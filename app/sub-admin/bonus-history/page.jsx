'use client';

import { useEffect, useState } from 'react';

export default function BonusHistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [expanded, setExpanded] = useState(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' });
      if (filter !== 'all') params.set('type', filter);

      const res = await fetch(`/api/admin/bonus-history?${params}`);
      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [filter, page]);

  const stats = logs.reduce((acc, log) => {
    acc.totalRuns++;
    acc.totalGiven += log.summary?.totalGiven || 0;
    acc.totalSkipped += log.summary?.totalSkipped || 0;
    acc.totalAmount += log.summary?.totalAmount || 0;
    return acc;
  }, { totalRuns: 0, totalGiven: 0, totalSkipped: 0, totalAmount: 0 });

  return (
    <div className="p-6 max-w-6xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-2">📜 বোনাস ইতিহাস</h1>
      <p className="text-sm text-gray-400 mb-6">
        কে কত পেল, কে পেল না — সব বিস্তারিত
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="মোট রান" value={stats.totalRuns} color="blue" />
        <StatCard label="পেয়েছে" value={stats.totalGiven} color="green" />
        <StatCard label="পায়নি" value={stats.totalSkipped} color="red" />
        <StatCard label="মোট বোনাস" value={stats.totalAmount} color="purple" suffix="৳" />
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {[
          { key: 'all', label: 'সব' },
          { key: 'weekly', label: 'সাপ্তাহিক' },
          { key: 'monthly', label: 'মাসিক' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              filter === f.key
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={fetchLogs}
          className="ml-auto px-4 py-2 bg-gray-700 text-white rounded-lg text-sm"
        >
          🔄 রিফ্রেশ
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">লোড হচ্ছে...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 text-gray-400">কোনো ইতিহাস নেই</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <LogCard
              key={log._id}
              log={log}
              expanded={expanded === log._id}
              onToggle={() => setExpanded(expanded === log._id ? null : log._id)}
            />
          ))}
        </div>
      )}

      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 text-gray-300"
          >
            ← আগের
          </button>
          <span className="px-4 py-2 text-gray-400">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-700 rounded-lg disabled:opacity-50 text-gray-300"
          >
            পরের →
          </button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, suffix = '' }) {
  const colors = {
    blue: 'bg-blue-900/30 border-blue-700 text-blue-300',
    green: 'bg-emerald-900/30 border-emerald-700 text-emerald-300',
    red: 'bg-red-900/30 border-red-700 text-red-300',
    purple: 'bg-purple-900/30 border-purple-700 text-purple-300',
  };
  return (
    <div className={`p-3 rounded-lg border ${colors[color]}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-xl font-bold">
        {suffix && <span className="text-sm mr-1">{suffix}</span>}
        {value.toLocaleString('bn-BD')}
      </div>
    </div>
  );
}

function LogCard({ log, expanded, onToggle }) {
  const [tab, setTab] = useState('given');
  const isWeekly = log.type === 'weekly';
  const runDate = new Date(log.runAt).toLocaleString('bn-BD');

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900/50">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-800/50"
        onClick={onToggle}
      >
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          isWeekly ? 'bg-emerald-900/50 text-emerald-300' : 'bg-purple-900/50 text-purple-300'
        }`}>
          {isWeekly ? '📅 সাপ্তাহিক' : '🏆 মাসিক'}
        </span>
        <span className="font-mono text-sm text-gray-300">{log.periodKey}</span>
        <span className="text-xs text-gray-500">{runDate}</span>
        <div className="ml-auto flex items-center gap-4 text-sm">
          <span className="text-emerald-400">✅ {log.summary?.totalGiven || 0}</span>
          <span className="text-red-400">❌ {log.summary?.totalSkipped || 0}</span>
          <span className="font-bold text-white">
            ৳ {(log.summary?.totalAmount || 0).toLocaleString('bn-BD')}
          </span>
          <span className="text-gray-500">{expanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-700 bg-gray-950/50">
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {isWeekly ? (
              <>
                <SumBox label="ডিপোজিট বোনাস" value={log.summary?.totalDepositBonus} />
                <SumBox label="ক্যাশব্যাক" value={log.summary?.totalCashback} />
                <SumBox label="ডিপোজিট প্রাপক" value={log.summary?.depositBonusCount} isCount />
                <SumBox label="ক্যাশব্যাক প্রাপক" value={log.summary?.cashbackCount} isCount />
              </>
            ) : (
              <>
                <SumBox label="মোট বিজয়ী" value={log.summary?.totalWinners} isCount />
                <SumBox label="মোট বোনাস" value={log.summary?.totalBonus} />
                <SumBox label="রেস caught" value={log.summary?.raceCaught} isCount />
                <SumBox label="ব্যর্থ" value={log.summary?.failedCount} isCount />
              </>
            )}
          </div>

          <div className="flex border-t border-gray-700">
            <button
              onClick={() => setTab('given')}
              className={`flex-1 py-2 text-sm font-medium ${
                tab === 'given'
                  ? 'bg-emerald-900/30 text-emerald-300 border-b-2 border-emerald-500'
                  : 'text-gray-400'
              }`}
            >
              ✅ যারা পেয়েছে ({log.given?.length || 0})
            </button>
            <button
              onClick={() => setTab('skipped')}
              className={`flex-1 py-2 text-sm font-medium ${
                tab === 'skipped'
                  ? 'bg-red-900/30 text-red-300 border-b-2 border-red-500'
                  : 'text-gray-400'
              }`}
            >
              ❌ যারা পায়নি ({log.skipped?.length || 0})
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {tab === 'given' ? (
              <GivenTable log={log} />
            ) : (
              <SkippedTable log={log} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SumBox({ label, value, isCount }) {
  const display = isCount
    ? (value || 0).toLocaleString('bn-BD')
    : `৳ ${(value || 0).toLocaleString('bn-BD')}`;

  return (
    <div className="bg-gray-900/50 p-2 rounded border border-gray-800">
      <div className="text-gray-500">{label}</div>
      <div className="font-bold text-gray-200">{display}</div>
    </div>
  );
}

function GivenTable({ log }) {
  const isWeekly = log.type === 'weekly';
  const given = log.given || [];

  if (given.length === 0) {
    return <div className="p-6 text-center text-gray-500 text-sm">কেউ পায়নি</div>;
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-900 sticky top-0">
        <tr className="text-gray-400 text-xs">
          {!isWeekly && <th className="p-2 text-left">র‍্যাংক</th>}
          <th className="p-2 text-left">UID</th>
          <th className="p-2 text-left">ফোন</th>
          {isWeekly ? (
            <>
              <th className="p-2 text-left">বোনাস</th>
              <th className="p-2 text-right">পরিমাণ</th>
              <th className="p-2 text-right">টার্নওভার</th>
            </>
          ) : (
            <>
              <th className="p-2 text-right">পুরস্কার</th>
              <th className="p-2 text-right">টার্নওভার</th>
            </>
          )}
        </tr>
      </thead>
      <tbody>
        {given.map((g, i) => (
          isWeekly ? (
            (g.bonuses || []).map((b, j) => (
              <tr key={`${i}-${j}`} className="border-t border-gray-800">
                {j === 0 && (
                  <>
                    <td className="p-2 font-mono" rowSpan={g.bonuses.length}>{g.uid}</td>
                    <td className="p-2" rowSpan={g.bonuses.length}>{g.phone}</td>
                  </>
                )}
                <td className="p-2">{b.type}</td>
                <td className="p-2 text-right font-bold text-emerald-400">৳ {b.amount}</td>
                <td className="p-2 text-right text-gray-400">{b.turnover || 0}</td>
              </tr>
            ))
          ) : (
            <tr key={i} className="border-t border-gray-800">
              <td className="p-2">#{g.rank}</td>
              <td className="p-2 font-mono">{g.uid}</td>
              <td className="p-2">{g.phone}</td>
              <td className="p-2 text-right font-bold text-emerald-400">৳ {g.prize}</td>
              <td className="p-2 text-right text-gray-400">{g.turnover}</td>
            </tr>
          )
        ))}
      </tbody>
    </table>
  );
}

function SkippedTable({ log }) {
  const skipped = log.skipped || [];

  if (skipped.length === 0) {
    return <div className="p-6 text-center text-gray-500 text-sm">সবাই পেয়েছে</div>;
  }

  const reasonLabels = {
    already_got: '🔄 আগেই পেয়েছে',
    below_min_deposit: '📉 ডিপোজিট কম',
    no_loss: '🎯 লস নেই',
    race_caught: '⚡ রেস caught',
    no_prize_for_rank: '🏅 পুরস্কার নেই',
    no_eligible_bonus: '❌ যোগ্য নয়',
  };

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-900 sticky top-0">
        <tr className="text-gray-400 text-xs">
          <th className="p-2 text-left">UID</th>
          <th className="p-2 text-left">ফোন</th>
          <th className="p-2 text-left">কারণ</th>
          <th className="p-2 text-right">Deposit</th>
          <th className="p-2 text-right">Lost</th>
        </tr>
      </thead>
      <tbody>
        {skipped.map((s, i) => (
          <tr key={i} className="border-t border-gray-800">
            <td className="p-2 font-mono">{s.uid}</td>
            <td className="p-2">{s.phone}</td>
            <td className="p-2 text-red-400 text-xs">
              {reasonLabels[s.reason] || s.reason}
            </td>
            <td className="p-2 text-right text-gray-400">{s.weeklyDeposit || s.monthlyCashback || 0}</td>
            <td className="p-2 text-right text-gray-400">{s.weeklyLost || 0}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}