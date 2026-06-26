import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import TopBar from "../components/Topbar"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { useApp } from "../context/AppContext"
import { formatPhoneForWhatsApp } from "../utils/phone"
import { getPackageDetailsAPI } from "../utils/packageApi"

export default function MyInquiries() {
  const { state, dispatch } = useApp()
  const [packagesMap, setPackagesMap] = useState({})

  // Show inquiries made by this user
  const myInquiries = (state.inquiries || []).filter(
    (inq) => inq.userId === state.user?.id
  )

  useEffect(() => {
    if (myInquiries.length === 0) return
    const uniqueIds = [...new Set(myInquiries.map((inq) => inq.packageId))]
    
    uniqueIds.forEach((pkgId) => {
      if (packagesMap[pkgId]) return // Already fetched
      getPackageDetailsAPI(pkgId)
        .then((data) => {
          if (data) {
            setPackagesMap((prev) => ({ ...prev, [pkgId]: data }))
          }
        })
        .catch((err) => {
          console.error(`Error loading package ${pkgId}:`, err)
        })
    })
  }, [myInquiries, packagesMap])

  if (!state.user) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar /><Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center">
          <span className="material-symbols-outlined text-[64px] text-outline">lock</span>
          <h1 className="text-2xl font-bold text-primary mt-4">Login Required</h1>
          <p className="text-on-surface-variant mt-2">Please login to view your inquiries.</p>
          <button onClick={() => dispatch({ type: "OPEN_LOGIN_MODAL" })} className="inline-block mt-6 px-6 py-3 bg-accent text-white rounded-lg font-semibold">Login</button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar /><Navbar />

      <div className="max-w-[1280px] mx-auto px-lg py-8">
        <h1 className="font-headline-lg text-[28px] text-primary font-bold mb-2">My Inquiries</h1>
        <p className="text-on-surface-variant text-sm mb-8">Track the status of your tour package inquiries</p>

        {myInquiries.length === 0 ? (
          <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[40px] text-accent">mail</span>
            </div>
            <h3 className="text-lg font-bold text-primary mb-2">No Inquiries Yet</h3>
            <p className="text-on-surface-variant text-sm mb-6 max-w-sm mx-auto">
              Browse our tour packages and express your interest to get started!
            </p>
            <Link to="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors cta-glow">
              <span className="material-symbols-outlined text-[18px]">search</span>
              Browse Packages
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myInquiries.slice().reverse().map((inq) => {
              const pkg = packagesMap[inq.packageId]
              return (
                <div key={inq.id} className="bg-white rounded-xl border border-surface-container-high overflow-hidden hover:shadow-elevated transition-all">
                  <div className="flex flex-col md:flex-row">
                    {/* Package Image */}
                    <div className="w-full md:w-48 h-40 md:h-auto flex-shrink-0 overflow-hidden">
                      {pkg?.images?.[0] ? (
                        <img src={pkg.images[0]} alt={inq.packageTitle} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-[40px] text-outline">image</span>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-primary text-base">{inq.packageTitle || "Tour Package"}</h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            Ref: <span className="font-bold text-primary">{inq.refNumber}</span>
                          </p>
                        </div>
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                          inq.status === "New" ? "bg-blue-100 text-blue-700" :
                          inq.status === "Responded" ? "bg-green-100 text-green-700" :
                          inq.status === "Converted" ? "bg-accent/10 text-accent" :
                          "bg-gray-100 text-gray-600"
                        }`}>
                          {inq.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                        <div>
                          <p className="text-on-surface-variant">Tier</p>
                          <p className="font-semibold text-primary capitalize">{inq.tier || "—"}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant">Travelers</p>
                          <p className="font-semibold text-primary">{inq.travelers || "—"}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant">Travel Date</p>
                          <p className="font-semibold text-primary">{inq.fromDate || "—"}</p>
                        </div>
                        <div>
                          <p className="text-on-surface-variant">Submitted</p>
                          <p className="font-semibold text-primary">{inq.createdAt ? new Date(inq.createdAt).toLocaleDateString() : "—"}</p>
                        </div>
                      </div>

                      {inq.specialRequirements && (
                        <p className="text-xs text-on-surface-variant mt-3 italic bg-surface-container-low p-2 rounded-lg">
                          "{inq.specialRequirements}"
                        </p>
                      )}

                      <div className="flex gap-3 mt-4">
                        {pkg && !pkg.archived ? (
                          <Link to={`/package/${pkg.id}`} className="text-xs font-semibold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">
                            View Package
                          </Link>
                        ) : pkg ? (
                          <span className="text-xs font-semibold text-outline bg-surface-container-high px-3 py-1.5 rounded-lg">
                            Package Ended
                          </span>
                        ) : null}
                        {pkg?.provider?.whatsapp && (
                          <a
                            href={`https://wa.me/${formatPhoneForWhatsApp(pkg.provider.whatsapp)}?text=${encodeURIComponent(`Hi, I've submitted inquiry ${inq.refNumber} for "${inq.packageTitle}". Can you provide an update?`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg whatsapp-glow flex items-center gap-1"
                            style={{ backgroundColor: "#25D366" }}
                          >
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                            Follow Up
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
