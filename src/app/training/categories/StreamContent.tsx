import { SectionCard, StepList, NotesBlock, type StepItem } from './components';

// ── Data ─────────────────────────────────────────────────────────────────────

const CSV_STEPS: StepItem[] = [
  {
    text: 'Delete old CSV from the Sage order import tab',
    children: ['In SAGE click filter (follow example below)'],
  },
  {
    text: "Filter where order allocated/despatched status is not equal to '3 — Cancelled' and not equal to '8 — Fully Despatched'",
    children: ['Apply'],
  },
  {
    text: 'This brings up all allocated / part-allocated orders that have not been dispatched',
    children: [
      {
        text: 'Ctrl/Shift, scroll down, go to reports',
        children: ['GRID CSV for Routes', 'Export'],
      },
      {
        text: 'Save document to Grid CSV — change to CSV file',
        children: [
          {
            text: 'Over-type CSV — click Grid CSV',
            children: ['Click Save', 'Open Documents', 'Click open CSV'],
          },
          {
            text: 'Click top-left arrow to highlight CSV and copy',
            children: ['Go back to Grid'],
          },
        ],
      },
      {
        text: 'Highlight the Grid "Sage orders import" tab with the left arrow',
        children: ['Paste in values into Sage orders import'],
      },
    ],
  },
  'Go to the Grid template to check all orders have pulled through on the main page',
];

const FILTER_SETUP = [
  "Only select records from 'Sales orders'",
  "Where: Order allocated/despatched status — Is Not Equal To — '3 - Cancelled (none despatched)'",
  "And: Order allocated/despatched status — Is Not Equal To — '8 - Fully Despatched (Complete)'",
];

const MISSED_ORDER_STEPS: StepItem[] = [
  {
    text: 'Go into SAGE',
    children: ['Click Filter', 'Open'],
  },
  'If doing the South Grid — check the Main Grid filter',
  {
    text: 'If doing the North Grid — check the RIC Grid filter',
    children: ['Click and open', 'Apply'],
  },
  {
    text: 'Ctrl + Shift in SAGE to highlight orders',
    children: ['Print List', 'Check against the Grid'],
  },
];

const STREAM_PROCESS_1: StepItem[] = [
  'Go to Grid orders ready to plan',
  'Go to the Stream uploader on the desktop',
  'Highlight order numbers in the Grid and copy',
  {
    text: 'Go to the Stream Uploader and "Get list from the Clipboard"',
    children: ['Stream uploader will bring up the orders'],
  },
  'Check the number of sales orders and export to Excel',
  'This PC → DATA → Front desk Stream → Stream uploader → click OK',
  {
    text: 'A pop-up will say "created spreadsheet" — click OK and open the spreadsheet',
    children: [
      {
        text: 'Change delivery date to the day of delivery',
        children: ['Copy the top cell, drag it down and paste'],
      },
      {
        text: 'Check every delivery has opening hours; if not, add them in',
        children: [
          'Search in SAGE for any missed delivery details',
          'File → Save As Excel workbook → Save → OK',
          'Close the Excel sheet and go into Stream on Google',
          {
            text: 'Click the menu in the top-right corner',
            children: ['Choose "order upload" from the dropdown'],
          },
        ],
      },
      {
        text: 'Choose the file to upload ("allow duplicates" unticked)',
        children: ['Scroll to the bottom, click open, upload'],
      },
    ],
  },
  {
    text: 'Double-check the number of orders uploaded matches the Grid',
    children: ['Menu → Advanced planning → returns you to the home page'],
  },
  'Let Lee know everything is on Stream so he can plan the routes',
];

const COPY_GRID_STEPS: StepItem[] = [
  {
    text: 'Click on the Grid Template tab',
    children: ['Right-click', 'Move or copy', 'Click Grid template', 'Create copy (tick box) → OK', 'Change tab name to the delivery date', 'Click off'],
  },
  {
    text: 'Click the top-left box and copy the whole grid',
    children: ['Right-click → copy', 'Right-click → paste values', 'Delete blank boxes below'],
  },
  'Copy any delivery notes onto the new grid',
];

const DELIVERY_NOTES_CHECK: StepItem[] = [
  "Ensure the customer's name matches the drivers' notes section, to confirm the correct delivery instructions have pulled across.",
  'If the name does not match, there may be multiple customers with the same postcode.',
];

const DELIVERY_NOTES_LOOKUP: StepItem[] = [
  'Go to the drivers notes import tab, Ctrl + F to search for the postcode and click "find all".',
  "This brings up all customers with that postcode — copy the correct drivers' notes and paste them into your copy of the Grid for that delivery day.",
];

const STREAM_PROCESS_2: StepItem[] = [
  'Menu → Advanced planning (home page)',
  "Click on drivers' routes; use the snipping tool for the route and print it out",
  'Write down the driver\'s name, start time, and last 3 digits of the van registration',
  'Scan for RED flags — these are customers you need to call as delivery will be earlier. Hover over "I" for information to get customer details',
  "Options if they're not going to be available: what's the earliest we can deliver; leave in a safe space; can the driver call when nearby? If they don't answer, leave a voicemail and send an email",
  'On the printout, write "confirmed" once spoken to the customer; if not reached, note "LEFT VM/EMAIL"',
  {
    text: 'Once called, add ETAs',
    children: ['Go back to the grid → the copy for that delivery day → Ctrl + F to search the SAGE order number column → add a drop number to each order'],
  },
  'From the top-right corner, highlight to the last order on the grid',
  'Click sort and filter → custom sort by column P → OK',
  'Highlight the order under the last drop of your route, right-click → insert 3 blank lines at the bottom, copy the header, insert copied cells, remove blank columns and coloured cells to tidy up',
  'Highlight the weight column, click auto-sum twice to get the total weight, add it to the bottom, and add a thick line around the total weight',
  "In the header, add the driver's name, start time and registration number",
  "Add confirmed ETAs; check the drivers' notes for anything else to do",
  {
    text: 'Back in Stream',
    children: [
      {
        text: "To get the drivers' delivery notes and labels to send to the delivery depot",
        children: ['Click on the driver\'s route', 'Actions'],
      },
    ],
  },
];

const STREAM_PROCESS_2_CONTINUED: StepItem[] = [
  {
    text: 'Print',
    children: ['Dropdown box', 'Delivery list → click show'],
  },
  'Check all orders have the correct depot code; if any codes need exchanging, write on the printout and run the code-changer process if required',
  {
    text: 'Back to Stream',
    children: [
      {
        text: 'Go to delivery notes and hit Save',
        children: ['Documents'],
      },
      {
        text: 'Save as "[Driver]\'s delivery notes"',
        children: ['Actions', 'Print again', 'Click labels'],
      },
      {
        text: '"Show" brings up the labels',
        children: ['Save documents', 'Save as "[Driver]\'s labels"'],
      },
      'If the email boxes are greyed out, go to Actions',
      'Email and send — this sends customers their tracking',
      {
        text: 'If the email box is greyed out, the email is missing in SAGE — search the customer\'s postcode in SAGE to find it',
        children: ['Go back into Stream → double-click the customer → edit → paste in primary email → save'],
      },
      'Click the third dot and lock the driver\'s route → click Yes on the pop-up',
      {
        text: 'Go into Emails → open new email → add the delivery notes and labels',
        children: ['Email to the depot and cc Lee — "[Driver]\'s Route"'],
      },
    ],
  },
];

const WESTFIELDS_STEPS: StepItem[] = [
  {
    text: 'Go to Contractor Tracker in bookmarks',
    children: ['Login', 'Choose Westfield London → scroll → continue', 'Select Type — Tenant/Retail'],
  },
  {
    text: 'Click the corresponding letter for the company name',
    children: ['Click the company', 'Add location to list and click OK', 'Vehicle type — Transit'],
  },
  {
    text: 'Click the vehicle registration for the delivery vehicle',
    children: [
      'Continue',
      'One-off delivery → Confirm',
      'Choose date → Continue → click time → Continue',
      {
        text: 'Carrier & Supplier — Projuice',
        children: ["Driver's name", 'Phone number', 'Tick accept Rules → Continue'],
      },
    ],
  },
  'Screenshot and send with delivery notes and labels',
  'If forgotten, take a picture and add it to the group chat',
];

const CODE_CHANGER_STEPS: StepItem[] = [
  'Go to SAGE',
  {
    text: 'Search the order number to be changed',
    children: [
      {
        text: 'Amend allocations',
        children: ['Click off the order', 'Unallocate stock'],
      },
    ],
  },
  {
    text: 'Open the code-changer software → add the SAGE order number',
    children: [
      'Find Sales Order',
      'Change to the correct depot',
      {
        text: 'Assign new product codes',
        children: ['Click OK'],
      },
      'Check it has pulled through to the new depot code',
      'Go back into SAGE and allocate the order',
    ],
  },
  'Triple-check, then click amend allocations to confirm the code has changed',
];

// ── Main component ───────────────────────────────────────────────────────────

export default function StreamContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Stream</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Building the delivery Grid, uploading routes to Stream, and planning driver routes.
        </p>
      </div>

      <SectionCard title="How to Get the CSV for the Grid">
        <p className="text-sm text-[#374151]">
          Once you&apos;ve processed all orders in the morning and added them to the Grid:
        </p>
        <StepList items={CSV_STEPS} />
        <div>
          <p className="text-sm font-semibold text-[#111827]">SAGE filter setup</p>
          <div className="mt-2">
            <StepList items={FILTER_SETUP} />
          </div>
        </div>
        <NotesBlock notes={['If saving a new CSV, make sure the old CSV spreadsheet is not open.']} />
      </SectionCard>

      <SectionCard title="Filter to Check That No Orders Have Been Missed">
        <StepList items={MISSED_ORDER_STEPS} />
      </SectionCard>

      <SectionCard title="Stream Process — Start at 11:15am">
        <StepList items={STREAM_PROCESS_1} />
      </SectionCard>

      <SectionCard title="Create Copy of Delivery Grid">
        <StepList items={COPY_GRID_STEPS} />
      </SectionCard>

      <SectionCard title="Delivery Notes (New Process)">
        <p className="text-sm text-[#374151]">
          Both SAGE order delivery information and drivers&apos; notes now pull onto the Grid, so we no longer need to copy across the delivery notes.
        </p>
        <NotesBlock notes={["When in the Grid template, please do not amend the drivers' note section."]} />
        <div>
          <p className="text-sm font-semibold text-[#111827]">
            Once you have created your copy for the delivery date and removed the formulas, do this check
          </p>
          <div className="mt-2">
            <StepList items={DELIVERY_NOTES_CHECK} />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#111827]">To find the correct driver&apos;s notes</p>
          <div className="mt-2">
            <StepList items={DELIVERY_NOTES_LOOKUP} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Stream Process 2 — Noon to 1pm">
        <StepList items={STREAM_PROCESS_2} />
      </SectionCard>

      <SectionCard title="Stream Process 2 — Continued">
        <StepList items={STREAM_PROCESS_2_CONTINUED} />
      </SectionCard>

      <SectionCard title="Booking In a Westfields Delivery">
        <StepList items={WESTFIELDS_STEPS} />
      </SectionCard>

      <SectionCard title="Code Changer">
        <StepList items={CODE_CHANGER_STEPS} />
      </SectionCard>
    </div>
  );
}
