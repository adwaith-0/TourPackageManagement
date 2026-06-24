import { Link, useNavigate, useLocation } from "react-router-dom"
import { useApp } from "../../context/AppContext"

export default function AgentSidebar({ activePage = "dashboard" }) {
  const { state } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  // Only count inquiries for THIS agent's packages
  const myPackageIds = (state.agentPackages || []).filter(p => p.agentId === state.user?.id).map(p => p.id)
  const myInquiries = (state.inquiries || []).filter(i => myPackageIds.includes(i.packageId))
  const newInquiries = myInquiries.filter(i => i.status === "New").length

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard", path: "/agent/dashboard", scrollTo: null, hash: "" },
    { id: "create", label: "Create Package", icon: "add_box", path: "/agent/create-package", scrollTo: null, hash: "" },
    { id: "packages", label: "My Packages", icon: "inventory_2", path: "/agent/dashboard", scrollTo: "section-packages", hash: "#packages" },
    { id: "inquiries", label: "Inquiries", icon: "mail", path: "/agent/dashboard", scrollTo: "section-inquiries", hash: "#inquiries", badge: newInquiries },
  ]

  const handleNavClick = (item) => {
    if (item.path === "/agent/dashboard") {
      if (location.pathname === "/agent/dashboard") {
        // Already on dashboard — update URL hash, scroll to target or top
        navigate(`/agent/dashboard${item.hash}`, { replace: true })
        const el = item.scrollTo ? document.getElementById(item.scrollTo) : null
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" })
        } else {
          const mainEl = document.querySelector("main")
          if (mainEl) mainEl.scrollTo({ top: 0, behavior: "smooth" })
        }
      } else {
        // Navigate to dashboard with hash
        navigate(`/agent/dashboard${item.hash}`)
      }
    } else {
      navigate(item.path)
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[256px] h-screen agent-sidebar flex-col fixed left-0 top-0 z-40">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link to="/" className="font-display-lg font-bold text-[24px] text-white">
            TOUR<span className="text-accent">IQ</span>
          </Link>
          <p className="text-white/40 text-xs mt-1 font-medium">Provider Portal</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Main Menu</p>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-all group text-left ${
                activePage === item.id
                  ? "agent-nav-active text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className={`material-symbols-outlined text-[20px] ${activePage === item.id ? "text-accent" : "group-hover:text-white/80"}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="ml-auto bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <div className="border-t border-white/10 mt-6 pt-4">
            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">Account</p>
            <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[20px]">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </a>
            <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-lg agent-btn-gradient transition-all mt-2">
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
              <span className="text-sm font-medium">Switch to Traveler View</span>
            </Link>
          </div>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent font-bold text-sm">
              {state.user?.name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{state.user?.name || "Agent"}</p>
              <p className="text-white/40 text-xs truncate">Travel Partner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-surface-container-high z-50 shadow-elevated">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 relative ${
                activePage === item.id ? "text-accent" : "text-on-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {item.badge > 0 && (
                <span className="absolute -top-0.5 right-1 bg-accent text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          <Link to="/" className="flex flex-col items-center gap-0.5 py-1 px-3 relative text-on-surface-variant">
            <span className="material-symbols-outlined text-[22px]">arrow_back</span>
            <span className="text-[10px] font-medium">Traveler View</span>
          </Link>
        </div>
      </nav>
    </>
  )
}
