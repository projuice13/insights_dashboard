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

const POSTCODE_ZONES = [
  ['Bristol Bath', 'Bristol, Bath, Swindon, Chippenham, Cirencester, Taunton, Wells, Glastonbury'],
  ['Birmingham', 'Birmingham, Worcester, Stroud, Gloucester, Cheltenham, Hereford, Dursley'],
  ['Leicester', 'Leicester, Coventry, Leamington Spa'],
  ['South Wales', 'Cardiff, Newport, Cwmbran'],
  ['London', 'Inside M25, Luton, Milton Keynes, South End, Essex, Northampton, Peterborough, Oxford, Guildford, Reading, Slough'],
  ['North', 'Above Leicester'],
  ['Scotland', 'Above Carlisle'],
  ['South', 'Brighton, Southampton, Portsmouth, Dorset, Salisbury'],
  ['South West', 'Devon & Cornwall'],
  ['DHL', 'Non-Frozen Orders'],
  ['Collection', 'Collection from Exeter or Twyford depot'],
  ['Pallet', 'Large pallet customers'],
  ['FSP', 'Food Service Partners'],
];

const FROZEN_SCHEDULE = [
  {
    area: 'Central North',
    cities: 'Liverpool, Manchester, Warrington, Wigan, Bolton, Oldham, Huddersfield, Halifax, Wakefield',
    service: 'Frozen delivery to the Central North areas — Mondays to Fridays between 6am and 3pm. Deliveries are generally made within 2 working days where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
    postcodes: 'L, WN, WA, BL, M, OL, HX, HD, WF, LS',
  },
  {
    area: 'North West',
    cities: 'Preston, Blackburn, Bradford, Lancashire',
    service: 'Frozen delivery to the North West area — Deliveries are generally made on Fridays between 6am and 3pm where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
    postcodes: 'FY, PR, BB, BD',
  },
  {
    area: 'North East',
    cities: 'Newcastle, Durham, Harrogate, York, Darlington, Middlesbrough',
    service: 'Frozen delivery to the North East area — Deliveries are generally made on Wednesdays or Thursdays between 6am and 3pm where orders are received by 10am on Tuesdays (this may be subject to change due to order volumes).',
    postcodes: 'NE18, NE45, NE44, NE43, NE42, NE17, NE39, NE16, NE11, NE9, NE38, NE15, NE41, NE40, NE21, NE8, NE10, NE35, NE36, NE34, NE32, NE31, NE33, NE20, NE13, NE5, NE4, NE3, NE2, NE1, NE6, NE7, NE12, NE27, NE28, NE29, NE30, NE25, NE26, NE23, NE24, NE22, NE62, NE63, NE64, YO1, YO24, YO23, YO31, YO10, YO19, YO8, YO26, YO30, YO32, YO51, YO61, YO60, YO7, YO62, YO18, YO13, YO22, YO21, DH, DL, TS, HG',
  },
  {
    area: 'North Midlands',
    cities: 'Chester, Crewe, Stockport, Sheffield, Telford, Stoke on Trent, Doncaster, Derby, Nottingham, Staffordshire',
    service: 'Frozen delivery to the North Midlands area — Deliveries are generally made on Tuesdays or Thursdays between 6am and 3pm where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
    postcodes: 'DN14, DN6, DN5, DN12, DN1, DN2, DN3, DN4, DN9, DN10, DN11, DN7, DN8, DN15, DN16, DN17, NG, S, DE, SK, ST, TF, CW, CH',
  },
];

const FSP_PROVIDERS = [
  ['Blue', 'Premier Frozen Foods'],
  ['Green', 'Upton Farm Frozen Foods'],
  ['Pink', 'Bikodi'],
  ['Uncoloured', 'Hunts Foodservice'],
  ['Yellow', 'SJB Foods'],
  ['Purple', 'Waterdene Foodservice'],
  ['Pink/Red', 'Cool Cuisine'],
  ['Light Blue', 'McClures'],
];

const FSP_NOTES = [
  'Isle of Man',
  'Robinsons',
  'McClures — Cumbria',
  'Note: Smoothies, Shakes, Ice Cream',
];

// ── Shared styles ────────────────────────────────────────────────────────────

const cardClass = 'rounded-xl border border-[#E5E7EB] bg-white overflow-hidden';
const sectionTitleClass = 'px-5 py-4 border-b border-[#F3F4F6] text-sm font-semibold text-[#111827]';
const thClass = 'px-4 py-2.5 text-left text-xs font-medium uppercase tracking-wide text-[#6B7280] whitespace-nowrap';
const tdClass = 'px-4 py-2 text-sm text-[#374151] align-top';

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

export default function MapsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Maps</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Delivery zone reference maps, schedules and contact lists.
        </p>
      </div>

      {/* Contact lists */}
      <ContactTable title="Suppliers Contact List" rows={SUPPLIER_CONTACTS} notes={SUPPLIER_NOTES} />
      <ContactTable title="Drivers / Staff Contact List" rows={STAFF_CONTACTS} notes={STAFF_NOTES} />

      {/* UK Postcode Delivery Map */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>UK Postcode Delivery Map — Regional Zones</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className={thClass}>Zone</th>
                <th className={thClass}>Includes</th>
              </tr>
            </thead>
            <tbody>
              {POSTCODE_ZONES.map(([zone, includes], i) => (
                <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                  <td className={`${tdClass} font-medium text-[#111827] whitespace-nowrap`}>{zone}</td>
                  <td className={tdClass}>{includes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3">
          <p className="text-sm text-[#6B7280]">
            Highlighted/labelled regions on the original map: Scotland, North, Leicester, London, South, South West, Birmingham, South Wales, Bristol Bath.
          </p>
        </div>
      </div>

      {/* Frozen delivery schedule */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Frozen Delivery Schedule by Area</h3>
        <div className="divide-y divide-[#F3F4F6]">
          {FROZEN_SCHEDULE.map((row) => (
            <div key={row.area} className="px-5 py-4">
              <p className="text-sm font-semibold text-[#111827]">{row.area}</p>
              <p className="mt-0.5 text-xs text-[#9CA3AF]">{row.cities}</p>
              <p className="mt-2 text-sm text-[#374151]">{row.service}</p>
              <p className="mt-2 text-xs text-[#6B7280]">
                <span className="font-medium uppercase tracking-wide text-[#9CA3AF]">Postcodes: </span>
                {row.postcodes}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Food Service Providers map */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Food Service Providers Map</h3>
        <p className="px-5 pt-4 text-sm text-[#6B7280]">
          Hand-drawn map of England &amp; Wales (regions: Wales, West Midlands, East Midlands, Anglia, London, South East, South West) — colours on the map correspond to the providers below.
        </p>
        <div className="overflow-x-auto px-5 py-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className={thClass}>Colour</th>
                <th className={thClass}>Provider</th>
              </tr>
            </thead>
            <tbody>
              {FSP_PROVIDERS.map(([colour, provider], i) => (
                <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                  <td className={`${tdClass} font-medium text-[#111827] whitespace-nowrap`}>{colour}</td>
                  <td className={tdClass}>{provider}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">Additional notes</p>
          <ul className="space-y-0.5 text-sm text-[#6B7280]">
            {FSP_NOTES.map((note, i) => <li key={i}>{note}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
