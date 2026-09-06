import NovaSite from "./components/nova-site";
import { V5Shell } from "./components/v5-shell";
import Button from "./components/ui/Button";

export default function NotFound() {
  return (
    <V5Shell>
      <NovaSite>
        <section className="nc:grid nc:min-h-[70vh] nc:place-items-center nc:bg-paper nc:px-5 nc:pt-24">
          <div className="nc:text-center">
            <p className="eyebrow dot-sage nc:text-sage">Erreur 404</p>
            <h1 className="letterpress-dark nc:mt-5 nc:text-[clamp(2.4rem,6vw,4.5rem)] nc:font-semibold nc:leading-none nc:tracking-[-0.04em]">
              Cette page a <span className="nc:font-serif nc:italic nc:font-normal">disparu</span>.
            </h1>
            <p className="nc:mx-auto nc:mt-5 nc:max-w-md nc:text-graphite">
              Contrairement aux greffons bien implantés, elle n&apos;a pas tenu. Revenons à l&apos;accueil.
            </p>
            <div className="nc:mt-8">
              <Button href="/v5">Retour à l&apos;accueil</Button>
            </div>
          </div>
        </section>
      </NovaSite>
    </V5Shell>
  );
}
