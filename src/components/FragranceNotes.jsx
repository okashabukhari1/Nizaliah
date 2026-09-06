export default function FragranceNotes({ notes, tone = 'light' }) {
  const dark = tone === 'dark'
  const groups = [
    { key: 'top', label: 'TOP NOTES', items: notes.top },
    { key: 'heart', label: 'HEART NOTES', items: notes.heart },
    { key: 'base', label: 'BASE NOTES', items: notes.base },
  ]

  return (
    <div className="grid gap-8 md:grid-cols-3">
      {groups.map((g) => (
        <div key={g.key} data-reveal>
          <p
            className={`mb-3 font-sans text-[10px] tracking-[0.3em] ${
              dark ? 'text-[#D4AF37]' : 'text-[#7B5E3B]'
            }`}
          >
            {g.label}
          </p>
          <ul className="flex flex-col gap-2">
            {g.items.map((note) => (
              <li
                key={note}
                className={`border-b pb-2 font-display text-xl font-light ${
                  dark
                    ? 'border-[#F8F4EE]/15 text-[#F8F4EE]'
                    : 'border-[#3E2E22]/15 text-[#3E2E22]'
                }`}
              >
                {note}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
