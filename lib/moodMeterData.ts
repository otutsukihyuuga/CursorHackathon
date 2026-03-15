// ── Mood Meter Data ────────────────────────────────────────────────────
// Contains the full 100-emotion grid, quadrant colors, types, and mock
// data helpers.  Backend will replace generateMockWeek() later.

export type Quadrant = 'red' | 'yellow' | 'blue' | 'green';

export interface EmotionCell {
  label: string;
  quadrant: Quadrant;
  row: number; // 0 = top (high energy)
  col: number; // 0 = left (low pleasantness)
}

export interface MoodEntry {
  day: number;   // 0 = Monday … 6 = Sunday
  hour: number;  // 0–23
  emotion: string;
  quadrant: Quadrant;
}

// ── Quadrant colors ────────────────────────────────────────────────────

export const QUADRANT_COLORS: Record<Quadrant, { bg: string; bgLight: string; text: string; label: string }> = {
  red:    { bg: '#dc2626', bgLight: '#fca5a5', text: '#fff', label: 'High Energy · Low Pleasantness' },
  yellow: { bg: '#eab308', bgLight: '#fde68a', text: '#422006', label: 'High Energy · High Pleasantness' },
  blue:   { bg: '#2563eb', bgLight: '#93c5fd', text: '#fff', label: 'Low Energy · Low Pleasantness' },
  green:  { bg: '#16a34a', bgLight: '#86efac', text: '#fff', label: 'Low Energy · High Pleasantness' },
};

export const EMPTY_COLOR = '#e2e8f0'; // slate-200

// ── 10×10 Emotion grid (row 0 = highest energy, col 0 = lowest pleasantness) ──

const EMOTION_LABELS: string[][] = [
  // Row 0 — highest energy
  ['Enraged','Panicked','Stressed','Jittery','Shocked',   'Surprised','Upbeat','Festive','Exhilarated','Ecstatic'],
  ['Livid','Furious','Frustrated','Tense','Stunned',      'Hyper','Cheerful','Motivated','Inspired','Elated'],
  ['Fuming','Frightened','Angry','Nervous','Restless',     'Energized','Lively','Excited','Optimistic','Enthusiastic'],
  ['Anxious','Apprehensive','Worried','Irritated','Annoyed','Pleased','Focused','Happy','Proud','Thrilled'],
  ['Repulsed','Troubled','Concerned','Uneasy','Peeved',   'Pleasant','Joyful','Hopeful','Playful','Blissful'],
  // Row 5 — transition to low energy
  ['Disgusted','Glum','Disappointed','Down','Apathetic',   'At Ease','Easygoing','Content','Loving','Fulfilled'],
  ['Pessimistic','Morose','Discouraged','Sad','Bored',     'Calm','Secure','Satisfied','Grateful','Touched'],
  ['Alienated','Miserable','Lonely','Disheartened','Tired','Relaxed','Chill','Restful','Blessed','Balanced'],
  ['Despondent','Depressed','Sullen','Exhausted','Fatigued','Mellow','Thoughtful','Peaceful','Comfortable','Carefree'],
  ['Despair','Hopeless','Desolate','Spent','Drained',      'Sleepy','Complacent','Tranquil','Cozy','Serene'],
];

function quadrantFor(row: number, col: number): Quadrant {
  const isHighEnergy = row < 5;
  const isHighPleasantness = col >= 5;
  if (isHighEnergy && !isHighPleasantness) return 'red';
  if (isHighEnergy && isHighPleasantness) return 'yellow';
  if (!isHighEnergy && !isHighPleasantness) return 'blue';
  return 'green';
}

export const EMOTION_GRID: EmotionCell[][] = EMOTION_LABELS.map((rowLabels, row) =>
  rowLabels.map((label, col) => ({ label, quadrant: quadrantFor(row, col), row, col }))
);

export const ALL_EMOTIONS: EmotionCell[] = EMOTION_GRID.flat();

// ── Day / hour labels ──────────────────────────────────────────────────

export const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export function formatHour(h: number): string {
  if (h === 0) return '12a';
  if (h < 12) return `${h}a`;
  if (h === 12) return '12p';
  return `${h - 12}p`;
}

// ── Mock data generator ────────────────────────────────────────────────

export function generateMockWeek(): MoodEntry[] {
  const entries: MoodEntry[] = [];
  const usedSlots = new Set<string>();

  // Generate 35–55 random entries across the week
  const count = 35 + Math.floor(Math.random() * 20);

  for (let i = 0; i < count; i++) {
    const day = Math.floor(Math.random() * 7);
    // Bias toward waking hours (7am – 11pm)
    const hour = Math.random() < 0.85
      ? 7 + Math.floor(Math.random() * 16)
      : Math.floor(Math.random() * 24);

    const key = `${day}-${hour}`;
    if (usedSlots.has(key)) continue;
    usedSlots.add(key);

    const emotion = ALL_EMOTIONS[Math.floor(Math.random() * ALL_EMOTIONS.length)];
    entries.push({ day, hour, emotion: emotion.label, quadrant: emotion.quadrant });
  }

  return entries;
}
