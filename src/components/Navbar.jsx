import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import { useApp } from "../context/AppContext"

export default function Navbar() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAgent = state.user?.type === "agent"
  const isLoggedIn = !!state.user
  const existingApp = state.agentApplications?.find(app => app.userId === state.user?.id)

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
    navigate("/")
  }

  return (
    <nav className="bg-surface-bright border-b border-surface-container-high shadow-sm sticky top-0 w-full h-[72px] z-50">
      <div className="flex justify-between items-center max-w-[1280px] mx-auto px-lg h-full">
        
        {/* Logo */}
        <Link to="/" className="font-display-lg text-primary font-bold tracking-tight text-[28px]">
          TOUR<span className="text-accent">IQ</span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8 h-full">
          <Link to="/search" className="flex items-center h-full text-on-surface-variant hover:text-primary font-medium transition-colors">
            Tour Packages
          </Link>
          {isAgent && (
            <Link to="/agent/dashboard" className="flex items-center h-full text-accent font-semibold transition-colors">
              <span className="material-symbols-outlined text-[20px] mr-1">dashboard</span>
              Agent Portal
            </Link>
          )}
          {state.user?.type === "superadmin" && (
            <Link to="/admin/dashboard" className="flex items-center h-full text-accent font-semibold transition-colors">
              <span className="material-symbols-outlined text-[20px] mr-1">admin_panel_settings</span>
              Admin Portal
            </Link>
          )}
          {isLoggedIn && !isAgent && state.user?.type !== "superadmin" && (
            <Link to="/my-inquiries" className="flex items-center h-full text-on-surface-variant hover:text-primary font-medium transition-colors">
              <span className="material-symbols-outlined text-[20px] mr-1">mail</span>
              My Inquiries
            </Link>
          )}
          {isLoggedIn && !isAgent && state.user?.type !== "superadmin" && (
            !existingApp ? (
              <Link to="/apply-agent" className="flex items-center h-full text-accent font-medium transition-colors">
                Apply to become Agent
              </Link>
            ) : existingApp.status === 'pending' ? (
              <span className="flex items-center h-full text-on-surface-variant/50 font-medium cursor-not-allowed">
                Agent Application Pending
              </span>
            ) : existingApp.status === 'rejected' ? (
              <span className="flex items-center h-full text-red-400 font-medium cursor-not-allowed">
                Agent Application Rejected
              </span>
            ) : existingApp.status === 'approved' ? (
              <span className="flex items-center h-full text-accent font-medium">Agent</span>
            ) : null
          )}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-2 bg-primary/5 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {state.user.name?.[0] || "U"}
                </div>
                <span className="text-sm font-medium text-primary">{state.user.name || "User"}</span>
                {isAgent && (
                  <span className="text-[10px] font-bold bg-accent/10 text-accent px-2 py-0.5 rounded-full uppercase">Agent</span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-on-surface-variant hover:text-primary transition-colors text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch({ type: "OPEN_LOGIN_MODAL" })}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">person</span>
              <span>Login / Register</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-primary" onClick={() => setMobileOpen(!mobileOpen)}>
          <span className="material-symbols-outlined text-[28px]">
            {mobileOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-[72px] left-0 right-0 bg-white border-b border-surface-container-high shadow-elevated z-50 animate-fade-in-up">
          <div className="flex flex-col p-4 space-y-3">
            <Link to="/search" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-surface-container-low text-on-surface font-medium transition-colors">
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>Tour Packages</span>
            </Link>
            {isAgent && (
              <Link to="/agent/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-accent/5 text-accent font-semibold transition-colors">
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Agent Portal</span>
              </Link>
            )}
            {state.user?.type === "superadmin" && (
              <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg bg-accent/5 text-accent font-semibold transition-colors">
                <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
                <span>Admin Portal</span>
              </Link>
            )}
            {isLoggedIn && !isAgent && state.user?.type !== "superadmin" && (
              <Link to="/my-inquiries" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-surface-container-low text-on-surface font-medium transition-colors">
                <span className="material-symbols-outlined text-[20px]">mail</span>
                <span>My Inquiries</span>
              </Link>
            )}
            {isLoggedIn && !isAgent && state.user?.type !== "superadmin" && (
              !existingApp ? (
                <Link to="/apply-agent" onClick={() => setMobileOpen(false)} className="flex items-center space-x-2 px-4 py-3 rounded-lg hover:bg-surface-container-low text-accent font-medium transition-colors w-full text-left">
                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                  <span>Apply to become Agent</span>
                </Link>
              ) : existingApp.status === 'pending' ? (
                <span className="flex items-center space-x-2 px-4 py-3 rounded-lg text-on-surface-variant/50 font-medium cursor-not-allowed">
                  <span className="material-symbols-outlined text-[20px]">hourglass_empty</span>
                  <span>Agent Application Pending</span>
                </span>
              ) : existingApp.status === 'rejected' ? (
                <span className="flex items-center space-x-2 px-4 py-3 rounded-lg text-red-400 font-medium cursor-not-allowed">
                  <span className="material-symbols-outlined text-[20px]">cancel</span>
                  <span>Agent Application Rejected</span>
                </span>
              ) : existingApp.status === 'approved' ? (
                <span className="flex items-center space-x-2 px-4 py-3 rounded-lg text-accent font-medium">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Agent</span>
                </span>
              ) : null
            )}
            <div className="border-t border-surface-container-high pt-3">
              {isLoggedIn ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-4 py-2">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {state.user.name?.[0] || "U"}
                    </div>
                    <span className="font-medium text-primary">{state.user.name}</span>
                  </div>
                  <button onClick={() => { handleLogout(); setMobileOpen(false) }} className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 font-medium">
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => { dispatch({ type: "OPEN_LOGIN_MODAL" }); setMobileOpen(false) }} className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-primary text-white rounded-lg font-medium">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  <span>Login / Register</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}