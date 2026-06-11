import { SectionCard, StepList, DataTable, type StepItem } from './components';

// ── Data ─────────────────────────────────────────────────────────────────────

const ORDER_FLOW: StepItem[] = [
  {
    text: 'Basket — the customer adds products to their basket, which slides out as a panel from the right-hand side of the page.',
  },
  {
    text: 'Checkout — when the customer proceeds to checkout, they can select, add or edit addresses in their address library and add delivery instructions.',
  },
  {
    text: 'Payment (externally hosted) — after clicking "Place Order", the customer is taken to a payment page hosted by Lloyds Cardnet (not on our website), for security purposes. Payment is taken and the customer is then returned to the website.',
  },
];

const WEBSITE_ERRORS_HEADERS = ['Category', 'Issue', 'What it means', 'Likely cause', 'Actions', 'Escalation'];

const WEBSITE_ERRORS = [
  [
    'Basket',
    'Customer cannot access basket',
    'The customer cannot open or return to their basket.',
    'A cached session issue is preventing the basket from loading.',
    'Ask the customer to clear their browser cache and retry.',
    'If the issue continues after cache is cleared, pass to Tim.',
  ],
  [
    'Basket',
    'Basket icon opens a different page',
    'The basket link is redirecting because the customer is not eligible for delivery to their area.',
    'The postcode entered is outside our current delivery area.',
    "Confirm the customer's delivery postcode and check whether that postcode is covered.",
    'If coverage is unclear, confirm internally with Hollie or Lee before advising the customer.',
  ],
  [
    'Checkout',
    '504 Gateway Timeout or 500 Internal Server Error',
    'The checkout process is taking too long to respond, or the server has failed while loading the next step.',
    'Temporary high traffic, maintenance, or a short-term server issue.',
    'Ask the customer to wait a few minutes, clear cache if needed, and try the checkout again.',
    'If the error repeats, capture the time of failure and escalate for technical investigation.',
  ],
  [
    'Checkout',
    'Error appears when moving to payment',
    'The customer can reach checkout but receives an error when progressing to the payment page.',
    'A temporary server or connection issue between checkout and payment.',
    'Confirm exactly when the error appears and whether it happens every time they retry.',
    'If repeatable, log the issue with the customer account details and escalate.',
  ],
  [
    'Payment',
    'Payment details entered but transaction does not complete',
    'The customer has submitted card details, but the payment has not been authorised or completed.',
    'Common causes include insufficient funds, a blocked card, daily banking limits, or incomplete bank authentication.',
    'Ask the customer whether they received an authentication request from their bank and whether they completed it in their banking app.',
    'Advise the customer to complete the authentication step, then return to the payment page and try again.',
  ],
  [
    'Payment',
    'Payment still fails after authentication',
    'The payment attempt is still unsuccessful after the customer has completed bank verification.',
    'The card may be restricted by the bank, or the account may have reached a transaction limit.',
    'Ask the customer to contact their bank or try an alternative payment card.',
    'If the issue persists across payment methods, escalate for payment gateway review.',
  ],
];

// ── Main component ───────────────────────────────────────────────────────────

export default function WebsiteContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Website</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Common website errors and how to handle them.
        </p>
      </div>

      <SectionCard title="Customer Order Flow (Projuice / Crops Website)">
        <StepList items={ORDER_FLOW} ordered />
      </SectionCard>

      <SectionCard title="Potential Website Errors">
        <DataTable headers={WEBSITE_ERRORS_HEADERS} rows={WEBSITE_ERRORS} minWidth="1100px" />
      </SectionCard>
    </div>
  );
}
