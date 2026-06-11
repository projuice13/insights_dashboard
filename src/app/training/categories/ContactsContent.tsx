import { cardClass, sectionTitleClass, thClass, tdClass } from './styles';

// ── Data ─────────────────────────────────────────────────────────────────────

const SUPPLIER_CONTACTS = [
  ['Beyond The', 'Bean', '401', '01179 533522'],
  ['CIM', 'Services', '402', '02382 026969'],
  ['Crops', 'Olivia', '403', '00325 6676431'],
  ['Darnells', 'Totnes', '404', '01803 862446'],
  ['Fuelcard', 'Services', '405', '01282 410700'],
  ['Gregorys', 'Cullompton', '406', '01884 35915'],
  ['Gregorys', 'Goods In', '407', '01884 836635'],
  ['Gregorys', 'Penny', '408', '01884 217051'],
  ['Run It Cool', 'Leeds Depot', '409', '01132 776359'],
  ['J and R', 'Main', '410', '01392 445510'],
  ['Mid Devon', 'Tyres', '411', '01392 360022'],
  ['Nargel', 'Langdons', '412', '01278 411114'],
  ['NFU', 'Main', '413', '01392 363107'],
  ['Peter', 'Green', '414', '01749 830824'],
  ['Plas', 'Farm', '415', '01392 337695'],
  ['Protyre', 'Main', '416', '07887 963193'],
  ['Robert', 'Hunts', '417', '01392 666700'],
  ['RVR', 'Main', '418', '01935 478826'],
  ['SMV', 'Main', '419', '01989 730255'],
  ['Tree Links', 'Fruit', '420', '01626 204204'],
  ['Vallance', 'LTD', '421', '01392 574500'],
  ['VW', 'Carrs', '422', '01395 204634'],
  ['Mercedez-Benz', 'Hill Barton', '423', '01935 478826'],
  ['SMV', 'Yeovil', '424', '01394 421140'],
  ['GAH', 'Main', '425', '01392 457201'],
  ['Still Forklifts', 'Emma', '426', '07939 066008'],
  ['DPD', 'Exeter', '427', '—'],
  ['DPD', 'Deliveries', '428', '—'],
  ['John Lafferty', 'Run It Cool', '430', '—'],
  ['Jesse', 'Argentex', '431', '—'],
  ['Kirsty', 'Run It Cool', '432', '—'],
  ['Head Office', 'Run It Cool', '433', '—'],
  ['Darnells', 'Newton Abbot', '434', '—'],
  ['Marshfield', 'Icecream', '435', '—'],
  ['Man Van', 'Exeter', '439', '—'],
  ['GSL', 'Website', '440', '—'],
];

const SUPPLIER_NOTES = [
  'RIC — 01414 888570',
  'DHL — 02476 937777 (Customer Service)',
  '02477 711907 — Option 3, Account Management',
];

const STAFF_CONTACTS = [
  ['David', 'Ford', '702', '07969 916251'],
  ['Lee', 'Hook', '703', '07704 500648'],
  ['Karol', 'Krol', '705', '07742 806003'],
  ['Ian', 'Richards', '706', '07377 421571'],
  ['Paul', 'Ford', '709', '07967 094441'],
  ['Daniel', 'Ramshaw', '712', '075[?]7 925460'],
  ['Jakub', 'London', '714', '07[?] [?]4 276749'],
  ['Andy', 'London', '715', '07950 741787'],
  ['Peter', 'Warrington', '717', '07[?]11 213540'],
  ['Andrew', 'Guerin', '718', '07[?]57 613351'],
];

const STAFF_NOTES = [
  'DHL — Marlon',
  'Shaun — 07804 443240',
  'Dan — 07777 523732',
];

// ── Shared component ─────────────────────────────────────────────────────────

function ContactTable({ title, rows, notes }: { title: string; rows: string[][]; notes?: string[] }) {
  return (
    <div className={cardClass}>
      <h3 className={sectionTitleClass}>{title}</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <th className={thClass}>First Name</th>
              <th className={thClass}>Last Name</th>
              <th className={thClass}>Speed Dial</th>
              <th className={thClass}>Number</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className={tdClass}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notes && notes.length > 0 && (
        <div className="border-t border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">Additional notes</p>
          <ul className="space-y-0.5 text-sm text-[#6B7280]">
            {notes.map((note, i) => <li key={i}>{note}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function ContactsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Contacts</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Supplier and staff contact lists.
        </p>
      </div>

      <ContactTable title="Suppliers Contact List" rows={SUPPLIER_CONTACTS} notes={SUPPLIER_NOTES} />
      <ContactTable title="Drivers / Staff Contact List" rows={STAFF_CONTACTS} notes={STAFF_NOTES} />
    </div>
  );
}
