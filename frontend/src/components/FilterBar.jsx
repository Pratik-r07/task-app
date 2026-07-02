const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
]

export default function FilterBar({ active, onChange }) {
  return (
    <div className="filter-bar">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          className={`filter-chip ${active === f.key ? 'active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
