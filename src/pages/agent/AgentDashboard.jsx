import { useState, useEffect, useRef } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import AgentSidebar from "../../components/agent/AgentSidebar"
import { useApp } from "../../context/AppContext"
import { formatPhoneForCall } from "../../utils/phone"
import { listPackagesByUserAPI, activatePackageAPI, inactivatePackageAPI } from "../../utils/packageApi"

export default function AgentDashboard() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const mainRef = useRef(null)
  const [activePage, setActivePage] = useState(() => {
    const hash = window.location.hash
    if (hash === "#packages") return "packages"
    if (hash === "#inquiries") return "inquiries"
    return "dashboard"
  })

  // Authentication check
  useEffect(() => {
    if (!state.user || state.user.type !== "agent") {
      dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "agent" } })
      navigate("/", { replace: true })
    }
  }, [state.user, navigate, dispatch])

  // Scroll to section based on URL hash
  useEffect(() => {
    const hash = location.hash
    let targetId = ""
    let page = "dashboard"
    if (hash === "#packages") {
      targetId = "section-packages"
      page = "packages"
    } else if (hash === "#inquiries") {
      targetId = "section-inquiries"
      page = "inquiries"
    }
    
    // Defer state update to avoid warnings about synchronous setState in useEffect
    const pageTimer = setTimeout(() => {
      setActivePage(page)
    }, 0)

    let scrollTimer
    if (targetId) {
      scrollTimer = setTimeout(() => {
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        }
      }, 100)
    } else if ((hash === "" || hash === "#dashboard") && mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: "smooth" })
    }

    return () => {
      clearTimeout(pageTimer)
      if (scrollTimer) clearTimeout(scrollTimer)
    }
  }, [location.hash])

  // Scrollspy to update active page highlight in sidebar as the user scrolls
  useEffect(() => {
    const mainEl = mainRef.current
    if (!mainEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === "section-packages") {
              setActivePage("packages")
            } else if (entry.target.id === "section-inquiries") {
              setActivePage("inquiries")
            }
          }
        })
      },
      {
        root: mainEl,
        rootMargin: "-20% 0px -60% 0px", // triggers when section is in upper-middle part
      }
    )

    const pkgsEl = document.getElementById("section-packages")
    const inqsEl = document.getElementById("section-inquiries")
    if (pkgsEl) observer.observe(pkgsEl)
    if (inqsEl) observer.observe(inqsEl)

    const handleScroll = () => {
      if (mainEl.scrollTop < 100) {
        setActivePage("dashboard")
      }
    }
    mainEl.addEventListener("scroll", handleScroll)

    return () => {
      observer.disconnect()
      mainEl.removeEventListener("scroll", handleScroll)
    }
  }, [state.user])

  const [myPackages, setMyPackages] = useState([])
  const [loadingPackages, setLoadingPackages] = useState(true)
  const [errorPackages, setErrorPackages] = useState(null)

  const fetchPackages = () => {
    if (!state.user?.id) return
    listPackagesByUserAPI(state.user.id)
      .then((data) => {
        setMyPackages(data)
        setLoadingPackages(false)
      })
      .catch((err) => {
        console.error("Error fetching packages:", err)
        setErrorPackages("Failed to load packages.")
        setLoadingPackages(false)
      })
  }

  useEffect(() => {
    fetchPackages()
  }, [state.user?.id])

  // Show inquiries for all of THIS agent's packages (including archived ones so history is preserved)
  const myPackageIds = myPackages.map((p) => p.id)
  const myInquiries = (state.inquiries || []).filter(
    (inq) => myPackageIds.includes(inq.packageId)
  )
  const newInquiries = myInquiries.filter((i) => i.status === "New")

  const handleStatusChange = (inquiryId, newStatus) => {
    dispatch({ type: "UPDATE_INQUIRY_STATUS", payload: { id: inquiryId, status: newStatus } })
  }

  const handleActivate = async (pkgId) => {
    try {
      await activatePackageAPI(pkgId)
      fetchPackages()
    } catch (err) {
      console.error("Error activating package:", err)
      alert(err.message || "Failed to activate package")
    }
  }

  const handleInactivate = async (pkgId) => {
    if (window.confirm("Are you sure you want to deactivate/inactivate this package? It will not show up in traveler search results.")) {
      try {
        await inactivatePackageAPI(pkgId)
        fetchPackages()
      } catch (err) {
        console.error("Error inactivating package:", err)
        alert(err.message || "Failed to inactivate package")
      }
    }
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <AgentSidebar activePage={activePage} />

      {/* Main scrollable area */}
      <main ref={mainRef} className="flex-1 md:ml-[256px] overflow-y-auto pb-20 md:pb-8">
        {/* Top Bar */}
        <div className="sticky top-0 bg-white border-b border-surface-container-high z-30 px-6 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-primary">Dashboard</h1>
              <p className="text-sm text-on-surface-variant">Welcome back, {state.user?.name || "Agent"} 👋</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-[20px] text-on-surface-variant">notifications</span>
                {newInquiries.length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white" />
                )}
              </button>
              <Link to="/agent/create-package" className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg font-semibold text-sm hover:bg-accent/90 transition-colors cta-glow">
                <span className="material-symbols-outlined text-[18px]">add</span>
                New Package
              </Link>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard icon="inventory_2" iconBg="bg-primary/10" iconColor="text-primary" label="My Packages" value={myPackages.length} sub={`${myPackages.length} total packages`} />
            <StatCard icon="mail" iconBg="bg-secondary/10" iconColor="text-secondary" label="Total Inquiries" value={myInquiries.length} sub={`${newInquiries.length} new`} />
            <StatCard icon="mark_email_unread" iconBg="bg-accent/10" iconColor="text-accent" label="Unread Leads" value={newInquiries.length} sub="Action needed" highlight />
          </div>

          {/* My Packages — with scroll target ID */}
          <section id="section-packages" className="scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary">My Packages</h2>
              <Link to="/agent/create-package" className="text-sm text-accent font-semibold hover:underline">+ Create New</Link>
            </div>
            {loadingPackages ? (
              <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center">
                <span className="material-symbols-outlined text-[40px] text-outline animate-spin">sync</span>
                <p className="text-sm font-semibold text-outline mt-2">Loading packages...</p>
              </div>
            ) : myPackages.length === 0 ? (
              <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center">
                <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-[40px] text-accent">add_box</span>
                </div>
                <h3 className="text-lg font-bold text-primary mb-2">Create Your First Package</h3>
                <p className="text-on-surface-variant text-sm mb-6 max-w-sm mx-auto">Start showcasing your tour packages to travelers.</p>
                <Link to="/agent/create-package" className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors cta-glow">
                  <span className="material-symbols-outlined text-[18px]">add</span> Create Package
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myPackages.map((pkg) => {
                  const pkgInquiries = myInquiries.filter((inq) => inq.packageId === pkg.id)
                  const isActive = pkg.status !== 'inactive'
                  return (
                    <div key={pkg.id} className="bg-white rounded-xl border border-surface-container-high overflow-hidden hover:shadow-elevated transition-all group">
                      <div className="flex">
                        <div className="w-32 h-32 flex-shrink-0 overflow-hidden">
                          {pkg.images?.[0] ? (
                            <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full bg-surface-container flex items-center justify-center">
                              <span className="material-symbols-outlined text-[32px] text-outline">image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-primary text-sm line-clamp-1">{pkg.title || "Untitled"}</h3>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}>
                                {isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-xs text-on-surface-variant flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              {pkg.destination || "No destination"}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                              {pkg.duration && <span>{pkg.duration.nights} {pkg.duration.nights === 1 ? 'Night' : 'Nights'}</span>}
                              {pkg.startingPrice > 0 && <span className="price-tag text-accent">₹{pkg.startingPrice.toLocaleString("en-IN")}</span>}
                              <span className="flex items-center gap-0.5">
                                <span className="material-symbols-outlined text-[12px]">mail</span>
                                {pkgInquiries.length} inquiries
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-2 w-full">
                            <Link to={`/package/${pkg.id}`} className="text-xs font-semibold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors">View</Link>
                            <Link to={`/agent/edit-package/${pkg.id}`} className="text-xs font-semibold text-accent bg-accent/5 px-3 py-1.5 rounded-lg hover:bg-accent/10 transition-colors">Edit</Link>
                            {isActive ? (
                              <button 
                                type="button"
                                onClick={() => handleInactivate(pkg.id)} 
                                className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors ml-auto flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">block</span>
                                Inactivate
                              </button>
                            ) : (
                              <button 
                                type="button"
                                onClick={() => handleActivate(pkg.id)} 
                                className="text-xs font-semibold text-green-600 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-lg transition-colors ml-auto flex items-center gap-1"
                              >
                                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                                Activate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          }       </section>

          {/* Inquiries — with scroll target ID */}
          <section id="section-inquiries" className="scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-primary">
                Expressed Interest
                {myInquiries.length > 0 && <span className="ml-2 text-sm font-normal text-on-surface-variant">({myInquiries.length} total)</span>}
              </h2>
            </div>

            {myInquiries.length === 0 ? (
              <div className="bg-white rounded-xl border border-surface-container-high p-8 text-center">
                <span className="material-symbols-outlined text-[48px] text-outline mb-2 block">inbox</span>
                <p className="text-on-surface-variant text-sm">No inquiries yet. They'll appear here when travelers show interest in your packages.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-surface-container-high overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-container-high bg-surface-container-low">
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Ref#</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Package</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Customer</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Phone</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Email</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Tier</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Dates</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Status</th>
                        <th className="text-left px-4 py-3 font-semibold text-on-surface-variant">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myInquiries.slice().reverse().map((inq) => (
                        <tr key={inq.id} className="border-b border-surface-container-high last:border-0 hover:bg-surface-container-low/50 transition-colors">
                          <td className="px-4 py-3 font-bold text-primary text-xs">{inq.refNumber}</td>
                          <td className="px-4 py-3 font-medium text-primary text-xs max-w-[120px] truncate">{inq.packageTitle || "—"}</td>
                          <td className="px-4 py-3 text-on-surface text-xs">{inq.customerName || "—"}</td>
                          <td className="px-4 py-3 text-on-surface-variant text-xs">
                            {inq.phone ? <a href={`tel:${formatPhoneForCall(inq.phone)}`} className="text-primary hover:underline">{inq.phone}</a> : "—"}
                          </td>
                          <td className="px-4 py-3 text-on-surface-variant text-xs">{inq.email || "—"}</td>
                          <td className="px-4 py-3 text-xs capitalize">{inq.tier || "—"}</td>
                          <td className="px-4 py-3 text-on-surface-variant text-xs">
                            {inq.fromDate ? `${inq.fromDate}${inq.toDate ? ` → ${inq.toDate}` : ""}` : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                              inq.status === "New" ? "bg-blue-100 text-blue-700" :
                              inq.status === "Responded" ? "bg-green-100 text-green-700" :
                              inq.status === "Converted" ? "bg-accent/10 text-accent" :
                              "bg-gray-100 text-gray-600"
                            }`}>{inq.status}</span>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={inq.status}
                              onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                              className="text-xs border border-surface-container-high rounded-lg px-2 py-1 bg-white focus:border-primary outline-none cursor-pointer"
                            >
                              <option value="New">New</option>
                              <option value="Responded">Responded</option>
                              <option value="Converted">Converted</option>
                              <option value="Closed">Closed</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>


        </div>
      </main>
    </div>
  )
}

function StatCard({ icon, iconBg, iconColor, label, value, sub, highlight }) {
  return (
    <div className={`bg-white rounded-xl border p-5 hover:shadow-elevated transition-all ${highlight ? "border-accent/30" : "border-surface-container-high"}`}>
      <div className="flex items-start justify-between">
        <div className={`w-11 h-11 ${iconBg} rounded-xl flex items-center justify-center`}>
          <span className={`material-symbols-outlined text-[22px] ${iconColor}`}>{icon}</span>
        </div>
        <span className={`text-3xl font-bold ${highlight ? "text-accent" : "text-primary"} price-tag`}>{value}</span>
      </div>
      <p className="text-sm font-semibold text-primary mt-3">{label}</p>
      <p className="text-xs text-on-surface-variant mt-0.5">{sub}</p>
    </div>
  )
}
