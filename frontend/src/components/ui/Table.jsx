/** Minimal, restrained data table for genuinely tabular content (e.g. the audit log). */
export default function Table({ columns, rows, rowKey = (r) => r.id }) {
  return (
    <div className="border border-[var(--border)] rounded-[var(--r-md)] overflow-x-auto">
      <table className="w-full text-sm border-collapse min-w-[560px]">
        <thead>
          <tr className="border-b border-[var(--border)] bg-[var(--surface-sunken)]">
            {columns.map((c) => (
              <th
                key={c.key}
                className="text-left font-semibold text-[0.68rem] uppercase tracking-wide text-[var(--ink-faint)] px-4 py-2.5"
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="border-b border-[var(--border)] last:border-b-0 transition-colors duration-150 hover:bg-[var(--surface-sunken)]"
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 align-top text-[var(--ink)]">
                  {c.render ? c.render(row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
