import NovaSite from "./components/nova-site";
import { V5Shell } from "./components/v5-shell";
import Button from "./components/ui/Button";

export default function NotFound() {
  return (
    <V5Shell>
      <NovaSite>
        <section className="nc:grid   nc:min-h-[70vh]   nc:place-items-center   nc:bg-paper   nc:px-5   nc:pt-24">
          <div className="nc:text-center">
            <p className="eyebrow   dot-sage   nc:text-sage">خطای ۴۰۴</p>
            <h1 className="letterpress-dark   nc:mt-5   nc:text-[clamp(2.4rem,6vw,4.5rem)]   nc:font-semibold   nc:leading-none  ">
              این صفحه <span className="nc:font-serif   nc:font-normal">گم شده</span> است.
            </h1>
            <p className="nc:mx-auto   nc:mt-5   nc:max-w-md   nc:text-graphite">
              برخلاف گرافت‌های خوب کاشته‌شده، این صفحه دو نیاورد. برویم صفحه اصلی.
            </p>
            <div className="nc:mt-8">
              <Button href="/v5">بازگشت به صفحه اصلی</Button>
            </div>
          </div>
        </section>
      </NovaSite>
    </V5Shell>
  );
}
