import TopBar from "../components/Topbar"
import Navbar from "../components/Navbar"
import HeroSection from "../components/home/HeroSection"
import ThemeCards from "../components/home/ThemeCards"
import Specials from "../components/home/Specials"
import WhyTouriq from "../components/home/WhyTouriq"
import Reviews from "../components/home/Reviews"
import Footer from "../components/Footer"
import { useApp } from "../context/AppContext"
import { Link } from "react-router-dom"

export default function Home() {
  const { state } = useApp()

  // Show agent-created packages alongside sample featured ones
  const agentPackages = state.agentPackages || []

  return (
    <div>
      <TopBar />
      <Navbar />
      <HeroSection />
      <ThemeCards />

      {/* Agent-Created Packages Section */}
      {agentPackages.length > 0 && (
        <section className="py-16 bg-surface-container-lowest border-y border-surface-container-high">
          <div className="max-w-[1280px] mx-auto px-lg">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="font-headline-lg text-[32px] text-primary font-bold">
                  Fresh from Our Agents
                </h2>
                <p className="text-on-surface-variant mt-1">Newly listed packages by verified travel agents</p>
              </div>
              <Link to="/search" className="flex items-center gap-1 text-accent font-semibold hover:gap-2 transition-all">
                View All
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {agentPackages.slice(0, 4).map((pkg) => (
                <Link
                  key={pkg.id}
                  to={`/package/${pkg.id}`}
                  className="group bg-white rounded-2xl overflow-hidden shadow-soft border border-surface-container-high hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    {pkg.images && pkg.images.length > 0 ? (
                      <img
                        src={pkg.images[0]}
                        alt={pkg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-container flex items-center justify-center">
                        <span className="material-symbols-outlined text-[48px] text-outline">image</span>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                        New
                      </span>
                    </div>
                    {pkg.duration && (
                      <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
                        {pkg.duration.nights}N/{pkg.duration.days}D
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-primary text-lg mb-1 line-clamp-1">{pkg.title || "Untitled Package"}</h3>
                    <div className="flex items-center gap-1 text-on-surface-variant text-sm mb-3">
                      <span className="material-symbols-outlined text-[16px]">location_on</span>
                      <span>{pkg.destination || "Unknown"}</span>
                    </div>
                    {pkg.tiers?.luxury?.price > 0 && (
                      <div className="flex items-baseline gap-1">
                        <span className="price-tag text-accent text-lg">₹{pkg.tiers.luxury.price.toLocaleString("en-IN")}</span>
                        <span className="text-xs text-on-surface-variant">/person</span>
                      </div>
                    )}
                    {pkg.provider?.name && (
                      <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-container-high">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary text-[10px] font-bold">
                          {pkg.provider.avatar || pkg.provider.name[0]}
                        </div>
                        <span className="text-xs text-on-surface-variant">{pkg.provider.name}</span>
                        {pkg.provider.verified && (
                          <span className="material-symbols-outlined filled text-[14px] text-green-600">verified</span>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Specials />
      <WhyTouriq />
      <Reviews />
      <Footer />
    </div>
  )
}