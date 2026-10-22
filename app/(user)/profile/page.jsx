"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!savedUser.uid && !savedUser.phone) {
      router.push("/login");
      return;
    }

    setProfile({
      ...savedUser,
      balance: Number(savedUser.balance) || 0,
      turnover: Number(savedUser.turnover) || 0,
      referralBalance: Number(savedUser.referralBalance) || 0,
      vipLevel: savedUser.vipLevel || "none",
      totalDeposit: Number(savedUser.totalDeposit) || 0,
    });
    setLoading(false);

    fetch("/api/user/me", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          const currentUser = {
            ...data.user,
            balance: Number(data.user.balance) || 0,
            turnover: Number(data.user.turnover) || 0,
            referralBalance: Number(data.user.referralBalance) || 0,
            vipLevel: data.user.vipLevel || "none",
            totalDeposit: Number(data.user.totalDeposit) || 0,
          };
          setProfile(currentUser);
          localStorage.setItem("user", JSON.stringify(currentUser));
        }
      })
      .catch((err) => console.error("Profile fetch error:", err));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      window.location.replace("/login");
    }
  };

  const handleCopyLink = () => {
    if (!profile) return;
    const link = `${window.location.origin}/register?ref=${profile.referralCode || profile.uid}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-[#07090e] text-white flex items-center justify-center">
        <div className="w-7 h-7 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[100dvh] bg-[#07090e] text-white flex items-center justify-center text-sm">
        ইউজার তথ্য পাওয়া যায়নি।
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#07090e] text-slate-100 flex justify-center p-3 md:p-6 pb-safe font-sans">
      <div className="w-full max-w-md md:max-w-2xl space-y-3">
        {/* হেডার */}
        <div className="flex justify-between items-center bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-lg">
          <h2 className="text-sm md:text-base font-bold text-emerald-400 flex items-center gap-2">
            <i className="fa-solid fa-user-circle"></i> ইউজার প্রোফাইল
          </h2>
          <button
            onClick={() => router.back()}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-xs md:text-sm font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left text-[10px]"></i> ফিরে যান
          </button>
        </div>

        {/* প্রোফাইল হেডার — ✅ VIP badge ছাড়া */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-lg md:text-xl font-black shadow-md flex-shrink-0">
            {profile.phone?.charAt(0) || profile.uid?.charAt(0) || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm md:text-base font-bold text-white font-mono truncate">
              {profile.phone || profile.uid || "ইউজার"}
            </h3>
            <p className="text-xs md:text-sm text-slate-400 font-mono truncate">
              UID: {profile.uid || "N/A"}
            </p>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${profile.isBlocked ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"}`}
          >
            {profile.isBlocked ? "ব্লকড" : "অ্যাক্টিভ"}
          </span>
        </div>

        {/* ব্যালেন্স কার্ড */}
        <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900 p-5 rounded-xl border border-emerald-500/30 shadow-lg text-left">
          <p className="text-xs md:text-sm text-slate-400 uppercase tracking-wider font-semibold">
            উপলব্ধ ব্যালেন্স
          </p>
          <h1 className="text-base md:text-lg font-bold text-amber-400 font-mono mt-1 truncate">
            ৳{profile.balance || 0}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 font-mono mt-1.5 truncate">
            টার্নওভার:{" "}
            <strong className="text-emerald-400">
              ৳{profile.turnover || 0}
            </strong>
          </p>
        </div>

        {/* 🎖️ VIP Level Card */}
        <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎖️</span>
              <span className="text-xs md:text-sm font-bold text-slate-300">
                VIP Level
              </span>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                profile.vipLevel === "diamond"
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                  : profile.vipLevel === "gold"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : profile.vipLevel === "silver"
                      ? "bg-slate-400/20 text-slate-300 border border-slate-400/30"
                      : profile.vipLevel === "bronze"
                        ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                        : "bg-slate-700/50 text-slate-400 border border-slate-600/30"
              }`}
            >
              {profile.vipLevel === "diamond" && "💎 Diamond"}
              {profile.vipLevel === "gold" && "🥇 Gold"}
              {profile.vipLevel === "silver" && "🥈 Silver"}
              {profile.vipLevel === "bronze" && "🥉 Bronze"}
              {(!profile.vipLevel || profile.vipLevel === "none") &&
                "— Regular"}
            </span>
          </div>

          <VipProgress
            vipLevel={profile.vipLevel}
            totalDeposit={profile.totalDeposit || 0}
          />
        </div>

        {/* ডিটেইলস (২ কলাম গ্রিড) */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-lg">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] md:text-xs text-slate-500 uppercase font-semibold mb-1">
                ইউজার আইডি
              </p>
              <p className="font-bold text-white font-mono text-sm md:text-base truncate">
                {profile.uid || "N/A"}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] md:text-xs text-slate-500 uppercase font-semibold mb-1">
                ফোন নম্বর
              </p>
              <p className="font-bold text-white font-mono text-sm md:text-base truncate">
                {profile.phone || "N/A"}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] md:text-xs text-slate-500 uppercase font-semibold mb-1">
                আইপি অ্যাড্রেস
              </p>
              <p className="font-mono text-xs md:text-sm text-slate-300 truncate">
                {profile.ipAddress || "N/A"}
              </p>
            </div>

            {/* <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
              <p className="text-[10px] md:text-xs text-slate-500 uppercase font-semibold mb-1">রেফারেল বোনাস</p>
              <p className="font-bold text-amber-400 font-mono text-sm md:text-base">৳{profile.referralBalance || 0}</p>
            </div> */}

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 col-span-2">
              <p className="text-[10px] md:text-xs text-slate-500 uppercase font-semibold mb-1">
                মোট ডিপোজিট
              </p>
              <p className="font-bold text-cyan-400 font-mono text-sm md:text-base">
                ৳{(profile.totalDeposit || 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* রেফারেল লিংক */}
        <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 shadow-lg space-y-2.5">
          <div className="flex justify-between items-center">
            <h3 className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <i className="fa-solid fa-share-nodes text-emerald-400"></i>{" "}
              রেফারেল লিংক
            </h3>
            {copySuccess && (
              <span className="text-[10px] md:text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                ✓ কপি হয়েছে
              </span>
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={
                typeof window !== "undefined"
                  ? `${window.location.origin}/register?ref=${profile.referralCode || profile.uid}`
                  : ""
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2.5 text-xs md:text-sm text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleCopyLink}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold transition whitespace-nowrap cursor-pointer flex-shrink-0 flex items-center gap-1.5"
            >
              <i className="fa-solid fa-copy"></i>
              <span className="hidden md:inline">কপি</span>
            </button>
          </div>
        </div>

        {/* ব্লকড ওয়ার্নিং */}
        {profile.isBlocked && (
          <div className="bg-rose-500/10 border border-rose-500/30 p-3.5 rounded-xl text-center text-xs md:text-sm text-rose-400 font-bold flex items-center justify-center gap-2">
            <i className="fa-solid fa-triangle-exclamation"></i>
            অ্যাকাউন্টটি সাময়িকভাবে ব্লক করা হয়েছে।
          </div>
        )}

        {/* লগআউট বাটন */}
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <i className="fa-solid fa-right-from-bracket"></i> লগআউট করুন
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 🎖️ VIP Progress Component
// ==========================================
function VipProgress({ vipLevel, totalDeposit }) {
  const LEVELS = [
    { level: "diamond", label: "💎 Diamond", minDeposit: 1000000 },
    { level: "gold", label: "🥇 Gold", minDeposit: 200000 },
    { level: "silver", label: "🥈 Silver", minDeposit: 50000 },
    { level: "bronze", label: "🥉 Bronze", minDeposit: 10000 },
  ];

  const currentIdx = LEVELS.findIndex((l) => l.level === vipLevel);
  const nextLevel = currentIdx > 0 ? LEVELS[currentIdx - 1] : null;

  if (vipLevel === "diamond") {
    return (
      <div className="text-center text-xs text-cyan-400 font-bold py-2">
        🎉 আপনি সর্বোচ্চ স্তরে আছেন!
      </div>
    );
  }

  const current = LEVELS.find((l) => l.level === vipLevel);
  const currentMin = current?.minDeposit || 0;
  const nextMin = nextLevel?.minDeposit || 10000;
  const range = nextMin - currentMin;
  const earned = totalDeposit - currentMin;
  const progress = Math.min(100, Math.max(0, (earned / range) * 100));
  const remaining = Math.max(0, nextMin - totalDeposit);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] md:text-xs text-slate-400">
        <span>পরবর্তী: {nextLevel?.label || "🥉 Bronze"}</span>
        <span className="font-mono">
          আরো ৳{remaining.toLocaleString("en-IN")}
        </span>
      </div>
      <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-[10px] text-slate-500 text-center font-mono">
        {progress.toFixed(0)}% সম্পন্ন
      </div>
    </div>
  );
}
