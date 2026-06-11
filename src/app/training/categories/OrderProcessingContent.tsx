import { SectionCard, StepList, DataTable, NotesBlock, type StepItem } from './components';

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

const PHONE_ORDER_STEPS: StepItem[] = [
  "Take customer's delivery postcode",
  'Bring up a new order and input account name',
  'Check delivery address',
  'Take opening hours',
  "Take customer's name for the order",
  "Take down the number they're calling from if different to one already on the account",
  'Check location of the delivery for either T. or 1. codes',
  'Read order back',
  'Calculate delivery charge if applicable',
  'Do they need to pay? Payment link or payment over the phone?',
  'Confirm delivery date and when payment would need to be received by',
];

const BESPOKE_IMPORT_STEPS: StepItem[] = [
  {
    text: 'Choose your order number from the drop-down menu',
    children: ['Select Account', 'Choose Order Dispatch Depot'],
  },
  {
    text: 'Check address has pulled through correctly and update phone number',
    children: [
      {
        text: 'Opening Hours using 24-hour clock',
        children: [
          'Edit Item codes if RED',
          {
            text: 'Check order total matches',
            children: ['Select delivery area'],
          },
        ],
      },
      {
        text: 'Delivery Date using the delivery depot grid',
        children: ['Import order to SAGE'],
      },
      {
        text: 'Write SAGE order number on the paperwork',
        children: ['Write delivery depot code if required'],
      },
    ],
  },
  'Once imported to SAGE, go back into SAGE and highlight all your orders',
  {
    text: 'Allocate stock, tick and initial the pick note on your desk if fully allocated',
    children: [
      'Part-allocated stock: print sales order confirmation and highlight out-of-stock items, then dispose of the picking note',
      'Check stock in email or with Lee/warehouse for when stock arrives',
      {
        text: "If no stock is available or you're changing an item, update the order and reprint the pick note",
        children: ["If it's a DHL order, print the delivery note"],
      },
    ],
  },
];

const BESPOKE_IMPORT_NOTES = [
  'Highlight the order and click "Amend allocation" at the top of the page.',
  'Web orders for Chocolat need to be on account COL26 from the Chocolate website.',
];

const EMAIL_PO_STEPS: StepItem[] = [
  {
    text: 'Search the postcode / company name / email address',
    children: ['Look at the last order for opening hours', "Bring up the customer's account"],
  },
  "Click New order to input the customer's account number in the top-right corner",
  {
    text: "Go to the Order Tab — add opening hours in 24-hour format and check phone number, email address and delivery address. Add delivery date and await payment, or mark as on account",
    children: ['Check the Customer Contact area for the correct depot'],
  },
  {
    text: 'Go to the Details Tab — input product codes with the correct prefix for the correct depot (W. / T. / 1.)',
    children: ['Add the PO number or name in the right-hand box'],
  },
  {
    text: 'Check the number of boxes — 12 boxes or 6 boxes determines the delivery charge',
    children: [
      {
        text: 'Go to the Footer Tab to add the delivery charge',
        children: ['Tax code is always 20%', 'Go back to the Order Tab'],
      },
    ],
  },
  {
    text: 'Check if on account (ME/DD) → print picking note — or prepayment (cash) → email sales order confirmation and create a payment link to send to the customer',
    children: ['Save and allocate the order'],
  },
  {
    text: 'Print picking notes from reports. Part-allocated → print sales order confirmation and highlight unallocated products',
    children: ['If fully allocated, print the picking note'],
  },
  {
    text: 'DHL orders: once allocated, print the picking note and delivery note from reports',
    children: ['Put the order with either the south grid, north grid, or DHL'],
  },
];

const BUNDLE_NOTES = [
  'When importing orders, always change the bundle code to 1.',
  "Mixed panini boxes — check SAGE to add flavours.",
];

const MENU_BUNDLE_STEPS: StepItem[] = [
  'When in SAGE, add the product codes within the Menu bundle and zero the cost of each product — the price will only be reflected in the Bundle.',
  'In the MENU Bundle you need to add a Menu board.',
  'Customer can request a Promotional pack to go with it — add if requested.',
  'Check the order value matches the picking note and SAGE.',
];

const CUSTOM_BUNDLE_STEPS: StepItem[] = [
  'Custom bundle is when the customer chooses their flavours, so you zero the bundle line.',
  'Customer can request a Promotional pack to go with it — add if requested.',
  'Add the chosen products and amend the product prices on the pick note.',
  'Check the order value matches the picking note and SAGE.',
];

const BLENDER_INTRO_STEPS: StepItem[] = [
  'Import Order Software: edit the RED code on spares packs or blender twin packs.',
  'SAGE for editing and allocation: needs updating in SAGE to add additional products in the spares pack, twin packs, or extra jugs.',
];

const TWIN_PACK_STEPS: StepItem[] = [
  'In the SAGE order, over-type the original product code so it sets the price back to the original.',
  'Add extra jugs or blender if required.',
  'Amend the discount price on the top line (e.g. take the jug price × 2 away from the original total) and check it matches the original web order.',
];

const SPARES_PACK_STEPS: StepItem[] = [
  'In the SAGE order, over-type the original product code so it sets the price back to the original.',
  'Spares pack splits out to individual items — always check Type A or B for the drive socket.',
  'Add the blade and plastic spanner (zero the price on the spanner).',
];

const BLENDER_NOTES = [
  'Set product back to original price → add additional products → apply any discount.',
  'Spares packs — confirm Type A or Type B.',
];

const PRODUCT_CODES = [
  ['T.PROB950-002', '950 Plastic Spanner'],
  ['T.PROB950-004', '950 Blade'],
  ["T.PROB950-030", "HeavyDuty Type 'B' 950 Drive Socket (S/N from 1676)"],
  ['T.PROBLEND-950B', 'BASIC ProBlend 950 Touch Blender'],
  ['T.PROBLEND-950ENC', 'SE ProBlend 950 Touch Blender with Sound Enclosure'],
  ['T.PROBLEND-950JUG', 'JUG ProBlend Square Blender Jug 1.5L (No Warranty)'],
];

const SPLIT_ORDER_STEPS: StepItem[] = [
  'Example: clipboards and drive sockets being shipped separately via DHL.',
  'Highlight the order and click duplicate; delete items that are allocated so the new order only has items shipping via DHL.',
  'Change any codes to the correct depot (Exeter).',
  'Check quantity and change the customer contact to DHL Courier.',
  'Go to Footer to delete any delivery charges and add the delivery day.',
  'Save / allocate.',
  'As it is now a new DHL order, print the pick note and delivery note.',
  'Go back to the original order, delete the items being sent on DHL, then save and cross out those items on the picking note.',
  'Be aware that clipboards need to be amended in SAGE to add in Smoothie or Shake.',
];

const PAYMENT_LINK_STEPS: StepItem[] = [
  'Highlight order and print',
  {
    text: 'Hover over sales order confirmation',
    children: ['Choose email', 'Close page'],
  },
  {
    text: 'Double-click order and minimise screen',
    children: [
      {
        text: 'Go to the Google tab for Lloyds Cardnet',
        children: ['Generate payment URL', 'Date ahead by 7 days'],
      },
      {
        text: 'Add order number URL / SAGE order number',
        children: ['Add total amount'],
      },
    ],
  },
  {
    text: 'Complete company name, first line of address and postal code',
    children: ['Click continue and submit', 'Select copy payment link'],
  },
  {
    text: 'Go back to email drafts and delete the inserted payment link',
    children: ['Paste new link and press enter'],
  },
  'Check email address from the picking note; copy it from SAGE into the email address field',
];

const PHONE_PAYMENT_STEPS: StepItem[] = [
  {
    text: 'Always ask for the last 4 digits of the card they wish to use',
    children: ['Click the arrow next to A/C on SAGE to see activity', 'Last 4 digits are under the "Reference number" header'],
  },
  'If the customer wishes to use a new card, a payment link must be sent to them',
  {
    text: 'If the customer wishes to use a previously used card, open internet banking — DO NOT CLICK THE URL — go to the order number and enter "VT", a space, then the SAGE order number, then add the total amount',
    children: [
      {
        text: 'Add in customer details — customer name, first line of address and postal code',
        children: ['Take customer off hold'],
      },
      {
        text: 'Process the long card number, expiry date and security code',
        children: ['Click continue, then Submit', 'Pop-up will say approved or failed', 'Try details one more time in case of any errors'],
      },
      'If payment fails, send the customer a link to make payment',
    ],
  },
  {
    text: 'If payment is approved, end the call and go back into SAGE, add "paid DC"',
    children: ['Save order and print picking notes'],
  },
];

const ACCOUNT_NOTES: StepItem[] = [
  'Café Ori / Massarella — use their site number to search for accounts.',
  {
    text: 'You can duplicate the most recent order for this customer for delivery details.',
    children: ['Remember to delete the delivery charge and the products from the original order', 'Retype new products and add the delivery charge'],
  },
  'Send a Sales Order Confirmation via email to the site that ordered.',
];

// ── Main component ───────────────────────────────────────────────────────────

export default function OrderProcessingContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Order Processing</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          The customer order flow and processing orders in SAGE.
        </p>
      </div>

      <SectionCard title="Customer Order Flow (Projuice / Crops Website)">
        <StepList items={ORDER_FLOW} ordered />
      </SectionCard>

      <SectionCard title="Processing Orders Over the Phone">
        <StepList items={PHONE_ORDER_STEPS} ordered />
      </SectionCard>

      <SectionCard title="Bespoke Importing of Web Orders">
        <StepList items={BESPOKE_IMPORT_STEPS} />
        <NotesBlock notes={BESPOKE_IMPORT_NOTES} />
      </SectionCard>

      <SectionCard title="Email and PO Orders to Add to SAGE">
        <StepList items={EMAIL_PO_STEPS} />
      </SectionCard>

      <SectionCard title="Adding Bundles">
        <div>
          <p className="text-sm font-semibold text-[#111827]">Menu Bundle</p>
          <div className="mt-2">
            <StepList items={MENU_BUNDLE_STEPS} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">Custom Bundle</p>
          <div className="mt-2">
            <StepList items={CUSTOM_BUNDLE_STEPS} />
          </div>
        </div>
        <NotesBlock notes={BUNDLE_NOTES} />
      </SectionCard>

      <SectionCard title="Orders with Blender Spare Parts / Twin Packs">
        <StepList items={BLENDER_INTRO_STEPS} />
        <div>
          <p className="text-sm font-semibold text-[#111827]">Blender twin packs / extra jugs</p>
          <div className="mt-2">
            <StepList items={TWIN_PACK_STEPS} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">Spares pack</p>
          <div className="mt-2">
            <StepList items={SPARES_PACK_STEPS} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">Common spares &amp; blender product codes</p>
          <div className="mt-2">
            <DataTable headers={['Code', 'Product']} rows={PRODUCT_CODES} />
          </div>
        </div>
        <NotesBlock notes={[...BLENDER_NOTES, 'Spare parts, jugs and blenders are stocked in Twyford / Warrington — T.Prob / W.Prob.']} />
      </SectionCard>

      <SectionCard title="Splitting Off Orders in SAGE">
        <StepList items={SPLIT_ORDER_STEPS} />
      </SectionCard>

      <SectionCard title="Sending Payment Links from Cardnet">
        <StepList items={PAYMENT_LINK_STEPS} />
      </SectionCard>

      <SectionCard title="Taking Payment Over the Phone">
        <StepList items={PHONE_PAYMENT_STEPS} />
      </SectionCard>

      <SectionCard title="Account-Specific Notes">
        <StepList items={ACCOUNT_NOTES} />
      </SectionCard>
    </div>
  );
}
