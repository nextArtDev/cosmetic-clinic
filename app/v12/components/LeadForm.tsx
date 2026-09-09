'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FadeUp, LineReveal } from './Reveal'
import { LEAD_FORM, toFa, type Answers } from '../lib/content'

/**
 * LeadForm — faithful port of the grind LeadForm.tsx (multi-step check
 * + contact slide). RTL: slide directions are mirrored (forward slides
 * left); the back arrow points right; step counter renders Persian
 * digits. Posts to the /v12 mock API with the original contract.
 */

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
}

export default function LeadForm() {
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [answers, setAnswers] = useState<Answers>({
    situation: '',
    goal: '',
    commitment: '',
  })
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const totalSteps = LEAD_FORM.steps.length + 1
  const progress = ((step + 1) / totalSteps) * 100

  const pickOption = (key: keyof Answers, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }))
    setDirection(1)
    setTimeout(() => setStep((s) => s + 1), 260)
  }

  const goBack = () => {
    setDirection(-1)
    setStep((s) => Math.max(0, s - 1))
  }

  const submit = async () => {
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg(LEAD_FORM.errors.invalid)
      setStatus('error')
      return
    }
    setStatus('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/v12/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...answers, name, email }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(data.error ?? LEAD_FORM.errors.generic)
      }
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : LEAD_FORM.errors.generic)
    }
  }

  return (
    <section
      id="start"
      className="tg:relative tg:scroll-mt-20 tg:overflow-hidden tg:bg-[#0a0a0a] tg:py-24 tg:md:py-36"
    >
      {/* Glow accent */}
      <div className="tg:pointer-events-none tg:absolute tg:left-1/2 tg:top-0 tg:h-[500px] tg:w-[800px] tg:-translate-x-1/2 tg:rounded-full tg:bg-[#d7fe45]/[0.06] tg:blur-[120px]" />

      <div className="tg:relative tg:mx-auto tg:max-w-4xl tg:px-5 tg:md:px-10">
        <div className="tg:mb-14 tg:text-center tg:md:mb-20">
          <h2 className="tg:font-display tg:text-5xl tg:leading-[1.1] tg:md:text-8xl">
            <LineReveal>{LEAD_FORM.headline[0].text}</LineReveal>
            <LineReveal delay={0.1}>
              <span className="tg:text-[#d7fe45]">{LEAD_FORM.headline[1].text}</span>
            </LineReveal>
          </h2>
          <FadeUp delay={0.25}>
            <p className="tg:mx-auto tg:mt-6 tg:max-w-md tg:text-base tg:leading-loose tg:text-[#f2f0eb]/60 tg:md:text-lg">
              {LEAD_FORM.sub}
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.3}>
          <div className="tg:rounded-3xl tg:border tg:border-white/10 tg:bg-[#141414] tg:p-6 tg:md:p-12">
            {status === 'done' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="tg:py-10 tg:text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 14 }}
                  className="tg:mx-auto tg:mb-6 tg:flex tg:h-20 tg:w-20 tg:items-center tg:justify-center tg:rounded-full tg:bg-[#d7fe45] tg:text-3xl tg:text-[#0a0a0a]"
                >
                  ✓
                </motion.div>
                <h3 className="tg:font-display tg:text-3xl tg:md:text-5xl">
                  {LEAD_FORM.successTitle}، {name.split(' ')[0]}!
                </h3>
                <p className="tg:mx-auto tg:mt-4 tg:max-w-sm tg:text-[#f2f0eb]/60">
                  {LEAD_FORM.successBody}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Progress */}
                <div className="tg:mb-8 tg:flex tg:items-center tg:gap-4">
                  <span className="tg:whitespace-nowrap tg:text-xs tg:font-bold tg:text-[#d7fe45]">
                    {LEAD_FORM.stepLabel} {toFa(step + 1)}/{toFa(totalSteps)}
                  </span>
                  <div className="tg:h-1 tg:flex-1 tg:overflow-hidden tg:rounded-full tg:bg-white/10">
                    <motion.div
                      className="tg:h-full tg:rounded-full tg:bg-[#d7fe45]"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>

                <div className="tg:relative tg:min-h-[320px] tg:md:min-h-[300px]">
                  <AnimatePresence mode="wait" custom={direction}>
                    {step < LEAD_FORM.steps.length ? (
                      <motion.div
                        key={step}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h3 className="tg:font-display tg:text-2xl tg:leading-[1.4] tg:md:text-4xl">
                          {LEAD_FORM.steps[step].question}
                        </h3>
                        <div className="tg:mt-8 tg:grid tg:grid-cols-1 tg:gap-3 tg:sm:grid-cols-2">
                          {LEAD_FORM.steps[step].options.map((option) => {
                            const key = LEAD_FORM.steps[step].key as keyof Answers
                            const selected = answers[key] === option
                            return (
                              <motion.button
                                key={option}
                                onClick={() => pickOption(key, option)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.97 }}
                                className={`tg:rounded-xl tg:border tg:px-5 tg:py-5 tg:text-right tg:text-sm tg:font-medium tg:transition-colors tg:duration-300 tg:md:text-base ${
                                  selected
                                    ? 'tg:border-[#d7fe45] tg:bg-[#d7fe45] tg:text-[#0a0a0a]'
                                    : 'tg:border-white/15 tg:bg-white/[0.03] tg:text-[#f2f0eb]/80 hover:tg:border-[#d7fe45]/60 hover:tg:text-[#f2f0eb]'
                                }`}
                              >
                                {option}
                              </motion.button>
                            )
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="contact"
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h3 className="tg:font-display tg:text-2xl tg:leading-[1.4] tg:md:text-4xl">
                          {LEAD_FORM.contactQuestion}
                        </h3>
                        <div className="tg:mt-8 tg:space-y-4">
                          <input
                            type="text"
                            placeholder={LEAD_FORM.nameLabel}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="tg:w-full tg:rounded-xl tg:border tg:border-white/15 tg:bg-white/[0.03] tg:px-5 tg:py-4 tg:text-[#f2f0eb] tg:outline-none tg:transition-colors tg:duration-300 placeholder:tg:text-[#f2f0eb]/30 focus:tg:border-[#d7fe45]"
                          />
                          <input
                            type="email"
                            placeholder={LEAD_FORM.emailLabel}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="tg:w-full tg:rounded-xl tg:border tg:border-white/15 tg:bg-white/[0.03] tg:px-5 tg:py-4 tg:text-[#f2f0eb] tg:outline-none tg:transition-colors tg:duration-300 placeholder:tg:text-[#f2f0eb]/30 focus:tg:border-[#d7fe45]"
                            dir="ltr"
                            style={{ textAlign: 'right' }}
                          />
                          {status === 'error' && (
                            <motion.p
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="tg:text-sm tg:text-red-400"
                            >
                              {errorMsg}
                            </motion.p>
                          )}
                          <motion.button
                            onClick={submit}
                            disabled={status === 'loading'}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            className="group tg:flex tg:w-full tg:items-center tg:justify-center tg:gap-3 tg:rounded-xl tg:bg-[#d7fe45] tg:px-8 tg:py-4 tg:font-bold tg:text-[#0a0a0a] tg:transition-opacity disabled:tg:opacity-60"
                          >
                            {status === 'loading' ? (
                              <span className="tg:flex tg:items-center tg:gap-2">
                                <span className="tg:h-4 tg:w-4 tg:animate-spin tg:rounded-full tg:border-2 tg:border-[#0a0a0a]/30 tg:border-t-[#0a0a0a]" />
                                {LEAD_FORM.sending}
                              </span>
                            ) : (
                              <>
                                {LEAD_FORM.submit}
                                <span className="tg:transition-transform tg:duration-300 group-hover:tg:-translate-x-1.5">
                                  →
                                </span>
                              </>
                            )}
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {step > 0 && (
                  <button
                    onClick={goBack}
                    className="tg:mt-6 tg:text-sm tg:text-[#f2f0eb]/40 tg:transition-colors hover:tg:text-[#d7fe45]"
                  >
                    {LEAD_FORM.back}
                  </button>
                )}
              </>
            )}
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
