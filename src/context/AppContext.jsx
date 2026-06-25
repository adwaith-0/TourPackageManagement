/* eslint-disable react-refresh/only-export-components */
// ─── App Context ─────────────────────────────────────────────────────────────
// Global state with auth (signup/login), unique accounts, localStorage.

import { createContext, useContext, useReducer, useEffect } from "react"
import { samplePackages } from "../data/samplePackages"

const AppContext = createContext(null)

// ─── Initial State ───────────────────────────────────────────────────────────
function getInitialState() {
  const stored = localStorage.getItem("touriq_state")
  let parsed = {}
  if (stored) {
    try { parsed = JSON.parse(stored) } catch { parsed = {} }
  }

  // Users registry
  const users = parsed.users || []
  
  // Seed Super Admin if not present
  const adminEmail = "admin@touriq.com"
  const adminExists = users.some((u) => u.email === adminEmail)
  if (!adminExists) {
    users.push({
      id: "user-superadmin",
      email: adminEmail,
      password: "admin123",
      name: "Super Admin",
      phone: "9876543210",
      type: "superadmin",
      createdAt: new Date().toISOString()
    })
  }

  // All agent packages (each has agentId)
  const agentPackages = parsed.agentPackages || []
  // All inquiries (each has userId and packageId)
  const inquiries = parsed.inquiries || []
  // Shopping experiences
  const shoppingExperiences = parsed.shoppingExperiences || []
  
  // Agent applications
  const agentApplications = parsed.agentApplications || []

  // Retrieve current logged-in user from localStorage session
  const sessionUserId = localStorage.getItem("touriq_session_user")
  let currentUser = null
  if (sessionUserId) {
    const found = users.find((u) => u.id === sessionUserId)
    if (found) {
      const safeUser = { ...found }
      delete safeUser.password
      currentUser = safeUser
    }
  }

  return {
    users,
    packages: buildPackages(agentPackages),
    agentPackages,
    inquiries,
    shoppingExperiences,
    agentApplications,
    user: currentUser,
    loginModal: { isOpen: false, accountType: "personal", view: "login" },
  }
}

// Show sample packages only when no agent has uploaded any packages yet
function buildPackages(agentPackages) {
  const active = agentPackages.filter(p => !p.archived)
  if (active.length > 0) return [...active]
  return [...samplePackages].map(p => ({ ...p, status: "approved" }))
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    // ── UI State ─────────────────────────────────────────────────────────────
    case "OPEN_LOGIN_MODAL": {
      return {
        ...state,
        loginModal: {
          isOpen: true,
          accountType: action.payload?.accountType || "personal",
          view: action.payload?.view || "login",
        },
      }
    }
    case "CLOSE_LOGIN_MODAL": {
      return {
        ...state,
        loginModal: { ...state.loginModal, isOpen: false },
      }
    }

    // ── Auth ──────────────────────────────────────────────
    // SET_USER: receives user data from the backend API and maps field names
    case "SET_USER": {
      const apiUser = action.payload
      const mappedUser = {
        id: apiUser.userId,
        name: apiUser.name,
        email: apiUser.email,
        phone: apiUser.phoneNumber,
        type: apiUser.type === "Traveler" ? "personal" : apiUser.type === "Agent" ? "agent" : apiUser.type,
        createdAt: apiUser.createdAt,
      }
      return {
        ...state,
        user: mappedUser,
        authError: null,
        loginModal: { ...state.loginModal, isOpen: false },
      }
    }

    case "LOGOUT": {
      return { ...state, user: null, authError: null }
    }

    case "CLEAR_AUTH_ERROR": {
      return { ...state, authError: null }
    }



    // ── Direct Password Reset (no OTP) ───────────────────────
    case "DIRECT_RESET_PASSWORD": {
      const { email, newPassword } = action.payload
      const updatedUsers = state.users.map((u) =>
        u.email === email ? { ...u, password: newPassword } : u
      )
      return {
        ...state,
        users: updatedUsers,
        authError: null,
      }
    }

    // ── Packages ─────────────────────────────────────────────
    case "ADD_PACKAGE": {
      const newPkg = {
        ...action.payload,
        id: `pkg-${Date.now()}`,
        agentId: state.user?.id, // Link to agent
        status: "approved", // Packages go live immediately since approval process was removed
        createdAt: new Date().toISOString().split("T")[0],
      }
      const updatedAgentPkgs = [...state.agentPackages, newPkg]
      return {
        ...state,
        agentPackages: updatedAgentPkgs,
        packages: buildPackages(updatedAgentPkgs),
      }
    }

    case "UPDATE_PACKAGE": {
      // If the package exists in agentPackages, update it. 
      // If it's a sample package (not in agentPackages), add it as a new customized agent package.
      let isExistingAgentPkg = state.agentPackages.some(p => p.id === action.payload.id)
      let updatedAgentPkgs;
      
      if (isExistingAgentPkg) {
        updatedAgentPkgs = state.agentPackages.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload, status: "approved" } : p
        )
      } else {
        updatedAgentPkgs = [...state.agentPackages, { ...action.payload, status: "approved", agentId: state.user?.id }]
      }

      return {
        ...state,
        agentPackages: updatedAgentPkgs,
        packages: buildPackages(updatedAgentPkgs),
      }
    }

    case "SET_PACKAGE_STATUS": {
      const { id, status } = action.payload
      const updatedAgentPkgs = state.agentPackages.map((p) =>
        p.id === id ? { ...p, status } : p
      )
      return {
        ...state,
        agentPackages: updatedAgentPkgs,
        packages: buildPackages(updatedAgentPkgs),
      }
    }

    case "DELETE_PACKAGE": {
      const updatedAgentPkgs = state.agentPackages.map((p) =>
        p.id === action.payload ? { ...p, archived: true } : p
      )
      return {
        ...state,
        agentPackages: updatedAgentPkgs,
        packages: buildPackages(updatedAgentPkgs),
      }
    }

    // ── Shopping Experiences ─────────────────────────────────
    case "ADD_SHOPPING_EXPERIENCE": {
      const newExp = {
        ...action.payload,
        id: `shop-${Date.now()}`,
        agentId: state.user?.id,
        createdAt: new Date().toISOString(),
      }
      const updatedShopping = [...(state.shoppingExperiences || []), newExp]
      return {
        ...state,
        shoppingExperiences: updatedShopping,
      }
    }

    case "DELETE_SHOPPING_EXPERIENCE": {
      const updatedShopping = (state.shoppingExperiences || []).filter(
        (exp) => exp.id !== action.payload
      )
      return {
        ...state,
        shoppingExperiences: updatedShopping,
      }
    }

    // ── Inquiries ────────────────────────────────────────────
    case "ADD_INQUIRY": {
      const inquiry = {
        ...action.payload,
        id: `inq-${Date.now()}`,
        userId: state.user?.id || null,
        refNumber: action.payload.refNumber || `TQ-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "New",
        createdAt: new Date().toISOString(),
      }
      return {
        ...state,
        inquiries: [...state.inquiries, inquiry],
      }
    }

    case "UPDATE_INQUIRY_STATUS": {
      return {
        ...state,
        inquiries: state.inquiries.map((inq) =>
          inq.id === action.payload.id
            ? { ...inq, status: action.payload.status }
            : inq
        ),
      }
    }

    // ── Agent Applications ───────────────────────────────────
    case "APPLY_FOR_AGENT": {
      const newApp = {
        ...(action.payload || {}),
        id: 'app-' + Date.now(),
        userId: state.user.id,
        name: state.user.name,
        email: state.user.email,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      return {
        ...state,
        agentApplications: [...(state.agentApplications || []), newApp]
      }
    }

    case "APPROVE_AGENT_APPLICATION": {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload
      const appToApprove = (state.agentApplications || []).find(a => a.id === id)
      if (!appToApprove) return state

      const updatedApps = (state.agentApplications || []).map(app => 
        app.id === id ? { ...app, status: 'approved' } : app
      )
      const updatedUsers = state.users.map(u => 
        u.id === appToApprove.userId ? { ...u, type: 'agent' } : u
      )
      
      const updatedUser = state.user?.id === appToApprove.userId ? { ...state.user, type: 'agent' } : state.user

      return {
        ...state,
        agentApplications: updatedApps,
        users: updatedUsers,
        user: updatedUser
      }
    }

    case "REJECT_AGENT_APPLICATION": {
      const id = typeof action.payload === 'object' ? action.payload.id : action.payload
      const updatedApps = (state.agentApplications || []).map(app => 
        app.id === id ? { ...app, status: 'rejected' } : app
      )
      return {
        ...state,
        agentApplications: updatedApps
      }
    }

    case "REMOVE_AGENT": {
      const { id, userId } = action.payload
      const updatedApps = (state.agentApplications || []).map(app => 
        app.id === id ? { ...app, status: 'rejected' } : app
      )
      const updatedUsers = state.users.map(u => 
        u.id === userId ? { ...u, type: 'personal' } : u
      )
      const updatedUser = state.user?.id === userId ? { ...state.user, type: 'personal' } : state.user
      const updatedAgentPkgs = state.agentPackages.map(p => 
        p.agentId === userId ? { ...p, archived: true } : p
      )
      return {
        ...state,
        agentApplications: updatedApps,
        users: updatedUsers,
        user: updatedUser,
        agentPackages: updatedAgentPkgs,
        packages: buildPackages(updatedAgentPkgs)
      }
    }

    default:
      return state
  }
}

// ─── Provider Component ──────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, getInitialState)

  // Synchronize state.user session with localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("touriq_session_user", state.user.id)
    } else {
      localStorage.removeItem("touriq_session_user")
    }
  }, [state.user])

  // Persist to localStorage
  useEffect(() => {
    const toStore = {
      users: state.users,
      agentPackages: state.agentPackages,
      inquiries: state.inquiries,
      shoppingExperiences: state.shoppingExperiences || [],
      agentApplications: state.agentApplications || [],
    }
    localStorage.setItem("touriq_state", JSON.stringify(toStore))
  }, [state.users, state.agentPackages, state.inquiries, state.shoppingExperiences, state.agentApplications])


  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

export default AppContext
