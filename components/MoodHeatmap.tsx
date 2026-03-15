'use client';

import { useMemo } from 'react';
import {
  MoodEntry,
  QUADRANT_COLORS,
  EMPTY_COLOR,
  DAY_LABELS,
  formatHour,
} from '@/lib/moodMeterData';

interface MoodHeatmapProps {
  entries: MoodEntry[];
}

export default function MoodHeatmap({ entries }: MoodHeatmapProps) {
  // Build a lookup map: "day-hour" → MoodEntry
  const lookup = useMemo(() => {
    const map = new Map<string, MoodEntry>();
    for (const e of entries) map.set(`${e.day}-${e.hour}`, e);
    return map;
  }, [entries]);

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[740px]">
        {/* ── Hour labels ─────────────────────────────────── */}
        <div className="flex items-end mb-1 pl-12">
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="flex-1 text-center text-[10px] text-slate-400 font-mono select-none"
            >
              {h % 3 === 0 ? formatHour(h) : ''}
            </div>
          ))}
        </div>

        {/* ── Rows ────────────────────────────────────────── */}
        {DAY_LABELS.map((day, dayIdx) => (
          <div key={day} className="flex items-center gap-1 mb-[3px]">
            {/* Day label */}
            <span className="w-10 text-right text-xs text-slate-500 font-medium select-none pr-1">
              {day}
            </span>

            {/* Hour cells */}
            <div className="flex gap-[3px] flex-1">
              {Array.from({ length: 24 }, (_, hour) => {
                const entry = lookup.get(`${dayIdx}-${hour}`);
                const bg = entry
                  ? QUADRANT_COLORS[entry.quadrant].bg
                  : EMPTY_COLOR;

                return (
                  <div
                    key={hour}
                    className="group relative flex-1 aspect-square rounded-[3px] transition-transform duration-150 hover:scale-125 hover:z-10 cursor-default"
                    style={{ backgroundColor: bg }}
                  >
                    {/* Tooltip */}
                    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30">
                      <div className="whitespace-nowrap rounded-md bg-slate-800 px-2.5 py-1.5 text-xs text-white shadow-lg">
                        {entry ? (
                          <>
                            <span className="font-semibold">{entry.emotion}</span>
                            <br />
                            <span className="text-slate-300">
                              {day} · {formatHour(hour)}
                            </span>
                          </>
                        ) : (
                          <span className="text-slate-300">
                            {day} · {formatHour(hour)} — no data
                          </span>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="mx-auto h-0 w-0 border-x-4 border-t-4 border-x-transparent border-t-slate-800" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Legend ───────────────────────────────────────── */}
        <div className="flex items-center gap-4 mt-4 pl-12 text-xs text-slate-500 flex-wrap">
          <span className="font-medium">Legend:</span>
          {(Object.entries(QUADRANT_COLORS) as [string, typeof QUADRANT_COLORS.red][]).map(
            ([key, val]) => (
              <div key={key} className="flex items-center gap-1.5">
                <span
                  className="inline-block w-3 h-3 rounded-[2px]"
                  style={{ backgroundColor: val.bg }}
                />
                <span>{val.label}</span>
              </div>
            )
          )}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-[2px]"
              style={{ backgroundColor: EMPTY_COLOR }}
            />
            <span>No data</span>
          </div>
        </div>
      </div>
    </div>
  );
}
