"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminStaffListPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // কাস্টম মডাল ও টোস্টের জন্য স্টেট
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins-list");
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
      }
    } catch (err) {
      console.error("Error fetching admin list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // মডাল ওপেন করার ফাংশন
  const confirmDemote = (uid) => {
    setSelectedUser(uid);
    setShowModal(true);
  };

  // সাব-অ্যাডমিন থেকে সাধারণ ইউজার বানানোর ফাইনাল রিকোয়েস্ট
  const handleDemoteToUser = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser);
      const res = await fetch("/api/admin/update-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUid: selectedUser, newRole: "user" }),
      });
      const data = await res.json();

      if (data.success) {
        setAdmins((prev) =>
          prev.filter(
            (admin) =>
              admin.uid !== selectedUser && admin.phone !== selectedUser,
          ),
        );
        showToast("সফলভাবে সাধারণ ইউজার করা হয়েছে!", "success");
      } else {
        showToast(data.message || "রোল পরিবর্তন করতে ব্যর্থ হয়েছে!", "error");
      }
    } catch (err) {
      console.error("Demote error:", err);
      showToast("সার্ভার এরর হয়েছে!", "error");
    } finally {
      setActionLoading(null);
      setShowModal(false);
      setSelectedUser(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto p-4 md:p-6 font-mono relative">
      {/* সেন্ট্রাল রেস্পনসিভ টোস্ট নোটিফিকেশন */}
      {toast.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4">
          <div
            className={`pointer-events-auto px-6 py-3.5 rounded-2xl shadow-2xl text-xs md:text-sm font-bold border backdrop-blur-md animate-fade-in transition-all ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10"
                : "bg-rose-950/90 text-rose-300 border-rose-500/30 shadow-rose-500/10"
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}

      {/* কাস্টম কনফার্মেশন মডাল */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0b132b] border border-slate-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-5 text-center animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
            </div>
            <div className="space-y-2">
              আপনি কি নিশ্চিত?
              <p className="text-xs text-slate-400">
                এই অ্যাডমিন/সাব-অ্যাডমিনকে সাধারণ ইউজার বানিয়ে দিতে চান?
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
              >
                না
              </button>
              <button
                disabled={actionLoading === selectedUser}
                onClick={handleDemoteToUser}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {actionLoading === selectedUser ? "প্রসেসিং..." : "হ্যাঁ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#0b132b] backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-6">
        {/* হেডার ও ন্যাভিগেশন বাটন */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h2 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              অ্যাডমিন ও সাব-অ্যাডমিন স্টাফ তালিকা
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              সক্রিয় অ্যাডমিন এবং সাব-অ্যাডমিনদের তালিকা ও পারমিশন
              ম্যানেজমেন্ট।
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="px-3.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
              মোট স্টাফ: {admins.length} জন
            </span>

            {/* পারমিশন ম্যানেজমেন্ট পেজে যাওয়ার বাটন */}
            <button
              onClick={() => router.push("/admin/permissions")}
              className="px-4 py-2.5 rounded-xl text-xs font-bold border border-purple-500/20 bg-purple-500/5 text-purple-400 hover:bg-purple-500/10 flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-purple-500/5"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                ></path>
              </svg>
              পারমিশন ম্যানেজমেন্ট
            </button>
          </div>
        </div>

        {/* লোডিং বা টেবিল */}
        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm animate-pulse">
            ডেটা লোড হচ্ছে...
          </div>
        ) : admins.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm bg-[#070b19]/50 rounded-2xl border border-slate-800/50">
            কোনো সক্রিয় অ্যাডমিন বা সাব-অ্যাডমিন পাওয়া যায়নি।
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800/80 bg-[#070b19]/30">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-[#070b19] uppercase tracking-wider text-[11px]">
                  <th className="p-4">ইউজার আইডি / ফোন</th>
                  <th className="p-4">রোল (Role)</th>
                  <th className="p-4">পারমিশনসমূহ</th>
                  <th className="p-4 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {admins.map((admin, index) => {
                  const identifier = admin.uid || admin.phone;
                  return (
                    <tr
                      key={admin._id || index}
                      className="hover:bg-[#070b19]/60 transition-colors"
                    >
                      <td className="p-4 text-slate-200 font-semibold">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                          {identifier || "N/A"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold inline-block ${
                            admin.role === "admin"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {admin.role || "sub-admin"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300 max-w-xs">
                        {admin.permissions && admin.permissions.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {admin.permissions.map((perm, pIdx) => (
                              <span
                                key={pIdx}
                                className="px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-300 text-[10px] border border-slate-700/50"
                              >
                                {perm}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-emerald-400/80 text-xs font-semibold bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10 inline-block">
                            ফুল অ্যাক্সেস (Super Admin)
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {admin.role !== "admin" && (
                          <button
                            disabled={actionLoading === identifier}
                            onClick={() => confirmDemote(identifier)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-all cursor-pointer disabled:opacity-50 inline-flex items-center gap-1.5"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                            {actionLoading === identifier
                              ? "প্রসেসিং..."
                              : "ইউজার করুন"}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
