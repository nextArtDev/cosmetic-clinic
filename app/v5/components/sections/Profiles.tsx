"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpLeft } from "lucide-react";
import SectionHeading from "../../components/ui/SectionHeading";
import { StaggerGroup, StaggerItem, scaleIn } from "../../components/ui/Reveal";
import { profiles } from "../../lib/site";

export default function Profiles() {
  return (
    <section id="profils" className="nc:relative   nc:bg-white   nc:py-24   nc:sm:py-32">
      <div className="nc:mx-auto   nc:max-w-7xl   nc:px-5   nc:sm:px-8">
        <div className="nc:flex   nc:flex-col   nc:gap-8   nc:lg:flex-row   nc:lg:items-end   nc:lg:justify-between">
          <SectionHeading
            eyebrow="خدمات کاشت موی ما"
            title={"سه پروفایل،\nسه *استراتژی* کاشت"}
            description="ریزش هورمونی آقایان، کم‌پشتی انتشاریشده بانوان یا فولیکول‌های پیچ‌درپیچ، هر کدام رویکرد متفاوتی می‌خواهند. پروفایل خودتان را انتخاب کنید."
          />
        </div>

        <StaggerGroup className="nc:mt-14   nc:grid   nc:gap-4   nc:sm:grid-cols-2   nc:lg:grid-cols-3   nc:lg:gap-6">
          {profiles.map((p) => (
            <StaggerItem key={p.index} variants={scaleIn}>
              <Link
                href={p.href}
                className="nc:group   nc:relative   nc:block   nc:aspect-[4/5]   nc:overflow-hidden   nc:rounded-[24px]   nc:bg-ink   nc:text-white   nc:shadow-soft   nc:transition-shadow   nc:duration-500   nc:hover:shadow-lift"
              >
                {/* Frame */}
                <div className="nc:absolute   nc:inset-0   nc:overflow-hidden">
                  <Image
                    src={p.image}
                    alt={`${p.title} — کاشت مو` }
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 50vw, 100vw"
                    className="nc:object-cover   nc:transition-transform   nc:duration-[1.6s]   nc:ease-[cubic-bezier(.16,1,.3,1)]   nc:group-hover:scale-[1.07]"
                  />
                </div>
                {/* Shade */}
                <div className="nc:absolute   nc:inset-0   nc:bg-gradient-to-t   nc:from-ink/90   nc:via-ink/30   nc:to-ink/5   nc:transition-opacity   nc:duration-700   nc:group-hover:opacity-95" />
                <div className="nc:absolute   nc:inset-0   nc:bg-sage/0   nc:transition-colors   nc:duration-700   nc:group-hover:bg-sage/20" />

                {/* Inner frame line */}
                <span className="nc:pointer-events-none   nc:absolute   nc:inset-3   nc:rounded-[16px]   nc:border   nc:border-white/15   nc:transition-all   nc:duration-700   nc:group-hover:inset-2   nc:group-hover:border-white/35" />

                {/* Content */}
                <div className="nc:absolute   nc:inset-x-0   nc:bottom-0   nc:p-6   nc:sm:p-7">
                  <p className="eyebrow   nc:text-sage-soft">
                    {p.eyebrow} {p.index}
                  </p>
                  <div className="nc:mt-2   nc:flex   nc:items-end   nc:justify-between   nc:gap-4">
                    <h3 className="letterpress-light   nc:text-[clamp(1.6rem,2.6vw,2.1rem)]   nc:font-semibold   nc:leading-none  ">
                      {p.title}
                    </h3>
                    <span className="nc:relative   nc:grid   nc:size-11   nc:shrink-0   nc:place-items-center   nc:overflow-hidden   nc:rounded-full   nc:border   nc:border-white/40   nc:bg-white/10   nc:backdrop-blur   nc:transition-all   nc:duration-500   nc:group-hover:border-white   nc:group-hover:bg-white   nc:group-hover:text-ink">
                      <ArrowUpLeft className="nc:absolute   nc:size-5   nc:transition-transform   nc:duration-500   nc:ease-[cubic-bezier(.16,1,.3,1)]   nc:group-hover:-translate-y-6   nc:group-hover:-translate-x-6" />
                      <ArrowUpLeft className="nc:absolute   nc:size-5   nc:translate-x-6   nc:translate-y-6   nc:transition-transform   nc:duration-500   nc:ease-[cubic-bezier(.16,1,.3,1)]   nc:group-hover:-translate-x-0   nc:group-hover:translate-y-0" />
                    </span>
                  </div>
                  <motion.p className="nc:mt-3   nc:max-h-0   nc:overflow-hidden   nc:text-[13.5px]   nc:leading-relaxed   nc:text-white/80   nc:opacity-0   nc:transition-all   nc:duration-700   nc:ease-[cubic-bezier(.16,1,.3,1)]   nc:group-hover:max-h-32   nc:group-hover:opacity-100">
                    {p.description}
                  </motion.p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
