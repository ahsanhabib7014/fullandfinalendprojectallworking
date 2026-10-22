"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🆕 আপনার দেওয়া সব বাটন ক্যাটাগরি অনুযায়ী সাজানো হলো
  const menuGroups = [
    {
      title: "মেইন মেনু",
      links: [
        { href: "/admin", label: "ড্যাশবোর্ড", icon: "fa-solid fa-house" },
        {
          href: "/admin/deposits",
          label: "ডিপোজিট",
          icon: "fa-solid fa-wallet",
        },
        {
          href: "/admin/withdraws",
          label: "উইথড্র",
          icon: "fa-solid fa-money-bill-transfer",
        },
        {
          href: "/admin/referrals",
          label: "রেফারেল",
          icon: "fa-solid fa-handshake",
        },
        {
          href: "/admin/payments",
          label: "পেমেন্ট",
          icon: "fa-solid fa-credit-card",
        },
      ],
    },
    {
      title: "এজেন্ট ও স্টাফ",
      links: [
        {
          href: "/admin/agent",
          label: "এজেন্ট প্যানেল",
          icon: "fa-solid fa-users-gear",
        },
        {
          href: "/admin/staff-list",
          label: "স্টাফ লিস্ট",
          icon: "fa-solid fa-user-tie",
        },
        {
          href: "/admin/permissions",
          label: "পারমিশন ম্যানেজমেন্ট",
          icon: "fa-solid fa-lock",
        },
      ],
    },
    {
      title: "বোনাস ও অডিট",
      links: [
        {
          href: "/admin/bonus-settings",
          label: "বোনাস সেটিংস",
          icon: "fa-solid fa-gear",
        },
        {
          href: "/admin/bonus-history",
          label: "বোনাস ইতিহাস",
          icon: "fa-solid fa-clock-rotate-left",
        },
        {
          href: "/admin/audit-logs",
          label: "অডিট লগ দেখুন",
          icon: "fa-solid fa-clipboard-list",
        },
      ],
    },
    {
      title: "গেটওয়ে ও সেটিংস",
      links: [
        {
          href: "/admin/payment-methods",
          label: "পেমেন্ট মেথডস",
          icon: "fa-solid fa-sliders",
        },
        {
          href: "/admin/settings/exchange-rate",
          label: "Exchange Rate",
          icon: "fa-solid fa-money-bill-trend-up",
        },
        {
          href: "/admin/nowpayments",
          label: "NowPayments",
          icon: "fa-brands fa-bitcoin",
        },
        {
          href: "/admin/settings/auto-crypto",
          label: "Auto Crypto",
          icon: "fa-solid fa-bolt",
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* 🔝 টপ হেডার (Navbar) */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0b101e] border-b border-slate-800 z-40 flex items-center justify-between px-4 md:px-6 shadow-md">
        {/* লোগো */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30">
            <i className="fa-solid fa-shield-halved text-lg"></i>
          </div>
          <h1 className="font-bold text-lg md:text-xl text-slate-200 tracking-wide">
            অ্যাডমিন
          </h1>
        </div>

        {/* মেনু ওপেন করার বাটন */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition"
        >
          <i className="fa-solid fa-bars text-lg"></i>
        </button>
      </header>

      {/* 🌑 মেনু ওপেন হলে পেছনের কালো পর্দা */}
      <div
        className={`fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] transition-opacity duration-300 flex items-center justify-center p-4 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        {/* 📂 মাঝখানে ভেসে ওঠা মেনু (Modal) */}
        <div
          className={`bg-[#0b101e] border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl transform transition-transform duration-300 flex flex-col max-h-[85vh] ${
            isMenuOpen ? "scale-100" : "scale-95"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* মেনুর হেডার */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
            <h2 className="text-lg font-bold text-emerald-400">সকল মেনু</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <i className="fa-solid fa-xmark text-lg"></i>
            </button>
          </div>

          {/* মেনুর লিংকগুলো (স্ক্রল করা যাবে) */}
          <div className="p-4 space-y-5 overflow-y-auto custom-scrollbar flex-1">
            {menuGroups.map((group, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                  {group.title}
                </h3>
                {group.links.map((l) => {
                  const active =
                    pathname === l.href ||
                    (l.href !== "/admin" && pathname.startsWith(l.href));
                  return (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        active
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                          : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      <i className={`${l.icon} text-base w-5 text-center`}></i>
                      <span>{l.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>

          {/* নিচে লগআউট বাটন */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/30 shrink-0">
            <button
              onClick={handleLogout}
              className="w-full bg-rose-600/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2"
            >
              <i className="fa-solid fa-arrow-right-from-bracket"></i> লগআউট
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
