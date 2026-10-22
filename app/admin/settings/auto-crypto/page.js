// app/admin/settings/auto-crypto/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AutoCryptoSettingsPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // ✅ Timer track
  const toastTimerRef = useRef(null);

  // ✅ Unmount-এ timer clear
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
      toastTimerRef.current = null;
    }, 3000);
  };

  // ✅ Load current status
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings/auto-crypto", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json();
      if (data.success) {
        setEnabled(data.enabled);
      }
    } catch (err) {
      console.error(err);
      showToast("Status load করতে সমস্যা!", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  // ✅ Toggle handler
  const handleToggle = async (newValue) => {
    if (saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/auto-crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ enabled: newValue }),
      });
      const data = await res.json();

      if (data.success) {
        setEnabled(data.enabled);
        showToast(data.message, "success");
      } else {
        showToast(data.message || "সমস্যা হয়েছে!", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("সার্ভার এরর!", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07090e] text-white flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-3 sm:p-6 font-sans">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] max-w-sm w-[calc(100%-1.5rem)]">
          <div
            className={`px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl text-center text-xs font-bold ${
              toast.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/40 text-emerald-400"
                : "bg-rose-950/95 border-rose-500/40 text-rose-400"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-lg font-extrabold text-emerald-400 flex items-center gap-2">
              <i className="fa-solid fa-bolt"></i>
              <span>Auto Crypto (NowPayments) সেটিংস</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
              User deposit page-এ Auto Crypto ট্যাব দেখাবে কি না নিয়ন্ত্রণ
              করুন।
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="text-[11px] sm:text-xs bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg text-slate-300 border border-slate-700 self-start sm:self-auto flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* Toggle Card */}
        <div className="bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 transition-all ${
                enabled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              <i
                className={`fa-solid ${enabled ? "fa-toggle-on" : "fa-toggle-off"}`}
              ></i>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white">
                Auto Crypto Status
              </h2>
              <p
                className={`text-xs font-semibold mt-0.5 ${
                  enabled ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {enabled ? "🟢 চালু আছে" : "🔴 বন্ধ আছে"}
              </p>
            </div>
          </div>

          {/* Big Toggle Button */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleToggle(true)}
              disabled={saving || enabled}
              className={`p-4 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center gap-2 ${
                enabled
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-950/40"
                  : "bg-slate-950 border-slate-700 text-slate-400 hover:border-emerald-500/50 hover:bg-emerald-500/5"
              } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <i className="fa-solid fa-power-off text-2xl"></i>
              <span className="font-bold text-sm">চালু করুন</span>
              <span className="text-[10px] opacity-70">ON</span>
            </button>

            <button
              onClick={() => handleToggle(false)}
              disabled={saving || !enabled}
              className={`p-4 rounded-2xl border-2 transition-all active:scale-95 flex flex-col items-center gap-2 ${
                !enabled
                  ? "bg-rose-500/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-950/40"
                  : "bg-slate-950 border-slate-700 text-slate-400 hover:border-rose-500/50 hover:bg-rose-500/5"
              } ${saving ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <i className="fa-solid fa-power-off text-2xl"></i>
              <span className="font-bold text-sm">বন্ধ করুন</span>
              <span className="text-[10px] opacity-70">OFF</span>
            </button>
          </div>

          {saving && (
            <div className="text-center text-xs text-emerald-400 font-semibold animate-pulse">
              <i className="fa-solid fa-spinner fa-spin mr-1"></i>
              আপডেট হচ্ছে...
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="bg-blue-950/30 border border-blue-500/30 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-circle-info text-blue-400"></i>
            <h4 className="text-xs font-bold text-blue-400">কীভাবে কাজ করে?</h4>
          </div>
          <ul className="text-[11px] text-slate-400 space-y-1.5 pl-1">
            <li>
              • <strong className="text-emerald-400">চালু থাকলে</strong> — User
              deposit page-এ "Auto Crypto" ট্যাব দেখা যাবে
            </li>
            <li>
              • <strong className="text-rose-400">বন্ধ থাকলে</strong> — শুধু
              "Manual Deposit" ট্যাব দেখা যাবে
            </li>
            <li>
              • <strong className="text-amber-400">তৎক্ষণাৎ কাজ করে</strong> —
              User page reload করলে নতুন সেটিংস দেখাবে
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
