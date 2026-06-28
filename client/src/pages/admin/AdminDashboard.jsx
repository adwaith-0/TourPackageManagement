import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../../context/AppContext"

export default function AdminDashboard() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedAppId, setSelectedAppId] = useState(null)
  const [apps, setApps] = useState([])

  const fetchApps = async () => {
    try {
      const response = await fetch("http://localhost:3001/users/agent/list")
      const result = await response.json()
      if (result.success) {
        const mapped = result.data.map(app => ({
          ...app,
          id: app.userId,
          status: app.status === 'New' ? 'pending' : app.status === 'Approved' ? 'approved' : 'rejected'
        }))
        setApps(mapped)
      }
    } catch (err) {
      console.error("Failed to load applications:", err)
    }
  }

  const handleApprove = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/users/agent/approve?userId=${userId}`, {
        method: "PUT"
      })
      const result = await response.json()
      if (result.success) {
        fetchApps()
      } else {
        alert(result.errorMessage || "Failed to approve agent")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to connect to server")
    }
  }

  const handleSuspend = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/users/agent/suspend?userId=${userId}`, {
        method: "PUT"
      })
      const result = await response.json()
      if (result.success) {
        fetchApps()
      } else {
        alert(result.errorMessage || "Failed to suspend/reject agent")
      }
    } catch (err) {
      console.error(err)
      alert("Failed to connect to server")
    }
  }

  // Authentication & data fetch check
  useEffect(() => {
    if (!state.user || state.user.type !== "superadmin") {
      dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "personal" } })
      navigate("/", { replace: true })
    } else {
      fetchApps()
    }
  }, [state.user, navigate, dispatch])

  if (!state.user || state.user.type !== "superadmin") return null

  const displayedAgents = apps.filter(a => {
    if (filterStatus === "all") return true
    return a.status === filterStatus
  })

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" })
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col pb-12">
      {/* Top Header */}
      <header className="bg-primary text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-white hover:text-accent transition-colors flex items-center mr-2" title="Back to Home">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <span className="font-display-lg font-bold text-[24px]">
              TOUR<span className="text-accent">IQ</span>
            </span>
            <span className="bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider hidden md:inline-block">
              Super Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-sm text-primary">
                S
              </div>
              <span className="text-sm font-semibold hidden md:inline">Super Admin</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-[1440px] w-full mx-auto px-6 mt-8 flex-grow flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">System Overview</h1>
          <p className="text-sm text-on-surface-variant">Review and approve agent applications</p>
        </div>

        <div className="flex-grow flex flex-col gap-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white border border-surface-container-high rounded-xl p-4 shadow-soft">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full sm:w-auto">
              {["all", "pending", "approved", "rejected"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    filterStatus === status 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-gray-500 hover:text-primary"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
            <div className="text-xs text-on-surface-variant font-semibold">
              Showing {displayedAgents.length} agent applications
            </div>
          </div>

          {/* Agent Applications List */}
          <div className="flex-grow flex flex-col">
            {displayedAgents.length === 0 ? (
              <div className="bg-white border border-surface-container-high rounded-xl p-12 text-center flex flex-col items-center justify-center flex-grow shadow-soft">
                <span className="material-symbols-outlined text-[64px] text-outline mb-4">person_add</span>
                <h3 className="text-lg font-bold text-primary mb-1">No Applications Found</h3>
                <p className="text-on-surface-variant text-sm max-w-sm">
                  There are no agent applications matching the "{filterStatus}" filter status.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {displayedAgents.map(app => (
                  <div key={app.id} className="bg-white border border-surface-container-high rounded-xl p-6 shadow-soft hover:shadow-elevated transition-all flex flex-col gap-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex flex-col">
                        <h3 className="font-bold text-primary text-lg">{app.agency_name || app.agencyName || app.name || "Unknown Agency"}</h3>
                        <p className="text-sm text-on-surface-variant">Applicant: {app.name || app.userId}</p>
                        {app.email && <p className="text-sm text-on-surface-variant">Email: {app.email}</p>}
                        {app.phone && <p className="text-sm text-on-surface-variant">Phone: {app.phone}</p>}
                        <p className="text-xs text-on-surface-variant mt-1">Status: <span className={`font-semibold uppercase ${
                          app.status === 'approved' ? 'text-green-600' :
                          app.status === 'rejected' ? 'text-red-600' :
                          'text-blue-600'
                        }`}>{app.status}</span></p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setSelectedAppId(selectedAppId === app.id ? null : app.id)}
                          className="flex-1 sm:flex-none py-2 px-3 bg-surface-container text-primary rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1 border border-surface-container-high"
                        >
                          <span className="material-symbols-outlined text-[14px]">visibility</span>
                          {selectedAppId === app.id ? "Hide Details" : "View Details"}
                        </button>

                        {app.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(app.userId)}
                              className="flex-1 sm:flex-none py-2 px-4 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Approve
                            </button>
                            <button
                              onClick={() => handleSuspend(app.userId)}
                              className="flex-1 sm:flex-none py-2 px-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">close</span>
                              Reject
                            </button>
                          </>
                        )}
                        {app.status === "approved" && (
                          <>
                            <div className="flex-1 sm:flex-none py-2 px-4 bg-green-50 text-green-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 border border-green-200">
                              <span className="material-symbols-outlined text-[16px] text-green-600 filled">check_circle</span>
                              Approved
                            </div>
                            <button
                              onClick={() => {
                                  if (window.confirm(`Are you sure you want to remove agent "${app.agencyName || app.agency_name || app.name || 'Unknown'}"? This will revoke their agent status and archive all their packages.`)) {
                                      handleSuspend(app.userId)
                                  }
                              }}
                              className="flex-1 sm:flex-none py-2 px-4 bg-red-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[14px]">person_remove</span>
                              Remove Agent
                            </button>
                          </>
                        )}
                        {app.status === "rejected" && (
                          <>
                            <div className="flex-1 sm:flex-none py-2 px-4 bg-red-50 text-red-700 font-semibold rounded-lg text-xs flex items-center justify-center gap-1 border border-red-200">
                              <span className="material-symbols-outlined text-[16px] text-red-600 filled">cancel</span>
                              Rejected
                            </div>
                            <button
                              onClick={() => handleApprove(app.userId)}
                              className="flex-1 sm:flex-none py-2 px-4 bg-green-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-green-700 transition-colors flex items-center justify-center gap-1 shadow-sm"
                            >
                              <span className="material-symbols-outlined text-[14px]">check</span>
                              Approve / Restore
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Expandable Details Section */}
                    {selectedAppId === app.id && (
                      <div className="pt-4 border-t border-surface-container-high text-sm text-on-surface grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-low/50 p-5 rounded-lg border border-surface-container animate-fade-in-up">
                        <div>
                          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Business Information</p>
                          <div className="space-y-1.5 text-xs">
                            <p><span className="font-semibold text-outline">Agency Name:</span> {app.agency_name || "N/A"}</p>
                            <p><span className="font-semibold text-outline">Website:</span> {app.website ? <a href={app.website} target="_blank" rel="noreferrer" className="text-primary hover:underline">{app.website}</a> : "N/A"}</p>
                            <p><span className="font-semibold text-outline">Experience:</span> {app.experience ? `${app.experience} Years` : "N/A"}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Legal Details</p>
                          <div className="space-y-1.5 text-xs">
                            <p><span className="font-semibold text-outline">License Number:</span> {app.license_number || "N/A"}</p>
                            <p><span className="font-semibold text-outline">Tax ID / PAN:</span> {app.pan_number || app.tax_id || "N/A"}</p>
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">Specialties & Operations</p>
                          <p className="text-xs bg-white p-3 rounded border border-surface-container-high leading-relaxed">{app.specialties || "No specific specialties listed."}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
