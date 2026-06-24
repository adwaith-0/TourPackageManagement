import { Link, useLocation } from "react-router-dom"
import TopBar from "../components/Topbar"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"

export default function InquirySuccess() {
  const location = useLocation()
  const { refNumber, packageTitle } = location.state || {}

  return (
    <div className="min-h-screen bg-surface">
      <TopBar /><Navbar />

      {/* Background */}
      <div className="relative min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=60")` }}
        />
        <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />

        {/* Card */}
        <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl max-w-lg w-full p-8 md:p-10 animate-fade-in-up">
          {/* Check Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center animate-bounce-check">
              <span className="material-symbols-outlined filled text-[48px] text-accent">check_circle</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-primary text-center mb-2">Inquiry Sent Successfully!</h1>
          <p className="text-on-surface-variant text-center text-sm mb-6">
            Thank you for your interest{packageTitle ? ` in "${packageTitle}"` : ""}. Our team will get back to you within 24 hours.
          </p>

          {/* Reference Number */}
          {refNumber && (
            <div className="flex items-center justify-center gap-2 bg-surface-container-low rounded-full py-2.5 px-5 mx-auto w-fit mb-8">
              <span className="material-symbols-outlined text-[18px] text-primary">receipt</span>
              <span className="text-sm font-bold text-primary">{refNumber}</span>
            </div>
          )}

          {/* What Happens Next */}
          <div className="border border-surface-container-high rounded-xl p-5 mb-8">
            <h3 className="font-bold text-primary text-sm mb-4">What happens next?</h3>
            <div className="space-y-4">
              {[
                { num: 1, title: "Expert Review", desc: "Our travel experts will review your inquiry and prepare options." },
                { num: 2, title: "Personal Callback", desc: "You'll receive a call/WhatsApp from our team within 24 hours." },
                { num: 3, title: "Customized Quote", desc: "Get a tailored quote matching your preferences and budget." },
              ].map((step) => (
                <div key={step.num} className="flex gap-3">
                  <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {step.num}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-primary">{step.title}</p>
                    <p className="text-xs text-on-surface-variant">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/search"
              className="flex-1 py-3 bg-accent text-white text-center font-bold rounded-xl hover:bg-accent/90 transition-all cta-glow"
            >
              Explore More Packages
            </Link>
            <Link
              to="/"
              className="flex-1 py-3 border-2 border-primary text-primary text-center font-bold rounded-xl hover:bg-primary hover:text-white transition-all"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
