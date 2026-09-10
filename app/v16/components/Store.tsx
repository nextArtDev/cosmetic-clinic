"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Search,
  Truck,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import type { MayaProduct } from "../lib/data";
import { cn, fa, faGroup, getLenis, scrollToTarget, toman, EASE_EXPO } from "../lib/fx";

/* ------------------------------------------------------------------ */
/* context                                                             */
/* ------------------------------------------------------------------ */

export type CartItem = { product: MayaProduct; size: string; qty: number };

type StoreCtx = {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addToCart: (p: MayaProduct, size?: string, qty?: number) => void;
  removeFromCart: (p: MayaProduct, size: string) => void;
  setQty: (p: MayaProduct, size: string, qty: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  quickView: MayaProduct | null;
  setQuickView: (p: MayaProduct | null) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  bundle: MayaProduct[];
  toggleBundle: (p: MayaProduct) => void;
  clearBundle: () => void;
  notify: (msg: string) => void;
};

const Ctx = createContext<StoreCtx | null>(null);
export const useStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
};

const FREE_SHIPPING = 2_000_000;
let toastId = 0;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickView, setQuickView] = useState<MayaProduct | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bundle, setBundle] = useState<MayaProduct[]>([]);
  const [toasts, setToasts] = useState<Array<{ id: number; msg: string }>>([]);
  const hydrated = useRef(false);

  /* persist mock cart */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("v16-maya-cart");
      if (raw) setCart(JSON.parse(raw)); // eslint-disable-line react-hooks/set-state-in-effect -- one-time cart hydration from localStorage
    } catch { /* noop */ }
    hydrated.current = true;
  }, []);
  useEffect(() => {
    if (!hydrated.current) return;
    try { localStorage.setItem("v16-maya-cart", JSON.stringify(cart)); } catch { /* noop */ }
  }, [cart]);

  const notify = useCallback((msg: string) => {
    const id = ++toastId;
    setToasts((t) => [...t.slice(-2), { id, msg }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2600);
  }, []);

  const addToCart = useCallback(
    (p: MayaProduct, size?: string, qty = 1) => {
      const s = size ?? p.sizes[0];
      setCart((c) => {
        const i = c.findIndex((x) => x.product.id === p.id && x.size === s);
        if (i >= 0) {
          const copy = [...c];
          copy[i] = { ...copy[i], qty: copy[i].qty + qty };
          return copy;
        }
        return [...c, { product: p, size: s, qty }];
      });
      notify(`«${p.title}» به سبد اضافه شد`);
    },
    [notify],
  );

  const removeFromCart = useCallback((p: MayaProduct, size: string) => {
    setCart((c) => c.filter((x) => !(x.product.id === p.id && x.size === size)));
  }, []);

  const setQty = useCallback((p: MayaProduct, size: string, qty: number) => {
    setCart((c) =>
      qty <= 0
        ? c.filter((x) => !(x.product.id === p.id && x.size === size))
        : c.map((x) => (x.product.id === p.id && x.size === size ? { ...x, qty } : x)),
    );
  }, []);

  const toggleBundle = useCallback(
    (p: MayaProduct) => {
      setBundle((b) => {
        if (b.some((x) => x.id === p.id)) return b.filter((x) => x.id !== p.id);
        if (b.length >= 7) {
          notify("حداکثر ۷ قلم در هر باندل");
          return b;
        }
        return [...b, p];
      });
    },
    [notify],
  );
  const clearBundle = useCallback(() => setBundle([]), []);

  const cartCount = cart.reduce((a, x) => a + x.qty, 0);
  const cartTotal = cart.reduce((a, x) => a + x.qty * x.product.price, 0);

  /* lock scroll when any overlay is open */
  const anyOpen = cartOpen || !!quickView || searchOpen || menuOpen;
  useEffect(() => {
    const lenis = getLenis();
    const el = document.documentElement;
    if (anyOpen) {
      lenis?.stop();
      el.style.overflow = "hidden";
    } else {
      lenis?.start();
      el.style.overflow = "";
    }
  }, [anyOpen]);

  /* escape closes topmost */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (quickView) setQuickView(null);
      else if (searchOpen) setSearchOpen(false);
      else if (cartOpen) setCartOpen(false);
      else if (menuOpen) setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickView, searchOpen, cartOpen, menuOpen]);

  const value = useMemo<StoreCtx>(
    () => ({
      cart, cartCount, cartTotal, addToCart, removeFromCart, setQty,
      cartOpen, setCartOpen, quickView, setQuickView, searchOpen, setSearchOpen,
      menuOpen, setMenuOpen, bundle, toggleBundle, clearBundle, notify,
    }),
    [cart, cartCount, cartTotal, addToCart, removeFromCart, setQty, cartOpen, quickView, searchOpen, menuOpen, bundle, toggleBundle, clearBundle, notify],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartDrawer />
      <QuickViewDrawer />
      <SearchOverlay />
      {/* toasts */}
      <div className="pointer-events-none fixed bottom-24 inset-x-0 z-[96] flex flex-col items-center gap-2 px-4 lg:bottom-8">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ y: 24, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 12, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE_EXPO }}
              className="pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-full bg-maya-ink px-5 py-3 text-sm font-semibold text-maya-cream shadow-2xl"
            >
              <span className="grid size-5 place-items-center rounded-full bg-maya-clay">
                <ShoppingBag className="size-3" strokeWidth={2.5} />
              </span>
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}

/* ------------------------------------------------------------------ */
/* shared overlay pieces                                               */
/* ------------------------------------------------------------------ */

function Backdrop({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="fixed inset-0 z-[90] bg-maya-ink/55 backdrop-blur-[2px]"
    />
  );
}

const panelTransition = { duration: 0.55, ease: EASE_EXPO };

/* ------------------------------------------------------------------ */
/* cart drawer                                                         */
/* ------------------------------------------------------------------ */

function CartDrawer() {
  const { cart, cartOpen, setCartOpen, cartTotal, cartCount, setQty, removeFromCart, notify } = useStore();
  const remain = Math.max(0, FREE_SHIPPING - cartTotal);
  const progress = Math.min(100, (cartTotal / FREE_SHIPPING) * 100);

  return (
    <AnimatePresence>
      {cartOpen && (
        <>
          <Backdrop onClick={() => setCartOpen(false)} />
          <motion.aside
            initial={{ x: "-104%" }}
            animate={{ x: 0 }}
            exit={{ x: "-104%" }}
            transition={panelTransition}
            className="fixed inset-y-0 left-0 z-[95] flex w-full max-w-md flex-col bg-maya-cream shadow-2xl"
            role="dialog"
            aria-label="سبد خرید"
          >
            <header className="flex items-center justify-between border-b border-maya-line px-6 py-5">
              <h3 className="text-lg font-extrabold">
                سبد خرید{" "}
                <span className="text-sm font-bold text-maya-mute">({fa(cartCount)} قلم)</span>
              </h3>
              <button className="maya-iconbtn" onClick={() => setCartOpen(false)} aria-label="بستن">
                <X className="size-5" />
              </button>
            </header>

            {/* free shipping progress */}
            <div className="border-b border-maya-line px-6 py-4">
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-maya-mute">
                <Truck className="size-4" />
                {remain > 0 ? (
                  <>تا ارسال رایگان {toman(remain)} مانده</>
                ) : (
                  <>تبریک! ارسال سفارش شما رایگان شد</>
                )}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-maya-line/60">
                <motion.div
                  className="h-full rounded-full bg-maya-clay"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.6, ease: EASE_EXPO }}
                />
              </div>
            </div>

            <div className="maya-nobar flex-1 overflow-y-auto px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <span className="grid size-16 place-items-center rounded-full bg-maya-parchment">
                    <ShoppingBag className="size-7 text-maya-mute" />
                  </span>
                  <p className="font-bold">سبد خریدت خالی است</p>
                  <p className="text-sm text-maya-mute">هنوز چیزی انتخاب نکرده‌ای؛ از کالکشن‌ها شروع کن.</p>
                  <button
                    className="maya-btn maya-btn-dark"
                    onClick={() => {
                      setCartOpen(false);
                      scrollToTarget("#maya-trending");
                    }}
                  >
                    مشاهده محصولات
                  </button>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-maya-line">
                  <AnimatePresence initial={false}>
                    {cart.map((item) => (
                      <motion.li
                        key={`${item.product.id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -24, height: 0, marginTop: 0, marginBottom: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex gap-4 py-4"
                      >
                        <div className="h-24 w-20 flex-none overflow-hidden rounded-xl bg-maya-parchment">
                          <img src={item.product.image} alt={item.product.title} className="size-full object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-bold leading-6">{item.product.title}</p>
                            <button
                              className="text-maya-mute transition-colors hover:text-maya-clay-deep"
                              onClick={() => removeFromCart(item.product, item.size)}
                              aria-label="حذف"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <p className="mt-0.5 text-xs text-maya-mute">سایز: {fa(item.size)}</p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-center rounded-full border border-maya-line">
                              <button
                                className="grid size-7 place-items-center"
                                onClick={() => setQty(item.product, item.size, item.qty - 1)}
                                aria-label="کمتر"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-bold">{fa(item.qty)}</span>
                              <button
                                className="grid size-7 place-items-center"
                                onClick={() => setQty(item.product, item.size, item.qty + 1)}
                                aria-label="بیشتر"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <p className="text-sm font-extrabold">{toman(item.product.price * item.qty)}</p>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {cart.length > 0 && (
              <footer className="border-t border-maya-line bg-maya-parchment/60 px-6 py-5">
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-maya-mute">جمع سبد</span>
                  <span className="text-lg font-black">{toman(cartTotal)}</span>
                </div>
                <p className="mb-4 flex items-center gap-1.5 text-[11px] text-maya-mute">
                  <ShieldCheck className="size-3.5" /> پرداخت امن با درگاه‌های معتبر بانکی
                </p>
                <button
                  className="maya-btn maya-btn-dark w-full"
                  onClick={() => notify("نسخه نمایشی — به‌زودی به درگاه پرداخت شما وصل می‌شود")}
                >
                  ادامه و تسویه حساب
                  <ArrowLeft className="size-4" />
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* quick view drawer                                                   */
/* ------------------------------------------------------------------ */

function QuickViewDrawer() {
  const { quickView: p, setQuickView, addToCart, setCartOpen } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const [color, setColor] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    setSize(null); // eslint-disable-line react-hooks/set-state-in-effect -- reset selections when quick-view product changes
    setColor(0);
    setQty(1);
  }, [p?.id]);

  return (
    <AnimatePresence>
      {p && (
        <>
          <Backdrop onClick={() => setQuickView(null)} />
          <motion.aside
            initial={{ x: "-104%" }}
            animate={{ x: 0 }}
            exit={{ x: "-104%" }}
            transition={panelTransition}
            className="fixed inset-y-0 left-0 z-[95] flex w-full max-w-lg flex-col overflow-hidden bg-maya-cream shadow-2xl"
            role="dialog"
            aria-label={`مشاهده سریع ${p.title}`}
          >
            <div className="maya-nobar flex-1 overflow-y-auto">
              <div className="relative aspect-[4/4.4] overflow-hidden bg-maya-parchment">
                <motion.img
                  key={p.id}
                  src={p.image}
                  alt={p.title}
                  initial={{ scale: 1.12, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: EASE_EXPO }}
                  className="size-full object-cover"
                />
                <button
                  className="maya-iconbtn absolute top-4 right-4 bg-maya-cream/90"
                  onClick={() => setQuickView(null)}
                  aria-label="بستن"
                >
                  <X className="size-5" />
                </button>
                {p.tag && (
                  <span className="absolute top-4 left-4 rounded-full bg-maya-ink px-3 py-1.5 text-xs font-bold text-maya-cream">
                    {p.tag}
                  </span>
                )}
              </div>

              <div className="px-6 py-6">
                <p className="mb-1 text-xs font-bold text-maya-clay">کالکشن {p.collection}</p>
                <h3 className="text-2xl font-black">{p.title}</h3>
                <div className="mt-3 flex items-baseline gap-3">
                  <p className="text-xl font-black">{toman(p.price)}</p>
                  {p.compareAt && (
                    <p className="text-sm text-maya-mute line-through">{toman(p.compareAt)}</p>
                  )}
                </div>

                <div className="mt-6">
                  <p className="mb-2.5 text-xs font-bold text-maya-mute">رنگ</p>
                  <div className="flex gap-2.5">
                    {p.colors.map((c, i) => (
                      <button
                        key={c}
                        className="maya-swatch"
                        style={{ background: c }}
                        data-active={color === i}
                        onClick={() => setColor(i)}
                        aria-label={`رنگ ${fa(i + 1)}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mt-5">
                  <p className="mb-2.5 text-xs font-bold text-maya-mute">سایز</p>
                  <div className="flex flex-wrap gap-2">
                    {p.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={cn(
                          "min-w-11 rounded-full border px-3.5 py-2 text-sm font-bold transition-all",
                          (size ?? p.sizes[0]) === s
                            ? "border-maya-ink bg-maya-ink text-maya-cream"
                            : "border-maya-line hover:border-maya-ink",
                        )}
                      >
                        {fa(s)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-7 flex items-stretch gap-3">
                  <div className="flex items-center rounded-full border border-maya-line px-1">
                    <button className="grid size-10 place-items-center" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="کمتر">
                      <Minus className="size-4" />
                    </button>
                    <span className="w-8 text-center font-black">{fa(qty)}</span>
                    <button className="grid size-10 place-items-center" onClick={() => setQty(qty + 1)} aria-label="بیشتر">
                      <Plus className="size-4" />
                    </button>
                  </div>
                  <button
                    className="maya-btn maya-btn-dark flex-1"
                    onClick={() => {
                      addToCart(p, size ?? p.sizes[0], qty);
                      setQuickView(null);
                      setCartOpen(true);
                    }}
                  >
                    افزودن به سبد خرید
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* search overlay                                                      */
/* ------------------------------------------------------------------ */

const POPULAR_SEARCHES = ["پالتو پشمی", "تیشرت اورسایز", "شلوار جین", "ست ورزشی", "بافت زمستانه", "کت اسپرت"];

function SearchOverlay() {
  const { searchOpen, setSearchOpen, notify } = useStore();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQ(""); // eslint-disable-line react-hooks/set-state-in-effect -- clear the query each time the overlay opens
      const t = window.setTimeout(() => inputRef.current?.focus(), 350);
      return () => window.clearTimeout(t);
    }
  }, [searchOpen]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div
          initial={{ opacity: 0, y: "-4%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "-3%" }}
          transition={{ duration: 0.45, ease: EASE_EXPO }}
          className="fixed inset-0 z-[95] flex flex-col bg-maya-cream/[0.985]"
        >
          <div className="maya-wrap flex items-center justify-between py-6">
            <p className="flex items-center gap-2 text-sm font-bold text-maya-mute">
              <Search className="size-4" /> جستجو در مایا
            </p>
            <button className="maya-iconbtn" onClick={() => setSearchOpen(false)} aria-label="بستن جستجو">
              <X className="size-5" />
            </button>
          </div>

          <div className="maya-wrap mt-6 max-w-3xl! md:mt-16">
            <motion.form
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.5, ease: EASE_EXPO }}
              onSubmit={(e) => {
                e.preventDefault();
                if (q.trim()) notify(`نسخه نمایشی — نتیجه‌ای برای «${q.trim()}» ثبت نشد`);
              }}
              className="flex items-center gap-4 border-b-2 border-maya-ink pb-4"
            >
              <Search className="size-7 flex-none text-maya-mute" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="دنبال چه چیزی می‌گردی؟"
                className="w-full bg-transparent text-2xl font-extrabold outline-none placeholder:text-maya-fog md:text-4xl"
              />
            </motion.form>

            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.5, ease: EASE_EXPO }}
              className="mt-10"
            >
              <p className="mb-4 text-xs font-bold text-maya-mute">جستجوهای پرطرفدار</p>
              <div className="flex flex-wrap gap-2.5">
                {POPULAR_SEARCHES.map((s, i) => (
                  <motion.button
                    key={s}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.28 + i * 0.05 }}
                    className="maya-chip transition-colors hover:border-maya-ink hover:bg-maya-ink hover:text-maya-cream"
                    onClick={() => setQ(s)}
                  >
                    {s}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          <p className="mt-auto pb-8 text-center text-xs text-maya-mute">
            برای بستن، کلید Esc را بزن — جستجوی واقعی به‌محض اتصال بک‌اند شما فعال می‌شود
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* small shared bits used across sections                              */
/* ------------------------------------------------------------------ */

export function PriceTag({ price, compareAt, className }: { price: number; compareAt?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className="font-extrabold">{faGroup(price)}</span>
      <span className="text-[0.62em] font-semibold text-maya-mute">تومان</span>
      {compareAt ? <span className="text-[0.72em] text-maya-mute line-through">{faGroup(compareAt)}</span> : null}
    </span>
  );
}
