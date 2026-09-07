import type { ReactNode } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { clinic } from '../lib/content'

/** گل هشت‌پر طرح اصلی — عیناً حفظ شده. */
export function Flower({ className = '', ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={`flower ${className}`} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M13.8384 18.6729C14.5576 20.4513 14.5112 22.3497 13.8531 24C12.2322 23.2706 10.8797 21.9374 10.1604 20.1602C9.44116 18.3829 9.48761 16.4845 10.1457 14.833C11.7666 15.5636 13.1191 16.8957 13.8384 18.6729Z" />
      <path d="M8.58144 18.0193C7.83271 19.7852 6.4576 21.0947 4.82536 21.7969C4.19557 20.1352 4.18084 18.2357 4.92957 16.4709C5.67829 14.7062 7.05341 13.3967 8.68565 12.6933C9.31543 14.3561 9.33016 16.2546 8.58144 18.0193Z" />
      <path d="M5.32715 13.8396C3.54992 14.5578 1.65036 14.5125 0 13.8544C.729467 12.2334 2.06267 10.881 3.8399 10.1617C5.61713 9.44244 7.51555 9.48888 9.16705 10.147C8.43645 11.7679 7.10438 13.1204 5.32715 13.8396Z" />
      <path d="M5.98186 8.58157C4.21596 7.83285 2.90654 6.45774 2.20426 4.8255C3.86595 4.19571 5.76551 4.18098 7.53028 4.92971C9.29504 5.67843 10.6045 7.05354 11.3079 8.68578C9.64505 9.31557 7.74663 9.3303 5.98186 8.58157Z" />
      <path d="M10.1616 5.32729C9.4423 3.54893 9.48874 1.6505 10.1468 0C11.7678.729605 13.1202 2.06281 13.8395 3.84004C14.5588 5.61726 14.5123 7.51569 13.8542 9.16719C12.2333 8.43659 10.8808 7.10451 10.1616 5.32729Z" />
      <path d="M15.4185 5.982C16.1672 4.2161 17.5423 2.90668 19.1746 2.2044C19.8044 3.86609 19.8191 5.76565 19.0704 7.53042C18.3216 9.29518 16.9465 10.6046 15.3143 11.308C14.6845 9.64519 14.6698 7.74676 15.4185 5.982Z" />
      <path d="M18.6728 10.1617C20.4511 9.44244 22.3496 9.48888 24 10.147C23.2705 11.7679 21.9373 13.1204 20.16 13.8396C18.3828 14.5589 16.4844 14.5125 14.8329 13.8544C15.5635 12.2334 16.8956 10.881 18.6728 10.1617Z" />
      <path d="M18.0192 15.4186C19.7851 16.1674 21.0945 17.5425 21.7968 19.1747C20.1351 19.8045 18.2356 19.8192 16.4708 19.0705C14.706 18.3218 13.3966 16.9467 12.6932 15.3144C14.356 14.6846 16.2544 14.6699 18.0192 15.4186Z" />
    </svg>
  )
}

/** آیکون سبد — عین طرح اصلی. */
export function BagIcon() {
  return (
    <svg width="21" height="21" viewBox="0 0 18 17" fill="none" aria-hidden="true">
      <path fill="currentColor" fillOpacity="0.35" d="M5.14029 4.49997H12.6813C14.2571 4.49997 15.6268 5.58995 15.9918 7.13441L16.8745 10.8697C17.5534 13.7423 15.3914 16.5 12.4606 16.5H5.5388C2.69247 16.5 0.548971 13.8902 1.08155 11.0732L1.79736 7.28701C2.10308 5.66992 3.50638 4.49997 5.14029 4.49997Z" />
      <path stroke="currentColor" strokeLinecap="round" d="M12.5334 7.35711V3.92854C12.5334 2.03499 11.0098 0.499969 9.13034 0.499969C7.2509 0.499969 5.7273 2.03499 5.7273 3.92854V7.35711M12.6813 4.49997H5.14029C3.50638 4.49997 2.10308 5.66992 1.79736 7.28701L1.08155 11.0732C0.548971 13.8902 2.69247 16.5 5.5388 16.5H12.4606C15.3914 16.5 17.5534 13.7423 16.8745 10.8697L15.9918 7.13441C15.6268 5.58995 14.2571 4.49997 12.6813 4.49997Z" />
    </svg>
  )
}

/** واژه‌نگار فارسی — به‌جای ماسک لاتین NERVANA، نام درمانگاه با فونت نمایشی. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`wordmark ${className}`} role="img" aria-label={clinic.name}>
      {clinic.short}
    </span>
  )
}

export function Eyebrow({ children, ring = false, className = '' }: { children: ReactNode; ring?: boolean; className?: string }) {
  return (
    <div className={`eyebrow ${ring ? 'eyebrow-ring' : ''} ${className}`}>
      <span className="eyebrow-dot" aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export function Corners() {
  return (
    <span className="corners" aria-hidden="true">
      <i /><i /><i /><i />
      <span className="corner-fold" />
    </span>
  )
}

export function Action({ children, href, onClick, className = '', icon = 'flower', type = 'button', disabled = false, ariaLabel }: {
  children: string; href?: string; onClick?: () => void; className?: string; icon?: 'flower' | 'arrow' | 'none'; type?: 'button' | 'submit'; disabled?: boolean; ariaLabel?: string
}) {
  const content = (
    <>
      <span className="button-label">
        <span>{children}</span>
        <span aria-hidden="true">{children}</span>
      </span>
      {icon === 'flower' ? <Flower /> : icon === 'arrow' ? <ArrowUpRight size={20} strokeWidth={1.3} /> : null}
    </>
  )
  if (href) return <a href={href} className={`action ${className}`} onClick={onClick} aria-label={ariaLabel}>{content}</a>
  return <button type={type} className={`action ${className}`} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>{content}</button>
}
