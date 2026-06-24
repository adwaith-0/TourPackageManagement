import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useApp } from './context/AppContext'
import Home from './pages/Home'
import LoginModal from './components/LoginModal'
import SearchResults from './pages/SearchResults'
import PackageDetail from './pages/PackageDetail'
import ShowInterest from './pages/ShowInterest'
import InquirySuccess from './pages/InquirySuccess'
import MyInquiries from './pages/MyInquiries'
import AgentDashboard from './pages/agent/AgentDashboard'
import CreatePackage from './pages/agent/CreatePackage'
import PackagePreview from './pages/agent/PackagePreview'
import AdminDashboard from './pages/admin/AdminDashboard'
import AgentApplication from './pages/AgentApplication'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <LoginModal />
      <Routes>
        {/* Traveler Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRouteHandler />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/package/:id" element={<PackageDetail />} />
        <Route path="/show-interest/:id" element={<ShowInterest />} />
        <Route path="/inquiry-success" element={<InquirySuccess />} />
        <Route path="/my-inquiries" element={<MyInquiries />} />
        <Route path="/apply-agent" element={<AgentApplication />} />

        {/* Agent/Provider Routes */}
        <Route path="/agent/dashboard" element={<AgentDashboard />} />
        <Route path="/agent/create-package" element={<CreatePackage />} />
        <Route path="/agent/edit-package/:id" element={<CreatePackage />} />
        <Route path="/agent/preview/:id" element={<PackagePreview />} />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
export default App

// Resets scroll position to top when navigating between pages
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

// Handles legacy /login URLs by redirecting to Home and opening the modal
function LoginRouteHandler() {
  const { dispatch } = useApp()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch({ type: "OPEN_LOGIN_MODAL" })
    navigate("/", { replace: true })
  }, [dispatch, navigate])

  return null
}