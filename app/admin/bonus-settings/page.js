"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BonusSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [giving, setGiving] = useState({ weekly: false, monthly: false });
  const [settings, setSettings] = useState({
    weeklyBonusEnabled: true,
    depositBonusEnabled: true,
    depositBonusPercent: 5,
    depositBonusMax: 1000,
    depositBonusMinDeposit: 1000,
    cashbackEnabled: true,
    cashbackPercent: 5,
    cashbackMax: 500,
    cashbackMinTurnover: 1000,
    topRankerEnabled: true,
    topRankerCount: 10,
    rank1Prize: 5000,
    rank2Prize: 3000,
    rank3Prize: 2000,
    rank4Prize: 1000,
    rank5Prize: 800,
    rank6Prize: 600,
    rank7Prize: 500,
    rank8Prize: 400,
    rank9Prize: 300,
    rank10Prize: 200,
    rank11PlusPrize: 100,
  });

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [result, setResult] = useState(null);

  // কাস্টম মডাল স্টেটস
  const [modal, setModal] = useState({
    show: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(
      () => setToast({ show: false, message: "", type: "success" }),
      3500,
    );
  };

  useEffect(() => {
    fetch("/api/admin/bonus-settings", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSettings(data.settings);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/bonus-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSettings(data.settings);
        showToast("✅ সেটিংস সেভ হয়েছে!", "success");
      } else {
        showToast(data.message || "সমস্যা হয়েছে!", "error");
      }
    } catch (err) {
      showToast("সার্ভার এরর!", "error");
    } finally {
      setSaving(false);
    }
  };

  const triggerGiveWeekly = () => {
    setModal({
      show: true,
      title: "📅 সাপ্তাহিক বোনাস বিতরণ",
      message: "আপনি কি নিশ্চিত যে সব যোগ্য ইউজারকে সাপ্তাহিক বোনাস দিতে চান?",
      onConfirm: executeGiveWeekly,
    });
  };

  const executeGiveWeekly = async () => {
    setModal({ ...modal, show: false });
    setGiving({ ...giving, weekly: true });
    setResult(null);
    try {
      const res = await fetch("/api/admin/bonus/weekly", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setResult({ type: "weekly", data });
      } else {
        showToast(data.message || "সমস্যা হয়েছে!", "error");
      }
    } catch (err) {
      showToast("সার্ভার এরর!", "error");
    } finally {
      setGiving({ ...giving, weekly: false });
    }
  };

  const triggerGiveMonthly = () => {
    setModal({
      show: true,
      title: "🏆 মাসিক টপ র‍্যাংকার বোনাস",
      message:
        "আপনি কি নিশ্চিত যে মাসিক টপ র‍্যাংকারদের বোনাস প্রদান করতে চান?",
      onConfirm: executeGiveMonthly,
    });
  };

  const executeGiveMonthly = async () => {
    setModal({ ...modal, show: false });
    setGiving({ ...giving, monthly: true });
    setResult(null);
    try {
      const res = await fetch("/api/admin/bonus/monthly", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        setResult({ type: "monthly", data });
      } else {
        showToast(data.message || "সমস্যা হয়েছে!", "error");
      }
    } catch (err) {
      showToast("সার্ভার এরর!", "error");
    } finally {
      setGiving({ ...giving, monthly: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex items-center justify-center">
        লোড হচ্ছে...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 font-sans relative">
      {/* 🎯 স্ক্রিনের ঠিক মাঝখানে সুবিন্যস্ত ও সামঞ্জস্যপূর্ণ টোস্ট (Centered & Balanced Toast) */}
      {toast.show && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none p-4">
          <div
            className="px-6 py-4 rounded-2xl border backdrop-blur-2xl shadow-2xl text-xs font-bold text-center pointer-events-auto max-w-sm w-full animate-in fade-in zoom-in duration-200"
            style={{
              background:
                toast.type === "success"
                  ? "rgba(6, 78, 59, 0.95)"
                  : "rgba(127, 29, 29, 0.95)",
              borderColor:
                toast.type === "success"
                  ? "rgba(16, 185, 129, 0.5)"
                  : "rgba(244, 63, 94, 0.5)",
              color: toast.type === "success" ? "#34d399" : "#fb7185",
            }}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* 🔴 কাস্টম 'হ্যাঁ / না' মডাল */}
      {modal.show && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-5 text-center">
            <h3 className="text-lg font-bold text-white">{modal.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {modal.message}
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal({ ...modal, show: false })}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer"
              >
                না (Cancel)
              </button>
              <button
                onClick={modal.onConfirm}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer shadow-lg shadow-emerald-900/40"
              >
                হ্যাঁ (Confirm)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* হেডার */}
        <div className="flex justify-between items-center bg-slate-900/40 border border-slate-800/80 p-5 rounded-3xl shadow-2xl">
          <div>
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              🎁 বোনাস সেটিংস
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              সব বোনাস নিয়ন্ত্রণ করুন
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold"
          >
            ← ফিরে যান
          </button>
        </div>

        {/* সাপ্তাহিক বোনাস সেকশন */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-sm md:text-base font-bold text-emerald-400 uppercase flex items-center gap-2">
              📅 সাপ্তাহিক বোনাস
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-400">স্ট্যাটাস:</span>
              <input
                type="checkbox"
                checked={settings.weeklyBonusEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    weeklyBonusEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-emerald-500"
              />
              <span
                className={`text-xs font-bold ${settings.weeklyBonusEnabled ? "text-emerald-400" : "text-rose-400"}`}
              >
                {settings.weeklyBonusEnabled ? "ON" : "OFF"}
              </span>
            </label>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-emerald-300 uppercase">
                💰 ডিপোজিট বোনাস
              </h3>
              <input
                type="checkbox"
                checked={settings.depositBonusEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    depositBonusEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-emerald-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  বোনাস %
                </label>
                <input
                  type="number"
                  value={settings.depositBonusPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      depositBonusPercent: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  সর্বোচ্চ (৳)
                </label>
                <input
                  type="number"
                  value={settings.depositBonusMax}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      depositBonusMax: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  ন্যূনতম ডিপোজিট (৳)
                </label>
                <input
                  type="number"
                  value={settings.depositBonusMinDeposit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      depositBonusMinDeposit: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-rose-300 uppercase">
                💸 ক্যাশব্যাক
              </h3>
              <input
                type="checkbox"
                checked={settings.cashbackEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    cashbackEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-rose-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  ক্যাশব্যাক %
                </label>
                <input
                  type="number"
                  value={settings.cashbackPercent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cashbackPercent: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-rose-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  সর্বোচ্চ (৳)
                </label>
                <input
                  type="number"
                  value={settings.cashbackMax}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cashbackMax: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-rose-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">
                  ন্যূনতম টার্নওভার (৳)
                </label>
                <input
                  type="number"
                  value={settings.cashbackMinTurnover}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      cashbackMinTurnover: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-rose-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* মাসিক টপ র্যাংকার সেকশন */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-sm md:text-base font-bold text-blue-400 uppercase flex items-center gap-2">
              🏆 মাসিক টপ র‍্যাংকার
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-slate-400">স্ট্যাটাস:</span>
              <input
                type="checkbox"
                checked={settings.topRankerEnabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    topRankerEnabled: e.target.checked,
                  })
                }
                className="w-5 h-5 accent-blue-500"
              />
              <span
                className={`text-xs font-bold ${settings.topRankerEnabled ? "text-blue-400" : "text-rose-400"}`}
              >
                {settings.topRankerEnabled ? "ON" : "OFF"}
              </span>
            </label>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">
                কতজন পাবে (Top X)
              </label>
              <input
                type="number"
                value={settings.topRankerCount}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    topRankerCount: Number(e.target.value),
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div>
                <label className="text-[10px] text-amber-400 block mb-1">
                  🥇 ১ম (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank1Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank1Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-amber-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-300 block mb-1">
                  🥈 ২য় (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank2Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank2Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-orange-400 block mb-1">
                  🥉 ৩য় (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank3Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank3Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-orange-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  ৪র্থ (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank4Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank4Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  ৫ম (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank5Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank5Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  ৬ষ্ঠ (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank6Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank6Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  ৭ম (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank7Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank7Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  ৮ম (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank8Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank8Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  ৯ম (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank9Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank9Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">
                  ১০ম (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank10Prize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank10Prize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-slate-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] text-cyan-400 block mb-1">
                  ১১+ (৳)
                </label>
                <input
                  type="number"
                  value={settings.rank11PlusPrize}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      rank11PlusPrize: Number(e.target.value),
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 p-3 rounded-xl text-xs text-white outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white py-4 rounded-2xl font-bold text-sm shadow-lg transition active:scale-95 cursor-pointer"
        >
          {saving ? "সেভ হচ্ছে..." : "💾 সেটিংস সেভ করুন"}
        </button>

        {/* ম্যানুয়াল বোনাস */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
          <h2 className="text-sm md:text-base font-bold text-slate-300 uppercase pb-4 border-b border-slate-800">
            🎁 ম্যানুয়াল বোনাস দিন
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-emerald-300 uppercase">
                  📅 সাপ্তাহিক বোনাস
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  ডিপোজিট বোনাস + ক্যাশব্যাক একসাথে
                </p>
              </div>
              <button
                onClick={triggerGiveWeekly}
                disabled={giving.weekly || !settings.weeklyBonusEnabled}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer"
              >
                {giving.weekly
                  ? "⏳ দেওয়া হচ্ছে..."
                  : "📤 সাপ্তাহিক বোনাস দিন"}
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-500/40 rounded-2xl p-4 space-y-3">
              <div>
                <h3 className="text-xs font-bold text-blue-300 uppercase">
                  🏆 মাসিক টপ র‍্যাংকার
                </h3>
                <p className="text-[10px] text-slate-500 mt-1">
                  Top 10 ক্যাশব্যাক প্রাপক
                </p>
              </div>
              <button
                onClick={triggerGiveMonthly}
                disabled={giving.monthly || !settings.topRankerEnabled}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-bold text-xs transition active:scale-95 cursor-pointer"
              >
                {giving.monthly ? "⏳ দেওয়া হচ্ছে..." : "📤 মাসিক বোনাস দিন"}
              </button>
            </div>
          </div>
        </div>

        {/* ফলাফল */}
        {result && (
          <div className="bg-slate-900/40 border border-emerald-500/40 rounded-3xl p-5 md:p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-emerald-400 uppercase">
              📊 ফলাফল — {result.type === "weekly" ? "সাপ্তাহিক" : "মাসিক"}
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {result.type === "weekly" ? (
                <>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500">মোট ইউজার</p>
                    <p className="text-lg font-black text-white mt-1">
                      {result.data.summary.totalUsers}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500">ডিপোজিট বোনাস</p>
                    <p className="text-lg font-black text-emerald-400 mt-1">
                      {result.data.summary.depositBonusCount}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500">ক্যাশব্যাক</p>
                    <p className="text-lg font-black text-rose-400 mt-1">
                      {result.data.summary.dashbackCount ||
                        result.data.summary.cashbackCount}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500">মোট বোনাস</p>
                    <p className="text-lg font-black text-amber-400 mt-1">
                      ৳{result.data.summary.totalBonus}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                    <p className="text-[10px] text-slate-500">বিজয়ী</p>
                    <p className="text-lg font-black text-white mt-1">
                      {result.data.summary.totalWinners}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 col-span-3">
                    <p className="text-[10px] text-slate-500">মোট বোনাস</p>
                    <p className="text-lg font-black text-amber-400 mt-1">
                      ৳{result.data.summary.totalBonus}
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 max-h-60 overflow-auto">
              <p className="text-[10px] text-slate-500 mb-2">বিস্তারিত:</p>
              <div className="space-y-1 text-xs font-mono">
                {result.data.details.slice(0, 20).map((d, i) => (
                  <div key={i} className="flex justify-between text-slate-300">
                    <span>
                      {d.rank ? `#${d.rank} ` : ""}
                      {d.phone}
                    </span>
                    <span className="text-emerald-400">
                      {d.prize
                        ? `৳${d.prize}`
                        : d.bonuses?.map((b) => `৳${b.amount}`).join(" + ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
