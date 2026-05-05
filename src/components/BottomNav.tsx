"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "홈", icon: "●" },
  { href: "/calendar", label: "달력", icon: "▦" },
  { href: "/stats", label: "통계", icon: "▤" },
  { href: "/restaurants", label: "맛집", icon: "♨" },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="sticky bottom-0 z-10 border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-black"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md">
        {TABS.map((t) => {
          const active =
            t.href === "/"
              ? pathname === "/"
              : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-0.5 py-3 text-xs ${
                  active
                    ? "text-black dark:text-white"
                    : "text-neutral-400"
                }`}
              >
                <span className="text-base leading-none">{t.icon}</span>
                <span>{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
