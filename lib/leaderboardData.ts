// ── Leaderboard Data ───────────────────────────────────────────────────
// Types, mock-data generator, and helpers for the leaderboard page.
// Backend will replace generateMockLeaderboard() later.

export const QUADRANT_COLORS: Record<string, string> = {
  red: '#dc2626',
  yellow: '#eab308',
  blue: '#2563eb',
  green: '#16a34a',
};

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  score: number;           // total positivity score
  positiveMoods: number;   // count of yellow + green mood entries this week
  totalMessages: number;   // total messages sent this week
  streak: number;          // consecutive days with positive channeling
  dominantQuadrant: 'red' | 'yellow' | 'blue' | 'green';
}

// ── Avatar placeholder colors ──────────────────────────────────────────

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6',
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function avatarColor(name: string): string {
  return AVATAR_COLORS[hashCode(name) % AVATAR_COLORS.length];
}

// ── Mock data ──────────────────────────────────────────────────────────

const MOCK_NAMES = [
  'Alex Rivera', 'Priya Sharma', 'Jordan Chen', 'Maya Williams',
  'Luca Rossi', 'Aisha Okafor', 'Kai Nakamura', 'Elena Volkov',
  'Omar Hassan', 'Sofia Martinez', 'Reza Hyuuga', 'Dina Petrov',
  'Tomás Alves', 'Noor Sheikh', 'Freya Johansson',
];

const QUADRANTS: LeaderboardEntry['dominantQuadrant'][] = ['yellow', 'green', 'yellow', 'green', 'red', 'blue', 'yellow', 'green'];

export function generateMockLeaderboard(): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = MOCK_NAMES.map((name) => {
    const totalMessages = 20 + Math.floor(Math.random() * 80);
    const positiveMoods = Math.floor(totalMessages * (0.3 + Math.random() * 0.6));
    const score = Math.floor(positiveMoods * 10 + Math.random() * 50);
    const streak = Math.floor(Math.random() * 7) + 1;
    const dominantQuadrant = QUADRANTS[Math.floor(Math.random() * QUADRANTS.length)];

    return {
      rank: 0,
      userId: name.toLowerCase().replace(/\s+/g, '-'),
      displayName: name,
      avatarUrl: null,
      score,
      positiveMoods,
      totalMessages,
      streak,
      dominantQuadrant,
    };
  });

  // Sort by score descending, assign ranks
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((e, i) => (e.rank = i + 1));

  return entries;
}
