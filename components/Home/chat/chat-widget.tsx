'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import {
  CircleAlert,
  MessageCircle,
  RotateCcw,
  SendHorizonal,
  Square,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'

import NextLink from 'next/link'

const SUGGESTIONS = [
  'خدمات کلینیک چی هستند؟',
  'ساعات کاری کلینیک چطور است؟',
  'چطور نوبت رزرو کنم؟',
]

const MAX_INPUT_CHARS = 2000

/**
 * Renders assistant text, replacing any `/booking` path the model writes with
 * a real clickable link ("رزرو نوبت آنلاین") — the model is instructed never
 * to print raw URLs or ids; this is the rendering side of that contract.
 */
function AssistantText({ text }: { text: string }) {
  const parts = text.split(/(\/booking\b)/g)
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts.map((part, i) =>
        part === '/booking' ? (
          <NextLink
            key={i}
            href="/booking"
            className="mx-0.5 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-gild-bright via-gilded to-gild-deep px-2.5 py-0.5 align-middle text-[12px] font-bold text-canvas-deep transition-transform hover:scale-105"
          >
            رزرو نوبت آنلاین
          </NextLink>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

/**
 * Site-wide floating chatbot — port of the shadcn chatbot-template chat UI,
 * restyled into the clinic's committed stage palette and RTL/Farsi.
 * Lives in the (home) layout so every public page gets it. The booking CTAs
 * own the bottom-left corner, so the bubble sits bottom-right.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const { messages, sendMessage, status, stop, error, setMessages } = useChat()

  const isBusy = status === 'submitted' || status === 'streaming'

  const submit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isBusy) return
    setInput('')
    void sendMessage({ text: trimmed })
  }

  return (
    <>
      {/* Bubble trigger */}
      <Button
        type="button"
        aria-label={open ? 'بستن گفتگو' : 'گفتگو با دستیار کلینیک'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 size-14 rounded-full bg-gradient-to-r from-gild-bright via-gilded to-gild-deep text-canvas-deep shadow-xl shadow-gilded/30 transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </Button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="گفتگو با دستیار کلینیک"
          className="fixed bottom-20 right-4 z-50 flex h-[min(70svh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-3xl border border-glass-border bg-canvas/95 shadow-2xl shadow-black/60 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-glass-border px-4 py-3">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-gild-bright opacity-60" />
              <span className="relative inline-flex size-2.5 rounded-full bg-gild-bright" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-cream">دستیار کلینیک</p>
              <p className="text-[11px] text-cream-dim">
                پاسخگوی سوالات خدمات و نوبتدهی
              </p>
            </div>
            {messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="گفتگوی جدید"
                className="size-8 text-cream-dim hover:text-cream"
                onClick={() => setMessages([])}
              >
                <RotateCcw size={15} />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="بستن"
              className="size-8 text-cream-dim hover:text-cream"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4" aria-live="polite">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                <p className="text-sm leading-relaxed text-cream-dim">
                  سلام! هر سوالی دربارهٔ خدمات، ساعات کاری یا نوبتدهی
                  کلینیک دارید، بپرسید.
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="rounded-full border border-glass-border bg-glass-bg px-3.5 py-2 text-xs text-cream transition-colors hover:border-gilded/50 hover:text-gild-bright"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((message) => {
                  const text = message.parts
                    .filter((p) => p.type === 'text')
                    .map((p) => (p.type === 'text' ? p.text : ''))
                    .join('')
                  if (message.role === 'user' && !text) return null
                  const isUser = message.role === 'user'
                  return (
                    <div
                      key={message.id}
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                        isUser
                          ? 'self-end rounded-bl-sm bg-gilded text-canvas-deep'
                          : 'self-start rounded-br-sm border border-glass-border bg-glass-bg-strong text-cream'
                      }`}
                    >
                      {isUser ? (
                        text
                      ) : (
                        <AssistantText text={text} />
                      )}
                    </div>
                  )
                })}
                {status === 'submitted' && (
                  <div className="flex items-center gap-2 self-start px-1 text-xs text-cream-dim">
                    <Spinner className="size-3.5" />
                    در حال نوشتن…
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <p
              role="alert"
              className="mx-4 mb-2 flex items-center gap-1.5 text-xs text-destructive"
            >
              <CircleAlert size={13} />
              ارتباط برقرار نشد؛ دوباره تلاش کنید.
            </p>
          )}

          {/* Prompt form */}
          <form
            className="flex items-end gap-2 border-t border-glass-border p-3"
            onSubmit={(e) => {
              e.preventDefault()
              submit(input)
            }}
          >
            <Textarea
              value={input}
              onChange={(e) =>
                setInput(e.target.value.slice(0, MAX_INPUT_CHARS))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  submit(input)
                }
              }}
              rows={1}
              maxLength={MAX_INPUT_CHARS}
              placeholder="سوال خود را بنویسید…"
              aria-label="متن پیام"
              className="max-h-28 min-h-11 flex-1 resize-none rounded-2xl border-glass-border bg-glass-bg px-3.5 py-2.5 text-sm text-cream placeholder:text-cream-dim/60 focus-visible:border-gilded/70"
            />
            {isBusy ? (
              <Button
                type="button"
                aria-label="توقف پاسخ"
                onClick={() => stop()}
                className="size-11 shrink-0 rounded-full border border-glass-border bg-transparent p-0 text-cream hover:bg-glass-bg-strong"
              >
                <Square size={15} />
              </Button>
            ) : (
              <Button
                type="submit"
                aria-label="ارسال پیام"
                disabled={!input.trim()}
                className="size-11 shrink-0 rounded-full bg-gradient-to-r from-gild-bright via-gilded to-gild-deep p-0 text-canvas-deep shadow-md shadow-gilded/25 disabled:opacity-40"
              >
                <SendHorizonal size={17} className="scale-x-[-1]" />
              </Button>
            )}
          </form>
        </div>
      )}
    </>
  )
}
