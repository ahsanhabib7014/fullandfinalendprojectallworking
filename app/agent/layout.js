"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AgentLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/agent/me");
        const data = await res.json();

        if (!data.success) {
          router.push("/login");
          return;
        }
        setAgent(data.agent);
      } catch (err) {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [router]);

  const links = [
    { href: "/agent", label: "ড্যাশবোর্ড", icon: "🏠" },
    { href: "/agent/deposits", label: "ডিপোজিট", icon: "💰" },
    { href: "/agent/withdraws", label: "উইথড্র", icon: "💸" },
    { href: "/agent/dollar-request", label: "ডলার লোড", icon: "💵" },
    {
      href: "/agent/commission-transfer",
      label: "কমিশন ট্রান্সফার",
      icon: "🔄",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090e] text-slate-400">
        <p className="text-sm font-semibold">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100">
      {/* মোবাইল হেডার */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-3 flex items-center justify-between sticky top-0 z-30">
        <h1 className="font-bold text-emerald-400">এজেন্ট প্যানেল</h1>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="text-slate-200 px-3 py-1 border border-slate-700 rounded-lg bg-slate-800"
        >
          ☰
        </button>
      </div>

      <div className="flex">
        {/* সাইডবার */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-20 w-64 bg-slate-900 border-r border-slate-800
            transform transition-transform duration-200
            ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}
        >
          <div className="p-4 border-b border-slate-800 hidden lg:block">
            <h1 className="font-bold text-emerald-400">এজেন্ট প্যানেল</h1>
            {agent && (
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {agent.agentCode} · {agent.agentPhone}
              </p>
            )}
          </div>

          <nav className="p-2 space-y-1 mt-12 lg:mt-0">
            {links.map((l) => {
              const active =
                pathname === l.href ||
                (l.href !== "/agent" && pathname.startsWith(l.href));
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className="text-lg">{l.icon}</span>
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>

          {agent && (
            <div className="p-3 m-2 mt-4 bg-slate-950 border border-slate-800 rounded-xl text-xs shadow-inner">
              <p className="text-slate-500 mb-1">মূল ব্যালেন্স</p>
              <p className="font-bold text-blue-400 text-lg font-mono">
                ৳{Number(agent.agentMainBalance || 0).toFixed(2)}
              </p>
              <div className="border-t border-slate-800 my-2"></div>
              <p className="text-slate-500 mb-1">কমিশন ব্যালেন্স</p>
              <p className="font-bold text-emerald-400 text-lg font-mono">
                ৳{Number(agent.agentCommissionBalance || 0).toFixed(2)}
              </p>
            </div>
          )}
        </aside>

        {/* মোবাইল ওভারলে */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* মূল কনটেন্ট */}
        <main className="flex-1 lg:ml-0 min-w-0">{children}</main>
      </div>
    </div>
  );
}
