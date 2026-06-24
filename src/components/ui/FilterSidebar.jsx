import { useState } from "react"

export default function FilterSidebar({ filters, setFilters, onReset }) {
  const [collapsed, setCollapsed] = useState({})
  const toggle = (key) => setCollapsed((p) => ({ ...p, [key]: !p[key] }))

  const durations = ["1 Night", "2-3 Nights", "4-6 Nights", "7+ Nights"]
  const types = ["Group Tour", "Private Tour", "Honeymoon", "Adventure", "Pilgrimage", "Wildlife", "Cultural"]

  const updateFilter = (updates) => setFilters((f) => ({ ...f, ...updates }))

  return (
    <div className="bg-white rounded-xl border border-surface-container-high shadow-soft overflow-hidden sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-container-high">
        <h3 className="font-bold text-primary text-sm">Filters</h3>
        <button onClick={onReset} className="text-xs text-accent font-semibold hover:underline">Reset All</button>
      </div>

      {/* Price Range */}
      <Section title="Price Range" collapsed={collapsed.price} onToggle={() => toggle("price")}>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice || ""}
            onChange={(e) => updateFilter({ minPrice: e.target.value })}
            className="w-full h-9 px-3 border border-surface-container-high rounded-lg text-xs focus:border-primary outline-none"
          />
          <span className="text-on-surface-variant text-xs">to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice || ""}
            onChange={(e) => updateFilter({ maxPrice: e.target.value })}
            className="w-full h-9 px-3 border border-surface-container-high rounded-lg text-xs focus:border-primary outline-none"
          />
        </div>
      </Section>

      {/* Duration */}
      <Section title="Duration" collapsed={collapsed.duration} onToggle={() => toggle("duration")}>
        <div className="space-y-2">
          {durations.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.durations?.includes(d) || false}
                onChange={() => {
                  const cur = filters.durations || []
                  const next = cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]
                  updateFilter({ durations: next })
                }}
                className="w-4 h-4 rounded border-surface-container-high text-accent focus:ring-accent cursor-pointer"
              />
              <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{d}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Tour Type */}
      <Section title="Tour Type" collapsed={collapsed.type} onToggle={() => toggle("type")}>
        <div className="space-y-2">
          {types.map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.types?.includes(t) || false}
                onChange={() => {
                  const cur = filters.types || []
                  const next = cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]
                  updateFilter({ types: next })
                }}
                className="w-4 h-4 rounded border-surface-container-high text-accent focus:ring-accent cursor-pointer"
              />
              <span className="text-sm text-on-surface group-hover:text-primary transition-colors">{t}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Rating */}
      <Section title="Rating" collapsed={collapsed.rating} onToggle={() => toggle("rating")}>
        <div className="space-y-2">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => updateFilter({ minRating: filters.minRating === r ? null : r })}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                filters.minRating === r
                  ? "bg-accent/10 text-accent font-semibold border border-accent/20"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`material-symbols-outlined filled text-[16px] ${i < r ? "text-secondary" : "text-outline/30"}`}>star</span>
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, collapsed, onToggle, children }) {
  return (
    <div className="border-b border-surface-container-high last:border-0">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-container-low/50 transition-colors">
        <span className="text-sm font-semibold text-primary">{title}</span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform" style={{ transform: collapsed ? "rotate(180deg)" : "" }}>
          expand_more
        </span>
      </button>
      {!collapsed && <div className="px-5 pb-4">{children}</div>}
    </div>
  )
}
