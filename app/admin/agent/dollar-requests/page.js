"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function DollarRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [filter, setFilter] = useState("pending");
  const [noteInput, setNoteInput] = useState({});
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);

  // 🆕 পপ-আপ ও মেসেজের স্টেট
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    request: null,
    action: "",
  });
  const [toastMessage, setToastMessage] = useState(null);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/agent/dollar-requests?status=${filter}&page=${page}&limit=20`,
      );
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setPagination(data.pagination || null);
      } else {
        showToast(data.message || "লোড করা যায়নি", "error");
      }
    } catch (err) {
      showToast("সার্ভার এরর", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, page]);

  // 🆕 টোস্ট মেসেজ দেখানোর ফাংশন
  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 🆕 পপ-আপ ওপেন করার ফাংশন
  const handleActionClick = (request, action) => {
    setConfirmModal({ show: true, request, action });
  };

  // 🆕 পপ-আপে হ্যাঁ ক্লিক করলে এই ফাংশনটি চলবে
  const handleConfirmAction = async () => {
    const { request, action } = confirmModal;
    if (!request) return;

    setConfirmModal({ show: false, request: null, action: "" });
    setProcessing(request._id);

    try {
      const res = await fetch("/api/admin/agent/dollar-requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request._id,
          action: action === "approve" ? "approve" : "reject",
          adminNote: noteInput[request._id] || "",
        }),
      });
      const data = await res.json();

      if (data.success) {
        showToast(data.message, "success");
        loadRequests();
      } else {
        showToast(data.message || "সমস্যা হয়েছে", "error");
      }
    } catch (err) {
      showToast("সার্ভার এরর", "error");
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100 bg-[#07090e] relative">
      {/* 🆕 টোস্ট মেসেজ */}
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

      {/* 🆕 কনফার্মেশন ডিটেইলস মডাল */}
      {confirmModal.show && confirmModal.request && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            {/* হেডার */}
            <div
              className={`p-4 border-b border-slate-800 text-center ${
                confirmModal.action === "approve"
                  ? "bg-emerald-950/30"
                  : "bg-rose-950/30"
              }`}
            >
              <i
                className={`fa-solid ${
                  confirmModal.action === "approve"
                    ? "fa-circle-check text-emerald-400"
                    : "fa-circle-xmark text-rose-400"
                } text-4xl mb-2`}
              ></i>
              <h3
                className={`text-lg font-bold ${
                  confirmModal.action === "approve"
                    ? "text-emerald-400"
                    : "text-rose-400"
                }`}
              >
                {confirmModal.action === "approve"
                  ? "রিকোয়েস্ট অ্যাপ্রুভ"
                  : "রিকোয়েস্ট রিজেক্ট"}
              </h3>
            </div>

            {/* ডিটেইলস */}
            <div className="p-5 text-sm">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {confirmModal.request.agentId?.agentCode || "N/A"}
                </span>
                <span className="text-sm text-slate-300 font-mono">
                  {confirmModal.request.agentId?.agentPhone ||
                    confirmModal.request.agentId?.phone ||
                    "-"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50 mb-3">
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">ডলার</p>
                  <p className="font-bold text-blue-300 font-mono">
                    ${Number(confirmModal.request.amountUSD || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">রেট</p>
                  <p className="font-bold text-slate-300 font-mono">
                    ৳{Number(confirmModal.request.dollarRate || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">টাকা</p>
                  <p className="font-bold text-blue-400 font-mono">
                    ৳{Number(confirmModal.request.amountBDT || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5">
                    এজেন্ট ব্যালেন্স
                  </p>
                  <p className="font-bold text-emerald-400 font-mono">
                    ৳
                    {Number(
                      confirmModal.request.agentId?.agentMainBalance || 0,
                    ).toFixed(2)}
                  </p>
                </div>
              </div>

              {confirmModal.request.paymentMethod && (
                <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                  <i className="fa-solid fa-wallet"></i>{" "}
                  <strong>পেমেন্ট:</strong> {confirmModal.request.paymentMethod}
                  {confirmModal.request.transactionId &&
                    ` | TrxID: ${confirmModal.request.transactionId}`}
                </p>
              )}
              <p className="text-[10px] text-slate-500 mb-3 font-mono">
                {new Date(confirmModal.request.createdAt).toLocaleString(
                  "bn-BD",
                )}
              </p>

              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs text-slate-500 mb-1 block">
                  অ্যাডমিন নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="নোট লিখুন..."
                  value={noteInput[confirmModal.request._id] || ""}
                  onChange={(e) =>
                    setNoteInput((prev) => ({
                      ...prev,
                      [confirmModal.request._id]: e.target.value,
                    }))
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ show: false, request: null, action: "" })
                }
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl transition"
              >
                না (বাতিল)
              </button>
              <button
                onClick={handleConfirmAction}
                className={`flex-1 font-bold py-2.5 rounded-xl transition shadow-lg ${
                  confirmModal.action === "approve"
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
        <Link
          href="/admin/agent"
          className="text-sm text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 mb-2"
        >
          <i className="fa-solid fa-arrow-left text-xs"></i> এজেন্ট
          ম্যানেজমেন্টে ফিরে যান
        </Link>
        <h1 className="text-2xl font-bold text-blue-400">
          ডলার লোড রিকোয়েস্ট
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          এজেন্টদের ডলার লোড রিকোয়েস্ট অ্যাপ্রুভ করলে ডলার রেট অনুযায়ী টাকা
          এজেন্টের মূল ব্যালেন্সে যোগ হবে।
        </p>
      </div>

      <div className="mb-5 flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            onClick={() => {
              setFilter(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              filter === s
                ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
                : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
            }`}
          >
            {s === "pending" && "⏳ পেন্ডিং"}
            {s === "approved" && "✅ অ্যাপ্রুভড"}
            {s === "rejected" && "❌ রিজেক্টেড"}
            {s === "all" && "📋 সব"}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
      ) : requests.length === 0 ? (
        <p className="p-5 text-slate-400 text-sm">
          এই ফিল্টারে কোনো রিকোয়েস্ট নেই।
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const agent = r.agentId || {};
            const isPending = r.status === "pending";

            return (
              <div
                key={r._id}
                className={`bg-slate-900 border rounded-xl p-4 shadow-lg transition-all ${
                  isPending ? "border-yellow-500/50" : "border-slate-800"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-[250px]">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-bold text-emerald-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {agent.agentCode || "N/A"}
                      </span>
                      <span className="text-sm text-slate-300 font-mono">
                        {agent.agentPhone || agent.phone || "-"}
                      </span>
                      <StatusBadge status={r.status} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 text-sm bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                      <InfoItem
                        label="ডলার"
                        value={`$${Number(r.amountUSD || 0).toFixed(2)}`}
                        color="text-blue-300"
                      />
                      <InfoItem
                        label="রেট"
                        value={`৳${Number(r.dollarRate || 0).toFixed(2)}`}
                        color="text-slate-300"
                      />
                      <InfoItem
                        label="টাকা"
                        value={`৳${Number(r.amountBDT || 0).toFixed(2)}`}
                        highlight
                      />
                      <InfoItem
                        label="এজেন্টের বর্তমান ব্যালেন্স"
                        value={`৳${Number(agent.agentMainBalance || 0).toFixed(2)}`}
                        color="text-emerald-400"
                      />
                    </div>

                    {r.paymentMethod && (
                      <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                        <i className="fa-solid fa-wallet"></i>
                        <strong>পেমেন্ট:</strong> {r.paymentMethod}
                        {r.transactionId && ` | TrxID: ${r.transactionId}`}
                      </p>
                    )}
                    {r.adminNote && (
                      <p className="text-xs text-orange-400 mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-note-sticky"></i>
                        <strong>নোট:</strong> {r.adminNote}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 mt-2 font-mono">
                      {new Date(r.createdAt).toLocaleString("bn-BD")}
                    </p>
                  </div>

                  {isPending && (
                    <div className="flex flex-col gap-2 min-w-[220px] bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleActionClick(r, "approve")}
                          disabled={processing === r._id}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50 transition shadow-lg shadow-emerald-500/20"
                        >
                          {processing === r._id ? "..." : "✅ অ্যাপ্রুভ"}
                        </button>
                        <button
                          onClick={() => handleActionClick(r, "reject")}
                          disabled={processing === r._id}
                          className="flex-1 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-lg disabled:opacity-50 transition shadow-lg shadow-rose-500/20"
                        >
                          {processing === r._id ? "..." : "❌ রিজেক্ট"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
  };
  const labels = {
    pending: "পেন্ডিং",
    approved: "অ্যাপ্রুভড",
    rejected: "রিজেক্টেড",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}

function InfoItem({ label, value, highlight, color }) {
  return (
    <div>
      <p className="text-[10px] text-slate-500 mb-0.5">{label}</p>
      <p
        className={`font-bold font-mono ${
          highlight ? "text-blue-400" : color || "text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
