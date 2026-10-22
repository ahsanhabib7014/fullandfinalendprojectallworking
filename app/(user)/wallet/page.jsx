"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import DepositHistorySection from "@/components/deposithistoryfetch";
import WithdrawHistorySection from "@/components/withdrowhistryfeatch";
import BetHistorySection from "@/components/bethistryfeatch";

export default function WalletPage() {
  const [user, setUser] = useState({ balance: 0, turnover: 0 });
  const [activeTab, setActiveTab] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.uid) {
      router.push("/login");
      return;
    }

    // ✅ FIX #1: String → Number conversion
    setUser({
      ...savedUser,
      balance: Number(savedUser.balance) || 0,
      turnover: Number(savedUser.turnover) || 0,
    });

    // ✅ FIX: /api/user/me ব্যবহার করা হচ্ছে (admin API-র বদলে)
    fetch("/api/user/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          // ✅ FIX #2: সব field Number-এ convert
          const currentUser = {
            ...data.user,
            balance: Number(data.user.balance) || 0,
            turnover: Number(data.user.turnover) || 0,
          };
          setUser(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      })
      .catch((err) => console.error(err));
  }, [router]);

  const uidToFetch = user.phone || user.uid;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-24 md:pb-8 font-sans selection:bg-emerald-500 selection:text-white">
      <div className="w-full max-w-md md:max-w-2xl space-y-3 md:space-y-4">
        {/* হেডার সেকশন (কমপ্যাক্ট) */}
        <div className="flex justify-between items-center bg-slate-900 p-3 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm font-bold text-emerald-400 flex items-center gap-2 whitespace-nowrap">
            <i className="fa-solid fa-wallet"></i> আমার ওয়ালেট
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 flex-shrink-0"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* ব্যালেন্স কার্ড */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 p-5 md:p-6 rounded-2xl border border-emerald-500/30 shadow-xl text-left">
          <p className="text-[11px] md:text-xs text-slate-400 uppercase tracking-wider font-semibold">
            উপলব্ধ মূল ব্যালেন্স
          </p>
          {/* ✅ ব্যালেন্সে truncate */}
          <h1 className="text-base md:text-lg font-bold text-amber-400 font-mono mt-1 truncate">
            ৳{user.balance || 0}
          </h1>
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs md:text-sm text-slate-400 font-mono">
            {/* ✅ টার্নওভারে truncate */}
            <span className="truncate">
              টার্নওভার:{" "}
              <strong className="text-emerald-400">
                ৳{user.turnover || 0}
              </strong>
            </span>
            {/* ✅ আইডিতে truncate */}
            <span className="truncate">
              আইডি: <strong className="text-white">{user.uid}</strong>
            </span>
          </div>
        </div>

        {/* কমপ্যাক্ট অ্যাকশন বাটন (ডিপোজিট এবং উইথড্র) */}
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <Link
            href="/deposit"
            className="flex flex-row items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-950/40 group"
          >
            <span className="text-xl group-hover:scale-110 transition">📥</span>
            <span className="font-bold text-sm">ডিপোজিট</span>
          </Link>

          <Link
            href="/withdraw"
            className="flex flex-row items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 py-3.5 px-4 rounded-xl transition shadow-lg shadow-rose-950/40 group"
          >
            <span className="text-xl group-hover:scale-110 transition">📤</span>
            <span className="font-bold text-sm">উইথড্র</span>
          </Link>
        </div>

        {/* হিস্ট্রি সেকশন */}
        <div className="space-y-3 pt-1">
          <p className="text-[11px] md:text-xs text-slate-400 text-center font-semibold uppercase tracking-wider">
            লেনদেনের ইতিহাস
          </p>

          {/* সেগমেন্টেড ট্যাব ডিজাইন */}
          <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-slate-900 rounded-xl border border-slate-800 shadow-lg">
            <button
              onClick={() =>
                setActiveTab(activeTab === "deposit" ? null : "deposit")
              }
              className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "deposit"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>📥</span> ডিপোজিট
            </button>

            <button
              onClick={() =>
                setActiveTab(activeTab === "withdraw" ? null : "withdraw")
              }
              className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "withdraw"
                  ? "bg-rose-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>📤</span> উইথড্র
            </button>

            <button
              onClick={() => setActiveTab(activeTab === "bet" ? null : "bet")}
              className={`py-2.5 px-1 rounded-lg text-[11px] md:text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === "bet"
                  ? "bg-amber-600 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <span>🎲</span> বেট হিস্ট্রি
            </button>
          </div>

          {/* হিস্ট্রি সেকশনগুলো */}
          <div className="pt-1">
            {activeTab === "deposit" && (
              <DepositHistorySection
                uid={uidToFetch}
                onClose={() => setActiveTab(null)}
              />
            )}
            {activeTab === "withdraw" && (
              <WithdrawHistorySection
                uid={uidToFetch}
                onClose={() => setActiveTab(null)}
              />
            )}
            {activeTab === "bet" && (
              <BetHistorySection
                uid={uidToFetch}
                onClose={() => setActiveTab(null)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
