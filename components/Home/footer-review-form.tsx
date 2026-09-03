'use client'

import Link from 'next/link'
import { useState, useTransition } from 'react'
import { CheckCircle2, Loader2, MessageSquarePlus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { createReview } from '@/lib/actions/rating'
import { cn } from '@/lib/utils'

interface FooterReviewFormProps {
  loggedIn: boolean
}

/**
 * Compact review submission UI living inside the cinematic footer.
 * No photo upload — reviews are text + star rating only, and they go live
 * after dashboard moderation.
 */
export function FooterReviewForm({ loggedIn }: FooterReviewFormProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [commentError, setCommentError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  if (!loggedIn) {
    return (
      <div className="flex flex-wrap justify-center gap-2.5 w-full mt-2">
        <Link
          href="/signin?callbackUrl=/"
          className="footer-glass-pill px-5 md:px-6 py-2.5 rounded-full flex items-center gap-2 text-muted-foreground text-[11px] sm:text-xs md:text-sm font-medium hover:text-foreground"
        >
          <MessageSquarePlus size={14} />
          برای ثبت دیدگاه وارد شوید
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-wrap justify-center gap-2.5 w-full mt-2">
        <span className="footer-glass-pill px-5 md:px-6 py-2.5 rounded-full flex items-center gap-2 text-muted-foreground text-[11px] sm:text-xs md:text-sm">
          <CheckCircle2 size={14} className="text-sage-bright" />
          دیدگاه شما ثبت شد و پس از تأیید نمایش داده می‌شود.
        </span>
      </div>
    )
  }

  if (!open) {
    return (
      <div className="flex flex-wrap justify-center gap-2.5 w-full mt-2">
        <button
          onClick={() => setOpen(true)}
          className="footer-glass-pill px-5 md:px-6 py-2.5 rounded-full flex items-center gap-2 text-muted-foreground text-[11px] sm:text-xs md:text-sm font-medium hover:text-foreground"
        >
          <MessageSquarePlus size={14} />
          ثبت دیدگاه شما
        </button>
      </div>
    )
  }

  function submit() {
    startTransition(async () => {
      const result = await createReview({ rating, comment }, '/')
      if (result.errors?._form?.[0]) {
        toast.error(result.errors._form[0])
        return
      }
      if (result.errors?.comment?.[0]) {
        setCommentError(result.errors.comment[0])
        return
      }
      toast.success('دیدگاه شما ثبت شد؛ سپاس از همراهی‌تان.')
      setDone(true)
      setOpen(false)
      setComment('')
      setRating(5)
    })
  }

  return (
    <div className="w-full max-w-xl mx-auto mt-3 rounded-3xl border border-border bg-background/60 backdrop-blur-md p-5 sm:p-6 shadow-2xl">
      <p className="text-center text-sm font-bold text-foreground mb-4">
        تجربهٔ خود از کلینیک را بنویسید
      </p>

      {/* Star input */}
      <div
        className="flex items-center justify-center gap-2 mb-4"
        onMouseLeave={() => setHovered(0)}
      >
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            aria-label={`${value} ستاره`}
            onMouseEnter={() => setHovered(value)}
            onClick={() => setRating(value)}
            className="p-3 transition-transform duration-150 hover:scale-110"
          >
            <Star
              size={22}
              className={cn(
                'transition-colors',
                value <= (hovered || rating)
                  ? 'fill-gild-bright text-gild-bright'
                  : 'text-muted-foreground/50',
              )}
            />
          </button>
        ))}
      </div>

      <label htmlFor="footer-review-comment" className="sr-only">
        متن دیدگاه
      </label>
      <textarea
        id="footer-review-comment"
        value={comment}
        onChange={(e) => {
          setComment(e.target.value)
          setCommentError(null)
        }}
        rows={3}
        placeholder="درج دیدگاه... (حداقل ۵ کاراکتر)"
        aria-invalid={commentError ? true : undefined}
        aria-describedby={
          commentError ? 'footer-review-comment-error' : undefined
        }
        className="w-full resize-none rounded-2xl border border-border bg-background/70 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:border-gilded/70 aria-invalid:border-destructive/60"
      />
      {commentError && (
        <p
          id="footer-review-comment-error"
          role="alert"
          className="mt-2 text-xs text-destructive"
        >
          {commentError}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          انصراف
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || comment.trim().length < 5}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gild-bright via-gilded to-gild-deep bg-[length:200%_auto] px-6 py-2 text-xs font-bold text-canvas-deep shadow-md shadow-gilded/25 transition-all duration-300 hover:bg-[position:right_center] disabled:pointer-events-none disabled:opacity-40"
        >
          {pending ? (
            <>
              <Loader2 size={13} className="animate-spin" /> در حال ارسال…
            </>
          ) : (
            'ارسال دیدگاه'
          )}
        </button>
      </div>
    </div>
  )
}
