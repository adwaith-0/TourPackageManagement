import { Link } from "react-router-dom"
import { useApp } from "../context/AppContext"

export default function Footer() {
  const { dispatch } = useApp()

  return (
    <footer className="bg-primary text-white w-full pt-16 pb-8">
      <div className="max-w-[1280px] mx-auto px-lg mb-12 grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <span className="font-display-lg font-bold text-[28px] text-white">
            TOUR<span className="text-accent">IQ</span>
          </span>
          <p className="text-sm text-white/70">India's Trusted Tour Marketplace.</p>
        </div>

        {/* Links */}
        <div className="flex flex-col space-y-3">
          <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Quick Links</h4>
          <Link to="/search" className="text-sm text-white/70 hover:text-white transition-colors">Tour Packages</Link>
          <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">About Us</a>
          <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">Contact</a>
        </div>

        {/* Travellers */}
        <div className="flex flex-col space-y-3">
          <h4 className="font-bold text-sm uppercase tracking-wider mb-2">For Travellers</h4>
          <Link to="/search" className="text-sm text-white/70 hover:text-white transition-colors">Search Packages</Link>
          <button onClick={() => dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "personal", view: "signup" }})} className="text-sm text-white/70 hover:text-white transition-colors text-left">Customer Register</button>
          <button onClick={() => dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "personal", view: "login" }})} className="text-sm text-white/70 hover:text-white transition-colors text-left">Customer Login</button>
          <Link to="/my-inquiries" className="text-sm text-white/70 hover:text-white transition-colors">My Inquiries</Link>
        </div>

        {/* Agents */}
        <div className="flex flex-col space-y-3">
          <h4 className="font-bold text-sm uppercase tracking-wider mb-2">For Agents</h4>
          <button onClick={() => dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "agent", view: "login" }})} className="text-sm text-white/70 hover:text-white transition-colors text-left">Agent Login</button>
          <button onClick={() => dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "agent", view: "signup" }})} className="text-sm text-white/70 hover:text-white transition-colors text-left">Agent Register</button>
          <Link to="/agent/dashboard" className="text-sm text-white/70 hover:text-white transition-colors">Agent Portal</Link>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col space-y-3">
          <h4 className="font-bold text-sm uppercase tracking-wider mb-2">Newsletter</h4>
          <div className="flex flex-col gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="bg-white/10 border border-white/20 rounded px-4 py-2 text-sm focus:outline-none focus:border-accent transition-colors text-white placeholder:text-white/40"
            />
            <button className="bg-accent hover:bg-accent/90 text-white font-bold py-2 px-4 rounded text-sm transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-[1280px] mx-auto px-lg pt-8 border-t border-white/10">
        <p className="text-sm text-white/50">
          © 2026 TOURIQ. All rights reserved. Made with ❤️ in India
        </p>
      </div>
    </footer>
  )
}