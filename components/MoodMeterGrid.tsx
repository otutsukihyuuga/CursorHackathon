'use client';

import { EMOTION_GRID, QUADRANT_COLORS } from '@/lib/moodMeterData';

export default function MoodMeterGrid() {
  return (
    <div className="relative w-full overflow-x-auto">
      <div className="min-w-[600px]">
        {/* ── Y-axis label (Energy) ───────────────────────── */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[calc(50%-8px)] -rotate-90 text-[10px] font-semibold tracking-widest text-slate-400 uppercase select-none whitespace-nowrap">
          Low Energy ← → High Energy
        </div>

        {/* ── Grid ────────────────────────────────────────── */}
        <div className="ml-8">
          {EMOTION_GRID.map((row, rIdx) => (
            <div key={rIdx} className="flex gap-[2px] mb-[2px]">
              {row.map((cell) => {
                const colors = QUADRANT_COLORS[cell.quadrant];
                return (
                  <div
                    key={`${cell.row}-${cell.col}`}
                    className="flex-1 flex items-center justify-center rounded-[3px] py-1.5 px-0.5 text-[9px] sm:text-[10px] font-medium leading-tight text-center select-none transition-all duration-150 hover:scale-110 hover:z-10 hover:shadow-md cursor-default"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                    }}
                    title={`${cell.label} — ${colors.label}`}
                  >
                    {cell.label}
                  </div>
                );
              })}
            </div>
          ))}

          {/* ── X-axis label (Pleasantness) ──────────────── */}
          <div className="flex justify-between mt-1 text-[10px] font-semibold tracking-widest text-slate-400 uppercase select-none px-1">
            <span>Low Pleasantness</span>
            <span>High Pleasantness</span>
          </div>
        </div>
      </div>
    </div>
  );
}
