import { useParams, Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import TopBar from "../../components/Topbar"
import Navbar from "../../components/Navbar"
import Footer from "../../components/Footer"
import ImageGallery from "../../components/package/ImageGallery"
import ItineraryTimeline from "../../components/package/ItineraryTimeline"
import InclusionsList from "../../components/package/InclusionsList"
import WhatsAppButton from "../../components/ui/WhatsAppButton"
import { useApp } from "../../context/AppContext"
import { getPackageDetailsAPI, inactivatePackageAPI } from "../../utils/packageApi"

export default function PackagePreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  // Authentication check
  useEffect(() => {
    if (!state.user || state.user.type !== "agent") {
      dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "agent" } })
      navigate("/", { replace: true })
    }
  }, [state.user, navigate, dispatch])

  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTierIdx, setActiveTierIdx] = useState(0)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getPackageDetailsAPI(id)
      .then((data) => {
        if (active) {
          if (data) {
            setPkg(data)
          } else {
            setError("Package not found")
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Error loading package details for preview:", err)
          setError("Failed to load package details.")
          setLoading(false)
        }
      })

    return () => { active = false }
  }, [id])

  // Normalize tiers to new array format
  const normalizedTiers = pkg
    ? (Array.isArray(pkg.tiers) 
        ? pkg.tiers 
        : [
            { name: "Budget", price: pkg.tiers?.budget?.price || 0, hotel: pkg.tiers?.budget?.hotel || "", specialInclusions: pkg.tiers?.budget?.inclusions || "", specialExclusions: "" },
            { name: "Luxury", price: pkg.tiers?.luxury?.price || 0, hotel: pkg.tiers?.luxury?.hotel || "", specialInclusions: pkg.tiers?.luxury?.inclusions || "", specialExclusions: "" }
          ].filter(t => t.price > 0))
    : []

  const activeTierData = normalizedTiers[activeTierIdx] || normalizedTiers[0] || { name: "", price: 0, hotel: "", specialInclusions: "", specialExclusions: "" }

  const displayItinerary = pkg?.itinerary || pkg?.itineraries?.luxury || pkg?.itineraries?.budget || []

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete (deactivate) this package? It will not show up in traveler search results.")) {
      try {
        await inactivatePackageAPI(pkg.id)
        navigate("/agent/dashboard")
      } catch (err) {
        console.error("Error deleting package:", err)
        alert(err.message || "Failed to delete package")
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar /><Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center animate-pulse">
          <span className="material-symbols-outlined text-[80px] text-outline animate-spin mb-4 block">sync</span>
          <h1 className="text-xl font-bold text-primary">Loading package preview...</h1>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar /><Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center">
          <span className="material-symbols-outlined text-[80px] text-outline">inventory_2</span>
          <h1 className="text-2xl font-bold text-primary mt-4">{error || "Package Not Found"}</h1>
          <Link to="/agent/dashboard" className="inline-block mt-6 px-6 py-3 bg-accent text-white rounded-lg font-semibold">Back to Dashboard</Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Preview Banner */}
      <div className="preview-banner text-white py-3 px-4 sticky top-0 z-50">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">visibility</span>
            <span className="text-sm font-semibold">PREVIEW MODE — This is how travelers will see your package</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/agent/edit-package/${pkg.id}`} className="px-4 py-1.5 border border-white/50 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-colors">
              Continue Editing
            </Link>
            <Link to="/agent/dashboard" className="px-4 py-1.5 bg-white text-accent text-xs font-bold rounded-lg hover:bg-white/90 transition-colors">
              Publish Now
            </Link>
          </div>
        </div>
      </div>

      <Navbar />

      <div className="max-w-[1280px] mx-auto px-lg py-6">
        {/* Gallery */}
        <ImageGallery images={pkg.images} />

        {/* Header */}
        <div className="mt-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{pkg.type}</span>
            {pkg.duration && (
              <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">
                {pkg.duration.nights}N / {pkg.duration.days}D
              </span>
            )}
          </div>
          <h1 className="font-display-lg text-[32px] text-primary font-bold">{pkg.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-on-surface-variant text-sm">
            {pkg.fromLocation && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-accent">flight_land</span>
                <span className="font-semibold text-outline text-[10px] uppercase">From:</span> {pkg.fromLocation}
              </span>
            )}
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-accent">location_on</span>
              <span className="font-semibold text-outline text-[10px] uppercase">To:</span> {pkg.destination}
            </span>
            {pkg.groupSize && (
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">group</span>
                {pkg.groupSize.min}–{pkg.groupSize.max} travelers
              </span>
            )}
          </div>
        </div>

        {/* Two Column */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left */}
          <div className="flex-1 space-y-8">
            {/* Description */}
            <section>
              <h2 className="text-lg font-bold text-primary mb-3">Overview</h2>
              <p className="text-on-surface leading-relaxed">{pkg.description}</p>
            </section>

            {/* Experiences */}
            {pkg.experiences?.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-primary mb-3">Key Experiences</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {pkg.experiences.map((exp, i) => (
                    <div key={i} className="bg-white rounded-xl border border-surface-container-high p-3 text-center">
                      <span className="material-symbols-outlined text-accent text-[24px]">{exp.icon}</span>
                      <p className="text-xs font-semibold text-primary mt-1">{exp.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary */}
            {displayItinerary.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-primary mb-3">Detailed Itinerary</h2>
                <div className="bg-white rounded-xl border border-surface-container-high p-5">
                  <ItineraryTimeline itinerary={displayItinerary} />
                </div>
              </section>
            )}

            {/* Inclusions */}
            <section>
              <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                Inclusions & Exclusions
                <span className="text-xs font-normal text-on-surface-variant bg-surface-container px-2 py-1 rounded-md ml-2 capitalize">
                  {activeTierData.name} Tier
                </span>
              </h2>
              <InclusionsList
                inclusions={pkg.inclusions}
                exclusions={pkg.exclusions}
                specialInclusions={activeTierData.specialInclusions || activeTierData.inclusions}
                specialExclusions={activeTierData.specialExclusions}
                activeTier={activeTierData.name}
              />
            </section>

            {/* Shopping Recommendations */}
            {pkg.shoppingTips && (
              <section>
                <h2 className="text-lg font-bold text-primary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent text-[20px]">shopping_bag</span>
                  Shopping Recommendations
                </h2>
                <div className="bg-white rounded-xl border border-surface-container-high p-5 shadow-soft">
                  <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{pkg.shoppingTips}</p>
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-[340px] flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* Price Card */}
              <div className="bg-white rounded-2xl border border-surface-container-high shadow-elevated p-5">
                {/* Tier Selector */}
                {normalizedTiers.length > 1 && (
                  <div className="flex bg-surface-container-low rounded-xl p-1 mb-4 overflow-x-auto hide-scroll">
                    {normalizedTiers.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTierIdx(idx)}
                        className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                          activeTierIdx === idx ? "bg-primary text-white shadow-md" : "text-on-surface-variant hover:text-primary"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="price-tag text-3xl text-accent">₹{(activeTierData?.price || 0).toLocaleString("en-IN")}</span>
                    <span className="text-sm text-on-surface-variant">/person</span>
                  </div>
                  {activeTierData?.bedSize && (
                    <p className="text-xs font-semibold text-accent mt-0.5">{activeTierData.bedSize}</p>
                  )}
                  {activeTierData?.hotel && (
                    <p className="text-xs text-on-surface-variant mt-1">{activeTierData.hotel}</p>
                  )}
                </div>
                <button className="w-full py-3 bg-accent text-white font-bold rounded-xl cta-glow opacity-60 cursor-not-allowed">
                  Show Interest (Preview)
                </button>
                {pkg.provider?.whatsapp && (
                  <div className="mt-3">
                    <WhatsAppButton phone={pkg.provider.whatsapp} message={`Inquiry about ${pkg.title}`} label="WhatsApp" fullWidth size="md" />
                  </div>
                )}
              </div>

              {/* Provider */}
              {pkg.provider && (
                <div className="bg-white rounded-xl border border-surface-container-high p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                      {pkg.provider.avatar || pkg.provider.name?.[0]}
                    </div>
                    <div>
                      <p className="font-bold text-primary text-sm">{pkg.provider.name}</p>
                      <p className="text-xs text-on-surface-variant">{pkg.provider.email}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-surface-container-high shadow-elevated z-40">
        <div className="max-w-[1280px] mx-auto px-lg py-4 flex items-center justify-between">
          <div className="flex gap-3">
            <Link to={`/agent/edit-package/${pkg.id}`} className="px-6 py-3 border-2 border-primary text-primary font-bold rounded-xl hover:bg-primary hover:text-white transition-all">
              Edit Package
            </Link>
            <button 
              type="button"
              onClick={handleDelete}
              className="px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-all border border-red-200 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Package
            </button>
          </div>
          <Link to="/agent/dashboard" className="px-8 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all cta-glow">
            Publish Package
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}
