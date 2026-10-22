"use client";

import { useState } from "react";

export default function AdminPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState("user");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // নেভবারের সকল সচল মেনুর সাথে হুবহু মিল রেখে পারমিশন লিস্ট
  const allPermissions = [
    { key: "manage_dashboard", label: "ড্যাশবোর্ড" },
    { key: "view_game_tracking", label: "ট্র্যাকিং" },
    { key: "manage_users", label: "ইউজার" },
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
  ];

  // ১. ইউজার সার্চ করার ফাংশন
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`/api/admin/permissions?query=${searchQuery}`);
      const data = await res.json();
      if (data.success) {
        setFoundUsers(data.users);
        if (data.users.length === 0) {
          setMessage("কোনো ইউজার পাওয়া যায়নি!");
        }
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("সার্ভারে ত্রুটি ঘটেছে!");
    }
    setLoading(false);
  };

  // ২. ইউজার সিলেক্ট করলে ডাটা ফর্মে লোড হওয়া
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setRole(user.role || "user");
    setPermissions(user.permissions || []);
    setMessage("");
  };

  // ৩. চেকবক্স টগল করার ফাংশন
  const handleCheckboxToggle = (permKey) => {
    if (permissions.includes(permKey)) {
      setPermissions(permissions.filter((p) => p !== permKey));
    } else {
      setPermissions([...permissions, permKey]);
    }
  };

  // ৪. পারমিশন ও রোল সেভ বা আপডেট করার ফাংশন
  const handleSave = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/permissions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser._id,
          role,
          permissions: role === "sub-admin" ? permissions : [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("সফলভাবে পারমিশন আপডেট করা হয়েছে!");
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage("আপডেট করতে গিয়ে ত্রুটি ঘটেছে!");
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-5 lg:p-6 text-white space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-emerald-400">
        সাব-অ্যাডমিন পারমিশন ম্যানেজমেন্ট
      </h1>

      {/* সার্চ ফর্ম */}
      <form
        onSubmit={handleSearch}
        className="flex flex-col sm:flex-row gap-2.5"
      >
        <input
          type="text"
          inputMode="numeric"
          placeholder="ইউজার UID বা ফোন নম্বর (সর্বোচ্চ ১১ ডিজিট)..."
          value={searchQuery}
          maxLength={11}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            setSearchQuery(val);
          }}
          className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg disabled:opacity-50 whitespace-nowrap cursor-pointer"
        >
          {loading ? "খোঁজা হচ্ছে..." : "সার্চ করুন"}
        </button>
      </form>

      {message && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-amber-300">
          {message}
        </div>
      )}

      {/* সার্চ রেজাল্ট লিস্ট */}
      {foundUsers.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400">
            প্রাপ্ত ইউজারগণ (সিলেক্ট করতে ক্লিক করুন):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {foundUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`p-3.5 border rounded-xl cursor-pointer transition ${selectedUser?._id === user._id ? "border-emerald-500 bg-slate-800 shadow-lg shadow-emerald-950/40" : "border-slate-800 bg-slate-900 hover:border-slate-700"}`}
              >
                <p className="font-bold text-sm sm:text-base">
                  UID: {user.uid}
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  ফোন: {user.phone}
                </p>
                <p className="text-xs mt-2">
                  রোল:{" "}
                  <span className="text-amber-400 uppercase font-bold">
                    {user.role}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* পারমিশন সিলেকশন প্যানেল */}
      {selectedUser && (
        <div className="bg-slate-900 p-4 sm:p-6 border border-slate-800 rounded-2xl shadow-xl space-y-5">
          <h3 className="text-base sm:text-lg font-bold text-emerald-400">
            রোল ও পারমিশন কনফিগারেশন:{" "}
            <span className="text-white">{selectedUser.phone}</span>
          </h3>

          <div className="space-y-2">
            <label className="block text-xs sm:text-sm text-slate-300 font-semibold">
              অ্যাডমিন রোল নির্ধারণ করুন:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full sm:w-1/2 bg-slate-950 border border-slate-700 p-3 rounded-xl text-xs sm:text-sm text-white outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="user">User (সাধারণ ইউজার)</option>
              <option value="sub-admin">Sub-Admin (সাব-অ্যাডমিন)</option>
              <option value="admin">Admin (সুপার অ্যাডমিন)</option>
            </select>
          </div>

          {role === "sub-admin" && (
            <div className="space-y-2.5">
              <label className="block text-xs sm:text-sm text-slate-300 font-semibold">
                সেকশনভিত্তিক পারমিশন টিক দিন:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-slate-950 p-3.5 sm:p-4 rounded-xl border border-slate-800">
                {allPermissions.map((perm) => (
                  <label
                    key={perm.key}
                    className="flex items-center gap-2.5 cursor-pointer p-2 hover:bg-slate-900 rounded-lg transition"
                  >
                    <input
                      type="checkbox"
                      checked={permissions.includes(perm.key)}
                      onChange={() => handleCheckboxToggle(perm.key)}
                      className="w-4 h-4 accent-emerald-500 rounded cursor-pointer flex-shrink-0"
                    />
                    <span className="text-xs text-slate-200">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white transition shadow-lg cursor-pointer disabled:opacity-50"
          >
            {loading ? "সংরক্ষণ হচ্ছে..." : "পরিবর্তন সেভ করুন"}
          </button>
        </div>
      )}
    </div>
  );
}

///////////////////////////////////////////////////////////////////////////
