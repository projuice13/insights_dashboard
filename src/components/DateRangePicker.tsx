'use client';

import { useState, useRef, useEffect } from 'react';

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function fmt(d: Date) {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function DateRangePicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => (value.from ?? new Date()).getFullYear());
  const [viewMonth, setViewMonth] = useState(() => (value.from ?? new Date()).getMonth());
  const [hovered, setHovered] = useState<Date | null>(null);
  const [stage, setStage] = useState<'from' | 'to'>('from');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    if (!open) {
      setStage('from');
      if (value.from) {
        setViewYear(value.from.getFullYear());
        setViewMonth(value.from.getMonth());
      }
    }
    setOpen((v) => !v);
  };

  const handleDayClick = (day: Date) => {
    if (stage === 'from') {
      onChange({ from: day, to: null });
      setStage('to');
    } else {
      if (value.from && day < value.from) {
        onChange({ from: day, to: value.from });
      } else {
        onChange({ from: value.from, to: day });
      }
      setStage('from');
      setOpen(false);
      setHovered(null);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ from: null, to: null });
    setStage('from');
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  // Calendar grid
  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const leadingBlanks = firstDow === 0 ? 6 : firstDow - 1; // Mon-first
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1)),
  ];

  // Effective to (live preview while hovering in 'to' stage)
  const effectiveTo =
    value.to ?? (stage === 'to' && hovered && value.from ? hovered : null);

  const getRangeBounds = (): [Date | null, Date | null] => {
    if (!value.from || !effectiveTo) return [value.from, null];
    return value.from <= effectiveTo
      ? [value.from, effectiveTo]
      : [effectiveTo, value.from];
  };
  const [rangeStart, rangeEnd] = getRangeBounds();

  const dayStatus = (d: Date) => {
    const start = !!rangeStart && isSameDay(d, rangeStart);
    const end = !!rangeEnd && isSameDay(d, rangeEnd);
    const inRange =
      !!rangeStart &&
      !!rangeEnd &&
      startOfDay(d) > startOfDay(rangeStart) &&
      startOfDay(d) < startOfDay(rangeEnd);
    return { start, end, inRange };
  };

  // Button label
  let label = 'Any date';
  if (value.from && value.to) label = `${fmt(value.from)} – ${fmt(value.to)}`;
  else if (value.from) label = `From ${fmt(value.from)}`;

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('en-GB', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={handleOpen}
        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm outline-none transition-colors ${
          open
            ? 'border-[#6B7280] bg-white'
            : 'border-[#E5E7EB] bg-white hover:border-[#9CA3AF]'
        }`}
      >
        {/* Calendar icon */}
        <svg
          className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]"
          fill="none"
          viewBox="0 0 16 16"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" />
          <path d="M1.5 6.5h13M5 1v3M11 1v3" strokeLinecap="round" />
        </svg>
        <span className={value.from ? 'text-[#111827]' : 'text-[#9CA3AF]'}>{label}</span>
        {(value.from || value.to) && (
          <span
            onClick={handleClear}
            className="cursor-pointer text-base leading-none text-[#9CA3AF] hover:text-[#374151]"
          >
            ×
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-[268px] rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-lg">
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              onClick={prevMonth}
              className="cursor-pointer rounded-md p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M10 12L6 8l4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-sm font-medium text-[#111827]">{monthLabel}</span>
            <button
              onClick={nextMonth}
              className="cursor-pointer rounded-md p-1 text-[#9CA3AF] transition-colors hover:bg-[#F3F4F6] hover:text-[#374151]"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M6 12l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="mb-1 grid grid-cols-7">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((d) => (
              <div key={d} className="py-1 text-center text-[11px] font-medium text-[#9CA3AF]">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {cells.map((d, i) => {
              if (!d) return <div key={`blank-${i}`} />;
              const { start, end, inRange } = dayStatus(d);

              let cellClass =
                'cursor-pointer text-center text-[13px] py-1.5 transition-colors w-full ';

              if (start || end) {
                cellClass += 'bg-[#111827] text-white font-semibold rounded-lg';
              } else if (inRange) {
                cellClass += 'bg-[#F3F4F6] text-[#374151]';
              } else {
                cellClass += 'text-[#374151] hover:bg-[#F3F4F6] rounded-lg';
              }

              return (
                <button
                  key={`day-${i}`}
                  onClick={() => handleDayClick(d)}
                  onMouseEnter={() => setHovered(d)}
                  onMouseLeave={() => setHovered(null)}
                  className={cellClass}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>

          {/* Instruction hint */}
          <p className="mt-3 text-center text-[11px] text-[#9CA3AF]">
            {stage === 'from' ? 'Select start date' : 'Now select end date'}
          </p>
        </div>
      )}
    </div>
  );
}
