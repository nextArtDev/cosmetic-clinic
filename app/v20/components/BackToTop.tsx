"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { scrollToSection } from "../lib/anim";

export default function BackToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      className={`if-top ${show ? "is-show" : ""}`}
      aria-label="بازگشت به بالای صفحه"
      onClick={() => scrollToSection("#hero")}
    >
      <ArrowUp size={20} />
    </button>
  );
}
