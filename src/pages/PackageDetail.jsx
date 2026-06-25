import { useState, useEffect } from "react"
import { useParams, Link, useLocation } from "react-router-dom"
import TopBar from "../components/Topbar"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import ImageGallery from "../components/package/ImageGallery"
import ItineraryTimeline from "../components/package/ItineraryTimeline"
import InclusionsList from "../components/package/InclusionsList"
import PriceSidebar from "../components/package/PriceSidebar"
import { useApp } from "../context/AppContext"
import { getPackageDetailsAPI } from "../utils/packageApi"

export default function PackageDetail() {
  const { id } = useParams()
  const location = useLocation()
  const { state } = useApp()

  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTierIdx, setActiveTierIdx] = useState(0)

  useEffect(() => {
    window.scrollTo(0, 0)
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
          console.error("Error loading package details:", err)
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

  const isOwnPackage = state.user?.id === pkg?.agentId
  const displayItinerary = pkg?.itinerary || pkg?.itineraries?.luxury || pkg?.itineraries?.budget || []

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar />
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center animate-pulse">
          <span className="material-symbols-outlined text-[80px] text-outline animate-spin mb-4 block">sync</span>
          <h1 className="text-xl font-bold text-primary">Loading package...</h1>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar />
        <Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center">
          <span className="material-symbols-outlined text-[80px] text-outline">travel_explore</span>
          <h1 className="text-2xl font-bold text-primary mt-4">{error || "Package Not Found"}</h1>
          <p className="text-on-surface-variant mt-2">The package you're looking for doesn't exist.</p>
          <Link to="/search" className="inline-block mt-6 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors">
            Browse Packages
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const otherPackages = state.packages.filter((p) => p.id !== pkg.id).slice(0, 3)

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-lg py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-on-surface-variant mb-4">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/search" className="hover:text-primary transition-colors">Tour Packages</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary font-medium line-clamp-1">{pkg.title}</span>
        </nav>

        {/* Image Gallery */}
        <ImageGallery images={pkg.images} />

        {/* Package Header */}
        <div className="mt-6 mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{pkg.type}</span>
            {pkg.duration && (
              <span className="bg-accent/10 text-accent text-xs font-bold px-3 py-1 rounded-full">
                {pkg.duration.nights}N / {pkg.duration.days}D
              </span>
            )}
            {pkg.tags?.map((tag) => (
              <span key={tag} className="bg-surface-container text-on-surface-variant text-xs font-medium px-2 py-1 rounded-full">{tag}</span>
            ))}
          </div>
          <h1 className="font-display-lg text-[32px] md:text-[40px] text-primary font-bold">{pkg.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">location_on</span>
              <span className="text-sm font-medium">{pkg.destination}</span>
            </div>
            {pkg.rating > 0 && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined filled text-[18px] text-secondary">star</span>
                <span className="text-sm font-bold text-primary">{pkg.rating}</span>
                <span className="text-sm text-on-surface-variant">({pkg.reviewCount} reviews)</span>
              </div>
            )}
            {pkg.groupSize && (
              <div className="flex items-center gap-1 text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">group</span>
                <span className="text-sm">{pkg.groupSize.min}–{pkg.groupSize.max} travelers</span>
              </div>
            )}
          </div>
        </div>

        {/* Summary Bar */}
        <div className="bg-white rounded-xl border border-surface-container-high p-4 mb-8 flex flex-wrap items-center gap-6 shadow-soft">
          {pkg.pickup && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-accent">flight_land</span>
              <div><p className="text-[10px] text-outline font-bold uppercase">Pickup</p><p className="text-sm font-medium text-primary">{pkg.pickup}</p></div>
            </div>
          )}
          {pkg.dropoff && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-accent">flight_takeoff</span>
              <div><p className="text-[10px] text-outline font-bold uppercase">Drop-off</p><p className="text-sm font-medium text-primary">{pkg.dropoff}</p></div>
            </div>
          )}
          {pkg.groupSize && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-accent">group</span>
              <div><p className="text-[10px] text-outline font-bold uppercase">Group Size</p><p className="text-sm font-medium text-primary">{pkg.groupSize.min}–{pkg.groupSize.max}</p></div>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1 space-y-8">
            {/* Overview */}
            <section>
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">info</span>
                Overview
              </h2>
              <p className="text-on-surface leading-relaxed">{pkg.description}</p>
            </section>

            {/* Key Experiences */}
            {pkg.experiences?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">auto_awesome</span>
                  Key Experiences
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {pkg.experiences.map((exp, i) => (
                    <div key={i} className="bg-white rounded-xl border border-surface-container-high p-4 text-center hover:shadow-soft transition-all hover:-translate-y-0.5">
                      <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="material-symbols-outlined text-accent text-[22px]">{exp.icon}</span>
                      </div>
                      <p className="text-xs font-semibold text-primary">{exp.label}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Itinerary */}
            {displayItinerary.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">map</span>
                  Detailed Itinerary
                </h2>
                <div className="bg-white rounded-xl border border-surface-container-high p-5">
                  <ItineraryTimeline itinerary={displayItinerary} />
                </div>
              </section>
            )}

            {/* Inclusions */}
            <section>
              <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent">checklist</span>
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
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">shopping_bag</span>
                  Shopping Recommendations
                </h2>
                <div className="bg-white rounded-xl border border-surface-container-high p-5 shadow-soft">
                  <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{pkg.shoppingTips}</p>
                </div>
              </section>
            )}

            {/* Reviews */}
            {pkg.reviews?.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-accent">reviews</span>
                  Traveler Reviews
                </h2>
                <div className="space-y-4">
                  {pkg.reviews.map((r, i) => (
                    <div key={i} className="bg-white rounded-xl border border-surface-container-high p-5">
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span key={s} className={`material-symbols-outlined filled text-[16px] ${s <= r.rating ? "text-secondary" : "text-surface-container-high"}`}>
                            star
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-on-surface italic mb-3">"{r.text}"</p>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">
                          {r.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-primary">{r.name}</p>
                          <p className="text-xs text-on-surface-variant">{r.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar — Desktop */}
          <div className="hidden lg:block w-[340px] flex-shrink-0">
            <PriceSidebar pkg={pkg} activeTier={activeTierIdx} setActiveTier={setActiveTierIdx} />
          </div>
        </div>

        {/* Similar Packages */}
        {otherPackages.length > 0 && (
          <section className="mt-12 pt-8 border-t border-surface-container-high">
            <h2 className="text-xl font-bold text-primary mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {otherPackages.map((p) => {
                const prices = (p.tiers && Array.isArray(p.tiers) ? p.tiers : Object.values(p.tiers || {})).map(t => t.price).filter(val => typeof val === "number" && val > 0)
                const startP = prices.length > 0 ? Math.min(...prices) : 0
                return (
                  <Link key={p.id} to={`/package/${p.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-soft border border-surface-container-high hover:shadow-elevated transition-all hover:-translate-y-1">
                    <div className="h-44 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[40px] text-outline">image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-primary mb-1 line-clamp-1">{p.title}</h3>
                      <p className="text-xs text-on-surface-variant mb-2">{p.destination}</p>
                      {startP > 0 && (
                        <span className="price-tag text-accent">₹{startP.toLocaleString("en-IN")} / person</span>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-container-high shadow-elevated z-40 px-4 py-3">
        {isOwnPackage ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">This is your package.</span>
            <Link to="/agent/dashboard#packages" className="text-xs text-accent font-bold hover:underline">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <span className="price-tag text-xl text-accent">₹{(activeTierData?.price || 0).toLocaleString("en-IN")}</span>
              <span className="text-xs text-on-surface-variant ml-1">/person ({activeTierData?.name || "Standard"})</span>
            </div>
            <Link to={`/show-interest/${pkg.id}${location.search}`} className="px-6 py-3 bg-accent text-white font-bold rounded-xl cta-glow">
              Show Interest
            </Link>
          </div>
        )}
      </div>

      <div className="lg:hidden h-20" /> {/* Spacer for fixed bottom bar */}
      <Footer />
    </div>
  )
}
