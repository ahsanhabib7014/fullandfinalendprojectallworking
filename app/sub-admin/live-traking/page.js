"use client";
import { useState, useEffect } from "react";

export default function LiveTrackingPage() {
  const [trackingData, setTrackingData] = useState({
    currentPeriod: "59732564",
    totalBig: 0,
    totalSmall: 0,
  });
  const [loading, setLoading] = useState(true);

  // রিয়েল-টাইম লাইভ গেম বেট ট্র্যাকিং ডেটা অ্যাডমিন এপিআই থেকে ফেচ করার জন্য
  useEffect(() => {
    const fetchLiveTracking = async () => {
      try {
        const res = await fetch(`/api/admin/live-bets?t=${Date.now()}`);
        const data = await res.json();

        if (data.success) {
          // ব্যাকএন্ড থেকে আসা 'stats' অবজেক্ট থেকে সঠিক ডেটা নেওয়া হলো
          const stats = data.stats || {};
          setTrackingData({
            currentPeriod: stats.periodNumber || stats.period || "59732564",
            totalBig: stats.bigTotal || 0,
            totalSmall: stats.smallTotal || 0,
          });
        }
      } catch (err) {
        console.error("Live tracking fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveTracking();
    const interval = setInterval(fetchLiveTracking, 3000); // প্রতি ৩ সেকেন্ড পর পর আপডেট হবে
    return () => clearInterval(interval);
  }, []);

  const fmt = (n) => Number(n || 0).toLocaleString("en-IN");

  return (
    <div className="space-y-6 pb-12 max-w-md mx-auto">
      {/* লাইভ গেম বেট ট্র্যাকিং মেইন কার্ড */}
      <div className="bg-[#0b132b] backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-5">
        {/* হেডার ও পিরিয়ড */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <h2 className="text-sm font-bold text-slate-100">
              লাইভ গেম বেট ট্র্যাকিং (Big / Small)
            </h2>
          </div>

          <div className="inline-flex items-center self-start px-4 py-2 rounded-2xl bg-[#070b19] border border-slate-800/80 text-xs text-slate-300 font-mono">
            কারেন্ট পিরিয়ড:{" "}
            <span className="text-emerald-400 font-bold ml-2">
              {trackingData.currentPeriod}
            </span>
          </div>
        </div>

        {/* মোট বিগ (BIG) বেট কার্ড */}
        <div className="bg-[#070b19]/80 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">
              মোট বিগ (BIG) বেট
            </p>
            <h3 className="text-2xl font-black text-emerald-400 font-mono">
              ৳{fmt(trackingData.totalBig)}
            </h3>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs tracking-wider">
            BIG
          </div>
        </div>

        {/* মোট স্মল (SMALL) বেট কার্ড */}
        <div className="bg-[#070b19]/80 p-5 rounded-2xl border border-slate-800/80 flex items-center justify-between shadow-lg">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase">
              মোট স্মল (SMALL) বেট
            </p>
            <h3 className="text-2xl font-black text-rose-400 font-mono">
              ৳{fmt(trackingData.totalSmall)}
            </h3>
          </div>
          <div className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-extrabold text-xs tracking-wider">
            SMALL
          </div>
        </div>
      </div>
    </div>
  );
}
