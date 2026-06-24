import { Link, useLocation } from "react-router-dom"

export default function PackageCard({ pkg }) {
  const location = useLocation()
  if (!pkg) return null

  const prices = (pkg.tiers && Array.isArray(pkg.tiers) ? pkg.tiers : Object.values(pkg.tiers || {})).map(t => t.price).filter(p => typeof p === 'number' && p > 0)
  const price = prices.length > 0 ? Math.min(...prices) : 0
  const image = pkg.images?.[0]

  return (
    <Link
      to={`/package/${pkg.id}${location.search}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-soft border border-surface-container-high hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 block"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        {image ? (
          <img src={image} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-surface-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[48px] text-outline">image</span>
          </div>
        )}
        {/* Type Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/95 backdrop-blur-sm text-primary text-[11px] font-bold px-3 py-1 rounded-full shadow-sm">
            {pkg.type || "Tour"}
          </span>
        </div>
        {/* Duration Badge */}
        {pkg.duration && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
            {pkg.duration.nights}N/{pkg.duration.days}D
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-primary text-lg mb-1 line-clamp-1 group-hover:text-accent transition-colors">
          {pkg.title}
        </h3>
        <div className="flex items-center gap-1 text-on-surface-variant text-sm mb-3">
          <span className="material-symbols-outlined text-[16px]">location_on</span>
          <span className="line-clamp-1">{pkg.destination}</span>
        </div>

        {/* Features */}
        {pkg.experiences && pkg.experiences.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {pkg.experiences.slice(0, 4).map((exp, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px] text-accent">{exp.icon}</span>
                <span className="line-clamp-1">{exp.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Price & Rating */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-container-high">
          <div>
            {price > 0 && (
              <div className="flex items-baseline gap-1">
                <span className="price-tag text-accent text-xl">₹{price.toLocaleString("en-IN")}</span>
                <span className="text-xs text-on-surface-variant">/person</span>
              </div>
            )}
          </div>
          {pkg.rating > 0 && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined filled text-[16px] text-secondary">star</span>
              <span className="text-sm font-bold text-primary">{pkg.rating}</span>
              <span className="text-xs text-on-surface-variant">({pkg.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Provider */}
        {pkg.provider?.name && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-container-high">
            <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[11px] font-bold">
              {pkg.provider.avatar || pkg.provider.name[0]}
            </div>
            <span className="text-xs text-on-surface-variant flex-1 line-clamp-1">{pkg.provider.name}</span>
            {pkg.provider.verified && (
              <span className="material-symbols-outlined filled text-[14px] text-green-600">verified</span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
