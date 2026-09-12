"use client";

/* ============================================================
   /v16 — mobile action dock.

   Ports the reference's `mobile-action-dock` section: a fixed
   bottom bar (below 1024px) with Home / Menu / Search / Shop /
   Account / Cart, where Cart carries a live count badge. It slides
   up once the visitor has scrolled past the hero.
   ============================================================ */

import { useEffect, useState } from "react";
import { Home, Menu, Search, ShoppingBag, User, LayoutGrid } from "lucide-react";
import { fa, scrollToTarget } from "../lib/fx";
import { useStore } from "./Store";

export function MobileDock() {
  const { cartCount, setCartOpen, setSearchOpen, setMenuOpen } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const item = "maya-dock-btn";

  return (
    <nav className="maya-dock" data-visible={visible} aria-label="دسترسی سریع">
      <button className={item} onClick={() => scrollToTarget(0)} aria-label="خانه">
        <Home className="size-[1.15rem]" />
        خانه
      </button>
      <button className={item} onClick={() => setMenuOpen(true)} aria-label="منو">
        <Menu className="size-[1.15rem]" />
        منو
      </button>
      <button className={item} onClick={() => setSearchOpen(true)} aria-label="جستجو">
        <Search className="size-[1.15rem]" />
        جستجو
      </button>
      <button className={item} onClick={() => scrollToTarget("#maya-collections")} aria-label="فروشگاه">
        <LayoutGrid className="size-[1.15rem]" />
        فروشگاه
      </button>
      <button className={item} onClick={() => scrollToTarget("#maya-faq")} aria-label="حساب کاربری">
        <User className="size-[1.15rem]" />
        حساب
      </button>
      <button className={item} onClick={() => setCartOpen(true)} aria-label="سبد خرید">
        <ShoppingBag className="size-[1.15rem]" />
        سبد
        {cartCount > 0 && <span className="maya-dock-badge">{fa(cartCount)}</span>}
      </button>
    </nav>
  );
}
