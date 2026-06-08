'use client';

import { useState } from 'react';
import SendResourcesModal from './SendResourcesModal';

export default function SendResourcesButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="cursor-pointer text-sm text-[#6B7280] underline underline-offset-2 transition-colors hover:text-[#374151]"
      >
        Send Resources Site Link
      </button>

      {open && <SendResourcesModal onClose={() => setOpen(false)} />}
    </>
  );
}
