"use client";

import { useState } from "react";

export default function SubAdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // কনফার্মেশন মডালের স্টেট (এডিট বা ডিলিট উভয়ের জন্য)
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    type: "", // 'edit', 'update-save', বা 'delete'
    data: null,
  });

  // সেন্ট্রাল টাস্ট নোটিফিকেশনের স্টেট
  const [toast, setToast] = useState({
    show: false,
    text: "",
    type: "success",
  });

  // স্ক্রিনের মাঝখানে টাস্ট মেসেজ দেখানোর ফাংশন
  const showToast = (text, type = "success") => {
    setToast({ show: true, text, type });
    setTimeout(() => {
      setToast({ show: false, text: "", type: "success" });
    }, 3000);
  };

  // ইউজার সার্চ করার ফাংশন
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(
        `/api/admin/users?search=${encodeURIComponent(searchQuery)}`,
      );
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.users.length === 0) {
          setMessage("কোনো ইউজার পাওয়া যায়নি।");
        }
      } else {
        setMessage(data.message || "ডেটা লোড করতে সমস্যা হয়েছে।");
      }
    } catch (err) {
      setMessage("সার্ভার ত্রুটি ঘটেছে।");
    }
    setLoading(false);
  };

  // ১. টেবিলের "এডিট" বা "ডিলিট" বাটনে চাপ দিলে প্রথম হ্যাঁ/না মডাল আসবে
  const handlePreAction = (type, userOrId) => {
    setConfirmModal({
      show: true,
      type,
      data: userOrId,
    });
  };

  // ২. প্রথম হ্যাঁ/না কনফার্মেশনের "হ্যাঁ" বাটনে ক্লিক করলে
  const handleConfirmYes = () => {
    const { type, data } = confirmModal;
    setConfirmModal({ show: false, type: "", data: null });

    if (type === "delete") {
      executeDelete(data);
    } else if (type === "edit") {
      setSelectedUser({
        userId: data.uid,
        balance: data.balance || 0,
        turnover: data.turnover || 0,
        isBlocked: data.isBlocked || false,
        customCommission: data.customCommission ?? "",
      });
      setIsModalOpen(true);
    } else if (type === "update-save") {
      // ফর্মের ডেটা দিয়ে আসল আপডেট এপিআই কল করা
      executeSaveUpdate(data);
    }
  };

  // ৩. আপডেট ফর্মের "সংরক্ষণ করুন" এ ক্লিক করলে আবার হ্যাঁ/না মডাল আসবে
  const handlePreUpdateSave = (e) => {
    e.preventDefault();
    setIsModalOpen(false); // ফর্ম মডাল বন্ধ করে হ্যাঁ/না মডাল ওপেন করা
    setConfirmModal({
      show: true,
      type: "update-save",
      data: selectedUser,
    });
  };

  // আসল ডিলিট ফাংশন
  const executeDelete = async (userId) => {
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(resData.message || "সফলভাবে ডিলিট করা হয়েছে!", "success");
        setUsers(users.filter((u) => u.uid !== userId));
      } else {
        showToast(resData.message || "ডিলিট করতে ব্যর্থ হয়েছে।", "error");
      }
    } catch (err) {
      showToast("সার্ভার ত্রুটি ঘটেছে।", "error");
    }
  };

  // আসল আপডেট সেভ ফাংশন
  const executeSaveUpdate = async (userData) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      const resData = await res.json();
      if (resData.success) {
        showToast(resData.message || "সফলভাবে আপডেট করা হয়েছে!", "success");
        setUsers(
          users.map((u) =>
            u.uid === userData.userId ? { ...u, ...userData } : u,
          ),
        );
      } else {
        showToast(resData.message || "আপডেট করতে ব্যর্থ হয়েছে।", "error");
      }
    } catch (err) {
      showToast("সার্ভার ত্রুটি ঘটেছে।", "error");
    }
  };

  return (
    <div className="p-3 sm:p-6 text-white max-w-7xl mx-auto font-sans relative">
      {/* স্ক্রিনের মাঝখানে টাস্ট নোটিফিকেশন */}
      {toast.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-in fade-in zoom-in duration-200 pointer-events-auto">
            <div
              className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 text-base font-bold backdrop-blur-md ${
                toast.type === "success"
                  ? "bg-emerald-950/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/80"
                  : "bg-red-950/95 border-red-500/50 text-red-300 shadow-red-950/80"
              }`}
            >
              <span className="text-xl">
                {toast.type === "success" ? "✅" : "❌"}
              </span>
              <span>{toast.text}</span>
            </div>
          </div>
        </div>
      )}

      {/* হ্যাঁ / না কনফার্মেশন মডাল */}
      {confirmModal.show && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-bold text-white mb-2">
              আপনি কি নিশ্চিত?
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              {confirmModal.type === "delete"
                ? "এই ইউজারটি স্থায়ীভাবে মুছে ফেলা হবে।"
                : confirmModal.type === "update-save"
                  ? "ইউজারের এই তথ্যগুলো সংরক্ষণ করতে চাচ্ছেন?"
                  : "এই ইউজারের তথ্য পরিবর্তন করতে চাচ্ছেন?"}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ show: false, type: "", data: null })
                }
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
              >
                না
              </button>
              <button
                onClick={handleConfirmYes}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/20"
              >
                হ্যাঁ
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">
          👥 সাব-অ্যাডমিন ইউজার ম্যানেজমেন্ট
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          ইউজার খুঁজুন, ব্যালেন্স, টার্নওভার ও স্ট্যাটাস পরিবর্তন করুন
        </p>
      </div>

      {/* সার্চ বক্স */}
      <div className="bg-[#0b132b] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-xl mb-6">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <input
            type="text"
            placeholder="ইউজার ফোন নম্বর বা UID দিন..."
            value={searchQuery}
            maxLength={11}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, "");
              setSearchQuery(val);
            }}
            className="w-full flex-1 px-4 py-2.5 bg-[#070b19] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition text-sm font-semibold shadow-lg shadow-emerald-900/20"
          >
            🔍 খুঁজুন
          </button>
        </form>
      </div>

      {message && (
        <div className="p-4 mb-6 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-center text-sm">
          {message}
        </div>
      )}

      {/* ইউজার লিস্ট টেবিল */}
      <div className="bg-[#0b132b] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead className="sticky top-0 bg-[#070b19] z-10">
              <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                <th className="p-3 sm:p-4">UID</th>
                <th className="p-3 sm:p-4">ফোন নম্বর</th>
                <th className="p-3 sm:p-4">ব্যালেন্স</th>
                <th className="p-3 sm:p-4">টার্নওভার</th>
                <th className="p-3 sm:p-4">স্ট্যাটাস</th>
                <th className="p-3 sm:p-4 text-center">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    ইউজার ডেটা লোড হচ্ছে...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-500">
                    কোনো ইউজার ডেটা পাওয়া যায়নি। দয়া করে সার্চ করুন।
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user._id || user.uid}
                    className="hover:bg-slate-800/40 transition"
                  >
                    <td className="p-3 sm:p-4 font-mono text-xs text-emerald-400">
                      {user.uid}
                    </td>
                    <td className="p-3 sm:p-4 font-semibold">{user.phone}</td>
                    <td className="p-3 sm:p-4 text-slate-300">
                      ৳ {user.balance || 0}
                    </td>
                    <td className="p-3 sm:p-4 text-slate-300">
                      ৳ {user.turnover || 0}
                    </td>
                    <td className="p-3 sm:p-4">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold ${
                          user.isBlocked
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {user.isBlocked ? "ব্লকড" : "অ্যাক্টিভ"}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-center space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handlePreAction("edit", user)}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                      >
                        এডিট
                      </button>
                      <button
                        onClick={() => handlePreAction("delete", user.uid)}
                        className="px-2.5 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition"
                      >
                        ডিলিট
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* এডিট করার মূল ফর্ম মডাল */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#0b132b] border border-slate-800 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl text-white my-auto">
            <h2 className="text-lg sm:text-xl font-bold text-emerald-400 mb-4">
              ইউজার তথ্য আপডেট ({selectedUser.userId})
            </h2>
            <form onSubmit={handlePreUpdateSave} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  ব্যালেন্স
                </label>
                <input
                  type="number"
                  value={selectedUser.balance}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      balance: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#070b19] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  টার্নওভার
                </label>
                <input
                  type="number"
                  value={selectedUser.turnover}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      turnover: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-[#070b19] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  কাস্টম কমিশন (%)
                </label>
                <input
                  type="number"
                  value={selectedUser.customCommission}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      customCommission: e.target.value,
                    })
                  }
                  placeholder="খালি রাখতে পারেন"
                  className="w-full px-4 py-2 bg-[#070b19] border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isBlocked"
                  checked={selectedUser.isBlocked}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      isBlocked: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
                <label
                  htmlFor="isBlocked"
                  className="text-sm text-slate-300 cursor-pointer"
                >
                  ইউজার ব্লক করুন
                </label>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-900/20"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
