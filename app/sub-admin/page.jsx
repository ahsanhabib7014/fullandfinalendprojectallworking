'use client';

import { useRouter } from 'next/navigation';

export function useLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST', 
        credentials: 'include' 
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      document.cookie = 'token=; Max-Age=0; path=/;';
      window.location.replace('/login');
    }
  };

  return handleLogout;
}

export function LogoutButton({ className = '' }) {
  const handleLogout = useLogout();

  return (
    <button 
      onClick={handleLogout}
      className={`bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white p-3.5 rounded-xl font-bold text-sm md:text-base transition shadow-lg cursor-pointer flex items-center justify-center gap-2 active:scale-95 ${className}`}
    >
      <i className="fa-solid fa-right-from-bracket"></i> লগআউট করুন
    </button>
  );
}

export default function SubAdminDashboard() {
  return (
    <div className="max-w-md mx-auto mt-6 space-y-4 font-sans pb-10">
      
      {/* ওয়েলকাম কার্ড */}
      <div className="bg-gradient-to-br from-[#0b132b] to-[#111c42] border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl font-bold">
            ⚡
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">সাব-অ্যাডমিন প্যানেল</h1>
            <p className="text-emerald-400 text-xs font-medium">সিস্টেম কন্ট্রোল সেন্টার</p>
          </div>
        </div>

        <p className="text-slate-300 text-xs leading-relaxed">
          এখান থেকে আপনার নির্দিষ্ট পারমিশন অনুযায়ী প্ল্যাটফর্মের বিভিন্ন মডিউল ও অপারেশন নিরাপদে ম্যানেজ করতে পারবেন।
        </p>
      </div>

      {/* সিস্টেম স্ট্যাটাস কার্ড */}
      <div className="bg-[#0b132b]/80 backdrop-blur-md border border-slate-800/80 p-4 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h3 className="text-white font-semibold text-xs">সিস্টেম স্ট্যাটাস</h3>
            <p className="text-slate-400 text-[11px]">সকল মডিউল স্বাভাবিকভাবে কাজ করছে</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          অ্যাক্টিভ
        </span>
      </div>

      {/* লগআউট সেকশন */}
      <div className="pt-2">
        <LogoutButton className="w-full text-xs py-3 shadow-rose-900/20" />
      </div>

    </div>
  );
}