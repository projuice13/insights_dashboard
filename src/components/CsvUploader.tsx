'use client';

import { useCallback, useState } from 'react';

interface CsvUploaderProps {
  onUpload: (file: File) => void;
  error: string | null;
  loading: boolean;
}

export default function CsvUploader({ onUpload, error, loading }: CsvUploaderProps) {
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.csv')) return;
      onUpload(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="w-full max-w-lg px-4">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[#111827] tracking-tight">
            Customer Churn Dashboard
          </h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Import your Sage export — new orders will be added to your history
          </p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed bg-white p-12 text-center transition-colors ${
            dragging
              ? 'border-[#6B7280] bg-[#F3F4F6]'
              : 'border-[#E5E7EB] hover:border-[#9CA3AF]'
          }`}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6]">
            <svg className="h-6 w-6 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>

          {loading ? (
            <p className="text-sm text-[#6B7280]">Processing…</p>
          ) : (
            <>
              <p className="text-sm font-medium text-[#374151]">
                Drag and drop your CSV here
              </p>
              <p className="mt-1 text-xs text-[#9CA3AF]">or</p>
              <label className="mt-3 inline-block cursor-pointer rounded-lg bg-[#111827] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#374151]">
                Choose file
                <input
                  type="file"
                  accept=".csv"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </label>
            </>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
