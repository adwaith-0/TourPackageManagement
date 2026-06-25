import { Link } from "react-router-dom"
import WhatsAppButton from "../ui/WhatsAppButton"
import { useApp } from "../../context/AppContext"
import { formatPhoneForCall } from "../../utils/phone"

export default function PriceSidebar({ pkg, activeTier, setActiveTier }) {
  const { state, dispatch } = useApp()

  if (!pkg) return null

  const isOwnPackage = state.user?.id === pkg.agentId

  const normalizedTiers = Array.isArray(pkg.tiers) 
    ? pkg.tiers 
    : [
        { name: "Budget", price: pkg.tiers?.budget?.price || 0, hotel: pkg.tiers?.budget?.hotel || "", specialInclusions: pkg.tiers?.budget?.inclusions || "", specialExclusions: "" },
        { name: "Luxury", price: pkg.tiers?.luxury?.price || 0, hotel: pkg.tiers?.luxury?.hotel || "", specialInclusions: pkg.tiers?.luxury?.inclusions || "", specialExclusions: "" }
      ].filter(t => t.price > 0)

  const currentTier = normalizedTiers[activeTier] || normalizedTiers[0]
  const price = currentTier?.price || 0
  const hotel = currentTier?.hotel || ""

  return (
    <div className="sticky top-28 space-y-4">
      {/* Pricing Card */}
      <div className="bg-white rounded-2xl border border-surface-container-high shadow-elevated p-5">
        {/* Tier Selector */}
        {normalizedTiers.length > 1 && (
          <div className="flex flex-wrap bg-surface-container-low rounded-xl p-1 mb-4 gap-1">
            {normalizedTiers.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTier(idx)}
                className={`flex-1 min-w-[80px] py-2.5 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  activeTier === idx ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="text-center mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="price-tag text-3xl text-accent">₹{price.toLocaleString("en-IN")}</span>
            <span className="text-sm text-on-surface-variant">/person</span>
          </div>
          {currentTier?.bedSize && (
            <p className="text-xs font-semibold text-accent mt-0.5">{currentTier.bedSize}</p>
          )}
          {hotel && <p className="text-xs text-on-surface-variant mt-1">{hotel}</p>}
          {pkg.duration && (
            <p className="text-xs text-outline mt-1">{pkg.duration.nights}N / {pkg.duration.days}D</p>
          )}
        </div>

        {/* CTA */}
        {isOwnPackage ? (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center mb-3">
            <p className="text-xs font-semibold text-primary">This is your package.</p>
            <Link to="/agent/dashboard#packages" className="text-xs text-accent font-bold hover:underline mt-1 block">View in Dashboard</Link>
          </div>
        ) : !state.user ? (
          <button
            onClick={() => dispatch({ type: "OPEN_LOGIN_MODAL" })}
            className="block w-full py-3.5 bg-accent text-white text-center font-bold rounded-xl hover:bg-accent/90 transition-all cta-glow mb-3"
          >
            Show Interest
          </button>
        ) : (
          <Link
            to={`/show-interest/${pkg.id}?tier=${encodeURIComponent(currentTier?.name || "")}`}
            className="block w-full py-3.5 bg-accent text-white text-center font-bold rounded-xl hover:bg-accent/90 transition-all cta-glow mb-3"
          >
            Show Interest
          </Link>
        )}

        {/* WhatsApp */}
        {pkg.provider?.whatsapp && (
          <WhatsAppButton
            phone={pkg.provider.whatsapp}
            message={`Hi, I'm interested in your "${pkg.title}" tour package.`}
            label="Chat on WhatsApp"
            fullWidth
            size="md"
          />
        )}

        {pkg.provider?.phone && (
          <button
            onClick={(e) => {
              if (!state.user) {
                e.preventDefault()
                dispatch({ type: "OPEN_LOGIN_MODAL" })
              } else {
                window.location.href = `tel:${formatPhoneForCall(pkg.provider.phone)}`
              }
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 mt-2 border border-surface-container-high rounded-xl text-sm font-medium text-primary hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
            Call Provider
          </button>
        )}
      </div>

      {/* Provider Card */}
      {pkg.provider && (
        <div className="bg-white rounded-2xl border border-surface-container-high shadow-soft p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
              {pkg.provider.avatar || pkg.provider.name?.[0]}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-primary text-sm">{pkg.provider.name}</h4>
                {pkg.provider.verified && (
                  <span className="material-symbols-outlined filled text-[16px] text-green-600">verified</span>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-on-surface-variant">
                <span className="material-symbols-outlined filled text-[14px] text-secondary">star</span>
                <span className="font-semibold">{pkg.provider.rating}</span>
                <span>({pkg.provider.reviewCount} reviews)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-on-surface-variant">Trusted travel partner on TourIQ. Verified identity and business documents.</p>
        </div>
      )}
    </div>
  )
}
