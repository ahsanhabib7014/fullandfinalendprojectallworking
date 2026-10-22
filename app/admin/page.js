"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import LiveBetTrackingCard from "@/components/LiveBetTrackingCard";

export default function AdminHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposit: 0,
    totalWithdraw: 0,
    totalUserBalance: 0,
    totalReferralBonus: 0,
    adminNetProfit: 0,
    todayDeposit: 0,
    todayWithdraw: 0,
    todayProfit: 0,
  });
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingUser, setEditingUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");
  const [newTurnover, setNewTurnover] = useState("");
  const [newIp, setNewIp] = useState("");

  const [confirmData, setConfirmData] = useState(null);
  const [toasts, setToasts] = useState([]);

  const searchQueryRef = useRef("");
  const fetchDataRef = useRef(null);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchData = useCallback(async (search = "") => {
    try {
      const statsRes = await fetch(`/api/admin/stats?t=${Date.now()}`);
      const statsData = await statsRes.json();
      if (statsData.success) setStats(statsData.stats);

      const usersRes = await fetch(
        `/api/admin/users?search=${search}&t=${Date.now()}`,
      );
      const usersData = await usersRes.json();
      if (usersData.success) setUsers(usersData.users);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDataRef.current = fetchData;
  }, [fetchData]);

  useEffect(() => {
    searchQueryRef.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    fetchDataRef.current?.("");
    const interval = setInterval(() => {
      fetchDataRef.current?.(searchQueryRef.current);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData(searchQuery);
  };

  const askConfirm = ({
    title,
    message,
    icon = "⚠️",
    iconColor = "amber",
    confirmText = "হ্যাঁ, নিশ্চিত",
    confirmClass = "emerald",
    onYes,
  }) => {
    setConfirmData({
      title,
      message,
      icon,
      iconColor,
      confirmText,
      confirmClass,
      onYes,
    });
  };

  const performUpdateUser = async (userId, updateData) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ...updateData }),
      });
      const data = await res.json();
      showToast(data.message || "সফলভাবে আপডেট হয়েছে", "success");
      setEditingUser(null);
      fetchData(searchQuery);
    } catch (err) {
      showToast("আপডেট করতে সমস্যা হয়েছে", "error");
    }
  };

  const performDeleteUser = async (userId) => {
    try {
      await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      showToast(`ইউজার ${userId} ডিলিট হয়েছে`, "success");
      fetchData(searchQuery);
    } catch (err) {
      showToast("ডিলিট করতে সমস্যা হয়েছে", "error");
    }
  };

  const handleUpdateUser = (userId, updateData) => {
    let title = "তথ্য আপডেট নিশ্চিত করুন";
    let message = "আপনি কি এই ইউজারের তথ্য আপডেট করতে চান?";
    let icon = "✏️";
    let iconColor = "blue";
    let confirmText = "হ্যাঁ, আপডেট";
    let confirmClass = "blue";

    if (updateData.isBlocked === true) {
      title = "ইউজার ব্লক নিশ্চিত করুন";
      message = "আপনি কি এই ইউজারকে ব্লক করতে চান?";
      icon = "🚫";
      iconColor = "rose";
      confirmText = "হ্যাঁ, ব্লক";
      confirmClass = "rose";
    }
    if (updateData.isBlocked === false) {
      title = "ইউজার আনব্লক নিশ্চিত করুন";
      message = "আপনি কি এই ইউজারকে আনব্লক করতে চান?";
      icon = "✅";
      iconColor = "emerald";
      confirmText = "হ্যাঁ, আনব্লক";
      confirmClass = "emerald";
    }

    askConfirm({
      title,
      message,
      icon,
      iconColor,
      confirmText,
      confirmClass,
      onYes: () => performUpdateUser(userId, updateData),
    });
  };

  const handleDeleteUser = (userId) => {
    askConfirm({
      title: "ইউজার ডিলিট নিশ্চিত করুন",
      message: `ইউজার ${userId} কে স্থায়ীভাবে ডিলিট করতে চান? এই কাজটি ফিরিয়ে আনা যাবে না।`,
      icon: "🗑️",
      iconColor: "rose",
      confirmText: "হ্যাঁ, ডিলিট",
      confirmClass: "rose",
      onYes: () => performDeleteUser(userId),
    });
  };

  const handleEditClick = (u) => {
    askConfirm({
      title: "ইউজার এডিট নিশ্চিত করুন",
      message: `ইউজার ${u.uid} এর তথ্য এডিট করতে চান?`,
      icon: "✏️",
      iconColor: "blue",
      confirmText: "হ্যাঁ, এডিট",
      confirmClass: "blue",
      onYes: () => {
        setEditingUser(u.uid);
        setNewBalance(u.balance);
        setNewTurnover(u.turnover || 0);
        setNewIp(u.ipAddress || "");
      },
    });
  };

  const handleLogout = () => {
    askConfirm({
      title: "লগআউট নিশ্চিত করুন",
      message: "আপনি কি অ্যাডমিন প্যানেল থেকে লগআউট করতে চান?",
      icon: "🔓",
      iconColor: "rose",
      confirmText: "হ্যাঁ, লগআউট",
      confirmClass: "rose",
      onYes: async () => {
        try {
          const res = await fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (res.ok) {
            showToast("সফলভাবে লগআউট হয়েছে", "success");
            setTimeout(() => {
              router.push("/login");
            }, 800);
          } else {
            showToast("লগআউট করতে সমস্যা হয়েছে", "error");
          }
        } catch (err) {
          console.error("Logout error:", err);
          showToast("নেটওয়ার্ক সমস্যা হয়েছে", "error");
        }
      },
    });
  };

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
  const fmtMoney = (n) => Number(n || 0).toFixed(2);

  const getAmountClass = (value, prefix = "৳") => {
    const len = `${prefix}${fmt(value)}`.length;
    if (len >= 15) return "text-sm md:text-base";
    if (len >= 13) return "text-base md:text-lg";
    if (len >= 10) return "text-lg md:text-xl";
    return "text-lg md:text-xl";
  };

  const iconColorMap = {
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  const confirmBtnMap = {
    emerald:
      "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/40",
    rose: "from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 shadow-rose-950/40",
    blue: "from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-blue-950/40",
  };

  const toastStyleMap = {
    success: {
      bg: "bg-emerald-950/95 border-emerald-500/40",
      icon: "✅",
      iconBg: "bg-emerald-500/20 text-emerald-400",
    },
    error: {
      bg: "bg-rose-950/95 border-rose-500/40",
      icon: "❌",
      iconBg: "bg-rose-500/20 text-rose-400",
    },
    info: {
      bg: "bg-blue-950/95 border-blue-500/40",
      icon: "ℹ️",
      iconBg: "bg-blue-500/20 text-blue-400",
    },
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 space-y-6 font-sans">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] space-y-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
        {toasts.map((t) => {
          const s = toastStyleMap[t.type] || toastStyleMap.success;
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl ${s.bg}`}
              style={{
                animation: "slideDown 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              <div
                className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base ${s.iconBg}`}
              >
                {s.icon}
              </div>
              <p className="flex-1 text-xs font-semibold text-white leading-relaxed">
                {t.message}
              </p>
              <button
                onClick={() => removeToast(t.id)}
                className="flex-shrink-0 text-slate-400 hover:text-white text-xs transition-colors"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* হেডার */}
      <div className="relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800/80 p-5 md:p-6 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 relative z-10">
          <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            অ্যাডমিন কন্ট্রোল সেন্টার
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            রিয়েল-টাইম ফিন্যান্সিয়াল ওভারভিউ
          </p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <button
            onClick={() => fetchData(searchQuery)}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg transition-all active:scale-95"
          >
            <span className="group-hover:rotate-180 transition-transform duration-500 text-sm">
              🔄
            </span>
            ডেটা সিঙ্ক করুন
          </button>
          <button
            onClick={handleLogout}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30 shadow-lg shadow-rose-950/30 transition-all duration-300 active:scale-95"
            title="লগআউট"
          >
            <span className="text-sm group-hover:-translate-x-0.5 transition-transform">
              🔓
            </span>
            লগআউট
          </button>
        </div>
      </div>

      {/* ================= ৬টি কার্ড ================= */}
      <div className="flex flex-col gap-3 md:gap-4">
        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-slate-800/80 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            {/* ✅ টাইটেলে truncate যুক্ত করা হয়েছে */}
            <span className="text-[11px] md:text-xs font-bold text-slate-400 uppercase truncate">
              মোট ইউজার
            </span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-2xl text-sm border border-blue-500/20 flex-shrink-0">
              👥
            </div>
          </div>
          {/* ✅ ইউজার কাউন্টে truncate বজায় রাখা হয়েছে */}
          <h2
            className={`mt-2 font-black text-white truncate ${getAmountClass(stats.totalUsers, "")}`}
          >
            {fmt(stats.totalUsers)}
          </h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-slate-800/80 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            {/* ✅ টাইটেলে truncate নিশ্চিত করা হয়েছে */}
            <span className="text-[11px] md:text-xs font-bold text-slate-400 uppercase truncate">
              মোট ডিপোজিট
            </span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20 flex-shrink-0">
              📥
            </div>
          </div>
          {/* ✅ ডিপোজিট অ্যামাউন্টে truncate সহ */}
          <h2
            className={`mt-2 font-black text-emerald-400 truncate ${getAmountClass(stats.totalDeposit)}`}
          >
            ৳{fmt(stats.totalDeposit)}
          </h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-slate-800/80 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            {/* ✅ টাইটেলে truncate যুক্ত করা হয়েছে */}
            <span className="text-[11px] md:text-xs font-bold text-slate-400 uppercase truncate">
              মোট উইথড্র
            </span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20 flex-shrink-0">
              📤
            </div>
          </div>
          {/* ✅ উইথড্র অ্যামাউন্টে truncate আগে থেকেই রয়েছে */}
          <h2
            className={`mt-2 font-black text-rose-400 truncate ${getAmountClass(stats.totalWithdraw)}`}
          >
            ৳{fmt(stats.totalWithdraw)}
          </h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-slate-800/80 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            {/* ✅ টাইটেলে truncate যুক্ত করা হয়েছে */}
            <span className="text-[11px] md:text-xs font-bold text-slate-400 uppercase truncate">
              মোট ইউজার বেলেন্স
            </span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-2xl text-sm border border-amber-500/20 flex-shrink-0">
              💰
            </div>
          </div>
          {/* ✅ অ্যামাউন্টে truncate আগে থেকেই রয়েছে */}
          <h2
            className={`mt-2 font-black text-amber-400 truncate ${getAmountClass(stats.totalUserBalance)}`}
          >
            ৳{fmt(stats.totalUserBalance)}
          </h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-slate-800/80 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            {/* ✅ টাইটেলে truncate যুক্ত করা হয়েছে */}
            <span className="text-[11px] md:text-xs font-bold text-slate-400 uppercase truncate">
              মোট রেফারেল বোনাস
            </span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-2xl text-sm border border-purple-500/20 flex-shrink-0">
              🤝
            </div>
          </div>
          {/* ✅ অ্যামাউন্টে truncate আগে থেকেই রয়েছে */}
          <h2
            className={`mt-2 font-black text-purple-400 truncate ${getAmountClass(stats.totalReferralBonus)}`}
          >
            ৳{fmt(stats.totalReferralBonus)}
          </h2>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl p-4 md:p-5 rounded-2xl border border-emerald-500/40 shadow-xl min-w-0 overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            {/* ✅ টাইটেলে truncate যুক্ত করা হয়েছে */}
            <span className="text-[11px] md:text-xs font-bold text-emerald-300 uppercase truncate">
              অ্যাডমিনের নিট লাভ
            </span>
            <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-2xl text-sm border border-emerald-500/30 flex-shrink-0">
              📊
            </div>
          </div>
          {/* ✅ অ্যামাউন্টে truncate আগে থেকেই রয়েছে */}
          <h2
            className={`mt-2 font-black truncate ${stats.adminNetProfit >= 0 ? "text-emerald-400" : "text-rose-400"} ${getAmountClass(Math.abs(stats.adminNetProfit))}`}
          >
            ৳{fmt(stats.adminNetProfit)}
          </h2>
        </div>
      </div>

      {/* ✅✅✅ NEW: আজকের লাভ/লস */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 truncate">
              📅 আজকের হিসাব
            </h2>
            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20 truncate">
              🔄 রাত ১২টায় অটো রিসেট
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {/* ১. আজকের ডিপোজিট কার্ড */}
          <div className="bg-gradient-to-br from-emerald-900/30 to-slate-900 p-4 md:p-5 rounded-2xl border border-emerald-500/40 shadow-xl min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] md:text-xs font-bold text-emerald-300 uppercase truncate">
                আজকের ডিপোজিট
              </span>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-2xl text-sm border border-emerald-500/20 flex-shrink-0">
                📥
              </div>
            </div>
            <h2 className="mt-2 text-lg md:text-2xl font-black text-emerald-400 font-mono truncate">
              ৳{fmt(stats.todayDeposit || 0)}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              আজ ১২:০০ AM থেকে
            </p>
          </div>

          {/* ২. আজকের উইথড্র কার্ড */}
          <div className="bg-gradient-to-br from-rose-900/30 to-slate-900 p-4 md:p-5 rounded-2xl border border-rose-500/40 shadow-xl min-w-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] md:text-xs font-bold text-rose-300 uppercase truncate">
                আজকের উইথড্র
              </span>
              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-2xl text-sm border border-rose-500/20 flex-shrink-0">
                📤
              </div>
            </div>
            <h2 className="mt-2 text-lg md:text-2xl font-black text-rose-400 font-mono truncate">
              ৳{fmt(stats.todayWithdraw || 0)}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              আজ ১২:০০ AM থেকে
            </p>
          </div>

          {/* ৩. আজকের লাভ/লস কার্ড */}
          <div
            className={`bg-gradient-to-br p-4 md:p-5 rounded-2xl border shadow-xl min-w-0 overflow-hidden ${(stats.todayProfit || 0) >= 0 ? "from-emerald-900/40 to-slate-900 border-emerald-500/50" : "from-rose-900/40 to-slate-900 border-rose-500/50"}`}
          >
            <div className="flex items-center justify-between gap-3">
              <span
                className={`text-[11px] md:text-xs font-bold uppercase truncate ${(stats.todayProfit || 0) >= 0 ? "text-emerald-300" : "text-rose-300"}`}
              >
                আজকের {(stats.todayProfit || 0) >= 0 ? "লাভ" : "লস"}
              </span>
              <div
                className={`p-2 rounded-2xl text-sm border flex-shrink-0 ${(stats.todayProfit || 0) >= 0 ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-rose-500/20 text-rose-300 border-rose-500/30"}`}
              >
                {(stats.todayProfit || 0) >= 0 ? "📈" : "📉"}
              </div>
            </div>
            <h2
              className={`mt-2 text-lg md:text-2xl font-black font-mono truncate ${(stats.todayProfit || 0) >= 0 ? "text-emerald-400" : "text-rose-400"}`}
            >
              ৳{fmt(stats.todayProfit || 0)}
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 truncate">
              ডিপোজিট − উইথড্র
            </p>
          </div>
        </div>
      </div>

      <LiveBetTrackingCard />

      {/* নেভিগেশন */}
      <div className="flex flex-wrap gap-2 bg-slate-900/40 p-2 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
        <button className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center gap-2">
          👤 ইউজার
        </button>
        <button
          onClick={() => router.push("/admin/deposits")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2"
        >
          📥 ডিপোজিট
        </button>
        <button
          onClick={() => router.push("/admin/withdraws")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2"
        >
          📤 উইথড্র
        </button>
        <button
          onClick={() => router.push("/admin/referrals")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 flex items-center gap-2"
        >
          🤝 রেফারেল
        </button>
        <button
          onClick={() => router.push("/admin/payments")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2"
        >
          💳 পেমেন্ট
        </button>
        <button
          onClick={() => router.push("/admin/payment-methods")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 flex items-center gap-2"
        >
          🌐 মেথডস
        </button>
        <button
          onClick={() => router.push("/admin/settings/exchange-rate")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/10 flex items-center gap-2 transition-all"
        >
          💱 Exchange Rate
        </button>
        <button
          onClick={() => router.push("/admin/nowpayments")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-amber-500/20 bg-amber-500/5 text-amber-400 hover:bg-amber-500/10 flex items-center gap-2 transition-all"
        >
          ₿ NowPayments
        </button>
        <button
          onClick={() => router.push("/admin/settings/auto-crypto")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 flex items-center gap-2 transition-all"
        >
          ⚡ Auto Crypto
        </button>
        <button
          onClick={() => router.push("/admin/staff-list")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          স্টাফ লিস্ট
        </button>
        <button
          onClick={() => router.push("/admin/permissions")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          পারমিশন ম্যানেজমেন্ট
        </button>

        <button
          onClick={() => router.push("/admin/bonus-settings")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-pink-500/20 bg-pink-500/5 text-pink-400 hover:bg-pink-500/10 flex items-center gap-2 transition-all"
        >
          ⚙️ বোনাস সেটিংস
        </button>

        <button
          onClick={() => router.push("/admin/bonus-history")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-2 transition-all"
        >
          📜 বোনাস ইতিহাস
        </button>
        <button
          onClick={() => router.push("/admin/audit-logs")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-clipboard-list text-sm"></i> অডিট লগ দেখুন
        </button>
        <button
          onClick={() => router.push("/admin/agent")}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10 flex items-center gap-2 transition-all cursor-pointer"
        >
          <i className="fa-solid fa-handshake text-sm"></i> এজেন্ট
        </button>
      </div>

      {/* ইউজার লিস্ট */}
      <div className="bg-slate-900/50 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-200">
              ইউজার লিস্ট ও সার্চ
            </h2>
            <span className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
              {users.length} জন
            </span>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="flex gap-2 w-full md:w-auto"
          >
            <input
              type="text"
              inputMode="numeric"
              placeholder="ফোন, আইডি বা আইপি..."
              value={searchQuery}
              onChange={(e) => {
                if (e.target.value.length <= 11) setSearchQuery(e.target.value);
              }}
              maxLength={11}
              className="bg-slate-950/80 border border-slate-700/60 px-4 py-2 rounded-xl text-xs w-full md:w-72 text-white font-mono"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 px-5 py-2 rounded-xl font-bold text-xs"
            >
              সার্চ
            </button>
          </form>
        </div>

        <div
          className="rounded-2xl border border-slate-800/80 bg-slate-950/40 overflow-auto"
          style={{ maxHeight: "500px" }}
        >
          <table className="w-full min-w-[900px] text-left text-xs text-slate-300 border-collapse">
            <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
                  UID
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
                  ফোন
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
                  ব্যালেন্স
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
                  টার্নওভার
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
                  আইপি
                </th>
                <th className="p-3.5 sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
                  স্ট্যাটাস
                </th>
                <th className="p-3.5 text-center sticky top-0 z-20 bg-slate-950 border-b border-slate-800">
                  অ্যাকশন
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-slate-500 text-xs"
                  >
                    {loading ? "লোড হচ্ছে..." : "কোনো ইউজার পাওয়া যায়নি"}
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id || u.uid} className="hover:bg-slate-900/60">
                    <td className="p-3.5 font-semibold text-white font-mono">
                      {u.uid}
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono">
                      {u.phone}
                    </td>
                    <td className="p-3.5 font-extrabold text-amber-400 font-mono">
                      ৳{fmtMoney(u.balance)}
                    </td>
                    <td className="p-3.5 text-slate-300 font-mono">
                      ৳{fmtMoney(u.turnover || 0)}
                    </td>
                    <td className="p-3.5 text-[11px] font-mono text-slate-400">
                      {u.ipAddress || "নেই"}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}
                      >
                        {u.isBlocked ? "ব্লকড" : "অ্যাক্টিভ"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex flex-wrap items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="whitespace-nowrap bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold border border-blue-500/20 transition-all"
                        >
                          এডিট
                        </button>
                        <button
                          onClick={() =>
                            handleUpdateUser(u.uid, { isBlocked: !u.isBlocked })
                          }
                          className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${u.isBlocked ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white border-emerald-500/20" : "bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border-rose-500/20"}`}
                        >
                          {u.isBlocked ? "আনব্লক" : "ব্লক"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.uid)}
                          className="whitespace-nowrap bg-slate-800 text-slate-400 hover:bg-rose-600 hover:text-white px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                        >
                          ডিলিট
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* এডিট মডাল */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
            <h3 className="text-base font-extrabold text-white">
              ইউজার এডিট:{" "}
              <span className="text-emerald-400 font-mono text-xs">
                {editingUser}
              </span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  ব্যালেন্স:
                </label>
                <input
                  type="number"
                  value={newBalance}
                  onChange={(e) => setNewBalance(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  টার্নওভার:
                </label>
                <input
                  type="number"
                  value={newTurnover}
                  onChange={(e) => setNewTurnover(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  আইপি:
                </label>
                <input
                  type="text"
                  value={newIp}
                  onChange={(e) => setNewIp(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 p-3 rounded-2xl text-white text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() =>
                  handleUpdateUser(editingUser, {
                    balance: Number(newBalance),
                    turnover: Number(newTurnover),
                    ipAddress: newIp,
                  })
                }
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-2xl font-bold text-xs"
              >
                আপডেট
              </button>
              <button
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-2xl font-bold text-xs"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      {/* কনফার্ম মডাল */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/20 p-6 rounded-3xl w-full max-w-sm space-y-5 shadow-2xl shadow-emerald-950/40">
            <div className="flex flex-col items-center text-center space-y-3">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border ${iconColorMap[confirmData.iconColor] || iconColorMap.amber}`}
              >
                {confirmData.icon}
              </div>
              <h3 className="text-base font-extrabold text-white">
                {confirmData.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {confirmData.message}
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setConfirmData(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-2xl font-bold text-xs transition-all active:scale-95"
              >
                না
              </button>
              <button
                onClick={() => {
                  confirmData.onYes?.();
                  setConfirmData(null);
                }}
                className={`flex-1 bg-gradient-to-r text-white py-3 rounded-2xl font-bold text-xs shadow-lg transition-all active:scale-95 ${confirmBtnMap[confirmData.confirmClass] || confirmBtnMap.emerald}`}
              >
                {confirmData.confirmText || "হ্যাঁ, নিশ্চিত"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

////////////////////////////////////////////////////////////////////
