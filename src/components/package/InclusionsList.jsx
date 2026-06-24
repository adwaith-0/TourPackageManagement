export default function InclusionsList({ inclusions = [], exclusions = [], specialInclusions = "", specialExclusions = "", activeTier = "luxury" }) {
  const incList = Array.isArray(inclusions) ? inclusions : (inclusions?.[activeTier] || [])
  const excList = Array.isArray(exclusions) ? exclusions : (exclusions?.[activeTier] || [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Inclusions */}
      <div className="bg-green-50/50 rounded-xl border border-green-200/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
          </div>
          <h4 className="font-bold text-primary text-sm">What's Included</h4>
        </div>
        <ul className="space-y-2.5">
          {incList.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="material-symbols-outlined filled text-[16px] text-green-500 mt-0.5 flex-shrink-0">check_circle</span>
              <span className="text-sm text-on-surface">{item}</span>
            </li>
          ))}
          {specialInclusions && (
            <li className="flex items-start gap-2.5 bg-green-100/40 p-2.5 rounded-lg border border-green-200/60 mt-2">
              <span className="material-symbols-outlined filled text-[16px] text-green-600 mt-1 flex-shrink-0">stars</span>
              <div className="text-xs text-green-800">
                <span className="block font-bold text-[9px] uppercase tracking-wider text-green-600 mb-0.5">Special inclusion for {activeTier} tier</span>
                {specialInclusions}
              </div>
            </li>
          )}
          {incList.length === 0 && !specialInclusions && (
            <li className="text-sm text-on-surface-variant italic">No inclusions specified</li>
          )}
        </ul>
      </div>

      {/* Exclusions */}
      <div className="bg-red-50/50 rounded-xl border border-red-200/50 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px] text-red-500">cancel</span>
          </div>
          <h4 className="font-bold text-primary text-sm">What's Not Included</h4>
        </div>
        <ul className="space-y-2.5">
          {excList.map((item, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="material-symbols-outlined filled text-[16px] text-red-400 mt-0.5 flex-shrink-0">cancel</span>
              <span className="text-sm text-on-surface">{item}</span>
            </li>
          ))}
          {specialExclusions && (
            <li className="flex items-start gap-2.5 bg-red-100/40 p-2.5 rounded-lg border border-red-200/60 mt-2">
              <span className="material-symbols-outlined filled text-[16px] text-red-600 mt-1 flex-shrink-0">stars</span>
              <div className="text-xs text-red-800">
                <span className="block font-bold text-[9px] uppercase tracking-wider text-red-600 mb-0.5">Special exclusion for {activeTier} tier</span>
                {specialExclusions}
              </div>
            </li>
          )}
          {excList.length === 0 && !specialExclusions && (
            <li className="text-sm text-on-surface-variant italic">No exclusions specified</li>
          )}
        </ul>
      </div>
    </div>
  )
}
