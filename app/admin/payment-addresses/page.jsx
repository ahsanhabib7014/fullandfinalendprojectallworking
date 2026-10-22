// "use client";

// import { useState } from "react";

// export default function AdminPaymentAddressesPage() {
//   const [saving, setSaving] = useState(false);
//   const [message, setMessage] = useState(null);

//   // ফর্ম স্টেট
//   const [form, setForm] = useState({
//     method: "",
//     accountNumber: "",
//   });

//   const handleSaveAddress = async (e) => {
//     e.preventDefault();
//     setMessage(null);

//     if (!form.method.trim() || !form.accountNumber.trim()) {
//       setMessage({ type: "error", text: "মেথড এবং অ্যাড্রেস দুটোই দিতে হবে!" });
//       return;
//     }

//     setSaving(true);
//     try {
//       const res = await fetch("/api/admin/payment-addresses", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         credentials: "include",
//         body: JSON.stringify({
//           method: form.method.trim(),
//           accountNumber: form.accountNumber.trim(),
//         }),
//       });
//       const data = await res.json();

//       if (data.success) {
//         setMessage({ type: "success", text: data.message });
//         setForm({ method: form.method, accountNumber: "" }); // শুধু অ্যাড্রেস ক্লিয়ার
//       } else {
//         setMessage({ type: "error", text: data.message });
//       }
//     } catch (err) {
//       setMessage({ type: "error", text: "সার্ভার এরর" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-6">
//       <div className="max-w-xl mx-auto space-y-6">
//         {/* হেডার */}
//         <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
//           <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
//             <i className="fa-solid fa-wallet"></i> পেমেন্ট অ্যাড্রেস
//           </h1>
//           <p className="text-slate-400 text-sm mt-1">
//             এজেন্টরা এই অ্যাড্রেসে টাকা পাঠাবে। তাই সঠিক অ্যাড্রেস টাইপ করুন।
//           </p>
//         </div>

//         {message && (
//           <div
//             className={`p-3 rounded-xl border text-sm font-bold ${
//               message.type === "success"
//                 ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
//                 : "bg-rose-950/40 border-rose-500/50 text-rose-400"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         {/* অ্যাড্রেস সেভ করার ফর্ম */}
//         <form
//           onSubmit={handleSaveAddress}
//           className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4"
//         >
//           <div>
//             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
//               মেথড (যেমন: USDT, TRX, BNB)
//             </label>
//             <input
//               type="text"
//               value={form.method}
//               onChange={(e) => setForm({ ...form, method: e.target.value })}
//               placeholder="USDT লিখুন"
//               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono"
//             />
//           </div>

//           <div>
//             <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
//               অ্যাড্রেস
//             </label>
//             <input
//               type="text"
//               value={form.accountNumber}
//               onChange={(e) =>
//                 setForm({ ...form, accountNumber: e.target.value })
//               }
//               placeholder="আপনার ওয়ালেট অ্যাড্রেস টাইপ করুন"
//               className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={saving}
//             className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
//           >
//             {saving ? (
//               <>
//                 <i className="fa-solid fa-spinner fa-spin mr-2"></i> সেভ
//                 হচ্ছে...
//               </>
//             ) : (
//               <>
//                 <i className="fa-solid fa-save mr-2"></i> সেভ করুন
//               </>
//             )}
//           </button>
//         </form>

//         {/* তথ্য */}
//         <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed">
//           <p className="flex items-start gap-2">
//             <i className="fa-solid fa-circle-info text-cyan-400 mt-0.5"></i>
//             <span>
//               এজেন্টরা ডলার লোড পেজে এই অ্যাড্রেসটি দেখতে পাবে এবং কপি করে টাকা
//               পাঠাবে।
//             </span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
// ////////////////////////////////////////////////////////////////////////////////////
"use client";

import { useState, useEffect } from "react";

export default function AdminPaymentAddressesPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ফর্ম স্টেট
  const [form, setForm] = useState({
    method: "",
    accountNumber: "",
  });

  // এডিট স্টেট
  const [editingAddress, setEditingAddress] = useState(null);

  // ✅ অ্যাড্রেস লোড করা
  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/payment-addresses", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  // ✅ সেভ বা এডিট
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!form.method.trim() || !form.accountNumber.trim()) {
      setMessage({ type: "error", text: "মেথড এবং অ্যাড্রেস দুটোই দিতে হবে!" });
      return;
    }

    setSaving(true);
    try {
      // এডিট হলে আগে ডিলিট করে নতুনটি যোগ করব
      if (editingAddress) {
        await fetch("/api/admin/payment-addresses", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ accountNumber: editingAddress.accountNumber }),
        });
      }

      const res = await fetch("/api/admin/payment-addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          method: form.method.trim(),
          accountNumber: form.accountNumber.trim(),
        }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        setForm({ method: "", accountNumber: "" });
        setEditingAddress(null);
        loadAddresses();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    } finally {
      setSaving(false);
    }
  };

  // ✅ ডিলিট
  const handleDeleteAddress = async (accountNumber) => {
    if (!confirm("আপনি কি এই অ্যাড্রেসটি ডিলিট করতে চান?")) return;

    try {
      const res = await fetch("/api/admin/payment-addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ accountNumber }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        loadAddresses();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err) {
      setMessage({ type: "error", text: "সার্ভার এরর" });
    }
  };

  // ✅ এডিট
  const handleEditAddress = (addr) => {
    setEditingAddress(addr);
    setForm({ method: addr.method, accountNumber: addr.accountNumber });
  };

  // ✅ কপি
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ type: "success", text: "কপি হয়েছে!" });
    setTimeout(() => setMessage(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* হেডার */}
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
          <h1 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
            <i className="fa-solid fa-wallet"></i> পেমেন্ট অ্যাড্রেস
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            এজেন্টরা এই অ্যাড্রেসে টাকা পাঠাবে। তাই সঠিক অ্যাড্রেস টাইপ করুন।
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-xl border text-sm font-bold ${
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
          onSubmit={handleSaveAddress}
          className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4"
        >
          <h2 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2">
            <i className="fa-solid fa-plus-circle text-cyan-400"></i>{" "}
            {editingAddress ? "অ্যাড্রেস এডিট করুন" : "নতুন অ্যাড্রেস যোগ করুন"}
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
              মেথড (যেমন: USDT, TRX, BNB)
            </label>
            <input
              type="text"
              value={form.method}
              onChange={(e) => setForm({ ...form, method: e.target.value })}
              placeholder="USDT লিখুন"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase">
              অ্যাড্রেস
            </label>
            <input
              type="text"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({ ...form, accountNumber: e.target.value })
              }
              placeholder="আপনার ওয়ালেট অ্যাড্রেস টাইপ করুন"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-500 font-mono"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl disabled:opacity-50 transition shadow-lg active:scale-95"
            >
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i> সেভ
                  হচ্ছে...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-save mr-2"></i>{" "}
                  {editingAddress ? "এডিট করুন" : "সেভ করুন"}
                </>
              )}
            </button>
            {editingAddress && (
              <button
                type="button"
                onClick={() => {
                  setEditingAddress(null);
                  setForm({ method: "", accountNumber: "" });
                }}
                className="bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition"
              >
                বাতিল
              </button>
            )}
          </div>
        </form>

        {/* লিস্ট */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-lg">
          <h2 className="font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-2 mb-4">
            <i className="fa-solid fa-list text-cyan-400"></i> সেভ করা অ্যাড্রেস
          </h2>

          {loading ? (
            <p className="text-slate-400 text-sm">লোড হচ্ছে...</p>
          ) : addresses.length === 0 ? (
            <p className="text-slate-400 text-sm">
              কোনো অ্যাড্রেস সেভ করা নেই।
            </p>
          ) : (
            <div className="space-y-2">
              {addresses.map((acc, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      {acc.method}
                    </p>
                    <p className="text-xs text-cyan-400 font-mono break-all mt-0.5">
                      {acc.accountNumber}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2 flex-shrink-0">
                    <button
                      onClick={() => handleCopy(acc.accountNumber)}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1.5 rounded-lg text-xs font-bold transition"
                      title="কপি"
                    >
                      <i className="fa-solid fa-copy"></i>
                    </button>
                    <button
                      onClick={() => handleEditAddress(acc)}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-2 py-1.5 rounded-lg text-xs font-bold transition"
                      title="এডিট"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(acc.accountNumber)}
                      className="bg-rose-600 hover:bg-rose-500 text-white px-2 py-1.5 rounded-lg text-xs font-bold transition"
                      title="ডিলিট"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
