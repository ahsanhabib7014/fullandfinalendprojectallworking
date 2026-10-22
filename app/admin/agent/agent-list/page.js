"use client";

import { useEffect, useState } from "react";

export default function AgentListPage() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // ফর্ম স্টেট
  const [form, setForm] = useState({
    uid: "",
    agentPhone: "",
    agentCryptoAddress: "",
    agentMainBalance: "",
    agentCommissionBalance: "",
    agentDepositCommission: "",
    agentWithdrawCommission: "",
    agentIsActive: false,
    agentIsBlocked: false,
  });

  // 🆕 মাল্টিপল পেমেন্ট অ্যাকাউন্ট স্টেট
  const [paymentAccounts, setPaymentAccounts] = useState([
    { method: "", accountNumber: "" },
  ]);

  const [editMode, setEditMode] = useState(false);

  const loadAgents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/agent/create");
      const data = await res.json();
      if (data.success) setAgents(data.agents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const payload = { ...form };

      // সংখ্যা ফিল্ড কনভার্ট
      [
        "agentMainBalance",
        "agentCommissionBalance",
        "agentDepositCommission",
        "agentWithdrawCommission",
      ].forEach((key) => {
        if (payload[key] === "" || payload[key] === null) {
          delete payload[key];
        } else {
          payload[key] = Number(payload[key]);
        }
      });

      // 🆕 পেমেন্ট অ্যাকাউন্ট ফিল্টার করে পাঠানো (খালি ফিল্ড বাদ দিয়ে)
      payload.agentPaymentAccounts = paymentAccounts.filter(
        (acc) => acc.method.trim() !== "" && acc.accountNumber.trim() !== "",
      );

      const res = await fetch("/api/admin/agent/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        resetForm();
        loadAgents();
      } else {
        setMessage({ type: "error", text: data.message || "সমস্যা হয়েছে" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setForm({
      uid: "",
      agentPhone: "",
      agentCryptoAddress: "",
      agentMainBalance: "",
      agentCommissionBalance: "",
      agentDepositCommission: "",
      agentWithdrawCommission: "",
      agentIsActive: false,
      agentIsBlocked: false,
    });
    setPaymentAccounts([{ method: "", accountNumber: "" }]); // 🆕 রিসেট
    setEditMode(false);
  };

  const handleEdit = (agent) => {
    setForm({
      uid: agent.uid || "",
      agentPhone: agent.agentPhone || "",
      agentCryptoAddress: agent.agentCryptoAddress || "",
      agentMainBalance: agent.agentMainBalance ?? "",
      agentCommissionBalance: agent.agentCommissionBalance ?? "",
      agentDepositCommission: agent.agentDepositCommission ?? "",
      agentWithdrawCommission: agent.agentWithdrawCommission ?? "",
      agentIsActive: agent.agentIsActive ?? false,
      agentIsBlocked: agent.agentIsBlocked ?? false,
    });

    // 🆕 পেমেন্ট অ্যাকাউন্ট লোড
    setPaymentAccounts(
      agent.agentPaymentAccounts && agent.agentPaymentAccounts.length > 0
        ? agent.agentPaymentAccounts
        : [{ method: "", accountNumber: "" }],
    );

    setEditMode(true);
    setMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100">
      <h1 className="text-2xl font-bold text-emerald-400 mb-1">এজেন্ট লিস্ট</h1>
      <p className="text-slate-400 mb-6 text-sm">
        ইউজারের UID দিয়ে এজেন্ট তৈরি করুন বা এডিট করুন
      </p>

      {message && (
        <div
          className={`mb-4 p-3 rounded-xl border text-sm font-bold ${
            message.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
              : "bg-rose-950/40 border-rose-500/50 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* ফর্ম */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg"
      >
        <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
          <h2 className="text-base md:text-lg font-bold text-slate-200">
            {editMode ? "এজেন্ট এডিট" : "নতুন এজেন্ট তৈরি"}
          </h2>
          {editMode && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
            >
              ✖ বাতিল করুন
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="ইউজারের UID *">
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              name="uid"
              value={form.uid}
              onChange={handleChange}
              required
              disabled={editMode}
              placeholder="যেমন: U123456"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none disabled:opacity-50 font-mono"
            />
          </FormField>

          <FormField label="এজেন্ট নাম্বার (১১ ডিজিট)">
            <input
              type="text"
              inputMode="numeric"
              maxLength={11}
              name="agentPhone"
              value={form.agentPhone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none font-mono"
            />
          </FormField>

          <FormField label="মূল ব্যালেন্স (৳)">
            <input
              type="number"
              name="agentMainBalance"
              value={form.agentMainBalance}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none font-mono"
            />
          </FormField>

          <FormField label="কমিশন ব্যালেন্স (৳)">
            <input
              type="number"
              name="agentCommissionBalance"
              value={form.agentCommissionBalance}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none font-mono"
            />
          </FormField>

          <FormField label="ডিপোজিট কমিশন (%)">
            <input
              type="number"
              name="agentDepositCommission"
              value={form.agentDepositCommission}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="খালি রাখলে গ্লোবাল"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none font-mono"
            />
          </FormField>

          <FormField label="উইথড্র কমিশন (%)">
            <input
              type="number"
              name="agentWithdrawCommission"
              value={form.agentWithdrawCommission}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="খালি রাখলে গ্লোবাল"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-emerald-500 outline-none font-mono"
            />
          </FormField>

          {/* 🆕 মাল্টিপল পেমেন্ট অ্যাকাউন্ট সেকশন */}
          <div className="col-span-1 md:col-span-2 bg-slate-950 p-4 rounded-xl border border-slate-800 mt-2">
            <label className="block text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">
              এজেন্টের পেমেন্ট মেথড ও নাম্বার (মাল্টিপল)
            </label>

            {paymentAccounts.map((acc, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-2 mb-2">
                <input
                  type="text"
                  placeholder="মেথডের নাম (যেমন: bKash Personal)"
                  value={acc.method}
                  onChange={(e) => {
                    const newAcc = [...paymentAccounts];
                    newAcc[index].method = e.target.value;
                    setPaymentAccounts(newAcc);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="নাম্বার বা অ্যাড্রেস"
                  value={acc.accountNumber}
                  onChange={(e) => {
                    const newAcc = [...paymentAccounts];
                    newAcc[index].accountNumber = e.target.value;
                    setPaymentAccounts(newAcc);
                  }}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-blue-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newAcc = paymentAccounts.filter(
                      (_, i) => i !== index,
                    );
                    setPaymentAccounts(newAcc);
                  }}
                  className="bg-rose-950 text-rose-400 border border-rose-900 px-3 py-2 rounded-xl text-sm font-bold hover:bg-rose-900 transition"
                >
                  ✖
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() =>
                setPaymentAccounts([
                  ...paymentAccounts,
                  { method: "", accountNumber: "" },
                ])
              }
              className="mt-2 text-xs font-bold text-blue-400 bg-blue-950/30 px-3 py-1.5 rounded-lg border border-blue-900 hover:bg-blue-900/50 transition"
            >
              + আরেকটি নাম্বার যোগ করুন
            </button>
          </div>

          <div className="flex items-center gap-6 md:mt-4">
            <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                name="agentIsActive"
                checked={form.agentIsActive}
                onChange={handleChange}
                className="w-4 h-4 accent-emerald-500"
              />
              অ্যাক্টিভ
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300 font-semibold cursor-pointer">
              <input
                type="checkbox"
                name="agentIsBlocked"
                checked={form.agentIsBlocked}
                onChange={handleChange}
                className="w-4 h-4 accent-rose-500"
              />
              ব্লকড
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
        >
          {saving
            ? "সেভ হচ্ছে..."
            : editMode
              ? "আপডেট করুন"
              : "এজেন্ট তৈরি করুন"}
        </button>
      </form>

      {/* লিস্ট */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-base font-bold text-slate-200">
            সব এজেন্ট ({agents.length})
          </h2>
        </div>

        {loading ? (
          <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
        ) : agents.length === 0 ? (
          <p className="p-5 text-slate-400 text-sm">কোনো এজেন্ট নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-left">UID</th>
                  <th className="px-4 py-3 text-left">কোড</th>
                  <th className="px-4 py-3 text-left">নাম্বার</th>
                  <th className="px-4 py-3 text-right">ব্যালেন্স</th>
                  <th className="px-4 py-3 text-right">কমিশন</th>
                  <th className="px-4 py-3 text-center">ডিপো %</th>
                  <th className="px-4 py-3 text-center">উইথ %</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {agents.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-slate-300 font-mono">
                      {a.uid}
                    </td>
                    <td className="px-4 py-3 text-slate-400">
                      {a.agentCode || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono">
                      <div className="flex flex-col gap-1">
                        <span>{a.agentPhone || "-"}</span>
                        {a.agentPaymentAccounts?.length > 0 && (
                          <span className="text-[10px] text-emerald-500">
                            {a.agentPaymentAccounts.length} টি মেথড
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-bold font-mono">
                      ৳{Number(a.agentMainBalance || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-blue-400 font-bold font-mono">
                      ৳{Number(a.agentCommissionBalance || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {a.agentDepositCommission ?? 0}%
                    </td>
                    <td className="px-4 py-3 text-center text-slate-300">
                      {a.agentWithdrawCommission ?? 0}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.agentIsBlocked ? (
                        <span className="bg-rose-950 text-rose-400 border border-rose-900 px-2 py-0.5 rounded text-xs font-bold">
                          ব্লকড
                        </span>
                      ) : a.agentIsActive ? (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-2 py-0.5 rounded text-xs font-bold">
                          অ্যাক্টিভ
                        </span>
                      ) : (
                        <span className="bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded text-xs font-bold">
                          নিষ্ক্রিয়
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEdit(a)}
                        className="text-blue-400 hover:text-blue-300 font-semibold text-xs border border-blue-500/30 px-3 py-1 rounded-lg hover:bg-blue-500/10 transition"
                      >
                        এডিট
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
