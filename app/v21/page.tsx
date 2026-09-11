import type { Metadata } from 'next';
import UnionExperience from './components/UnionExperience';
import { unionRepository } from './data';

// /v21 is a port of the Persian "UNION" (اتحاد) documentary frontend from
// C:\Users\aria\Desktop\chat-clone\union (src/features/union), a localized RTL
// adaptation of https://db-union-awards.webflow.io/, following the proven
// /v7 → /v20 isolation pattern. All UI lives inside this route's directory;
// union.module.css scopes every rule under `.experience`, so the home page and
// every other route are untouched. Route-local assets live in public/union/.
export const metadata: Metadata = {
  title: { absolute: 'اتحاد — صدای ما، قدرت ما | UNION' },
  description:
    'روایت آدم‌های معمولی که کنار هم، کاری غیرمعمولی کردند. نسخه فارسی و نمایشی وب‌سایت مستند اتحاد؛ تریلر، عوامل و برنامه اکران‌ها.',
  robots: { index: false, follow: false },
};

export default async function V21Page() {
  return <UnionExperience initialScreenings={await unionRepository.listScreenings()} />;
}
