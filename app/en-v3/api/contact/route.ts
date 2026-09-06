import { NextResponse } from 'next/server'

/**
 * Mock contact endpoint for the /v3 frontend port. Validation is faithful to
 * the original lagence-design-studio route, but persistence is a no-op
 * in-memory mock: it stores nothing and touches neither Prisma nor the
 * production database. When you adopt /v3 for real, replace the mock section
 * below with your own Prisma insert.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type StoredInquiry = { id: string; name: string; email: string; company: string; website: string | null; service: string; budget: string; message: string; consent: true; createdAt: string }

// Module-level mock "table". Restarts the dev server -> data is gone, by design.
const globalForMock = globalThis as typeof globalThis & { __v3MockInquiries?: StoredInquiry[] }
const inquiries: StoredInquiry[] = (globalForMock.__v3MockInquiries ??= [])

export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin')
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host')
    if (origin && new URL(origin).host !== host) {
      return NextResponse.json({ error: 'Cette demande n’est pas autorisée.' }, { status: 403 })
    }
    if (Number(request.headers.get('content-length') || 0) > 16000) {
      return NextResponse.json({ error: 'Votre message est trop long.' }, { status: 413 })
    }
    const raw = await request.text()
    if (raw.length > 16000) {
      return NextResponse.json({ error: 'Votre message est trop long.' }, { status: 413 })
    }
    let body: Record<string, unknown>
    try { body = JSON.parse(raw) } catch {
      return NextResponse.json({ error: 'Le formulaire est invalide.' }, { status: 400 })
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ error: 'Le formulaire est invalide.' }, { status: 400 })
    }
    const clean = (key: string) => typeof body[key] === 'string' ? (body[key] as string).trim() : ''
    if (clean('nickname')) {
      return NextResponse.json({ error: 'Veuillez réessayer sans remplissage automatique.' }, { status: 400 })
    }
    const name = clean('name')
    const email = clean('email').toLowerCase()
    const company = clean('company')
    const website = clean('website')
    const service = clean('service')
    const budget = clean('budget')
    const message = clean('message')
    const fields: Record<string, string> = {}
    if (name.length < 2 || name.length > 120) fields.name = 'Indiquez votre nom (2 à 120 caractères).'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) fields.email = 'Indiquez une adresse e-mail valide.'
    if (company.length < 2 || company.length > 160) fields.company = 'Indiquez le nom de votre marque.'
    if (website.length > 300 || (website && !/^https?:\/\/[^\s.]+\.[^\s]+$/i.test(website))) fields.website = 'Indiquez une URL complète (https://…).'
    if (!service || service.length > 100) fields.service = 'Sélectionnez un accompagnement.'
    if (!budget || budget.length > 100) fields.budget = 'Sélectionnez votre budget estimé.'
    if (message.length < 20 || message.length > 5000) fields.message = 'Parlez-nous de votre projet en 20 à 5 000 caractères.'
    if (body.consent !== true) fields.consent = 'Votre accord est nécessaire pour traiter la demande.'
    if (Object.keys(fields).length) {
      return NextResponse.json({ error: 'Vérifiez les champs indiqués.', fields }, { status: 400 })
    }

    // ---- mock persistence (replace with Prisma when /v3 goes real) ----
    const recent = inquiries.filter(item =>
      item.email === email && Date.now() - new Date(item.createdAt).getTime() < 60_000,
    )
    if (recent.length >= 3) {
      return NextResponse.json({ error: 'Votre demande est déjà en cours. Réessayez dans une minute.' }, { status: 429, headers: { 'Retry-After': '60' } })
    }
    const record: StoredInquiry = {
      id: crypto.randomUUID(),
      name, email, company,
      website: website || null,
      service, budget, message,
      consent: true,
      createdAt: new Date().toISOString(),
    }
    inquiries.push(record)
    console.log('[v3 mock] inquiry stored (in-memory only):', record.id)
    return NextResponse.json({ success: true, id: record.id }, { status: 201 })
  } catch (error) {
    console.error('v3 contact submission failed:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json({ error: 'L’enregistrement est momentanément indisponible. Veuillez réessayer dans quelques instants.' }, { status: 503 })
  }
}
