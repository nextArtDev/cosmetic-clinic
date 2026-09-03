// app/api/chat/route.ts
// Streaming chat endpoint — port of the shadcn chatbot-template route,
// grounded in the clinic database via lib/chat/tools.

import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  streamText,
  toUIMessageStream,
  validateUIMessages,
  type UIMessage,
} from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

import { buildChatSystemPrompt } from '@/lib/chat/system-prompt'
import { getChatTools } from '@/lib/chat/tools'

export const runtime = 'nodejs'
export const maxDuration = 30

const MODEL_ID = process.env.OPENAI_MODEL ?? 'gpt-4o-mini'
const MAX_OUTPUT_TOKENS = 1024
const MAX_MESSAGES = 24
const MAX_BODY_BYTES = 64 * 1024

const WINDOW_MS = 10 * 60 * 1000
const MAX_REQUESTS_PER_WINDOW = 20

// Best-effort in-memory rate limit (per server instance). For multi-instance
// deployments, swap for a shared store (Redis/Upstash) or platform WAF.
const hits = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key)
    }
  }
  return false
}

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

function getModel() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null
  const openai = createOpenAI({
    apiKey,
    // Optional custom/OpenAI-compatible endpoint (e.g. OpenRouter or a
    // self-hosted gateway): set OPENAI_BASE_URL in .env to override.
    baseURL: process.env.OPENAI_BASE_URL || undefined,
  })
  return openai(MODEL_ID)
}

export async function POST(req: Request) {
  if (isRateLimited(getClientIp(req))) {
    return Response.json(
      { error: 'تعداد درخواستها زیاد است؛ چند دقیقه دیگر تلاش کنید.' },
      { status: 429 },
    )
  }

  const model = getModel()
  if (!model) {
    return Response.json(
      { error: 'سرویس گفتگو در دسترس نیست؛ بعداً تلاش کنید.' },
      { status: 503 },
    )
  }

  let body: unknown
  try {
    if ((req.body?.locked ?? false) === false) {
      const text = await req.text()
      if (text.length > MAX_BODY_BYTES) {
        return Response.json({ error: 'بدنهٔ درخواست بیش از حد بزرگ است.' }, { status: 413 })
      }
      body = JSON.parse(text)
    } else {
      body = await req.json()
    }
  } catch {
    return Response.json({ error: 'درخواست نامعتبر است.' }, { status: 400 })
  }

  const rawMessages = (body as { messages?: unknown })?.messages
  if (!Array.isArray(rawMessages) || rawMessages.length > MAX_MESSAGES) {
    return Response.json({ error: 'گفتگو نامعتبر است.' }, { status: 400 })
  }

  // Validate the shape of every message part before trusting it.
  let messages: UIMessage[]
  try {
    messages = await validateUIMessages<UIMessage>({
      messages: rawMessages as UIMessage[],
    })
  } catch {
    return Response.json({ error: 'گفتگو نامعتبر است.' }, { status: 400 })
  }

  const result = streamText({
    model,
    system: buildChatSystemPrompt(),
    messages: await convertToModelMessages(messages),
    tools: getChatTools(),
    stopWhen: isStepCount(6),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    abortSignal: req.signal,
  })

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      sendSources: true,
      onError: () => 'خطایی رخ داد؛ لطفاً دوباره تلاش کنید.',
    }),
  })
}
