import Image from 'next/image'
import { Mail, MapPin, Phone, Sparkles, UserRound } from 'lucide-react'
import { initials } from '../../lib/utils'

type Profile = {
  name: string
  email: string
  phoneNumber: string
  bio: string | null
  gender: string | null
  address: string | null
  image: string | null
}

const GENDER_LABEL: Record<string, string> = {
  male: 'آقا',
  female: 'خانم',
  MALE: 'آقا',
  FEMALE: 'خانم',
}

export function ProfileCard({ profile }: { profile: Profile }) {
  return (
    <aside className="glass-panel h-fit p-6">
      <div className="flex items-center gap-4">
        {profile.image ? (
          <Image
            src={profile.image}
            alt={profile.name}
            width={72}
            height={72}
            className="h-18 w-18 shrink-0 rounded-2xl object-cover"
          />
        ) : (
          <span className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sage-bright/40 to-sage/20 font-display text-xl text-ivory">
            {initials(profile.name)}
          </span>
        )}
        <div>
          <p className="font-display text-lg text-ivory">
            {profile.gender ? GENDER_LABEL[profile.gender] ?? '' : ''}{' '}
            {profile.name}
          </p>
          <p className="mt-0.5 text-xs text-ivory-dim">بیمار کلینیک ۴۰۴</p>
        </div>
      </div>

      <div className="mt-6 space-y-3 border-t border-glass-border pt-5 text-sm">
        <div className="flex items-center gap-3 text-ivory-dim">
          <Phone size={15} className="text-sage-mist" />
          <span dir="ltr">{profile.phoneNumber}</span>
        </div>
        {profile.email && profile.email !== `${profile.phoneNumber}@clinic.local` && (
          <div className="flex items-center gap-3 text-ivory-dim">
            <Mail size={15} className="text-sage-mist" />
            <span className="break-all" dir="ltr">
              {profile.email}
            </span>
          </div>
        )}
        {profile.address && (
          <div className="flex items-center gap-3 text-ivory-dim">
            <MapPin size={15} className="text-sage-mist" />
            <span>{profile.address}</span>
          </div>
        )}
      </div>

      {profile.bio && (
        <p className="mt-5 flex items-start gap-2 border-t border-glass-border pt-4 text-sm leading-relaxed text-ivory-dim">
          <Sparkles size={15} className="mt-0.5 shrink-0 text-gold-soft" />
          {profile.bio}
        </p>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-glass-border pt-4 text-[11px] text-ivory-dim/70">
        <UserRound size={13} />
         اطلاعات حساب توسط دکتر به‌روزرسانی می‌شود.
      </div>
    </aside>
  )
}
