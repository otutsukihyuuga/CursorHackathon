'use client';

import { LeaderboardEntry, avatarColor, QUADRANT_COLORS } from '@/lib/leaderboardData';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

// ── Podium medals ──────────────────────────────────────────────────────

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-amber-500 text-white font-bold text-sm shadow-md shadow-amber-200/50">
        🥇
      </span>
    );
  if (rank === 2)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 text-white font-bold text-sm shadow-md shadow-slate-200/50">
        🥈
      </span>
    );
  if (rank === 3)
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 text-white font-bold text-sm shadow-md shadow-amber-200/50">
        🥉
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-semibold text-sm">
      {rank}
    </span>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  const bg = avatarColor(name);
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

// ── Streak flame ───────────────────────────────────────────────────────

function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return <span className="text-slate-300 text-xs">—</span>;
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-orange-500">
      🔥 {streak}d
    </span>
  );
}

// ── Quadrant dot ───────────────────────────────────────────────────────

function QuadrantDot({ quadrant }: { quadrant: LeaderboardEntry['dominantQuadrant'] }) {
  const color = QUADRANT_COLORS[quadrant];
  return (
    <span
      className="inline-block w-3 h-3 rounded-full flex-shrink-0"
      style={{ backgroundColor: color }}
      title={quadrant}
    />
  );
}

// ── Main component ─────────────────────────────────────────────────────

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="w-full">
      {/* ── Podium top 3 ───────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-end justify-center gap-3 sm:gap-4 mb-8">
        {entries.slice(0, 3).map((entry, idx) => {
          const heights = ['h-36', 'h-28', 'h-24'];
          const order = [1, 0, 2]; // 2nd-place, 1st-place, 3rd-place position
          const smOrder = [`sm:order-${order[idx]}`, `sm:order-${order[idx]}`, `sm:order-${order[idx]}`];
          const isFirst = idx === 0;

          return (
            <div
              key={entry.userId}
              className={`flex flex-col items-center w-full sm:w-36 ${smOrder[idx]}`}
              style={{ order: order[idx] }}
            >
              {/* Avatar + crown */}
              <div className="relative mb-2">
                {isFirst && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg">👑</span>
                )}
                <div
                  className={`rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
                    isFirst ? 'w-16 h-16 text-xl' : 'w-12 h-12 text-sm'
                  }`}
                  style={{ backgroundColor: avatarColor(entry.displayName) }}
                >
                  {entry.displayName
                    .split(' ')
                    .map((w) => w[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase()}
                </div>
              </div>
              <span className="text-sm font-semibold text-slate-700 truncate max-w-full">
                {entry.displayName}
              </span>
              <span className="text-lg font-bold text-slate-800">{entry.score.toLocaleString()}</span>

              {/* Podium bar */}
              <div
                className={`${heights[idx]} w-full rounded-t-xl mt-2 flex items-start justify-center pt-3`}
                style={{
                  background:
                    idx === 0
                      ? 'linear-gradient(135deg, #fbbf24, #f59e0b)'
                      : idx === 1
                      ? 'linear-gradient(135deg, #cbd5e1, #94a3b8)'
                      : 'linear-gradient(135deg, #d97706, #b45309)',
                }}
              >
                <span className="text-white text-2xl font-bold">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Table for ranks 4+ ─────────────────────────── */}
      <div className="rounded-xl border border-slate-200/80 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_4.5rem_5rem_4rem_3.5rem] sm:grid-cols-[3.5rem_1fr_5rem_6rem_5rem_4rem] gap-2 px-4 py-2.5 bg-slate-50 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <span>Rank</span>
          <span>User</span>
          <span className="text-right">Score</span>
          <span className="text-right">Positive</span>
          <span className="text-right">Streak</span>
          <span className="text-center">Mood</span>
        </div>

        {/* Rows */}
        {entries.slice(3).map((entry) => {
          const isYou = entry.userId === currentUserId;
          return (
            <div
              key={entry.userId}
              className={`grid grid-cols-[3rem_1fr_4.5rem_5rem_4rem_3.5rem] sm:grid-cols-[3.5rem_1fr_5rem_6rem_5rem_4rem] gap-2 px-4 py-3 items-center border-t border-slate-100 transition-colors duration-100 hover:bg-slate-50/80 ${
                isYou ? 'bg-indigo-50/60 border-l-2 border-l-indigo-400' : ''
              }`}
            >
              <RankBadge rank={entry.rank} />
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar name={entry.displayName} />
                <span className={`text-sm truncate ${isYou ? 'font-bold text-indigo-700' : 'font-medium text-slate-700'}`}>
                  {entry.displayName}
                  {isYou && (
                    <span className="ml-1 text-[10px] font-semibold text-indigo-400 uppercase">you</span>
                  )}
                </span>
              </div>
              <span className="text-right text-sm font-bold text-slate-800">
                {entry.score.toLocaleString()}
              </span>
              <span className="text-right text-sm text-emerald-600 font-medium">
                {entry.positiveMoods}/{entry.totalMessages}
              </span>
              <div className="text-right">
                <StreakBadge streak={entry.streak} />
              </div>
              <div className="flex justify-center">
                <QuadrantDot quadrant={entry.dominantQuadrant} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
