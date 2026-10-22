import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';

export default async function SubAdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  let userRole = '';
  let userPermissions = [];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userRole = decoded.role || '';
    userPermissions = decoded.permissions || decoded.permission || [];

    if (userRole !== 'sub-admin' && userRole !== 'admin') {
      redirect('/');
    }
  } catch (err) {
    redirect('/login');
  }

  const headersList = await headers();
  const pathname = headersList.get('x-invoke-path') || '';

  const isAdmin = userRole === 'admin';

  const hasPerm = (permName) => {
    if (isAdmin) return true;
    return userPermissions.some(p => p === permName || p === permName.replace(/-/g, '_') || p === permName.replace(/_/g, '-'));
  };

  // পারমিশন অনুযায়ী সঠিক ফাংশন চেক
  const canManageDashboard = hasPerm('manage_dashboard');
  const canViewGameTracking = hasPerm('view_game_tracking');
  const canManageUsers = hasPerm('manage_users');
  const canManageDeposits = hasPerm('manage_deposits');
  const canManageWithdraws = hasPerm('manage_withdraws');
  const canManageReferrals = hasPerm('manage_referrals');
  const canManagePayments = hasPerm('manage_payments');
  const canManagePaymentMethods = hasPerm('manage_methods');
  const canManageExchangeRate = hasPerm('manage_exchange_rate');
  const canManageNowPayments = hasPerm('manage_nowpayments');
  const canManageAutoCrypto = hasPerm('manage_auto_crypto');
  const canManageBonusSettings = hasPerm('manage_bonus_settings');
  const canManageBonusHistory = hasPerm('view_bonus_history');

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col justify-between pb-24">
      <main className="flex-1 max-w-md w-full mx-auto p-4 pt-6">
        {children}
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-4 pb-3">
        <nav className="max-w-md w-full bg-[#0b132b] border border-slate-800/80 rounded-2xl py-3 px-4 flex justify-around items-center overflow-x-auto shadow-2xl space-x-2">
          
          {/* ড্যাশবোর্ড */}
          {canManageDashboard && (
            <Link href="/sub-admin" className={`flex flex-col items-center flex-shrink-0 transition ${pathname === '/sub-admin' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">ড্যাশবোর্ড</span>
            </Link>
          )}

          {/* ট্র্যাকিং */}
          {canViewGameTracking && (
            <Link href="/sub-admin/live-traking" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/live-traking') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">ট্র্যাকিং</span>
            </Link>
          )}

          {/* ইউজার */}
          {canManageUsers && (
            <Link href="/sub-admin/users" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/users') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">ইউজার</span>
            </Link>
          )}

          {/* ডিপোজিট */}
          {canManageDeposits && (
            <Link href="/sub-admin/deposits" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/deposits') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">ডিপোজিট</span>
            </Link>
          )}

          {/* উইথড্র */}
          {canManageWithdraws && (
            <Link href="/sub-admin/withdraws" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/withdraws') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">উইথড্র</span>
            </Link>
          )}

          {/* রেফারেল */}
          {canManageReferrals && (
            <Link href="/sub-admin/referrals" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/referrals') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">রেফারেল</span>
            </Link>
          )}

          {/* পেমেন্ট */}
          {canManagePayments && (
            <Link href="/sub-admin/payments" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/payments') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">পেমেন্ট</span>
            </Link>
          )}

          {/* মেথডস */}
          {canManagePaymentMethods && (
            <Link href="/sub-admin/payment-methods" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/payment-methods') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">মেথডস</span>
            </Link>
          )}

          {/* Exchange Rate */}
          {canManageExchangeRate && (
            <Link href="/sub-admin/settings/exchange-rate" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/settings/exchange-rate') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">Exchange Rate</span>
            </Link>
          )}

          {/* NowPayments */}
          {canManageNowPayments && (
            <Link href="/sub-admin/nowpayments" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/nowpayments') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">NowPayments</span>
            </Link>
          )}

          {/* Auto Crypto */}
          {canManageAutoCrypto && (
            <Link href="/sub-admin/settings/auto-crypto" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/settings/auto-crypto') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">Auto Crypto</span>
            </Link>
          )}

          {/* বোনাস সেটিংস */}
          {canManageBonusSettings && (
            <Link href="/sub-admin/bonus-settings" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/bonus-settings') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">বোনাস সেটিংস</span>
            </Link>
          )}

          {/* বোনাস ইতিহাস */}
          {canManageBonusHistory && (
            <Link href="/sub-admin/bonus-history" className={`flex flex-col items-center flex-shrink-0 transition ${pathname.includes('/sub-admin/bonus-history') ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
              <span className="text-[11px] font-medium">বোনাস ইতিহাস</span>
            </Link>
          )}

        </nav>
      </div>
    </div>
  );
}