import { SectionCard, StepList, DataTable, NotesBlock, type StepItem } from './components';

// ── Data ─────────────────────────────────────────────────────────────────────

const BOOKING_STEPS: StepItem[] = [
  {
    text: 'To book deliveries on the DHL website you need to have the picking note and delivery note',
    children: [
      {
        text: 'Confirm how many boxes to book',
        children: ['Add the weight'],
      },
      'Check the delivery address',
      {
        text: 'Click business or residential',
        children: ['Search by postal code'],
      },
      'Click on correct address and edit if required',
      'Add SAGE order number in customer no. box',
      {
        text: 'Add email address and telephone number',
        children: ['Delivery options all stay the same', 'Customer ref is SAGE order number'],
      },
    ],
  },
  'Extended liability if required — check sheet for value of consignment',
  {
    text: 'Print label and clip with delivery note and picking note',
    children: ['Take it down to Karol before 1pm'],
  },
];

const BOX_CONFIGURATIONS = [
  ['Cups, Lids, Straws (+ any other takeaway packaging)', '1 box to 1 box'],
  ['Choc-o-Lait Sticks', '16 sticks to 1 box'],
  ['Choc-o-Lait Spoons', '8 spoons to 1 box'],
  ['Spare Blender Parts: drive sockets, blades, spanners, tamper tool', 'Multiple parts to 1 box'],
  ['Problend SE', '2 blenders to 1 box'],
  ['Problend Basic', '4 blenders to 1 box'],
  ['Problend Jugs', 'Multiple to 1 box (if sending alongside blenders, check with warehouse)'],
  ['POS Packs', '1 box to 1 box'],
  ['Clipboards, Menu Boards, Pavement Signs', '1 box to 1 box'],
  ["Wolfy's Porridge Pots", '4 boxes to 1 box'],
];

const INSURANCE_LEVEL_1 = [
  '3 or more Problend Jugs',
  '2 or more basic Problend blenders',
  '1 or more basic Problend blender with 1 or more extra jug',
  '1 or more SE Problend blender',
  'One Shot Swirl machine',
  '17 or more COL sticks',
  '7 or more COL spoons',
  '4 or more boxes of cups or lids',
  '2 or more boxes of Zuma Hot Chocolate Powder',
  "15 or more boxes of Wolfy's Porridge",
];

const INSURANCE_LEVEL_2 = [
  '100 cases or more of COL sticks',
  '55 cases or more of COL spoons',
  'Large blender / equipment orders',
];

const INSURANCE_THRESHOLDS = [
  ['Level 1', '£100 – £1000'],
  ['Level 2', '£1000 – £2000'],
];

// ── Main component ───────────────────────────────────────────────────────────

export default function DhlContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">DHL</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Booking ambient deliveries on DHL, box configurations and insurance levels.
        </p>
      </div>

      <SectionCard title="Booking Ambient Deliveries on DHL">
        <StepList items={BOOKING_STEPS} />
      </SectionCard>

      <SectionCard title="DHL Box Configurations">
        <DataTable headers={['Item', 'Configuration']} rows={BOX_CONFIGURATIONS} />
      </SectionCard>

      <SectionCard title="Insurance">
        <div>
          <p className="text-sm font-semibold text-[#111827]">Examples of when you will need to use Level 1</p>
          <div className="mt-2">
            <StepList items={INSURANCE_LEVEL_1} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">Examples of when you will need to use Level 2</p>
          <div className="mt-2">
            <StepList items={INSURANCE_LEVEL_2} />
          </div>
        </div>
        <DataTable headers={['Level', 'Cost price (not customer order total)']} rows={INSURANCE_THRESHOLDS} />
        <NotesBlock notes={['Use the cost price thresholds above when an order doesn’t fall into one of the listed examples.']} />
      </SectionCard>
    </div>
  );
}
