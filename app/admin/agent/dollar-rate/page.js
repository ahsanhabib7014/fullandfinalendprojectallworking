"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DollarRatePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [dollarRate, setDollarRate] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    const loadRate = async () => {
      try {
        const res = await fetch("/api/admin/agent/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setDollarRate(data.settings.dollarRate ?? 0);
          setLastUpdated(data.settings.updatedAt || null);
        } else {
          setMessage({
            type: "error",
            text: data.message || "রেট লোড করা যায়নি",
          });
        }
      } catch (err) {
        setMessage({ type: "error", text: "সার্ভার এরর" });
      } finally {
        setLoading(false);
      }
    };
    loadRate();
  }, []);

  // লাইভ প্রিভিউ
  useEffect(() => {
    const rate = Number(dollarRate);
    if (!isNaN(rate) && rate > 0) {
      setPreview({
        usd1: rate,
        usd10: rate * 10,
        usd100: rate * 100,
      });
    } else {
      setPreview(null);
    }
  }, [dollarRate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const rate = Number(dollarRate);
    if (isNaN(rate) || rate <= 0) {
      setMessage({ type: "error", text: "ডলার রেট ০ এর বেশি হতে হবে" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/agent/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dollarRate: rate }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setLastUpdated(data.settings?.updatedAt || new Date().toISOString());
        if (data.settings) {
          setDollarRate(data.settings.dollarRate ?? 0);
        }
      } else {
        setMessage({ type: "error", text: data.message || "সেভ করা যায়নি" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold">লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto min-h-screen text-slate-100">
      <div className="mb-6">
        <Link
          href="/admin/agent"
          className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 mb-2"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i> এজেন্ট
          ম্যানেজমেন্টে ফিরে যান
        </Link>
        <h1 className="text-2xl font-bold text-orange-400 mt-2">ডলার রেট</h1>
        <p className="text-slate-400 mt-1 text-sm">
          এজেন্টের ডলার লোড ও ইউজার ডলার ডিপোজিট/উইথড্রতে এই রেট ব্যবহার হবে।
        </p>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-xl border text-sm font-bold ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
              : "bg-rose-950/40 border-rose-500/50 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 shadow-lg"
      >
        <div>
          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
            ১ ডলার = কত টাকা (৳)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xl">
              ৳
            </span>
            <input
              type="number"
              value={dollarRate}
              onChange={(e) => setDollarRate(e.target.value)}
              min="0.01"
              step="0.01"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-2xl text-emerald-400 font-mono font-bold focus:border-emerald-500 outline-none transition"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            যেমন: ১২০ লিখলে $১ = ৳১২০
          </p>
        </div>

        {/* লাইভ প্রিভিউ */}
        {preview && (
          <div className="mt-5 p-4 bg-slate-950 border border-blue-500/30 rounded-xl">
            <p className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-2">
              <i className="fa-solid fa-calculator"></i> প্রিভিউ (এই রেটে)
            </p>
            <ul className="text-sm text-slate-300 space-y-1.5 font-mono">
              <li className="flex justify-between">
                <span>$১</span>
                <span className="text-emerald-400 font-bold">
                  ৳{preview.usd1.toFixed(2)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>$১০</span>
                <span className="text-emerald-400 font-bold">
                  ৳{preview.usd10.toFixed(2)}
                </span>
              </li>
              <li className="flex justify-between">
                <span>$১০০</span>
                <span className="text-emerald-400 font-bold">
                  ৳{preview.usd100.toFixed(2)}
                </span>
              </li>
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col md:flex-row items-center gap-4 border-t border-slate-800 pt-5">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold px-8 py-2.5 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
          >
            {saving ? "সেভ হচ্ছে..." : "সেভ করুন"}
          </button>
          {lastUpdated && (
            <span className="text-xs text-slate-500 font-mono">
              সর্বশেষ আপডেট: {new Date(lastUpdated).toLocaleString("bn-BD")}
            </span>
          )}
        </div>
      </form>

      <div className="mt-6 p-4 bg-yellow-950/30 border border-yellow-500/30 rounded-xl text-sm text-yellow-500/90">
        <p className="font-bold mb-2 flex items-center gap-2">
          <i className="fa-solid fa-triangle-exclamation"></i> মনে রাখবেন
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-xs">
          <li>
            রেট পরিবর্তন হলে{" "}
            <strong className="text-yellow-400">
              পুরোনো ডিপোজিট/উইথড্র/লোড রিকোয়েস্টে
            </strong>{" "}
            আগের রেটই থাকবে (স্ন্যাপশট)
          </li>
          <li>নতুন রিকোয়েস্টে নতুন রেট ব্যবহার হবে</li>
        </ul>
      </div>
    </div>
  );
}
