"use client";

import { useState, useEffect } from "react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState({});
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // নেভবারের সকল পারমিশন ক্যাটাগরি
  const tabList = [
    { key: "all", label: "সকল লগ" },
    { key: "manage_dashboard", label: "ড্যাশবোর্ড" },
    { key: "view_game_tracking", label: "ট্র্যাকিং" },
    { key: "manage_users", label: "ইউজার" },
    { key: "manage_agents", label: "এজেন্ট সিস্টেম" },
    { key: "manage_deposits", label: "ডিপোজিট" },
    { key: "manage_withdraws", label: "উইথড্র" },
    { key: "manage_referrals", label: "রেফারেল" },
    { key: "manage_payments", label: "পেমেন্ট" },
    { key: "manage_methods", label: "মেথডস" },
    { key: "manage_exchange_rate", label: "Exchange Rate" },
    { key: "manage_nowpayments", label: "NowPayments" },
    { key: "manage_auto_crypto", label: "Auto Crypto" },
    { key: "manage_bonus_settings", label: "বোনাস সেটিংস" },
    { key: "view_bonus_history", label: "বোনাস ইতিহাস" },
    { key: "others", label: "অন্যান্য" },
  ];

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit-logs");
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        setGroupedLogs(data.groupedLogs || {});
      } else {
        setMessage(data.message || "ডেটা লোড করতে ব্যর্থ হয়েছে।");
      }
    } catch (err) {
      setMessage("সার্ভার ত্রুটি ঘটেছে।");
    }
    setLoading(false);
  };

  const currentLogs = activeTab === "all" ? logs : groupedLogs[activeTab] || [];

  // সুন্দর ও স্পষ্ট ফরম্যাটে অবজেক্ট বা মান দেখানোর ফাংশন
  const renderDataValue = (val) => {
    if (val === null || val === undefined) {
      return <span className="text-slate-500 italic">N/A</span>;
    }

    if (typeof val === "object") {
      const entries = Object.entries(val);
      if (entries.length === 0)
        return <span className="text-slate-500 italic">কোনো ডেটা নেই</span>;

      return (
        <div className="space-y-1">
          {entries.map(([key, value]) => {
            let labelName = key;
            if (key === "balance") labelName = "ব্যালেন্স";
            if (key === "turnover") labelName = "টার্নওভার";
            if (key === "isBlocked") labelName = "ব্লক স্ট্যাটাস";
            if (key === "customCommission") labelName = "কমিশন";

            let displayVal = String(value);
            if (value === true) displayVal = "হ্যাঁ (Blocked/True)";
            if (value === false) displayVal = "না (Active/False)";

            return (
              <div
                key={key}
                className="flex justify-between items-center text-[11px] border-b border-white/5 pb-0.5"
              >
                <span className="text-slate-400 capitalize">{labelName}:</span>
                <span className="font-semibold text-white">{displayVal}</span>
              </div>
            );
          })}
        </div>
      );
    }

    return <span>{String(val)}</span>;
  };

  return (
    <div className="p-2 sm:p-5 text-white max-w-5xl mx-auto font-sans">
      <div className="mb-4">
        <h1 className="text-lg sm:text-xl font-bold text-emerald-400">
          📜 অডিট লগ ও অ্যাক্টিভিটি ট্র্যাকার
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-400">
          কে, কখন এবং কী পরিবর্তন করেছেন তার হিস্ট্রি
        </p>
      </div>

      {/* ক্যাটাগরি ফিল্টার ট্যাব */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-thin">
        {tabList.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shadow-sm ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-emerald-900/30"
                : "bg-[#0b132b] text-slate-400 border border-slate-800/80 hover:bg-slate-800"
            }`}
          >
            {tab.label}{" "}
            {tab.key !== "all" && groupedLogs[tab.key]?.length
              ? `(${groupedLogs[tab.key].length})`
              : ""}
          </button>
        ))}
      </div>

      {message && (
        <div className="p-2.5 mb-4 bg-slate-800 border border-slate-700 rounded-lg text-yellow-300 text-xs text-center">
          {message}
        </div>
      )}

      {/* ১০টি কার্ডের সমান সর্বোচ্চ হাইট ফিক্সড এবং ভেতরে ভার্টিক্যাল স্ক্রোলবার */}
      <div className="max-h-[620px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900/40">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#0b132b] border border-slate-800 rounded-xl">
            অডিট লগ লোড হচ্ছে...
          </div>
        ) : currentLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-[#0b132b] border border-slate-800 rounded-xl">
            কোনো লগের তথ্য পাওয়া যায়নি।
          </div>
        ) : (
          currentLogs.map((log) => (
            <div
              key={log._id}
              className="bg-[#0b132b] border border-slate-800/80 rounded-xl p-3 shadow-md hover:border-slate-700/80 transition space-y-2"
            >
              {/* হেডার: অ্যাকশন, অ্যাডমিন ও সময় */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-slate-800/60 pb-2">
                <div className="flex items-center gap-1.5 flex-wrap text-xs">
                  <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-400 font-bold text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    অ্যাডমিন:{" "}
                    <strong className="text-emerald-400">
                      {log.adminPhone || log.adminId || "অ্যাডমিন"}
                    </strong>
                  </span>
                  {log.targetUser && (
                    <span className="text-slate-400 text-[11px]">
                      | টার্গেট:{" "}
                      <strong className="text-slate-200">
                        {log.targetUser}
                      </strong>
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.createdAt || log.timestamp).toLocaleString(
                    "bn-BD",
                  )}
                </div>
              </div>

              {/* আগে ও পরের মান (কমপ্যাক্ট লেআউট) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {/* আগের মান */}
                <div className="bg-red-950/20 border border-red-500/20 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-0.5">
                    ❌ আগে ছিল (Old Value):
                  </p>
                  <div className="text-red-300 text-[11px] leading-tight">
                    {renderDataValue(log.oldData || log.oldValue)}
                  </div>
                </div>

                {/* বর্তমান মান */}
                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-2">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                    ✅ বর্তমান মান (New Value):
                  </p>
                  <div className="text-emerald-300 text-[11px] leading-tight">
                    {renderDataValue(log.newData || log.newValue)}
                  </div>
                </div>
              </div>

              {/* বিস্তারিত */}
              {log.details && (
                <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/40 flex items-start gap-1.5">
                  <span className="text-slate-500 font-medium whitespace-nowrap">
                    বিস্তারিত:
                  </span>
                  <span className="break-words">{log.details}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
/////////////////////////////////////////////////////////////////////////////////
