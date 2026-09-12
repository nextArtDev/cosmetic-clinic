import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./maya.css";
import "./maya-motion.css";

// /v16 layout — the port's own scoped stylesheet only. No shared chrome of
// the production site renders here; every rule is .maya-* namespaced (see
// maya.css header). The root layout still owns <html>/<body>.
export const metadata: Metadata = {
  title: "مایا | فروشگاه مد و پوشاک ایرانی",
  description:
    "مایا — ظرافت بی‌زمان با روندهای مدرن. پوشاک ایرانی با پارچه درجه‌یک و طراحی یکتا. ارسال رایگان به سراسر ایران.",
};

export default function V16Layout({ children }: { children: ReactNode }) {
  return (
    <div id="maya-root" dir="rtl" lang="fa" className="maya-root">
      {children}
    </div>
  );
}
