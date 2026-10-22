"use client";

import { useEffect, useState } from "react";

export default function AgentDepositsPage() {
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  // 🆕 পপ-আপ ও মেসেজের জন্য স্টেট
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    deposit: null,
    action: "",
  });
  const [toastMessage, setToastMessage] = useState(null);

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/agent/deposits?status=${status}&page=${page}&limit=20`,
      );
      const data = await res.json();
      if (data.success) {
        setDeposits(data.deposits || []);
        setSummary(data.summary || null);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, page]);

  // 🆕 টোস্ট মেসেজ দেখানোর ফাংশন
  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 🆕 বাটনে ক্লিক করলে পপ-আপ ওপেন হবে
  const handleActionClick = (deposit, action) => {
    setConfirmModal({ show: true, deposit, action });
  };

  // 🆕 পপ-আপে "হ্যাঁ" ক্লিক করলে এই ফাংশনটি চলবে
  const handleConfirmAction = async () => {
    const { deposit, action } = confirmModal;
    if (!deposit) return;

    setConfirmModal({ show: false, deposit: null, action: "" }); // পপ-আপ বন্ধ
    setActionLoading(deposit._id);

    try {
      const res = await fetch("/api/agent/deposits/action", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          depositId: deposit._id,
          status: action === "approved" ? "approved" : "rejected",
        }),
      });
      const data = await res.json();

      if (data.success) {
        // 🆕 সফল হলে কমিশনের পরিমাণসহ মেসেজ দেখানো
        if (action === "approved") {
          const commission = Number(deposit.agentCommission || 0).toFixed(2);
          showToast(
            `✅ ডিপোজিট অ্যাপ্রুভ হয়েছে! আপনি ৳${commission} কমিশন পেয়েছেন।`,
            "success",
          );
        } else {
          showToast(data.message || "❌ ডিপোজিট বাতিল হয়েছে!", "success");
        }
        loadDeposits();
      } else {
        showToast(data.message, "error");
      }
    } catch (err) {
      showToast("সার্ভার এরর", "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100 bg-[#07090e] relative">
      {/* 🆕 টোস্ট মেসেজ মডাল */}
      {toastMessage && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div
            className={`px-6 py-4 rounded-2xl text-sm font-bold shadow-2xl text-center max-w-xs w-full flex flex-col items-center gap-3 border ${
              toastMessage.type === "success"
                ? "bg-slate-900 border-emerald-500 text-emerald-400"
                : "bg-slate-900 border-rose-500 text-rose-400"
            }`}
          >
            <i
              className={`fa-solid ${toastMessage.type === "success" ? "fa-circle-check text-4xl" : "fa-circle-exclamation text-4xl"}`}
            ></i>
            <span className="leading-relaxed">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* 🆕 কনফার্মেশন ডিটেইলস পপ-আপ */}
      {confirmModal.show && confirmModal.deposit && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            {/* হেডার */}
            <div
              className={`p-4 border-b border-slate-800 text-center ${
                confirmModal.action === "approved"
                  ? "bg-emerald-950/30"
                  : "bg-rose-950/30"
              }`}
            >
              <i
                className={`fa-solid ${
                  confirmModal.action === "approved"
                    ? "fa-circle-check text-emerald-400"
                    : "fa-circle-xmark text-rose-400"
                } text-4xl mb-2`}
              ></i>
              <h3
                className={`text-lg font-bold ${
                  confirmModal.action === "approved"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {confirmModal.action === "approved"
                  ? "ডিপোজিট অ্যাপ্রুভ করুন"
                  : "ডিপোজিট বাতিল করুন"}
              </h3>
            </div>

            {/* ডিটেইলস */}
            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">ইউজার UID</span>
                <span className="font-mono text-slate-200 font-bold">
                  {confirmModal.deposit.uid}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">পরিমাণ</span>
                <span className="font-mono text-blue-400 font-bold">
                  {confirmModal.deposit.originalCurrency === "USD"
                    ? `$${Number(confirmModal.deposit.originalAmount).toFixed(2)} (৳${Number(confirmModal.deposit.amount).toFixed(2)})`
                    : `৳${Number(confirmModal.deposit.amount).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">মেথড</span>
                <span className="text-slate-200">
                  {confirmModal.deposit.method}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-slate-400">TrxID</span>
                <span className="font-mono text-slate-200 text-xs">
                  {confirmModal.deposit.transactionId}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">আপনার কমিশন</span>
                <span className="font-mono text-emerald-400 font-bold">
                  ৳
                  {Number(confirmModal.deposit.agentCommission || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* বাটন */}
            <div className="p-4 bg-slate-950/50 flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ show: false, deposit: null, action: "" })
                }
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition"
              >
                না (বাতিল)
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 font-bold py-2.5 rounded-xl transition shadow-lg ${
                  confirmModal.action === "approved"
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-rose-600 hover:bg-rose-500 text-white"
                }`}
              >
                হ্যাঁ (নিশ্চিত)
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-400">ডিপোজিট</h1>
        <p className="text-slate-400 mt-1 text-sm">
          আপনার কাছে আসা সব ডিপোজিট ও অর্জিত কমিশন
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <SummaryCard
            label="মোট কমিশন (অ্যাপ্রুভড)"
            value={`৳${Number(summary.totalCommission || 0).toFixed(2)}`}
            icon="🎁"
            color="text-emerald-400"
          />
          <SummaryCard
            label="অ্যাপ্রুভড ডিপোজিট"
            value={`৳${Number(summary.totalApprovedAmount || 0).toFixed(2)}`}
            icon="💰"
            color="text-blue-400"
          />
          <SummaryCard
            label="অ্যাপ্রুভড সংখ্যা"
            value={summary.approvedCount ?? 0}
            icon="✅"
            color="text-purple-400"
          />
        </div>
      )}

      <div className="mb-5 flex gap-2 flex-wrap">
        {[
          { key: "all", label: "সব" },
          { key: "pending", label: "পেন্ডিং" },
          { key: "approved", label: "অ্যাপ্রুভড" },
          { key: "rejected", label: "রিজেক্টেড" },
          { key: "partial", label: "পার্শিয়াল" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setStatus(s.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              status === s.key
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
        ) : deposits.length === 0 ? (
          <p className="p-5 text-slate-400 text-sm">
            এই ফিল্টারে কোনো ডিপোজিট নেই।
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left">UID</th>
                  <th className="px-4 py-3 text-right">পরিমাণ</th>
                  <th className="px-4 py-3 text-right">কমিশন</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-center">কমিশন পেইড</th>
                  <th className="px-4 py-3 text-left">সময়</th>
                  <th className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {deposits.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-300 font-mono">
                      {d.uid}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {d.originalCurrency === "USD" && d.originalAmount ? (
                        <div className="flex flex-col items-end">
                          <span className="text-blue-300">
                            ${Number(d.originalAmount).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ৳{Number(d.amount).toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-200">
                          ৳{Number(d.amount).toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono">
                      {d.agentCommission > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="text-emerald-400 font-bold">
                            ৳{Number(d.agentCommission).toFixed(2)}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            ({d.agentCommissionRate}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={d.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      {d.agentCommissionPaid ? (
                        <span className="text-emerald-400 text-lg">✅</span>
                      ) : (
                        <span className="text-slate-600 text-lg">⏳</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-400 font-mono">
                      {new Date(d.createdAt).toLocaleString("bn-BD")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {d.status === "pending" ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleActionClick(d, "approved")}
                            disabled={actionLoading === d._id}
                            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition"
                          >
                            {actionLoading === d._id ? "..." : "অ্যাপ্রুভ"}
                          </button>
                          <button
                            onClick={() => handleActionClick(d, "rejected")}
                            disabled={actionLoading === d._id}
                            className="bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-[10px] font-bold px-3 py-1 rounded-lg transition"
                          >
                            {actionLoading === d._id ? "..." : "বাতিল"}
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-500">
                          প্রসেসড
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
          >
            ←
          </button>
          <span className="text-xs font-bold text-slate-400">
            পেজ {page} / {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page === pagination.totalPages}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-yellow-950/50 text-yellow-400 border-yellow-500/30",
    approved: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
    rejected: "bg-rose-950/50 text-rose-400 border-rose-500/30",
    partial: "bg-blue-950/50 text-blue-400 border-blue-500/30",
  };
  const labels = {
    pending: "পেন্ডিং",
    approved: "অ্যাপ্রুভড",
    rejected: "রিজেক্টেড",
    partial: "পার্শিয়াল",
  };
  return (
    <span
      className={`inline-block text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status] || "bg-slate-800 text-slate-400 border-slate-700"}`}
    >
      {labels[status] || status}
    </span>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
          {label}
        </span>
        <span className="text-lg opacity-80">{icon}</span>
      </div>
      <p className={`text-2xl font-black mt-2 font-mono ${color}`}>{value}</p>
    </div>
  );
}
