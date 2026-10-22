// // // "use client";

// // // import { useEffect, useState } from "react";

// // // export default function AgentDollarRequestPage() {
// // //   const [requests, setRequests] = useState([]);
// // //   const [pagination, setPagination] = useState(null);
// // //   const [loading, setLoading] = useState(true);
// // //   const [saving, setSaving] = useState(false);
// // //   const [message, setMessage] = useState(null);
// // //   const [dollarRate, setDollarRate] = useState(0);
// // //   const [statusFilter, setStatusFilter] = useState("all");
// // //   const [page, setPage] = useState(1);

// // //   // ফর্ম
// // //   const [form, setForm] = useState({
// // //     amountUSD: "",
// // //     paymentMethod: "",
// // //     senderNumber: "",
// // //     transactionId: "",
// // //   });

// // //   // প্রিভিউ
// // //   const [preview, setPreview] = useState(null);

// // //   useEffect(() => {
// // //     const rate = Number(form.amountUSD);
// // //     if (!isNaN(rate) && rate > 0 && dollarRate > 0) {
// // //       setPreview({
// // //         amountBDT: rate * dollarRate,
// // //       });
// // //     } else {
// // //       setPreview(null);
// // //     }
// // //   }, [form.amountUSD, dollarRate]);

// // //   const loadRequests = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const res = await fetch(
// // //         `/api/agent/dollar-request?status=${statusFilter}&page=${page}&limit=20`,
// // //       );
// // //       const data = await res.json();
// // //       if (data.success) {
// // //         setRequests(data.requests || []);
// // //         setPagination(data.pagination || null);
// // //       }
// // //     } catch (err) {
// // //       console.error(err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     const loadMe = async () => {
// // //       try {
// // //         const res = await fetch("/api/agent/me");
// // //         const data = await res.json();
// // //         if (data.success) {
// // //           setDollarRate(Number(data.dollarRate || 0));
// // //         }
// // //       } catch (err) {
// // //         console.error(err);
// // //       }
// // //     };
// // //     loadMe();
// // //   }, []);

// // //   useEffect(() => {
// // //     loadRequests();
// // //     // eslint-disable-next-line react-hooks/exhaustive-deps
// // //   }, [statusFilter, page]);

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setMessage(null);

// // //     const usd = Number(form.amountUSD);
// // //     if (!usd || usd <= 0) {
// // //       setMessage({ type: "error", text: "সঠিক ডলার পরিমাণ দিন" });
// // //       return;
// // //     }
// // //     if (dollarRate <= 0) {
// // //       setMessage({
// // //         type: "error",
// // //         text: "ডলার রেট সেট হয়নি, অ্যাডমিনের সাথে যোগাযোগ করুন",
// // //       });
// // //       return;
// // //     }

// // //     setSaving(true);
// // //     try {
// // //       const res = await fetch("/api/agent/dollar-request", {
// // //         method: "POST",
// // //         headers: { "Content-Type": "application/json" },
// // //         body: JSON.stringify({
// // //           amountUSD: usd,
// // //           paymentMethod: form.paymentMethod,
// // //           senderNumber: form.senderNumber,
// // //           transactionId: form.transactionId,
// // //         }),
// // //       });
// // //       const data = await res.json();

// // //       if (data.success) {
// // //         setMessage({ type: "success", text: data.message });
// // //         setForm({
// // //           amountUSD: "",
// // //           paymentMethod: "",
// // //           senderNumber: "",
// // //           transactionId: "",
// // //         });
// // //         setPage(1);
// // //         setStatusFilter("all");
// // //         loadRequests();
// // //       } else {
// // //         setMessage({
// // //           type: "error",
// // //           text: data.message || "রিকোয়েস্ট জমা হয়নি",
// // //         });
// // //       }
// // //     } catch (err) {
// // //       setMessage({ type: "error", text: "সার্ভার এরর" });
// // //     } finally {
// // //       setSaving(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="p-4 md:p-6 max-w-5xl mx-auto min-h-screen text-slate-100 bg-[#07090e]">
// // //       <div className="mb-6">
// // //         <h1 className="text-2xl font-bold text-blue-400">
// // //           ডলার লোড রিকোয়েস্ট
// // //         </h1>
// // //         <p className="text-slate-400 mt-1 text-sm">
// // //           ডলারে রিকোয়েস্ট দিন। অ্যাডমিন অ্যাপ্রুভ করলে ডলার রেট অনুযায়ী টাকা
// // //           আপনার মূল ব্যালেন্সে যোগ হবে।
// // //         </p>
// // //         <div className="mt-2 inline-flex items-center gap-2 bg-blue-950/40 border border-blue-500/30 px-3 py-1 rounded-lg">
// // //           <span className="text-xs text-slate-400">বর্তমান ডলার রেট:</span>
// // //           <span className="text-sm font-bold text-blue-400 font-mono">
// // //             ৳{Number(dollarRate).toFixed(2)} / $
// // //           </span>
// // //         </div>
// // //       </div>

// // //       {message && (
// // //         <div
// // //           className={`mb-6 p-3 rounded-xl border text-sm font-bold ${
// // //             message.type === "success"
// // //               ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
// // //               : "bg-rose-950/40 border-rose-500/50 text-rose-400"
// // //           }`}
// // //         >
// // //           {message.text}
// // //         </div>
// // //       )}

// // //       {/* ফর্ম */}
// // //       <form
// // //         onSubmit={handleSubmit}
// // //         className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg"
// // //       >
// // //         <h2 className="font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
// // //           <i className="fa-solid fa-plus-circle text-emerald-400"></i> নতুন
// // //           রিকোয়েস্ট
// // //         </h2>

// // //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// // //           <div>
// // //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// // //               ডলার পরিমাণ ($) *
// // //             </label>
// // //             <div className="relative">
// // //               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">
// // //                 $
// // //               </span>
// // //               <input
// // //                 type="number"
// // //                 value={form.amountUSD}
// // //                 onChange={(e) =>
// // //                   setForm({ ...form, amountUSD: e.target.value })
// // //                 }
// // //                 min="0.01"
// // //                 step="0.01"
// // //                 required
// // //                 placeholder="যেমন: 100"
// // //                 className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
// // //               />
// // //             </div>
// // //             {preview && (
// // //               <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">
// // //                 ≈ ৳{preview.amountBDT.toFixed(2)} (রেট: ৳{dollarRate}/$)
// // //               </p>
// // //             )}
// // //           </div>

// // //           <div>
// // //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// // //               পেমেন্ট মেথড
// // //             </label>
// // //             <input
// // //               type="text"
// // //               value={form.paymentMethod}
// // //               onChange={(e) =>
// // //                 setForm({ ...form, paymentMethod: e.target.value })
// // //               }
// // //               placeholder="USDT / bKash / Binance"
// // //               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
// // //             />
// // //           </div>

// // //           <div>
// // //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// // //               প্রেরকের নাম্বার / অ্যাড্রেস
// // //             </label>
// // //             <input
// // //               type="text"
// // //               value={form.senderNumber}
// // //               onChange={(e) =>
// // //                 setForm({ ...form, senderNumber: e.target.value })
// // //               }
// // //               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
// // //             />
// // //           </div>

// // //           <div>
// // //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// // //               ট্রানজেকশন আইডি
// // //             </label>
// // //             <input
// // //               type="text"
// // //               value={form.transactionId}
// // //               onChange={(e) =>
// // //                 setForm({ ...form, transactionId: e.target.value })
// // //               }
// // //               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
// // //             />
// // //           </div>
// // //         </div>

// // //         <button
// // //           type="submit"
// // //           disabled={saving}
// // //           className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
// // //         >
// // //           {saving ? "জমা হচ্ছে..." : "রিকোয়েস্ট জমা দিন"}
// // //         </button>
// // //       </form>

// // //       {/* লিস্ট */}
// // //       <div className="mb-4 flex gap-2 flex-wrap">
// // //         {[
// // //           { key: "all", label: "সব" },
// // //           { key: "pending", label: "পেন্ডিং" },
// // //           { key: "approved", label: "অ্যাপ্রুভড" },
// // //           { key: "rejected", label: "রিজেক্টেড" },
// // //         ].map((s) => (
// // //           <button
// // //             key={s.key}
// // //             onClick={() => {
// // //               setStatusFilter(s.key);
// // //               setPage(1);
// // //             }}
// // //             className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
// // //               statusFilter === s.key
// // //                 ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
// // //                 : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
// // //             }`}
// // //           >
// // //             {s.label}
// // //           </button>
// // //         ))}
// // //       </div>

// // //       <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
// // //         {loading ? (
// // //           <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
// // //         ) : requests.length === 0 ? (
// // //           <p className="p-5 text-slate-400 text-sm">কোনো রিকোয়েস্ট নেই।</p>
// // //         ) : (
// // //           <div className="overflow-x-auto">
// // //             <table className="w-full text-sm">
// // //               <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
// // //                 <tr>
// // //                   <th className="px-4 py-3 text-right">ডলার</th>
// // //                   <th className="px-4 py-3 text-right">রেট</th>
// // //                   <th className="px-4 py-3 text-right">টাকা</th>
// // //                   <th className="px-4 py-3 text-left">মেথড</th>
// // //                   <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
// // //                   <th className="px-4 py-3 text-left">সময়</th>
// // //                 </tr>
// // //               </thead>
// // //               <tbody className="divide-y divide-slate-800">
// // //                 {requests.map((r) => (
// // //                   <tr key={r._id} className="hover:bg-slate-800/50 transition">
// // //                     <td className="px-4 py-3 text-right font-mono text-slate-200">
// // //                       ${Number(r.amountUSD).toFixed(2)}
// // //                     </td>
// // //                     <td className="px-4 py-3 text-right font-mono text-slate-400">
// // //                       ৳{Number(r.dollarRate).toFixed(2)}
// // //                     </td>
// // //                     <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
// // //                       ৳{Number(r.amountBDT).toFixed(2)}
// // //                     </td>
// // //                     <td className="px-4 py-3 text-slate-300">
// // //                       {r.paymentMethod || "-"}
// // //                     </td>
// // //                     <td className="px-4 py-3 text-center">
// // //                       <StatusBadge status={r.status} />
// // //                     </td>
// // //                     <td className="px-4 py-3 text-[10px] text-slate-500 font-mono">
// // //                       {new Date(r.createdAt).toLocaleString("bn-BD")}
// // //                     </td>
// // //                   </tr>
// // //                 ))}
// // //               </tbody>
// // //             </table>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {pagination && pagination.totalPages > 1 && (
// // //         <div className="mt-6 flex items-center justify-center gap-3">
// // //           <button
// // //             onClick={() => setPage((p) => Math.max(1, p - 1))}
// // //             disabled={page === 1}
// // //             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
// // //           >
// // //             ←
// // //           </button>
// // //           <span className="text-xs font-bold text-slate-400">
// // //             পেজ {page} / {pagination.totalPages}
// // //           </span>
// // //           <button
// // //             onClick={() =>
// // //               setPage((p) => Math.min(pagination.totalPages, p + 1))
// // //             }
// // //             disabled={page === pagination.totalPages}
// // //             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
// // //           >
// // //             →
// // //           </button>
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // }

// // // function StatusBadge({ status }) {
// // //   const styles = {
// // //     pending: "bg-yellow-950/50 text-yellow-400 border-yellow-500/30",
// // //     approved: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
// // //     rejected: "bg-rose-950/50 text-rose-400 border-rose-500/30",
// // //   };
// // //   const labels = {
// // //     pending: "পেন্ডিং",
// // //     approved: "অ্যাপ্রুভড",
// // //     rejected: "রিজেক্টেড",
// // //   };
// // //   return (
// // //     <span
// // //       className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status] || "bg-slate-800 text-slate-400"}`}
// // //     >
// // //       {labels[status] || status}
// // //     </span>
// // //   );
// // // }
// // // ///////////////////////////////////////////////////////////////////////////////////////
// // "use client";

// // import { useEffect, useState } from "react";

// // export default function AgentDollarRequestPage() {
// //   const [requests, setRequests] = useState([]);
// //   const [pagination, setPagination] = useState(null);
// //   const [loading, setLoading] = useState(true);
// //   const [saving, setSaving] = useState(false);
// //   const [message, setMessage] = useState(null);
// //   const [dollarRate, setDollarRate] = useState(0);
// //   const [statusFilter, setStatusFilter] = useState("all");
// //   const [page, setPage] = useState(1);

// //   // 🆕 TrxID রিয়েল-টাইম চেক স্টেট
// //   const [trxError, setTrxError] = useState("");
// //   const [checkingTrx, setCheckingTrx] = useState(false);

// //   // ফর্ম
// //   const [form, setForm] = useState({
// //     amountUSD: "",
// //     paymentMethod: "",
// //     senderNumber: "",
// //     transactionId: "",
// //   });

// //   // প্রিভিউ
// //   const [preview, setPreview] = useState(null);

// //   useEffect(() => {
// //     const rate = Number(form.amountUSD);
// //     if (!isNaN(rate) && rate > 0 && dollarRate > 0) {
// //       setPreview({
// //         amountBDT: rate * dollarRate,
// //       });
// //     } else {
// //       setPreview(null);
// //     }
// //   }, [form.amountUSD, dollarRate]);

// //   // 🆕 ট্রানজেকশন আইডি রিয়েল-টাইম চেক
// //   useEffect(() => {
// //     const checkTrx = async () => {
// //       const cleanTrx = form.transactionId.trim();

// //       // যদি ৫ অক্ষরের কম হয়, তবে চেক করবে না
// //       if (!cleanTrx || cleanTrx.length < 5) {
// //         setTrxError("");
// //         return;
// //       }

// //       setCheckingTrx(true);
// //       try {
// //         const res = await fetch("/api/agent/check-trx", {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify({ transactionId: cleanTrx }),
// //         });
// //         const data = await res.json();

// //         if (data.exists) {
// //           setTrxError("এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহার করা হয়েছে!");
// //         } else {
// //           setTrxError("");
// //         }
// //       } catch (err) {
// //         console.error("Trx check error:", err);
// //       } finally {
// //         setCheckingTrx(false);
// //       }
// //     };

// //     // টাইপিং থামার ৫০০ms পর চেক করবে
// //     const timer = setTimeout(checkTrx, 500);
// //     return () => clearTimeout(timer);
// //   }, [form.transactionId]);

// //   const loadRequests = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetch(
// //         `/api/agent/dollar-request?status=${statusFilter}&page=${page}&limit=20`,
// //       );
// //       const data = await res.json();
// //       if (data.success) {
// //         setRequests(data.requests || []);
// //         setPagination(data.pagination || null);
// //       }
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     const loadMe = async () => {
// //       try {
// //         const res = await fetch("/api/agent/me");
// //         const data = await res.json();
// //         if (data.success) {
// //           setDollarRate(Number(data.dollarRate || 0));
// //         }
// //       } catch (err) {
// //         console.error(err);
// //       }
// //     };
// //     loadMe();
// //   }, []);

// //   useEffect(() => {
// //     loadRequests();
// //     // eslint-disable-next-line react-hooks/exhaustive-deps
// //   }, [statusFilter, page]);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setMessage(null);

// //     // 🆕 TrxID এরর থাকলে সাবমিট হবে না
// //     if (trxError) {
// //       setMessage({ type: "error", text: trxError });
// //       return;
// //     }

// //     const usd = Number(form.amountUSD);
// //     if (!usd || usd <= 0) {
// //       setMessage({ type: "error", text: "সঠিক ডলার পরিমাণ দিন" });
// //       return;
// //     }
// //     if (dollarRate <= 0) {
// //       setMessage({
// //         type: "error",
// //         text: "ডলার রেট সেট হয়নি, অ্যাডমিনের সাথে যোগাযোগ করুন",
// //       });
// //       return;
// //     }

// //     setSaving(true);
// //     try {
// //       const res = await fetch("/api/agent/dollar-request", {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify({
// //           amountUSD: usd,
// //           paymentMethod: form.paymentMethod,
// //           senderNumber: form.senderNumber,
// //           transactionId: form.transactionId,
// //         }),
// //       });
// //       const data = await res.json();

// //       if (data.success) {
// //         setMessage({ type: "success", text: data.message });
// //         setForm({
// //           amountUSD: "",
// //           paymentMethod: "",
// //           senderNumber: "",
// //           transactionId: "",
// //         });
// //         setTrxError(""); // ✅ সাবমিটের পর এরর রিসেট
// //         setPage(1);
// //         setStatusFilter("all");
// //         loadRequests();
// //       } else {
// //         setMessage({
// //           type: "error",
// //           text: data.message || "রিকোয়েস্ট জমা হয়নি",
// //         });
// //       }
// //     } catch (err) {
// //       setMessage({ type: "error", text: "সার্ভার এরর" });
// //     } finally {
// //       setSaving(false);
// //     }
// //   };

// //   return (
// //     <div className="p-4 md:p-6 max-w-5xl mx-auto min-h-screen text-slate-100 bg-[#07090e]">
// //       <div className="mb-6">
// //         <h1 className="text-2xl font-bold text-blue-400">
// //           ডলার লোড রিকোয়েস্ট
// //         </h1>
// //         <p className="text-slate-400 mt-1 text-sm">
// //           ডলারে রিকোয়েস্ট দিন। অ্যাডমিন অ্যাপ্রুভ করলে ডলার রেট অনুযায়ী টাকা
// //           আপনার মূল ব্যালেন্সে যোগ হবে।
// //         </p>
// //         <div className="mt-2 inline-flex items-center gap-2 bg-blue-950/40 border border-blue-500/30 px-3 py-1 rounded-lg">
// //           <span className="text-xs text-slate-400">বর্তমান ডলার রেট:</span>
// //           <span className="text-sm font-bold text-blue-400 font-mono">
// //             ৳{Number(dollarRate).toFixed(2)} / $
// //           </span>
// //         </div>
// //       </div>

// //       {message && (
// //         <div
// //           className={`mb-6 p-3 rounded-xl border text-sm font-bold ${
// //             message.type === "success"
// //               ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
// //               : "bg-rose-950/40 border-rose-500/50 text-rose-400"
// //           }`}
// //         >
// //           {message.text}
// //         </div>
// //       )}

// //       {/* ফর্ম */}
// //       <form
// //         onSubmit={handleSubmit}
// //         className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg"
// //       >
// //         <h2 className="font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
// //           <i className="fa-solid fa-plus-circle text-emerald-400"></i> নতুন
// //           রিকোয়েস্ট
// //         </h2>

// //         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //           <div>
// //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// //               ডলার পরিমাণ ($) *
// //             </label>
// //             <div className="relative">
// //               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">
// //                 $
// //               </span>
// //               <input
// //                 type="number"
// //                 value={form.amountUSD}
// //                 onChange={(e) =>
// //                   setForm({ ...form, amountUSD: e.target.value })
// //                 }
// //                 min="0.01"
// //                 step="0.01"
// //                 required
// //                 placeholder="যেমন: 100"
// //                 className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
// //               />
// //             </div>
// //             {preview && (
// //               <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">
// //                 ≈ ৳{preview.amountBDT.toFixed(2)} (রেট: ৳{dollarRate}/$)
// //               </p>
// //             )}
// //           </div>

// //           <div>
// //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// //               পেমেন্ট মেথড
// //             </label>
// //             <input
// //               type="text"
// //               value={form.paymentMethod}
// //               onChange={(e) =>
// //                 setForm({ ...form, paymentMethod: e.target.value })
// //               }
// //               placeholder="USDT / bKash / Binance"
// //               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// //               প্রেরকের নাম্বার / অ্যাড্রেস
// //             </label>
// //             <input
// //               type="text"
// //               value={form.senderNumber}
// //               onChange={(e) =>
// //                 setForm({ ...form, senderNumber: e.target.value })
// //               }
// //               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
// //             />
// //           </div>

// //           <div>
// //             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
// //               ট্রানজেকশন আইডি
// //             </label>
// //             <input
// //               type="text"
// //               value={form.transactionId}
// //               onChange={(e) =>
// //                 setForm({ ...form, transactionId: e.target.value })
// //               }
// //               className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-sm text-white outline-none font-mono ${
// //                 trxError
// //                   ? "border-rose-500 focus:border-rose-500"
// //                   : "border-slate-700 focus:border-blue-500"
// //               }`}
// //             />

// //             {/* 🆕 TrxID এরর মেসেজ */}
// //             {trxError && (
// //               <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
// //                 <i className="fa-solid fa-circle-exclamation"></i> {trxError}
// //               </p>
// //             )}
// //             {checkingTrx && (
// //               <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
// //                 <i className="fa-solid fa-spinner fa-spin"></i> চেক করা হচ্ছে...
// //               </p>
// //             )}
// //           </div>
// //         </div>

// //         <button
// //           type="submit"
// //           disabled={saving || !!trxError || checkingTrx}
// //           className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
// //         >
// //           {saving ? "জমা হচ্ছে..." : "রিকোয়েস্ট জমা দিন"}
// //         </button>
// //       </form>

// //       {/* লিস্ট */}
// //       <div className="mb-4 flex gap-2 flex-wrap">
// //         {[
// //           { key: "all", label: "সব" },
// //           { key: "pending", label: "পেন্ডিং" },
// //           { key: "approved", label: "অ্যাপ্রুভড" },
// //           { key: "rejected", label: "রিজেক্টেড" },
// //         ].map((s) => (
// //           <button
// //             key={s.key}
// //             onClick={() => {
// //               setStatusFilter(s.key);
// //               setPage(1);
// //             }}
// //             className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
// //               statusFilter === s.key
// //                 ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
// //                 : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
// //             }`}
// //           >
// //             {s.label}
// //           </button>
// //         ))}
// //       </div>

// //       <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
// //         {loading ? (
// //           <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
// //         ) : requests.length === 0 ? (
// //           <p className="p-5 text-slate-400 text-sm">কোনো রিকোয়েস্ট নেই।</p>
// //         ) : (
// //           <div className="overflow-x-auto">
// //             <table className="w-full text-sm">
// //               <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
// //                 <tr>
// //                   <th className="px-4 py-3 text-right">ডলার</th>
// //                   <th className="px-4 py-3 text-right">রেট</th>
// //                   <th className="px-4 py-3 text-right">টাকা</th>
// //                   <th className="px-4 py-3 text-left">মেথড</th>
// //                   <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
// //                   <th className="px-4 py-3 text-left">সময়</th>
// //                 </tr>
// //               </thead>
// //               <tbody className="divide-y divide-slate-800">
// //                 {requests.map((r) => (
// //                   <tr key={r._id} className="hover:bg-slate-800/50 transition">
// //                     <td className="px-4 py-3 text-right font-mono text-slate-200">
// //                       ${Number(r.amountUSD).toFixed(2)}
// //                     </td>
// //                     <td className="px-4 py-3 text-right font-mono text-slate-400">
// //                       ৳{Number(r.dollarRate).toFixed(2)}
// //                     </td>
// //                     <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
// //                       ৳{Number(r.amountBDT).toFixed(2)}
// //                     </td>
// //                     <td className="px-4 py-3 text-slate-300">
// //                       {r.paymentMethod || "-"}
// //                     </td>
// //                     <td className="px-4 py-3 text-center">
// //                       <StatusBadge status={r.status} />
// //                     </td>
// //                     <td className="px-4 py-3 text-[10px] text-slate-500 font-mono">
// //                       {new Date(r.createdAt).toLocaleString("bn-BD")}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         )}
// //       </div>

// //       {pagination && pagination.totalPages > 1 && (
// //         <div className="mt-6 flex items-center justify-center gap-3">
// //           <button
// //             onClick={() => setPage((p) => Math.max(1, p - 1))}
// //             disabled={page === 1}
// //             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
// //           >
// //             ←
// //           </button>
// //           <span className="text-xs font-bold text-slate-400">
// //             পেজ {page} / {pagination.totalPages}
// //           </span>
// //           <button
// //             onClick={() =>
// //               setPage((p) => Math.min(pagination.totalPages, p + 1))
// //             }
// //             disabled={page === pagination.totalPages}
// //             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
// //           >
// //             →
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // function StatusBadge({ status }) {
// //   const styles = {
// //     pending: "bg-yellow-950/50 text-yellow-400 border-yellow-500/30",
// //     approved: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
// //     rejected: "bg-rose-950/50 text-rose-400 border-rose-500/30",
// //   };
// //   const labels = {
// //     pending: "পেন্ডিং",
// //     approved: "অ্যাপ্রুভড",
// //     rejected: "রিজেক্টেড",
// //   };
// //   return (
// //     <span
// //       className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status] || "bg-slate-800 text-slate-400"}`}
// //     >
// //       {labels[status] || status}
// //     </span>
// //   );
// // }
// // ////////////////////////////////////////////////////////////////////////////////

// "use client";

// import { useEffect, useState } from "react";

// export default function AgentDollarRequestPage() {
//   const [requests, setRequests] = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState(null);
//   const [dollarRate, setDollarRate] = useState(0);
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [page, setPage] = useState(1);

//   // 🆕 TrxID রিয়েল-টাইম চেক স্টেট
//   const [trxError, setTrxError] = useState("");
//   const [checkingTrx, setCheckingTrx] = useState(false);

//   // 🆕 অ্যাডমিনের অ্যাড্রেস স্টেট
//   const [adminAddresses, setAdminAddresses] = useState([]);
//   const [selectedAddress, setSelectedAddress] = useState(null);

//   // ফর্ম
//   const [form, setForm] = useState({
//     amountUSD: "",
//     paymentMethod: "",
//     senderNumber: "",
//     transactionId: "",
//   });

//   // প্রিভিউ
//   const [preview, setPreview] = useState(null);

//   // ✅ অ্যাডমিনের অ্যাড্রেস লোড করা
//   useEffect(() => {
//     const loadAdminAddresses = async () => {
//       try {
//         const res = await fetch("/api/admin/payment-addresses", {
//           credentials: "include",
//         });
//         const data = await res.json();
//         if (data.success && data.addresses) {
//           setAdminAddresses(data.addresses);
//           if (data.addresses.length > 0) {
//             setSelectedAddress(data.addresses[0]);
//             // ✅ প্রথম অ্যাড্রেসের মেথড অটো ফর্মে বসে যাবে
//             setForm((prev) => ({
//               ...prev,
//               paymentMethod: data.addresses[0].method,
//             }));
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load admin addresses:", err);
//       }
//     };
//     loadAdminAddresses();
//   }, []);

//   useEffect(() => {
//     const rate = Number(form.amountUSD);
//     if (!isNaN(rate) && rate > 0 && dollarRate > 0) {
//       setPreview({
//         amountBDT: rate * dollarRate,
//       });
//     } else {
//       setPreview(null);
//     }
//   }, [form.amountUSD, dollarRate]);

//   // 🆕 ট্রানজেকশন আইডি রিয়েল-টাইম চেক
//   useEffect(() => {
//     const checkTrx = async () => {
//       const cleanTrx = form.transactionId.trim();

//       if (!cleanTrx || cleanTrx.length < 5) {
//         setTrxError("");
//         return;
//       }

//       setCheckingTrx(true);
//       try {
//         const res = await fetch("/api/agent/check-trx", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ transactionId: cleanTrx }),
//         });
//         const data = await res.json();

//         if (data.exists) {
//           setTrxError("এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহার করা হয়েছে!");
//         } else {
//           setTrxError("");
//         }
//       } catch (err) {
//         console.error("Trx check error:", err);
//       } finally {
//         setCheckingTrx(false);
//       }
//     };

//     const timer = setTimeout(checkTrx, 500);
//     return () => clearTimeout(timer);
//   }, [form.transactionId]);

//   const loadRequests = async () => {
//     setLoading(true);
//     try {
//       const res = await fetch(
//         `/api/agent/dollar-request?status=${statusFilter}&page=${page}&limit=20`,
//       );
//       const data = await res.json();
//       if (data.success) {
//         setRequests(data.requests || []);
//         setPagination(data.pagination || null);
//       }
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     const loadMe = async () => {
//       try {
//         const res = await fetch("/api/agent/me");
//         const data = await res.json();
//         if (data.success) {
//           setDollarRate(Number(data.dollarRate || 0));
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     };
//     loadMe();
//   }, []);

//   useEffect(() => {
//     loadRequests();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [statusFilter, page]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage(null);

//     if (trxError) {
//       setMessage({ type: "error", text: trxError });
//       return;
//     }

//     const usd = Number(form.amountUSD);
//     if (!usd || usd <= 0) {
//       setMessage({ type: "error", text: "সঠিক ডলার পরিমাণ দিন" });
//       return;
//     }
//     if (dollarRate <= 0) {
//       setMessage({
//         type: "error",
//         text: "ডলার রেট সেট হয়নি, অ্যাডমিনের সাথে যোগাযোগ করুন",
//       });
//       return;
//     }

//     setSaving(true);
//     try {
//       const res = await fetch("/api/agent/dollar-request", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           amountUSD: usd,
//           paymentMethod: form.paymentMethod,
//           senderNumber: form.senderNumber,
//           transactionId: form.transactionId,
//         }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         setMessage({ type: "success", text: data.message });
//         setForm({
//           amountUSD: "",
//           paymentMethod: selectedAddress ? selectedAddress.method : "",
//           senderNumber: "",
//           transactionId: "",
//         });
//         setTrxError("");
//         setPage(1);
//         setStatusFilter("all");
//         loadRequests();
//       } else {
//         setMessage({
//           type: "error",
//           text: data.message || "রিকোয়েস্ট জমা হয়নি",
//         });
//       }
//     } catch (err) {
//       setMessage({ type: "error", text: "সার্ভার এরর" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   // ✅ কপি ফাংশন
//   const handleCopy = (text) => {
//     navigator.clipboard.writeText(text);
//     setMessage({ type: "success", text: "অ্যাড্রেস কপি হয়েছে!" });
//     setTimeout(() => setMessage(null), 2000);
//   };

//   return (
//     <div className="p-4 md:p-6 max-w-5xl mx-auto min-h-screen text-slate-100 bg-[#07090e]">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-blue-400">
//           ডলার লোড রিকোয়েস্ট
//         </h1>
//         <p className="text-slate-400 mt-1 text-sm">
//           ডলারে রিকোয়েস্ট দিন। অ্যাডমিন অ্যাপ্রুভ করলে ডলার রেট অনুযায়ী টাকা
//           আপনার মূল ব্যালেন্সে যোগ হবে।
//         </p>
//         <div className="mt-2 inline-flex items-center gap-2 bg-blue-950/40 border border-blue-500/30 px-3 py-1 rounded-lg">
//           <span className="text-xs text-slate-400">বর্তমান ডলার রেট:</span>
//           <span className="text-sm font-bold text-blue-400 font-mono">
//             ৳{Number(dollarRate).toFixed(2)} / $
//           </span>
//         </div>
//       </div>

//       {message && (
//         <div
//           className={`mb-6 p-3 rounded-xl border text-sm font-bold ${
//             message.type === "success"
//               ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
//               : "bg-rose-950/40 border-rose-500/50 text-rose-400"
//           }`}
//         >
//           {message.text}
//         </div>
//       )}

//       {/* ✅ অ্যাডমিনের অ্যাড্রেস ড্রপডাউন */}
//       {adminAddresses.length > 0 && (
//         <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-500/40 rounded-2xl p-5 mb-6 shadow-lg">
//           <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
//             <i className="fa-solid fa-wallet"></i> অ্যাডমিনের ডলার পাঠানোর
//             অ্যাড্রেস
//           </h3>

//           <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
//             মেথড সিলেক্ট করুন
//           </label>
//           <select
//             value={selectedAddress ? selectedAddress.accountNumber : ""}
//             onChange={(e) => {
//               const selected = adminAddresses.find(
//                 (acc) => acc.accountNumber === e.target.value,
//               );
//               setSelectedAddress(selected);
//               // ✅ ড্রপডাউনে সিলেক্ট করলে নিচের ফর্মে পেমেন্ট মেথড অটো বসে যাবে
//               if (selected) {
//                 setForm((prev) => ({
//                   ...prev,
//                   paymentMethod: selected.method,
//                 }));
//               }
//             }}
//             className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 cursor-pointer mb-3"
//           >
//             {adminAddresses.map((acc, i) => (
//               <option key={i} value={acc.accountNumber}>
//                 {acc.method}
//               </option>
//             ))}
//           </select>

//           {selectedAddress && (
//             <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
//               <span className="text-xs text-blue-400 font-mono break-all">
//                 {selectedAddress.accountNumber}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => handleCopy(selectedAddress.accountNumber)}
//                 className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition ml-2 flex-shrink-0"
//               >
//                 <i className="fa-solid fa-copy"></i> কপি
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {/* ফর্ম */}
//       <form
//         onSubmit={handleSubmit}
//         className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg"
//       >
//         <h2 className="font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
//           <i className="fa-solid fa-plus-circle text-emerald-400"></i> নতুন
//           রিকোয়েস্ট
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
//               ডলার পরিমাণ ($) *
//             </label>
//             <div className="relative">
//               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">
//                 $
//               </span>
//               <input
//                 type="number"
//                 value={form.amountUSD}
//                 onChange={(e) =>
//                   setForm({ ...form, amountUSD: e.target.value })
//                 }
//                 min="0.01"
//                 step="0.01"
//                 required
//                 placeholder="যেমন: 100"
//                 className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
//               />
//             </div>
//             {preview && (
//               <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">
//                 ≈ ৳{preview.amountBDT.toFixed(2)} (রেট: ৳{dollarRate}/$)
//               </p>
//             )}
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
//               পেমেন্ট মেথড
//             </label>
//             <input
//               type="text"
//               value={form.paymentMethod}
//               readOnly
//               onChange={(e) =>
//                 setForm({ ...form, paymentMethod: e.target.value })
//               }
//               placeholder="USDT / bKash / Binance"
//               // ✅ মেথড থাকলে লাল রঙে দেখাবে
//               className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors ${
//                 form.paymentMethod.trim()
//                   ? "border-rose-500 text-rose-400"
//                   : "border-slate-700 text-white focus:border-blue-500"
//               }`}
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
//               প্রেরকের নাম্বার / অ্যাড্রেস
//             </label>
//             <input
//               type="text"
//               value={form.senderNumber}
//               onChange={(e) =>
//                 setForm({ ...form, senderNumber: e.target.value })
//               }
//               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
//               ট্রানজেকশন আইডি
//             </label>
//             <input
//               type="text"
//               value={form.transactionId}
//               onChange={(e) =>
//                 setForm({ ...form, transactionId: e.target.value })
//               }
//               className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-sm text-white outline-none font-mono ${
//                 trxError
//                   ? "border-rose-500 focus:border-rose-500"
//                   : "border-slate-700 focus:border-blue-500"
//               }`}
//             />

//             {trxError && (
//               <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
//                 <i className="fa-solid fa-circle-exclamation"></i> {trxError}
//               </p>
//             )}
//             {checkingTrx && (
//               <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
//                 <i className="fa-solid fa-spinner fa-spin"></i> চেক করা হচ্ছে...
//               </p>
//             )}
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={saving || !!trxError || checkingTrx}
//           className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
//         >
//           {saving ? "জমা হচ্ছে..." : "রিকোয়েস্ট জমা দিন"}
//         </button>
//       </form>

//       {/* লিস্ট */}
//       <div className="mb-4 flex gap-2 flex-wrap">
//         {[
//           { key: "all", label: "সব" },
//           { key: "pending", label: "পেন্ডিং" },
//           { key: "approved", label: "অ্যাপ্রুভড" },
//           { key: "rejected", label: "রিজেক্টেড" },
//         ].map((s) => (
//           <button
//             key={s.key}
//             onClick={() => {
//               setStatusFilter(s.key);
//               setPage(1);
//             }}
//             className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
//               statusFilter === s.key
//                 ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30"
//                 : "bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800"
//             }`}
//           >
//             {s.label}
//           </button>
//         ))}
//       </div>

//       <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
//         {loading ? (
//           <p className="p-5 text-slate-400 text-sm">লোড হচ্ছে...</p>
//         ) : requests.length === 0 ? (
//           <p className="p-5 text-slate-400 text-sm">কোনো রিকোয়েস্ট নেই।</p>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
//                 <tr>
//                   <th className="px-4 py-3 text-right">ডলার</th>
//                   <th className="px-4 py-3 text-right">রেট</th>
//                   <th className="px-4 py-3 text-right">টাকা</th>
//                   <th className="px-4 py-3 text-left">মেথড</th>
//                   <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
//                   <th className="px-4 py-3 text-left">সময়</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-slate-800">
//                 {requests.map((r) => (
//                   <tr key={r._id} className="hover:bg-slate-800/50 transition">
//                     <td className="px-4 py-3 text-right font-mono text-slate-200">
//                       ${Number(r.amountUSD).toFixed(2)}
//                     </td>
//                     <td className="px-4 py-3 text-right font-mono text-slate-400">
//                       ৳{Number(r.dollarRate).toFixed(2)}
//                     </td>
//                     <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
//                       ৳{Number(r.amountBDT).toFixed(2)}
//                     </td>
//                     <td className="px-4 py-3 text-slate-300">
//                       {r.paymentMethod || "-"}
//                     </td>
//                     <td className="px-4 py-3 text-center">
//                       <StatusBadge status={r.status} />
//                     </td>
//                     <td className="px-4 py-3 text-[10px] text-slate-500 font-mono">
//                       {new Date(r.createdAt).toLocaleString("bn-BD")}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {pagination && pagination.totalPages > 1 && (
//         <div className="mt-6 flex items-center justify-center gap-3">
//           <button
//             onClick={() => setPage((p) => Math.max(1, p - 1))}
//             disabled={page === 1}
//             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
//           >
//             ←
//           </button>
//           <span className="text-xs font-bold text-slate-400">
//             পেজ {page} / {pagination.totalPages}
//           </span>
//           <button
//             onClick={() =>
//               setPage((p) => Math.min(pagination.totalPages, p + 1))
//             }
//             disabled={page === pagination.totalPages}
//             className="px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-800 transition"
//           >
//             →
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// function StatusBadge({ status }) {
//   const styles = {
//     pending: "bg-yellow-950/50 text-yellow-400 border-yellow-500/30",
//     approved: "bg-emerald-950/50 text-emerald-400 border-emerald-500/30",
//     rejected: "bg-rose-950/50 text-rose-400 border-rose-500/30",
//   };
//   const labels = {
//     pending: "পেন্ডিং",
//     approved: "অ্যাপ্রুভড",
//     rejected: "রিজেক্টেড",
//   };
//   return (
//     <span
//       className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status] || "bg-slate-800 text-slate-400"}`}
//     >
//       {labels[status] || status}
//     </span>
//   );
// }
// ///////////////////////////////////////////////////////////////////////////////
"use client";

import { useEffect, useState } from "react";

export default function AgentDollarRequestPage() {
  const [requests, setRequests] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [dollarRate, setDollarRate] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // 🆕 TrxID রিয়েল-টাইম চেক স্টেট
  const [trxError, setTrxError] = useState("");
  const [checkingTrx, setCheckingTrx] = useState(false);

  // 🆕 অ্যাডমিনের অ্যাড্রেস স্টেট
  const [adminAddresses, setAdminAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);

  // ফর্ম
  const [form, setForm] = useState({
    amountUSD: "",
    paymentMethod: "",
    senderNumber: "",
    transactionId: "",
  });

  // প্রিভিউ
  const [preview, setPreview] = useState(null);

  // ✅ অ্যাডমিনের অ্যাড্রেস লোড করা
  useEffect(() => {
    const loadAdminAddresses = async () => {
      try {
        const res = await fetch("/api/admin/payment-addresses", {
          credentials: "include",
        });
        const data = await res.json();
        if (data.success && data.addresses) {
          setAdminAddresses(data.addresses);
          if (data.addresses.length > 0) {
            setSelectedAddress(data.addresses[0]);
            // ✅ প্রথম অ্যাড্রেসের মেথড অটো ফর্মে বসে যাবে
            setForm((prev) => ({
              ...prev,
              paymentMethod: data.addresses[0].method,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to load admin addresses:", err);
      }
    };
    loadAdminAddresses();
  }, []);

  useEffect(() => {
    const rate = Number(form.amountUSD);
    if (!isNaN(rate) && rate > 0 && dollarRate > 0) {
      setPreview({
        amountBDT: rate * dollarRate,
      });
    } else {
      setPreview(null);
    }
  }, [form.amountUSD, dollarRate]);

  // 🆕 ট্রানজেকশন আইডি রিয়েল-টাইম চেক
  useEffect(() => {
    const checkTrx = async () => {
      const cleanTrx = form.transactionId.trim();

      if (!cleanTrx || cleanTrx.length < 5) {
        setTrxError("");
        return;
      }

      setCheckingTrx(true);
      try {
        const res = await fetch("/api/agent/check-trx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactionId: cleanTrx }),
        });
        const data = await res.json();

        if (data.exists) {
          setTrxError("এই ট্রানজেকশন আইডি ইতিমধ্যে ব্যবহার করা হয়েছে!");
        } else {
          setTrxError("");
        }
      } catch (err) {
        console.error("Trx check error:", err);
      } finally {
        setCheckingTrx(false);
      }
    };

    const timer = setTimeout(checkTrx, 500);
    return () => clearTimeout(timer);
  }, [form.transactionId]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/agent/dollar-request?status=${statusFilter}&page=${page}&limit=20`,
      );
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMe = async () => {
      try {
        const res = await fetch("/api/agent/me");
        const data = await res.json();
        if (data.success) {
          setDollarRate(Number(data.dollarRate || 0));
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadMe();
  }, []);

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, page]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (trxError) {
      setMessage({ type: "error", text: trxError });
      return;
    }

    const usd = Number(form.amountUSD);
    if (!usd || usd <= 0) {
      setMessage({ type: "error", text: "সঠিক ডলার পরিমাণ দিন" });
      return;
    }
    if (dollarRate <= 0) {
      setMessage({
        type: "error",
        text: "ডলার রেট সেট হয়নি, অ্যাডমিনের সাথে যোগাযোগ করুন",
      });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/agent/dollar-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountUSD: usd,
          paymentMethod: form.paymentMethod,
          senderNumber: form.senderNumber,
          transactionId: form.transactionId,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setForm({
          amountUSD: "",
          paymentMethod: selectedAddress ? selectedAddress.method : "",
          senderNumber: "",
          transactionId: "",
        });
        setTrxError("");
        setPage(1);
        setStatusFilter("all");
        loadRequests();
      } else {
        setMessage({
          type: "error",
          text: data.message || "রিকোয়েস্ট জমা হয়নি",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    } finally {
      setSaving(false);
    }
  };

  // ✅ কপি ফাংশন
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", text: "অ্যাড্রেস কপি হয়েছে!" });
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto min-h-screen text-slate-100 bg-[#07090e]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-blue-400">
          ডলার লোড রিকোয়েস্ট
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          ডলারে রিকোয়েস্ট দিন। অ্যাডমিন অ্যাপ্রুভ করলে ডলার রেট অনুযায়ী টাকা
          আপনার মূল ব্যালেন্সে যোগ হবে।
        </p>
        <div className="mt-2 inline-flex items-center gap-2 bg-blue-950/40 border border-blue-500/30 px-3 py-1 rounded-lg">
          <span className="text-xs text-slate-400">বর্তমান ডলার রেট:</span>
          <span className="text-sm font-bold text-blue-400 font-mono">
            ৳{Number(dollarRate).toFixed(2)} / $
          </span>
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

      {/* ✅ অ্যাডমিনের অ্যাড্রেস ড্রপডাউন */}
      {adminAddresses.length > 0 && (
        <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-500/40 rounded-2xl p-5 mb-6 shadow-lg">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <i className="fa-solid fa-wallet"></i> অ্যাডমিনের ডলার পাঠানোর
            অ্যাড্রেস
          </h3>

          <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
            মেথড সিলেক্ট করুন
          </label>
          <select
            value={selectedAddress ? selectedAddress.accountNumber : ""}
            onChange={(e) => {
              const selected = adminAddresses.find(
                (acc) => acc.accountNumber === e.target.value,
              );
              setSelectedAddress(selected);
              // ✅ ড্রপডাউনে সিলেক্ট করলে নিচের ফর্মে পেমেন্ট মেথড অটো বসে যাবে
              if (selected) {
                setForm((prev) => ({
                  ...prev,
                  paymentMethod: selected.method,
                }));
              }
            }}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-blue-500 cursor-pointer mb-3"
          >
            {adminAddresses.map((acc, i) => (
              <option key={i} value={acc.accountNumber}>
                {acc.method}
              </option>
            ))}
          </select>

          {selectedAddress && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-xs text-blue-400 font-mono break-all">
                {selectedAddress.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => handleCopy(selectedAddress.accountNumber)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition ml-2 flex-shrink-0"
              >
                <i className="fa-solid fa-copy"></i> কপি
              </button>
            </div>
          )}
        </div>
      )}

      {/* ফর্ম */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-8 shadow-lg"
      >
        <h2 className="font-bold text-slate-200 mb-4 border-b border-slate-800 pb-3 flex items-center gap-2">
          <i className="fa-solid fa-plus-circle text-emerald-400"></i> নতুন
          রিকোয়েস্ট
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              ডলার পরিমাণ ($) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 font-bold">
                $
              </span>
              <input
                type="number"
                value={form.amountUSD}
                onChange={(e) =>
                  setForm({ ...form, amountUSD: e.target.value })
                }
                min="0.01"
                step="0.01"
                required
                placeholder="যেমন: 100"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
              />
            </div>
            {preview && (
              <p className="text-[11px] text-emerald-400 mt-1.5 font-semibold">
                ≈ ৳{preview.amountBDT.toFixed(2)} (রেট: ৳{dollarRate}/$)
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              পেমেন্ট মেথড
            </label>
            <input
              type="text"
              value={form.paymentMethod}
              readOnly
              onChange={(e) =>
                setForm({ ...form, paymentMethod: e.target.value })
              }
              placeholder="USDT / bKash / Binance"
              // ✅ মেথডের রঙ স্বাভাবিক করা হয়েছে
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              প্রেরকের নাম্বার / অ্যাড্রেস
            </label>
            <input
              type="text"
              value={form.senderNumber}
              onChange={(e) =>
                setForm({ ...form, senderNumber: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:border-blue-500 outline-none font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
              ট্রানজেকশন আইডি
            </label>
            <input
              type="text"
              value={form.transactionId}
              onChange={(e) =>
                setForm({ ...form, transactionId: e.target.value })
              }
              className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 text-sm text-white outline-none font-mono ${
                trxError
                  ? "border-rose-500 focus:border-rose-500"
                  : "border-slate-700 focus:border-blue-500"
              }`}
            />

            {trxError && (
              <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                <i className="fa-solid fa-circle-exclamation"></i> {trxError}
              </p>
            )}
            {checkingTrx && (
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
                <i className="fa-solid fa-spinner fa-spin"></i> চেক করা হচ্ছে...
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !!trxError || checkingTrx}
          className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-6 py-2.5 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
        >
          {saving ? "জমা হচ্ছে..." : "রিকোয়েস্ট জমা দিন"}
        </button>
      </form>

      {/* লিস্ট */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {[
          { key: "all", label: "সব" },
          { key: "pending", label: "পেন্ডিং" },
          { key: "approved", label: "অ্যাপ্রুভড" },
          { key: "rejected", label: "রিজেক্টেড" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => {
              setStatusFilter(s.key);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              statusFilter === s.key
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
        ) : requests.length === 0 ? (
          <p className="p-5 text-slate-400 text-sm">কোনো রিকোয়েস্ট নেই।</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-right">ডলার</th>
                  <th className="px-4 py-3 text-right">রেট</th>
                  <th className="px-4 py-3 text-right">টাকা</th>
                  <th className="px-4 py-3 text-left">মেথড</th>
                  <th className="px-4 py-3 text-center">স্ট্যাটাস</th>
                  <th className="px-4 py-3 text-left">অ্যাডমিন নোট</th>{" "}
                  {/* 🆕 নতুন কলাম */}
                  <th className="px-4 py-3 text-left">সময়</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-right font-mono text-slate-200">
                      ${Number(r.amountUSD).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-400">
                      ৳{Number(r.dollarRate).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      ৳{Number(r.amountBDT).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {r.paymentMethod || "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={r.status} />
                    </td>

                    {/* 🆕 অ্যাডমিন নোট দেখানোর সেল */}
                    <td className="px-4 py-3 text-xs text-orange-400 max-w-[200px] break-words">
                      {r.adminNote ? (
                        <span className="flex items-start gap-1">
                          <i className="fa-solid fa-note-sticky mt-0.5"></i>{" "}
                          {r.adminNote}
                        </span>
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-[10px] text-slate-500 font-mono">
                      {new Date(r.createdAt).toLocaleString("bn-BD")}
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
  };
  const labels = {
    pending: "পেন্ডিং",
    approved: "অ্যাপ্রুভড",
    rejected: "রিজেক্টেড",
  };
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${styles[status] || "bg-slate-800 text-slate-400"}`}
    >
      {labels[status] || status}
    </span>
  );
}
