"use client";

import { ChevronDown } from "lucide-react";
import { scrollToSection } from "../lib/anim";

/**
 * Section-level scroll cue — the Iranian take on the original site's
 * `.scrolldown` ("SCROLL DOWN" + arrow) that sat at the bottom of nearly
 * every section. Clicking it smooth-scrolls to the next section.
 */
export default function ScrollCue({
  target,
  label = "بخش بعدی",
}: {
  target: string;
  label?: string;
}) {
  return (
    <div className="if-cue" aria-hidden={false}>
      <button
        type="button"
        className="if-cue-btn"
        onClick={() => scrollToSection(target)}
        aria-label={`اسکرول به ${label}`}
      >
        <span className="if-cue-word">{label}</span>
        <span className="if-cue-track">
          <ChevronDown size={15} strokeWidth={2.6} />
        </span>
      </button>
    </div>
  );
}
