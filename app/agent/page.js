"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AgentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await fetch("/api/agent/me");
        const json = await res.json();
        if (json.success) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, []);

  // 🆕 লগআউট ফাংশন
  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      // আপনার logout API এর পাথ (প্রয়োজনে পরিবর্তন করুন)
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const resData = await res.json();

      if (resData.success) {
        // লোকাল স্টোরেজ থেকে ইউজারের ডাটা মুছে ফেলা
        localStorage.removeItem("user");
        // লগইন পেজে রিডাইরেক্ট করা
        router.push("/login");
        router.refresh();
      } else {
        alert("লগআউট করতে সমস্যা হয়েছে!");
      }
    } catch (err) {
      console.error("Logout error:", err);
      alert("সার্ভার এরর!");
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center text-slate-400 bg-[#07090e]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  if (!data?.agent)
    return (
      <div className="p-6 text-slate-400 bg-[#07090e] min-h-screen">
        তথ্য পাওয়া যায়নি।
      </div>
    );

  const { agent, dollarRate } = data;

  const cards = [
    {
      title: "মূল ব্যালেন্স",
      value: `৳${Number(agent.agentMainBalance || 0).toFixed(2)}`,
      desc: "ডিপোজিট ও উইথড্র পেমেন্টের জন্য",
      color: "bg-slate-900 border-slate-800 hover:border-blue-500",
      textColor: "text-blue-400",
      icon: "💰",
    },
    {
      title: "কমিশন ব্যালেন্স",
      value: `৳${Number(agent.agentCommissionBalance || 0).toFixed(2)}`,
      desc: "ডিপোজিট/উইথড্র কমিশন থেকে অর্জিত",
      color: "bg-slate-900 border-slate-800 hover:border-emerald-500",
      textColor: "text-emerald-400",
      icon: "🎁",
    },
    {
      title: "ডলার রেট",
      value: `৳${Number(dollarRate || 0).toFixed(2)}`,
      desc: "১ ডলার = কত টাকা",
      color: "bg-slate-900 border-slate-800 hover:border-purple-500",
      textColor: "text-purple-400",
      icon: "💱",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto min-h-screen text-slate-100">
      {/* 🆕 হেডার ও লগআউট বাটন */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-emerald-400">
            স্বাগতম, এজেন্ট
          </h1>
          <p className="text-slate-400 mt-1 text-xs md:text-sm font-mono">
            {agent.agentCode} · {agent.agentPhone}
          </p>
        </div>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="bg-rose-950/50 hover:bg-rose-900 border border-rose-500/30 text-rose-400 px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loggingOut ? (
            <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <i className="fa-solid fa-arrow-right-from-bracket"></i>
          )}
          লগআউট
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <div
            key={c.title}
            className={`border rounded-2xl p-5 shadow-lg transition-colors duration-200 ${c.color}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <div className="w-10 h-10 rounded-full bg-slate-950 flex items-center justify-center text-xl border border-slate-800">
                {c.icon}
              </div>
            </div>
            <p className={`text-3xl font-black mt-3 font-mono ${c.textColor}`}>
              {c.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">{c.desc}</p>
          </div>
        ))}
      </div>

      {/* কমিশন তথ্য */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg">
        <h2 className="font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
          <i className="fa-solid fa-percent text-emerald-400"></i> আপনার কমিশন
          রেট
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">ডিপোজিট কমিশন</p>
            <p className="text-2xl font-bold text-emerald-400 font-mono">
              {agent.agentDepositCommission ?? 0}%
            </p>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-500 mb-1">উইথড্র কমিশন</p>
            <p className="text-2xl font-bold text-blue-400 font-mono">
              {agent.agentWithdrawCommission ?? 0}%
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-4 flex items-center gap-1.5">
          <i className="fa-solid fa-circle-info"></i>
          কমিশন মূলত টাকায় হিসাব হয় এবং আপনার কমিশন ব্যালেন্সে যোগ হয়।
        </p>
      </div>

      {/* দ্রুত লিংক */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickLink
          href="/agent/dollar-request"
          title="ডলার লোড রিকোয়েস্ট"
          desc="নতুন ডলার লোড রিকোয়েস্ট দিন"
          icon="💵"
          color="hover:border-blue-500/50"
        />
        <QuickLink
          href="/agent/commission-transfer"
          title="কমিশন ট্রান্সফার"
          desc="কমিশন ব্যালেন্স মূল ব্যালেন্সে যোগ করুন"
          icon="🔄"
          color="hover:border-emerald-500/50"
        />
        <QuickLink
          href="/agent/deposits"
          title="ডিপোজিট দেখুন"
          desc="আপনার কাছে আসা সব ডিপোজিট"
          icon="💰"
          color="hover:border-emerald-500/50"
        />
        <QuickLink
          href="/agent/withdraws"
          title="উইথড্র দেখুন"
          desc="আপনার সাথে সম্পর্কিত সব উইথড্র"
          icon="💸"
          color="hover:border-rose-500/50"
        />
      </div>

      {agent.agentIsBlocked && (
        <div className="mt-8 p-4 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-400 flex items-start gap-3">
          <i className="fa-solid fa-triangle-exclamation mt-0.5 text-lg"></i>
          <p className="text-sm font-bold">
            আপনার এজেন্ট অ্যাকাউন্ট ব্লক করা হয়েছে। সহায়তার জন্য যোগাযোগ করুন।
          </p>
        </div>
      )}
    </div>
  );
}

function QuickLink({ href, title, desc, icon, color }) {
  return (
    <Link
      href={href}
      className={`flex items-start gap-4 p-4 bg-slate-900 border border-slate-800 rounded-xl transition shadow-lg group ${color}`}
    >
      <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-2xl border border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-bold text-slate-200 group-hover:text-white transition-colors">
          {title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </Link>
  );
}
