'use client';

import { useState } from 'react';

export default function AdminPermissionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [role, setRole] = useState('user');
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // সিস্টেমের সকল পারমিশন লিস্ট
  const allPermissions = [
    { key: 'view_users', label: 'ইউজার ম্যানেজমেন্ট (ভিউ)' },
    { key: 'manage_users', label: 'ইউজার ব্লক/ব্যালেন্স কন্ট্রোল' },
    { key: 'view_deposits', label: 'ডিপোজিট লিস্ট দেখুন' },
    { key: 'manage_deposits', label: 'ডিপোজিট এপ্রুভ/রিজেক্ট' },
    { key: 'view_withdrawals', label: 'উইথড্র লিস্ট দেখুন' },
    { key: 'manage_withdrawals', label: 'উইথড্র এপ্রুভ/পে' },
    { key: 'view_referrals', label: 'রেফারেল সেকশন' },
    { key: 'manage_payments', label: 'পেমেন্ট ম্যানেজমেন্ট' },
    { key: 'manage_methods', label: 'মেথডস কন্ট্রোল' },
    { key: 'manage_exchange_rate', label: 'Exchange Rate' },
    { key: 'manage_nowpayments', label: 'B NowPayments' },
    { key: 'manage_auto_crypto', label: 'Auto Crypto' },
    { key: 'manage_bonus_settings', label: 'বোনাস সেটিংস' },
    { key: 'view_bonus_history', label: 'বোনাস ইতিহাস' },
    { key: 'view_game_tracking', label: 'লাইভ গেম বেট ট্র্যাকিং' },
  ];

  // ১. ইউজার সার্চ করার ফাংশন
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/admin/permissions?query=${searchQuery}`);
      const data = await res.json();
      if (data.success) {
        setFoundUsers(data.users);
        if (data.users.length === 0) {
          setMessage('কোনো ইউজার পাওয়া যায়নি!');
        }
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('সার্ভারে ত্রুটি ঘটেছে!');
    }
    setLoading(false);
  };

  // ২. ইউজার সিলেক্ট করলে ডাটা ফর্মে লোড হওয়া
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setRole(user.role || 'user');
    setPermissions(user.permissions || []);
    setMessage('');
  };

  // ৩. চেকবক্স টগল করার ফাংশন
  const handleCheckboxToggle = (permKey) => {
    if (permissions.includes(permKey)) {
      setPermissions(permissions.filter(p => p !== permKey));
    } else {
      setPermissions([...permissions, permKey]);
    }
  };

  // ৪. পারমিশন ও রোল সেভ বা আপডেট করার ফাংশন
  const handleSave = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/permissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser._id,
          role,
          permissions: role === 'sub-admin' ? permissions : []
        })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('সফলভাবে পারমিশন আপডেট করা হয়েছে!');
      } else {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('আপডেট করতে গিয়ে ত্রুটি ঘটেছে!');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 text-white max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-green-400">সাব-অ্যাডমিন পারমিশন ম্যানেজমেন্ট</h1>

      {/* সার্চ ফর্ম */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <input 
          type="text" 
          placeholder="ইউজার UID বা ফোন নম্বর (সর্বোচ্চ ১১ ডিজিট)..." 
          value={searchQuery}
          maxLength={11}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '');
            setSearchQuery(val);
          }}
          className="p-3 bg-gray-900 border border-gray-700 rounded-lg flex-1 text-white focus:outline-none focus:border-green-500"
        />
        <button 
          type="submit" 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold transition-all"
        >
          {loading ? 'খোঁজা হচ্ছে...' : 'সার্চ করুন'}
        </button>
      </form>

      {message && <div className="p-3 mb-4 bg-gray-800 border border-gray-700 rounded text-yellow-300">{message}</div>}

      {/* সার্চ রেজাল্ট লিস্ট */}
      {foundUsers.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm text-gray-400 mb-3">প্রাপ্ত ইউজারগণ (সিলেক্ট করতে ক্লিক করুন):</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {foundUsers.map(user => (
              <div 
                key={user._id} 
                onClick={() => handleSelectUser(user)}
                className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedUser?._id === user._id ? 'border-green-500 bg-gray-800 shadow-lg shadow-green-900/20' : 'border-gray-800 bg-gray-900 hover:border-gray-700'}`}
              >
                <p className="font-semibold text-lg">UID: {user.uid}</p>
                <p className="text-gray-300">ফোন: {user.phone}</p>
                <p className="text-sm mt-2">রোল: <span className="text-yellow-400 uppercase font-bold">{user.role}</span></p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* পারমিশন সিলেকশন প্যানেল */}
      {selectedUser && (
        <div className="bg-gray-900 p-6 border border-gray-800 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold mb-4 text-green-400">
            রোল ও পারমিশন কনফিগারেশন: <span className="text-white">{selectedUser.phone}</span>
          </h3>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 font-medium">অ্যাডমিন রোল নির্ধারণ করুন:</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="bg-gray-800 border border-gray-700 p-3 rounded-lg text-white w-full md:w-1/3 focus:outline-none focus:border-green-500"
            >
              <option value="user">User (সাধারণ ইউজার)</option>
              <option value="sub-admin">Sub-Admin (সাব-অ্যাডমিন)</option>
              <option value="admin">Admin (সুপার অ্যাডমিন)</option>
            </select>
          </div>

          {role === 'sub-admin' && (
            <div className="mb-6">
              <label className="block text-gray-300 mb-3 font-medium">সেকশনভিত্তিক পারমিশন টিক দিন:</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-950 p-4 rounded-xl border border-gray-800">
                {allPermissions.map(perm => (
                  <label key={perm.key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-900 rounded-lg">
                    <input 
                      type="checkbox" 
                      checked={permissions.includes(perm.key)}
                      onChange={() => handleCheckboxToggle(perm.key)}
                      className="w-5 h-5 accent-green-500 rounded cursor-pointer"
                    />
                    <span className="text-sm text-gray-200">{perm.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold text-white transition-all shadow-lg"
          >
            {loading ? 'সংরক্ষণ হচ্ছে...' : 'পরিবর্তন সেভ করুন'}
          </button>
        </div>
      )}
    </div>
  );
}