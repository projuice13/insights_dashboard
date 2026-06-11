import { cardClass, sectionTitleClass, thClass, tdClass } from './styles';

// ── Data ─────────────────────────────────────────────────────────────────────

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
    area: 'Greater London',
    cities: '',
    service: 'Mondays to Fridays between 6:30am and 3:30pm. Deliveries are generally made within 2 working days where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
  },
  {
    area: 'Birmingham',
    cities: '',
    service: 'Thursdays (and occasionally Tuesdays depending on order volume) between 6:30am and 3:30pm, where orders are received by 10am the preceding working day (this may be subject to change due to order volumes).',
  },
  {
    area: 'Leicester & Coventry',
    cities: '',
    service: 'Tuesdays or Thursdays between 6:30am and 3:30pm, where orders are received by 10am the preceding working day (this may be subject to change due to order volumes).',
  },
  {
    area: 'North (Central)',
    cities: 'Liverpool, Manchester, Leeds, Warrington, Wigan, Bolton, Oldham, Huddersfield, Halifax & Wakefield',
    service: 'Mondays to Fridays between 6:30am and 3:30pm. Deliveries are generally made within 2 working days where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
  },
  {
    area: 'North West',
    cities: 'Preston, Blackburn, Blackpool, Bradford & Lancashire',
    service: 'Deliveries are generally made on Fridays between 6:30am and 3:30pm where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
  },
  {
    area: 'North East',
    cities: 'Newcastle, Durham, Harrogate, York, Darlington & Middlesbrough',
    service: 'Deliveries are generally made on Wednesdays or Thursdays between 6:30am and 3:30pm where orders are received by 10am on Tuesdays (this may be subject to change due to order volumes).',
  },
  {
    area: 'North Midlands',
    cities: 'Chester, Crewe, Stockport, Sheffield, Telford, Stoke on Trent, Doncaster, Derby & Nottingham',
    service: 'Deliveries are generally made on Tuesdays or Thursdays between 6:30am and 3:30pm where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
  },
  {
    area: 'Scotland',
    cities: '',
    service: 'Order before 10am on a Tuesday for delivery on a Thursday or Friday of that week (this may be subject to change due to order volumes).',
  },
  {
    area: 'Bristol, South Wales & Bath',
    cities: '',
    service: 'Tuesdays or Wednesdays between 6:30am and 3:30pm, where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
  },
  {
    area: 'South Devon & Cornwall',
    cities: '',
    service: 'Fridays between 6:30am and 3:30pm, where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
  },
  {
    area: 'South Coast',
    cities: '',
    service: 'Fridays between 6:30am and 3:30pm, where orders are received by 10am the preceding day (this may be subject to change due to order volumes).',
  },
  {
    area: 'Gloucester & Worcester',
    cities: '',
    service: 'Tuesdays or Thursdays between 6:30am and 3:30pm, where orders are received by 10am the preceding working day (this may be subject to change due to order volumes).',
  },
  {
    area: 'Oxford, Luton & Milton Keynes',
    cities: '',
    service: 'Wednesdays between 6:30am and 3:30pm, where orders are received by 10am the preceding working day (this may be subject to change due to order volumes).',
  },
  {
    area: 'Cambridge, Southend & Chelmsford',
    cities: '',
    service: 'Thursdays between 6:30am and 3:30pm, where orders are received by 10am the preceding working day (this may be subject to change due to order volumes).',
  },
  {
    area: 'All other areas',
    cities: '',
    service: 'Please continue to place your order and we will call to confirm your delivery day.',
  },
];

const FROZEN_CHARGES = [
  ['1', '£55', '£70'],
  ['2', '£50', '£65'],
  ['3', '£45', '£60'],
  ['4', '£40', '£55'],
  ['5', '£35', '£50'],
  ['6', '£30', '£45'],
  ['7', '£25', '£40'],
  ['8', '£20', '£35'],
  ['9', '£15', '£30'],
  ['10', '£10', '£25'],
  ['11', '£5', '£20'],
  ['12', 'FREE delivery', '£15'],
  ['13', '£5 discount', '£10'],
  ['14', '£10 discount', '£5'],
  ['15', '£15 discount', 'FREE delivery'],
  ['16', '£15 discount', '£5 discount'],
  ['17', '£15 discount', '£10 discount'],
  ['18+', '£15 discount', '£15 discount'],
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

// ── Main component ───────────────────────────────────────────────────────────

export default function MapsContent() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-[#111827]">Delivery Info</h2>
        <p className="mt-1 text-sm text-[#9CA3AF]">
          Delivery zone reference maps and schedules.
        </p>
      </div>

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
              {row.cities && <p className="mt-0.5 text-xs text-[#9CA3AF]">{row.cities}</p>}
              <p className="mt-2 text-sm text-[#374151]">{row.service}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Frozen delivery charges */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Frozen Delivery Charges</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className={thClass}>Boxes</th>
                <th className={thClass}>England</th>
                <th className={thClass}>Scotland</th>
              </tr>
            </thead>
            <tbody>
              {FROZEN_CHARGES.map(([boxes, england, scotland], i) => (
                <tr key={i} className="border-b border-[#F3F4F6] last:border-0">
                  <td className={`${tdClass} font-medium text-[#111827] whitespace-nowrap`}>{boxes}</td>
                  <td className={tdClass}>{england}</td>
                  <td className={tdClass}>{scotland}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-[#F3F4F6] bg-[#F9FAFB] px-5 py-3">
          <p className="text-sm text-[#6B7280]">
            Scotland pricing as of Monday 13th April 2026.
          </p>
        </div>
      </div>

      {/* Ambient only delivery */}
      <div className={cardClass}>
        <h3 className={sectionTitleClass}>Ambient Only Delivery</h3>
        <div className="space-y-3 px-5 py-4 text-sm text-[#374151]">
          <p>If your basket consists entirely of non frozen/ambient products, a flat-fee of £5.95 will apply. Prices exclude VAT.</p>
          <p>Ambient-only orders are typically dispatched using DHL&apos;s next-day delivery service; however, Projuice cannot guarantee next-day arrival.</p>
          <p>Please note deliveries to Northern Ireland and Scotland may take longer and may incur a delivery surcharge.</p>
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
