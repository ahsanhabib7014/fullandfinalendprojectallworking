// "use client";

// import Link from "next/link";
// import { useEffect, useState } from "react";

// export default function AgentAdminDashboard() {
//   const [summary, setSummary] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchSummary = async () => {
//       try {
//         const [settingsRes, agentsRes, requestsRes] = await Promise.all([
//           fetch("/api/admin/agent/settings"),
//           fetch("/api/admin/agent/create"),
//           fetch("/api/admin/agent/dollar-requests?status=pending&limit=1"),
//         ]);

//         const settingsData = await settingsRes.json();
//         const agentsData = await agentsRes.json();
//         const requestsData = await requestsRes.json();

//         setSummary({
//           depositCommission:
//             settingsData?.settings?.defaultDepositCommission ?? 0,
//           withdrawCommission:
//             settingsData?.settings?.defaultWithdrawCommission ?? 0,
//           dollarRate: settingsData?.settings?.dollarRate ?? 0,
//           totalAgents: agentsData?.agents?.length ?? 0,
//           pendingRequests: requestsData?.pagination?.total ?? 0,
//         });
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchSummary();
//   }, []);

//   const cards = [
//     {
//       title: "এজেন্ট লিস্ট",
//       href: "/admin/agent/agent-list",
//       desc: "ইউজারকে এজেন্ট বানান, ব্যালেন্স ও কমিশন সেট করুন",
//       icon: "👥",
//       color: "bg-slate-900 border-slate-800 hover:border-blue-500",
//     },
//     {
//       title: "ডলার লোড রিকোয়েস্ট",
//       href: "/admin/agent/dollar-requests",
//       desc: "এজেন্টদের ডলার লোড রিকোয়েস্ট অ্যাপ্রুভ/রিজেক্ট",
//       icon: "💵",
//       color: "bg-slate-900 border-slate-800 hover:border-emerald-500",
//       badge: summary?.pendingRequests || 0,
//     },
//     {
//       title: "এজেন্ট হিস্ট্রি",
//       href: "/admin/agent/history",
//       desc: "এজেন্টদের সব ডিপোজিট ও উইথড্র হিস্ট্রি",
//       icon: "📊",
//       color: "bg-slate-900 border-slate-800 hover:border-purple-500",
//     },
//     {
//       title: "কমিশন সেটিংস",
//       href: "/admin/agent/commission-settings",
//       desc: "গ্লোবাল ডিপোজিট ও উইথড্র কমিশন % সেট করুন",
//       icon: "⚙️",
//       color: "bg-slate-900 border-slate-800 hover:border-yellow-500",
//     },
//     {
//       title: "ডলার রেট",
//       href: "/admin/agent/dollar-rate",
//       desc: "১ ডলার = কত টাকা সেট করুন",
//       icon: "💱",
//       color: "bg-slate-900 border-slate-800 hover:border-orange-500",
//     },
//   ];

//   return (
//     <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100">
//       <div className="mb-6">
//         <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
//           <i className="fa-solid fa-users-gear"></i> এজেন্ট ম্যানেজমেন্ট
//         </h1>
//         <p className="text-slate-400 mt-1 text-sm">
//           এজেন্ট, কমিশন, ডলার লোড ও হিস্ট্রি ম্যানেজ করুন
//         </p>
//       </div>

//       {/* সারসংক্ষেপ কার্ড */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
//         <SummaryCard
//           label="মোট এজেন্ট"
//           value={loading ? "..." : (summary?.totalAgents ?? 0)}
//           icon="👥"
//           color="text-blue-400"
//         />
//         <SummaryCard
//           label="পেন্ডিং রিকোয়েস্ট"
//           value={loading ? "..." : (summary?.pendingRequests ?? 0)}
//           icon="⏳"
//           color="text-orange-400"
//         />
//         <SummaryCard
//           label="ডিপোজিট কমিশন"
//           value={loading ? "..." : `${summary?.depositCommission ?? 0}%`}
//           icon="💰"
//           color="text-emerald-400"
//         />
//         <SummaryCard
//           label="ডলার রেট"
//           value={loading ? "..." : `৳${summary?.dollarRate ?? 0}`}
//           icon="💱"
//           color="text-purple-400"
//         />
//       </div>

//       {/* মেনু কার্ড */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         {cards.map((card) => (
//           <Link
//             key={card.href}
//             href={card.href}
//             className={`relative p-5 rounded-xl border ${card.color} transition-all duration-200 group`}
//           >
//             <div className="flex items-start gap-4">
//               <div className="w-12 h-12 rounded-lg bg-slate-950 flex items-center justify-center text-2xl border border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
//                 {card.icon}
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">
//                   {card.title}
//                 </h3>
//                 <p className="text-xs text-slate-400 mt-1 leading-relaxed">
//                   {card.desc}
//                 </p>
//               </div>
//             </div>
//             {card.badge > 0 && (
//               <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shadow-lg shadow-rose-500/50">
//                 {card.badge} Pending
//               </span>
//             )}
//           </Link>
//         ))}
//       </div>
//     </div>
//   );
// }

// function SummaryCard({ label, value, icon, color }) {
//   return (
//     <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
//       <div className="flex items-center justify-between">
//         <span className="text-xs font-semibold text-slate-400">{label}</span>
//         <span className="text-lg opacity-80">{icon}</span>
//       </div>
//       <p className={`text-2xl font-black mt-2 font-mono ${color}`}>{value}</p>
//     </div>
//   );
// }
// //////////////////////////////////////////////////////////////////////////////////////////////////

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function AgentAdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [settingsRes, agentsRes, requestsRes] = await Promise.all([
          fetch("/api/admin/agent/settings"),
          fetch("/api/admin/agent/create"),
          fetch("/api/admin/agent/dollar-requests?status=pending&limit=1"),
        ]);

        const settingsData = await settingsRes.json();
        const agentsData = await agentsRes.json();
        const requestsData = await requestsRes.json();

        setSummary({
          depositCommission:
            settingsData?.settings?.defaultDepositCommission ?? 0,
          withdrawCommission:
            settingsData?.settings?.defaultWithdrawCommission ?? 0,
          dollarRate: settingsData?.settings?.dollarRate ?? 0,
          totalAgents: agentsData?.agents?.length ?? 0,
          pendingRequests: requestsData?.pagination?.total ?? 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const cards = [
    {
      title: "এজেন্ট লিস্ট",
      href: "/admin/agent/agent-list",
      desc: "ইউজারকে এজেন্ট বানান, ব্যালেন্স ও কমিশন সেট করুন",
      icon: "👥",
      color: "bg-slate-900 border-slate-800 hover:border-blue-500",
    },
    {
      title: "ডলার লোড রিকোয়েস্ট",
      href: "/admin/agent/dollar-requests",
      desc: "এজেন্টদের ডলার লোড রিকোয়েস্ট অ্যাপ্রুভ/রিজেক্ট",
      icon: "💵",
      color: "bg-slate-900 border-slate-800 hover:border-emerald-500",
      badge: summary?.pendingRequests || 0,
    },
    {
      title: "এজেন্ট হিস্ট্রি",
      href: "/admin/agent/history",
      desc: "এজেন্টদের সব ডিপোজিট ও উইথড্র হিস্ট্রি",
      icon: "📊",
      color: "bg-slate-900 border-slate-800 hover:border-purple-500",
    },
    {
      title: "কমিশন সেটিংস",
      href: "/admin/agent/commission-settings",
      desc: "গ্লোবাল ডিপোজিট ও উইথড্র কমিশন % সেট করুন",
      icon: "⚙️",
      color: "bg-slate-900 border-slate-800 hover:border-yellow-500",
    },
    {
      title: "ডলার রেট",
      href: "/admin/agent/dollar-rate",
      desc: "১ ডলার = কত টাকা সেট করুন",
      icon: "💱",
      color: "bg-slate-900 border-slate-800 hover:border-orange-500",
    },
    {
      title: "পেমেন্ট অ্যাড্রেস",
      href: "/admin/payment-addresses",
      desc: "এজেন্টদের জন্য ডলার পাঠানোর অ্যাড্রেস সেট করুন",
      icon: "💳",
      color: "bg-slate-900 border-slate-800 hover:border-cyan-500",
    },
  ];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto min-h-screen text-slate-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
          <i className="fa-solid fa-users-gear"></i> এজেন্ট ম্যানেজমেন্ট
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          এজেন্ট, কমিশন, ডলার লোড ও হিস্ট্রি ম্যানেজ করুন
        </p>
      </div>

      {/* সারসংক্ষেপ কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <SummaryCard
          label="মোট এজেন্ট"
          value={loading ? "..." : (summary?.totalAgents ?? 0)}
          icon="👥"
          color="text-blue-400"
        />
        <SummaryCard
          label="পেন্ডিং রিকোয়েস্ট"
          value={loading ? "..." : (summary?.pendingRequests ?? 0)}
          icon="⏳"
          color="text-orange-400"
        />
        <SummaryCard
          label="ডিপোজিট কমিশন"
          value={loading ? "..." : `${summary?.depositCommission ?? 0}%`}
          icon="💰"
          color="text-emerald-400"
        />
        <SummaryCard
          label="ডলার রেট"
          value={loading ? "..." : `৳${summary?.dollarRate ?? 0}`}
          icon="💱"
          color="text-purple-400"
        />

        {/* ✅ নতুন পেমেন্ট অ্যাড্রেস কার্ড (ক্লিকেবল) */}
        <Link href="/admin/payment-addresses" className="block">
          <SummaryCard
            label="পেমেন্ট অ্যাড্রেস"
            value="সেট করুন"
            icon="💳"
            color="text-cyan-400"
          />
        </Link>
      </div>

      {/* মেনু কার্ড */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`relative p-5 rounded-xl border ${card.color} transition-all duration-200 group`}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-slate-950 flex items-center justify-center text-2xl border border-slate-800 flex-shrink-0 group-hover:scale-110 transition-transform">
                {card.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-200 group-hover:text-white transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </div>
            {card.badge > 0 && (
              <span className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 shadow-lg shadow-rose-500/50">
                {card.badge} Pending
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg cursor-pointer hover:border-cyan-500/50 transition-all active:scale-95">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400">{label}</span>
        <span className="text-lg opacity-80">{icon}</span>
      </div>
      <p className={`text-2xl font-black mt-2 font-mono ${color}`}>{value}</p>
    </div>
  );
}
