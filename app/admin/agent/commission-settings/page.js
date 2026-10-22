"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function CommissionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    defaultDepositCommission: "",
    defaultWithdrawCommission: "",
  });

  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/admin/agent/settings");
        const data = await res.json();
        if (data.success && data.settings) {
          setForm({
            defaultDepositCommission:
              data.settings.defaultDepositCommission ?? 0,
            defaultWithdrawCommission:
              data.settings.defaultWithdrawCommission ?? 0,
          });
          setLastUpdated(data.settings.updatedAt || null);
        } else {
          setMessage({
            type: "error",
            text: data.message || "সেটিংস লোড করা যায়নি",
          });
        }
      } catch (err) {
        setMessage({ type: "error", text: "সার্ভার এরর" });
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    // ভ্যালিডেশন
    const dep = Number(form.defaultDepositCommission);
    const wit = Number(form.defaultWithdrawCommission);

    if (isNaN(dep) || dep < 0 || dep > 100) {
      setMessage({
        type: "error",
        text: "ডিপোজিট কমিশন ০ থেকে ১০০ এর মধ্যে হতে হবে",
      });
      return;
    }
    if (isNaN(wit) || wit < 0 || wit > 100) {
      setMessage({
        type: "error",
        text: "উইথড্র কমিশন ০ থেকে ১০০ এর মধ্যে হতে হবে",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/agent/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          defaultDepositCommission: dep,
          defaultWithdrawCommission: wit,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setLastUpdated(data.settings?.updatedAt || new Date().toISOString());
        if (data.settings) {
          setForm({
            defaultDepositCommission:
              data.settings.defaultDepositCommission ?? 0,
            defaultWithdrawCommission:
              data.settings.defaultWithdrawCommission ?? 0,
          });
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
        <h1 className="text-2xl font-bold text-yellow-400 mt-2">
          কমিশন সেটিংস
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          ডিফল্ট ডিপোজিট ও উইথড্র কমিশন সেট করুন। এজেন্টের নিজস্ব কমিশন না থাকলে
          এই মান ব্যবহার হবে।
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
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              ডিপোজিট কমিশন (%)
            </label>
            <div className="relative">
              <input
                type="number"
                name="defaultDepositCommission"
                value={form.defaultDepositCommission}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg text-emerald-400 font-mono font-bold focus:border-emerald-500 outline-none transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              ইউজার ডিপোজিট অ্যাপ্রুভ হলে এজেন্ট এই % কমিশন পাবে (টাকায়)
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              উইথড্র কমিশন (%)
            </label>
            <div className="relative">
              <input
                type="number"
                name="defaultWithdrawCommission"
                value={form.defaultWithdrawCommission}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-lg text-blue-400 font-mono font-bold focus:border-blue-500 outline-none transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                %
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              ইউজার উইথড্র অ্যাপ্রুভ হলে এজেন্ট এই % কমিশন পাবে (টাকায়)
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center gap-4 border-t border-slate-800 pt-5">
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
    </div>
  );
}
