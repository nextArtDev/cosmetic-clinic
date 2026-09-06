import Link from "next/link";

export default function Logo({
  dark,
  className = "",
  withTooltip = true,
}: {
  dark?: boolean;
  className?: string;
  withTooltip?: boolean;
}) {
  return (
    <Link
      href="/v5/"
      aria-label="کلینیک کاشت مو — صفحه اصلی"
      className={`nc:group/logo   nc:relative   nc:inline-flex   nc:items-center   nc:gap-2.5  ${className}`}
    >
      <span
        className={`nc:relative   nc:grid   nc:size-9   nc:place-items-center   nc:overflow-hidden   nc:rounded-[10px]  ${
          dark ? "nc:bg-white nc:text-ink" : "nc:bg-ink nc:text-white"
        }`}
      >
        <svg viewBox="0 0 24 24" className="nc:size-5" fill="none" aria-hidden>
          <path
            d="M5 19V5l14 14V5"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="nc:absolute   nc:-end-1   nc:-top-1   nc:size-3   nc:rounded-full   nc:bg-sage   nc:ring-2   nc:ring-white   nc:transition-transform   nc:duration-500   nc:group-hover/logo:scale-125" />
      </span>
      <span className={`nc:flex   nc:flex-col   nc:leading-none  ${dark ? "nc:text-white" : "nc:text-ink"}`}>
        <span className="nc:text-[15px]   nc:font-extrabold  ">کاشت مو</span>
        <span className={`nc:text-[10px]   nc:font-medium    ${dark ? "nc:text-white/60" : "nc:text-graphite"}`}>
          کلینیک تخصصی
        </span>
      </span>
      {withTooltip && (
        <span
          role="tooltip"
          className="nc:pointer-events-none   nc:absolute   nc:start-0   nc:top-[calc(100%+10px)]   nc:hidden   nc:translate-y-1   nc:whitespace-nowrap   nc:rounded-full   nc:bg-ink   nc:px-3   nc:py-1.5   nc:text-[11px]   nc:font-medium   nc:text-white   nc:opacity-0   nc:shadow-lg   nc:transition-all   nc:duration-300   nc:group-hover/logo:translate-y-0   nc:group-hover/logo:opacity-100   nc:md:block"
        >
          بازگشت به صفحه اصلی
        </span>
      )}
    </Link>
  );
}
