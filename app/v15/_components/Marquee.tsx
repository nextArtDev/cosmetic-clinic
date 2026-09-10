'use client';

const ITEMS = [
  'دوختِ زینیِ دست',
  'چرمِ گیاهی‌دباغی',
  'ساختِ تهران',
  'از ۱۳۰۴ خورشیدی',
  'مُهرِ گرمِ اختصاصی',
  'ضمانتِ مادام‌العمرِ دوخت',
];

/** V15 — Infinite typographic ribbon. Duplicated track, pure-CSS loop (scroll-jank free).
 */
export default function Marquee({ dark = false }: { dark?: boolean }) {
  const row = [...ITEMS, ...ITEMS];
  return (
    <div
      dir="ltr"
      aria-hidden
      className={`overflow-hidden border-y py-4 md:py-5 ${
        dark
          ? 'v15-bg-ink border-white/10 text-[color:var(--v15-paper)]'
          : 'border-[color:var(--v15-line)] bg-[color:var(--v15-paper-2)]/60'
      }`}
    >
      <div className="v15-marquee-track flex w-max items-center gap-10 pl-10">
        {row.map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span dir="rtl" className="text-sm font-light tracking-wide md:text-base">
              {item}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--v15-caramel)]" />
          </span>
        ))}
      </div>
    </div>
  );
}
