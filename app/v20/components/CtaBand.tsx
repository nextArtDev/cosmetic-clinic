"use client";

import { Zap } from "lucide-react";
import Magnetic from "./Magnetic";
import { scrollToSection } from "../lib/anim";

export default function CtaBand() {
  return (
    <section id="join" data-if-spy="۹" className="if-section if-band">
      <div className="if-container">
        <p className="if-kicker" style={{ justifyContent: "center" }} data-if-reveal>
          ۰۹ · حالا نوبت توست
        </p>
        <h2 data-if-reveal data-if-delay="0.08">
          بهترین زمانِ شروع
          <br />
          <em>دقیقا همین لحظه است</em>
        </h2>
        <p className="if-lead" data-if-reveal data-if-delay="0.16">
          هفت روز اول رایگان، بدون کارت بانکی. اگر جواب نگرفتی — که می‌گرفتی —
          هیچ هزینه‌ای نمی‌پردازی.
        </p>
        <div style={{ marginTop: "2.4rem", display: "inline-block" }} data-if-reveal data-if-delay="0.24">
          <Magnetic>
            <button className="if-btn if-btn--solid" onClick={() => scrollToSection("#pricing")}>
              <Zap size={16} />
              عضویت رایگان می‌خواهم
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
