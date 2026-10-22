"use client";
import { useState, useEffect } from "react";

export default function DepositHistorySection({ uid, onClose }) {
  const [depositHistory, setDepositHistory] = useState([]);
  const [loadingDeposit, setLoadingDeposit] = useState(true);

  // 🆕 Show More state
  const [showAll, setShowAll] = useState(false);
  const INITIAL_COUNT = 10;

  useEffect(() => {
    if (!uid) return;
    fetch(`/api/user/history?uid=${uid}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const deposits = data.deposits || [];
          setDepositHistory([...deposits]);
        } else {
          setDepositHistory([]);
        }
      })
      .catch((err) => {
        console.error("Deposit history fetch error:", err);
        setDepositHistory([]);
      })
      .finally(() => setLoadingDeposit(false));
  }, [uid]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";

    let date;
    if (typeof timestamp === "object" && timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 🆕 Visible items based on showAll
  const visibleItems = showAll
    ? depositHistory
    : depositHistory.slice(0, INITIAL_COUNT);

  const hasMore = depositHistory.length > INITIAL_COUNT;
  const remainingCount = depositHistory.length - INITIAL_COUNT;

  return (
    <div className="mt-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2.5 animate-fadeIn shadow-xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
        <span className="text-xs font-bold text-emerald-400 uppercase">
          ডিপোজিট রেকর্ডসমূহ
          {depositHistory.length > 0 && (
            <span className="text-slate-500 ml-1.5 font-normal">
              ({depositHistory.length})
            </span>
          )}
        </span>
        <button
          onClick={onClose}
          className="text-[10px] text-slate-400 hover:text-white bg-slate-800 px-2 py-0.5 rounded-lg"
        >
          বন্ধ করুন ✕
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
        {loadingDeposit ? (
          <p className="text-center py-6 text-xs text-slate-400 animate-pulse">
            লোড হচ্ছে...
          </p>
        ) : depositHistory.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-500">
            কোনো ডিপোজিট রেকর্ড পাওয়া যায়নি।
          </p>
        ) : (
          <>
            <div className="divide-y divide-slate-800/60">
              {visibleItems.map((item, index) => {
                const rawTime =
                  item.createdAt ||
                  item.created_at ||
                  item.date ||
                  item.timestamp ||
                  item.time;

                return (
                  <div
                    key={index}
                    className="p-3 space-y-2 hover:bg-slate-900/40 transition"
                  >
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <span className="text-slate-300 font-mono text-[11px] block font-semibold">
                          {item.method || "Bkash/Nagad"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {formatDateTime(rawTime)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-bold font-mono text-emerald-400 block text-sm">
                          ৳{item.amount}
                        </span>
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold mt-1 ${
                            item.status === "approved"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : item.status === "rejected"
                                ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                : item.status === "partial"
                                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {item.status === "approved"
                            ? "✅ সফল"
                            : item.status === "rejected"
                              ? "❌ ব্যর্থ"
                              : item.status === "partial"
                                ? "⚠️ কম পাঠিয়েছে"
                                : "⏳ পেন্ডিং"}
                        </span>
                      </div>
                    </div>

                    {item.adminNote ? (
                      <div className="bg-slate-900 border border-amber-500/30 p-2 rounded-lg text-[11px] text-amber-300 space-y-0.5">
                        <span className="font-bold text-amber-400 block text-[10px]">
                          অ্যাডমিন নোট:
                        </span>
                        <p>{item.adminNote}</p>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* 🆕 Show More / Show Less Button */}
            {hasMore && (
              <div className="p-3 border-t border-slate-800 bg-slate-900/30">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full py-2 rounded-lg text-[11px] font-bold transition-all active:scale-95 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg"
                >
                  {showAll ? "🔼 কম দেখান" : `🔽 আরও ${remainingCount}টি দেখুন`}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
