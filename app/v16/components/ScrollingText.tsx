"use client";

/* ============================================================
   /v16 — scrolling text marquee.

   Ports the reference's `scrolling_text` footer-group section: one
   oversized line that scrolls horizontally forever, with the second
   half rendered as outlined (text-stroke) type. Sits directly above
   the footer, exactly as in the original.
   ============================================================ */

import { SCROLLING_TEXT } from "../lib/data";

function Run() {
  return (
    <span className="maya-scrolling-text-item">
      <span>{SCROLLING_TEXT.lead}</span>
      <span className="maya-text-stroke">{SCROLLING_TEXT.accent}</span>
      <i className="maya-diamond scale-[2.6] text-maya-clay" />
    </span>
  );
}

export function ScrollingText() {
  return (
    <section className="maya-scrolling-text border-y border-maya-line py-6 md:py-8" aria-label="شعار مایا">
      <div className="maya-scrolling-text-track">
        {/* two identical runs → seamless -50% loop */}
        <div className="flex items-center" aria-hidden="false">
          <Run />
          <Run />
        </div>
        <div className="flex items-center" aria-hidden="true">
          <Run />
          <Run />
        </div>
      </div>
    </section>
  );
}
