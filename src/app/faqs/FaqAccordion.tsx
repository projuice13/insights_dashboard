'use client';

import { useState } from 'react';

interface Faq {
  question: string;
  answer: string;
}

const FAQS: Faq[] = [
  {
    question: 'How do I import customer data?',
    answer:
      'Go to Settings (top-right corner of the dashboard) and choose "Import CSV". Upload your monthly Sage export — new orders are appended to the existing history automatically. Re-uploading the same file is safe; duplicate orders are skipped.',
  },
  {
    question: 'What does the Churn Risk score mean?',
    answer:
      'Churn Risk is calculated from the gap between a customer\'s orders. A "High" risk means the customer\'s last order was significantly later than their usual ordering pattern. "Medium" is a moderate delay, and "Low" means they are ordering on schedule.',
  },
  {
    question: 'How do I assign a customer to a team member?',
    answer:
      'In the Customer Insights Dashboard, click the "Assign" pill in the Assigned column of any customer row. A dropdown will appear with all team members — select one to assign. Admins can also bulk-assign by selecting multiple customers with the checkboxes and using the action bar that appears.',
  },
  {
    question: 'What do the customer status tags mean?',
    answer:
      'Status tags let you categorise customers: Hot (active opportunity), Possible (potential), Seasonal (orders at certain times of year), No Response (not replying to contact), Dormant (inactive but not gone), and Deactivated (no longer a customer). Team members can tag their own assigned customers; admins can tag anyone. Deactivations raised by team members require admin approval.',
  },
  {
    question: 'Can team members see all customers?',
    answer:
      'Team members see the full customer list by default but the "Assigned to me" filter is on by default, so they only see their own contacts. They can turn this off in the Filters panel to browse the wider list. Deactivated customers are hidden from team members automatically.',
  },
  {
    question: 'What happens when a deactivated customer places a new order?',
    answer:
      'If a deactivated customer appears in a subsequent CSV import with a new order, they are automatically reactivated — their Deactivated status is cleared and they return to the active list.',
  },
  {
    question: 'What is the Postcode Checker?',
    answer:
      'The Postcode Checker is a separate tool that lets you look up whether a postcode falls within your delivery zones or coverage area. It opens in a new tab and does not require a separate login.',
  },
  {
    question: 'How do I reset a team member\'s password?',
    answer:
      'Admins can reset passwords via Settings → Manage Users. Click "Reset password" next to the relevant user — a new temporary password will be shown once. Share it with the user and they will be prompted to set a new password on their next login.',
  },
  {
    question: 'How do I add a call log note on a customer?',
    answer:
      'Open a customer by clicking their name in the table, then switch to the Comments tab in the side panel. Type your note and click "Add note". All team members and admins with access to that customer can see the notes. You can edit or delete your own notes.',
  },
];

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#E5E7EB] rounded-xl border border-[#E5E7EB] bg-white">
      {FAQS.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full cursor-pointer items-center justify-between px-6 py-4 text-left transition-colors hover:bg-[#F9FAFB]"
            >
              <span className="pr-6 text-sm font-medium text-[#111827]">{faq.question}</span>
              <svg
                className={`h-4 w-4 shrink-0 text-[#9CA3AF] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6l5 5 5-5" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-6 pb-5">
                <p className="text-sm leading-relaxed text-[#6B7280]">{faq.answer}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
