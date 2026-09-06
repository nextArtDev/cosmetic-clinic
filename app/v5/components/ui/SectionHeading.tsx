import SplitText from "./SplitText";
import Reveal from "./Reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
  className?: string;
  as?: "h1" | "h2" | "h3";
};

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  dark,
  className = "",
  as = "h2",
}: SectionHeadingProps) {
  const center = align === "center";
  return (
    <div className={`${center ? "nc:mx-auto nc:max-w-3xl nc:text-center" : "nc:max-w-3xl"} ${className}`}>
      {eyebrow && (
        <Reveal as="p" className={`eyebrow   nc:mb-5  ${dark ? "nc:text-sage-soft dot-white" : "nc:text-sage dot-sage"}`}>
          {eyebrow}
        </Reveal>
      )}
      <SplitText
        as={as}
        text={title}
        className={`text-balance   nc:text-[clamp(2rem,4.2vw,3.6rem)]   nc:font-semibold   nc:leading-[1.02]    ${
          dark ? "letterpress-light" : "letterpress-dark"
        }`}
      />
      {description && (
        <Reveal
          as="p"
          delay={2}
          className={`nc:mt-6   nc:text-base   nc:leading-relaxed   nc:md:text-lg  ${
            dark ? "nc:text-white/70" : "nc:text-graphite"
          } ${center ? "nc:mx-auto nc:max-w-2xl" : "nc:max-w-2xl"}`}
        >
          {description}
        </Reveal>
      )}
    </div>
  );
}
