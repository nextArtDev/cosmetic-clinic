type MarqueeProps = {
  items: string[];
  className?: string;
  duration?: number;
  dark?: boolean;
};

export default function Marquee({ items, className = "", duration = 42, dark }: MarqueeProps) {
  const row = [...items, ...items];
  return (
    <div
      className={`marquee   nc:relative   nc:overflow-hidden  ${className}`}
      style={{ ["--marquee-duration" as string]: `${duration}s` }}
      aria-hidden
    >
      {/* RTL: overlay at inline-start (physical right) fades toward physical
          left; overlay at inline-end fades toward physical right. */}
      <div
        className={`nc:pointer-events-none   nc:absolute   nc:inset-y-0   nc:start-0   nc:z-10   nc:w-24   nc:bg-linear-to-l  ${
          dark ? "nc:from-ink" : "nc:from-white"
        }  nc:to-transparent`}
      />
      <div
        className={`nc:pointer-events-none   nc:absolute   nc:inset-y-0   nc:end-0   nc:z-10   nc:w-24   nc:bg-linear-to-r  ${
          dark ? "nc:from-ink" : "nc:from-white"
        }  nc:to-transparent`}
      />
      <div className="marquee-track   nc:items-center   nc:gap-10   nc:py-5">
        {row.map((item, i) => (
          <span
            key={i}
            className={`nc:flex   nc:items-center   nc:gap-10   nc:whitespace-nowrap   nc:text-sm   nc:font-semibold   nc:normal-case    ${
              dark ? "nc:text-white/70" : "nc:text-graphite"
            }`}
          >
            {item}
            <span className={`nc:size-1.5   nc:rounded-full  ${dark ? "nc:bg-sage-soft" : "nc:bg-sage"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
