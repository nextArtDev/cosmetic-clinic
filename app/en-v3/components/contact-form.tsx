'use client'

import { useEffect, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowIcon, ArrowLink, ease } from './motion-primitives'

const services = ['Le Tremplin', 'La Vitrine', 'La Boutique', 'Identité visuelle', 'Un projet sur mesure']

export function ContactForm() {
  const [service, setService] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(null)
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const initial = new URLSearchParams(window.location.search).get('offre')
      if (initial && services.includes(initial)) setService(initial)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    setError(''); setFields({})
    if (!service) { setFields({ service: 'Choisissez un accompagnement pour votre projet.' }); return }
    const form = new FormData(event.currentTarget)
    const payload = { name: form.get('name'), email: form.get('email'), company: form.get('company'), website: form.get('website'), service, budget: form.get('budget'), message: form.get('message'), consent: form.get('consent') === 'on', nickname: form.get('nickname') }
    setPending(true)
    try {
      const response = await fetch('/v3/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) { setError(data.error || 'Veuillez réessayer.'); setFields(data.fields || {}); return }
      setSuccess({ id: data.id, name: String(form.get('name')).split(' ')[0] })
    } catch { setError('La connexion a été interrompue. Vos informations sont toujours ici : vous pouvez réessayer.') }
    finally { setPending(false) }
  }

  if (success) return (
    <motion.div className="contact-success" role="status" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease }}>
      <div className="success-mark"><ArrowIcon diagonal /></div><p className="eyebrow">Un premier pas vers la suite</p><h2>Merci, <em>{success.name}.</em></h2><p>Votre demande a bien été enregistrée.<br />Nous avons hâte de découvrir votre univers et de donner forme à vos ambitions.</p><span className="success-reference">Votre référence : {success.id.slice(0, 8).toUpperCase()}</span><ArrowLink href="/v3/projets">En attendant, découvrez nos projets</ArrowLink><button className="text-link" onClick={() => { setSuccess(null); setService('') }}>Envoyer une autre demande</button>
    </motion.div>
  )

  return (
    <form className="contact-form" onSubmit={submit} id="contact-form">
      <div className="form-intro"><p className="eyebrow">01 — Vous & votre marque</p><p>Faisons connaissance.</p></div>
      <div className="form-grid">
        <label className="form-field"><span>Votre nom <b>*</b></span><input name="name" autoComplete="name" placeholder="Prénom et nom" required minLength={2} maxLength={120} aria-invalid={Boolean(fields.name)} aria-describedby={fields.name ? 'v3-error-name' : undefined} />{fields.name && <small id="v3-error-name">{fields.name}</small>}</label>
        <label className="form-field"><span>Votre e-mail <b>*</b></span><input name="email" type="email" autoComplete="email" placeholder="bonjour@votremarque.fr" required maxLength={255} aria-invalid={Boolean(fields.email)} aria-describedby={fields.email ? 'v3-error-email' : undefined} />{fields.email && <small id="v3-error-email">{fields.email}</small>}</label>
        <label className="form-field"><span>Votre marque / entreprise <b>*</b></span><input name="company" autoComplete="organization" placeholder="Le nom de votre marque" required minLength={2} maxLength={160} aria-invalid={Boolean(fields.company)} aria-describedby={fields.company ? 'v3-error-company' : undefined} />{fields.company && <small id="v3-error-company">{fields.company}</small>}</label>
        <label className="form-field"><span>Votre site web <span className="optional">(facultatif)</span></span><input name="website" type="url" autoComplete="url" placeholder="https://" maxLength={300} aria-invalid={Boolean(fields.website)} aria-describedby={fields.website ? 'v3-error-website' : undefined} />{fields.website && <small id="v3-error-website">{fields.website}</small>}</label>
      </div>
      <fieldset className="service-options"><legend><span className="eyebrow">02 — Votre ambition</span>De quoi avez-vous besoin ? <b>*</b></legend><div>{services.map(item => <button type="button" key={item} onClick={() => { setService(item); setFields(old => ({ ...old, service: '' })) }} className={service === item ? 'is-selected' : ''} aria-pressed={service === item}>{item}<span aria-hidden="true">{service === item ? '✓' : '+'}</span></button>)}</div>{fields.service && <small className="field-error" role="alert">{fields.service}</small>}</fieldset>
      <label className="form-field budget-field"><span>Votre budget estimé <b>*</b></span><select name="budget" required defaultValue="" aria-invalid={Boolean(fields.budget)} aria-describedby={fields.budget ? 'v3-error-budget' : undefined}><option value="" disabled>Choisir une enveloppe</option><option>Moins de 3 000 €</option><option>3 000 — 6 000 €</option><option>6 000 — 10 000 €</option><option>Plus de 10 000 €</option><option>À définir ensemble</option></select>{fields.budget && <small id="v3-error-budget">{fields.budget}</small>}</label>
      <label className="form-field message-field"><span>Racontez-nous votre projet <b>*</b></span><textarea name="message" placeholder="Votre univers, vos envies, vos objectifs… Nous avons hâte de vous lire." rows={4} required minLength={20} maxLength={5000} aria-invalid={Boolean(fields.message)} aria-describedby={fields.message ? 'v3-error-message' : undefined} />{fields.message && <small id="v3-error-message">{fields.message}</small>}</label>
      <div className="form-honeypot" aria-hidden="true"><label>Ne pas remplir<input name="nickname" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="form-consent"><input name="consent" type="checkbox" required /><span>J’accepte que mes informations soient utilisées pour répondre à ma demande, conformément à la <Link href="/v3/politique-de-confidentialite">politique de confidentialité</Link>. <b>*</b></span></label>
      {fields.consent && <small className="field-error">{fields.consent}</small>}
      {error && <div className="form-error" role="alert">{error}</div>}
      <div className="form-submit-row"><button type="submit" disabled={pending} className="submit-button">{pending ? <><span className="button-spinner" />Enregistrement…</> : <>Donnons vie à votre projet<ArrowIcon /></>}</button><span>Les champs marqués d’un * sont nécessaires.</span></div>
    </form>
  )
}
