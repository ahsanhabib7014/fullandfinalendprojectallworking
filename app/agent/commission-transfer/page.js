"use client";

import { useEffect, useState } from "react";

export default function AgentCommissionTransferPage() {
  const [balances, setBalances] = useState({
    agentMainBalance: 0,
    agentCommissionBalance: 0,
  });
  const [history, setHistory] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [page, setPage] = useState(1);
  const [amount, setAmount] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/agent/commission-transfer?page=${page}&limit=20`,
      );
      const data = await res.json();
      if (data.success) {
        setBalances(
          data.balances || { agentMainBalance: 0, agentCommissionBalance: 0 },
        );
        setHistory(data.history || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleTransfer = async (e) => {
    e.preventDefault();
    setMessage(null);

    const transferAmount = Number(amount);
    if (!transferAmount || transferAmount <= 0) {
      setMessage({ type: "error", text: "সঠিক পরিমাণ দিন" });
      return;
    }
    if (transferAmount > balances.agentCommissionBalance) {
      setMessage({
        type: "error",
        text: `কমিশন ব্যালেন্স পর্যাপ্ত নয়। আছে: ৳${balances.agentCommissionBalance.toFixed(2)}`,
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/agent/commission-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: transferAmount }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setAmount("");
        setPage(1);
        loadData();
      } else {
        setMessage({ type: "error", text: data.message || "ট্রান্সফার হয়নি" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto min-h-screen text-slate-100 bg-[#07090e]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-400">
          কমিশন ট্রান্সফার
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          আপনার কমিশন ব্যালেন্স থেকে মূল ব্যালেন্সে টাকা নিন
        </p>
      </div>

      {/* ব্যালেন্স কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            কমিশন ব্যালেন্স
          </p>
          <p className="text-3xl font-black text-emerald-400 font-mono mt-2">
            ৳{Number(balances.agentCommissionBalance || 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-colors">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            মূল ব্যালেন্স
          </p>
          <p className="text-3xl font-black text-blue-400 font-mono mt-2">
            ৳{Number(balances.agentMainBalance || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded-xl border text-sm font-bold ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
              : "bg-rose-950/40 border-rose-500/50 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ট্রান্সফার ফর্ম */}
      <form
        onSubmit={handleTransfer}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg"
      >
        <h2 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
          <i className="fa-solid fa-money-bill-transfer text-emerald-400"></i>{" "}
          ট্রান্সফার করুন
        </h2>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0.01"
            step="0.01"
            max={balances.agentCommissionBalance}
            placeholder="পরিমাণ (৳)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none font-mono"
          />
          <button
            type="button"
            onClick={() =>
              setAmount(balances.agentCommissionBalance.toFixed(2))
            }
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold px-4 py-3 rounded-xl transition border border-slate-700"
          >
            সব
          </button>
          <button
            type="submit"
            disabled={saving}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
          >
            {saving ? "চলছে..." : "ট্রান্সফার"}
          </button>
        </div>

        <p className="text-[11px] text-slate-500 mt-3 flex items-center gap-1.5">
          <i className="fa-solid fa-circle-info"></i>
          কমিশন ব্যালেন্স থেকে কেটে মূল ব্যালেন্সে যোগ হবে। এটি তাৎক্ষণিক।
        </p>
      </form>

      {/* হিস্ট্রি */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <h2 className="font-bold text-slate-200 flex items-center gap-2">
            <i className="fa-solid fa-clock-rotate-left text-slate-500"></i>{" "}
            ট্রান্সফার হিস্ট্রি
          </h2>
        </div>

        {loading ? (
          <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
        ) : history.length === 0 ? (
          <p className="p-5 text-slate-400 text-sm">
            এখনো কোনো ট্রান্সফার নেই।
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-right">পরিমাণ</th>
                  <th className="px-4 py-3 text-left">বিবরণ</th>
                  <th className="px-4 py-3 text-left">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {history.map((h) => (
                  <tr key={h._id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      ৳{Number(h.amount).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{h.comment}</td>
                    <td className="px-4 py-3 text-[10px] text-slate-500 font-mono">
                      {new Date(h.createdAt).toLocaleString("bn-BD")}
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
