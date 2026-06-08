'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  products: string[];
  disabled?: boolean;
  placeholder?: string;
}

const MAX_RESULTS = 8;

export default function ProductAutocomplete({
  value,
  onChange,
  products,
  disabled = false,
  placeholder = 'Product name…',
}: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter products: starts-with first, then contains
  const filtered = value.trim().length === 0 ? [] : (() => {
    const q = value.trim().toLowerCase();
    const startsWith = products.filter((p) => p.toLowerCase().startsWith(q));
    const contains = products.filter(
      (p) => !p.toLowerCase().startsWith(q) && p.toLowerCase().includes(q),
    );
    return [...startsWith, ...contains].slice(0, MAX_RESULTS);
  })();

  const showDropdown = open && filtered.length > 0;

  // Reset highlight when results change
  useEffect(() => { setHighlighted(0); }, [filtered.length]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = useCallback((name: string) => {
    onChange(name);
    setOpen(false);
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      select(filtered[highlighted]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition-colors focus:border-[#6B7280] disabled:bg-[#F9FAFB]"
        autoComplete="off"
      />

      {showDropdown && (
        <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-[#E5E7EB] bg-white py-1 shadow-lg">
          {filtered.map((name, i) => {
            const q = value.trim().toLowerCase();
            const matchStart = name.toLowerCase().indexOf(q);
            return (
              <button
                key={name}
                type="button"
                onMouseDown={(e) => { e.preventDefault(); select(name); }}
                onMouseEnter={() => setHighlighted(i)}
                className={`flex w-full cursor-pointer items-center px-3 py-1.5 text-left text-sm transition-colors ${
                  i === highlighted ? 'bg-[#F3F4F6]' : 'hover:bg-[#F9FAFB]'
                }`}
              >
                {/* Bold the matched portion */}
                {matchStart >= 0 ? (
                  <>
                    <span className="text-[#9CA3AF]">{name.slice(0, matchStart)}</span>
                    <span className="font-medium text-[#111827]">{name.slice(matchStart, matchStart + q.length)}</span>
                    <span className="text-[#374151]">{name.slice(matchStart + q.length)}</span>
                  </>
                ) : (
                  <span className="text-[#374151]">{name}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
