import { cardClass, sectionTitleClass, thClass, tdClass } from './styles';

export type StepItem = string | { text: string; children?: StepItem[] };

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className={cardClass}>
      <h3 className={sectionTitleClass}>{title}</h3>
      <div className="space-y-4 px-5 py-4">{children}</div>
    </div>
  );
}

export function StepList({ items, ordered = false }: { items: StepItem[]; ordered?: boolean }) {
  const className = `${ordered ? 'list-decimal' : 'list-disc'} space-y-1.5 pl-5 text-sm text-[#374151]`;
  const ListTag = ordered ? 'ol' : 'ul';

  return (
    <ListTag className={className}>
      {items.map((item, i) => {
        const text = typeof item === 'string' ? item : item.text;
        const children = typeof item === 'string' ? undefined : item.children;
        return (
          <li key={i}>
            {text}
            {children && children.length > 0 && (
              <div className="mt-1.5">
                <StepList items={children} />
              </div>
            )}
          </li>
        );
      })}
    </ListTag>
  );
}

export function DataTable({ headers, rows, minWidth }: { headers: string[]; rows: string[][]; minWidth?: string }) {
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full border-collapse" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
            {headers.map((h, i) => (
              <th key={i} className={thClass}>{h}</th>
            ))}
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
  );
}

export function NotesBlock({ title = 'Notes', notes }: { title?: string; notes: string[] }) {
  return (
    <div className="rounded-lg bg-[#F9FAFB] px-4 py-3">
      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#9CA3AF]">{title}</p>
      <ul className="space-y-0.5 text-sm text-[#6B7280]">
        {notes.map((note, i) => <li key={i}>{note}</li>)}
      </ul>
    </div>
  );
}
