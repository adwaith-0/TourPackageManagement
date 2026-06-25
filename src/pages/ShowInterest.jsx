import { useState, useEffect } from "react"
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom"
import TopBar from "../components/Topbar"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import WhatsAppButton from "../components/ui/WhatsAppButton"
import { useApp } from "../context/AppContext"
import { formatPhoneForWhatsApp } from "../utils/phone"
import { getPackageDetailsAPI } from "../utils/packageApi"

export default function ShowInterest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { state, dispatch } = useApp()

  const [pkg, setPkg] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Read search criteria query params for pre-population
  const paramFrom = searchParams.get("from") || ""
  const paramDeparture = searchParams.get("departure") || ""
  const paramReturn = searchParams.get("return") || ""
  const paramTravelers = parseInt(searchParams.get("travelers")) || null
  const paramTier = searchParams.get("tier") || ""

  const normalizedTiers = pkg
    ? (Array.isArray(pkg.tiers) 
        ? pkg.tiers 
        : [
            { name: "Budget", price: pkg.tiers?.budget?.price || 0 },
            { name: "Luxury", price: pkg.tiers?.luxury?.price || 0 }
          ].filter(t => t.price > 0))
    : []

  const defaultTier = paramTier && normalizedTiers.some(t => t.name === paramTier) 
    ? paramTier 
    : normalizedTiers[0]?.name || "Standard"

  const [form, setForm] = useState({
    customerName: state.user?.name || "",
    phone: state.user?.phone || "",
    email: state.user?.email || "",
    fromDate: paramDeparture || "",
    toDate: paramReturn || "",
    fromPlace: paramFrom || "",
    toPlace: "",
    travelers: paramTravelers || 1,
    tier: defaultTier,
    specialRequirements: "",
    whatsappUpdates: true,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getPackageDetailsAPI(id)
      .then((data) => {
        if (active) {
          if (data) {
            setPkg(data)
            const tiers = Array.isArray(data.tiers) ? data.tiers : []
            const selectedTier = paramTier && tiers.some(t => t.name === paramTier)
              ? paramTier
              : tiers[0]?.name || "Standard"

            setForm((f) => ({
              ...f,
              toPlace: data.destination || "",
              travelers: paramTravelers || data.groupSize?.min || 1,
              tier: selectedTier
            }))
          } else {
            setError("Package not found")
          }
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Error loading package details:", err)
          setError("Failed to load package details.")
          setLoading(false)
        }
      })

    return () => { active = false }
  }, [id, paramTier, paramTravelers])

  const isOwnPackage = !!state.user && pkg && state.user.id === pkg.agentId
  const hasExisting = !!state.user && pkg && (state.inquiries || []).some(
    (inq) => inq.userId === state.user.id && inq.packageId === pkg.id && (inq.status === "New" || inq.status === "Responded")
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar /><Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center animate-pulse">
          <span className="material-symbols-outlined text-[80px] text-outline animate-spin mb-4 block">sync</span>
          <h1 className="text-xl font-bold text-primary">Loading package...</h1>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !pkg) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar /><Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center">
          <span className="material-symbols-outlined text-[80px] text-outline">error</span>
          <h1 className="text-2xl font-bold text-primary mt-4">{error || "Package Not Found"}</h1>
          <Link to="/search" className="inline-block mt-6 px-6 py-3 bg-accent text-white rounded-lg font-semibold">Browse Packages</Link>
        </div>
        <Footer />
      </div>
    )
  }

  // Agent self-inquiry block
  if (isOwnPackage) {
    return (
      <div className="min-h-screen bg-surface">
        <TopBar /><Navbar />
        <div className="max-w-[1280px] mx-auto px-lg py-20 text-center">
          <span className="material-symbols-outlined text-[80px] text-accent">security</span>
          <h1 className="text-2xl font-bold text-primary mt-4">Access Denied</h1>
          <p className="text-on-surface-variant mt-2">Agents cannot express interest in their own tour packages.</p>
          <Link to="/agent/dashboard" className="inline-block mt-6 px-6 py-3 bg-accent text-white rounded-lg font-semibold">Back to Dashboard</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const update = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }))
    setErrors((e) => ({ ...e, [field]: "" }))
  }

  const today = (() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  })()

  const validate = () => {
    const errs = {}
    if (!form.customerName.trim()) errs.customerName = "Name is required"
    if (!form.phone.trim() || form.phone.length < 10) errs.phone = "Valid phone number required"
    if (!form.email.trim() || !form.email.includes("@")) errs.email = "Valid email required"
    if (!form.fromDate) errs.fromDate = "Select a start date"
    else if (form.fromDate < today) errs.fromDate = "Start date cannot be in the past"
    if (form.toDate && form.fromDate && form.toDate < form.fromDate) errs.toDate = "End date must be after start date"

    // Group size constraints validation
    const minGroup = pkg.groupSize?.min || 1
    const maxGroup = pkg.groupSize?.max || 100
    const travelersCount = parseInt(form.travelers) || 0
    if (travelersCount < minGroup) {
      errs.travelers = `Minimum group size required is ${minGroup} travelers`
    } else if (travelersCount > maxGroup) {
      errs.travelers = `Maximum group size allowed is ${maxGroup} travelers`
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (hasExisting) return
    if (!validate()) return

    const refNumber = generateRefNumber()

    dispatch({
      type: "ADD_INQUIRY",
      payload: {
        packageId: pkg.id,
        packageTitle: pkg.title,
        refNumber,
        ...form,
      },
    })

    navigate("/inquiry-success", { state: { refNumber, packageTitle: pkg.title } })
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar /><Navbar />

      <div className="max-w-[1280px] mx-auto px-lg py-8">
        {/* Header */}
        <Link to={`/package/${pkg.id}`} className="inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary mb-4 transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to Package Details
        </Link>
        <h1 className="font-headline-lg text-[28px] text-primary font-bold mb-1">Express Your Interest</h1>
        <p className="text-on-surface-variant">{pkg.title} — {pkg.duration?.days}D/{pkg.duration?.nights}N in {pkg.destination}</p>

        {/* Content */}
        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1">
            {hasExisting && (
              <div className="p-4 bg-accent/10 border border-accent/20 rounded-xl text-sm text-accent flex items-start gap-3 mb-6 animate-fade-in-up">
                <span className="material-symbols-outlined text-[20px] mt-0.5">warning</span>
                <div>
                  <p className="font-bold">Active Inquiry Found</p>
                  <p className="text-xs text-on-surface-variant mt-1">You already have an active inquiry for this tour package. You can track its status in your profile or follow up directly with the agent.</p>
                  <div className="flex gap-4 mt-3">
                    <Link to="/my-inquiries" className="text-xs font-bold underline">Go to My Inquiries</Link>
                    {pkg.provider?.whatsapp && (
                      <a
                        href={`https://wa.me/${formatPhoneForWhatsApp(pkg.provider.whatsapp)}?text=${encodeURIComponent(`Hi, I'm following up on my inquiry for "${pkg.title}".`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold underline flex items-center gap-1"
                      >
                        Chat on WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-surface-container-high shadow-soft p-6 md:p-8 space-y-5">
              {/* Name */}
              <Field label="Full Name" error={errors.customerName}>
                <input type="text" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} placeholder="Enter your full name" className={inputCls(errors.customerName)} />
              </Field>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Mobile Number" error={errors.phone}>
                  <div className={`flex border rounded-lg overflow-hidden ${errors.phone ? "border-red-400" : "border-surface-container-high"} focus-within:border-primary focus-within:ring-1 focus-within:ring-primary`}>
                    <div className="flex items-center px-3 bg-surface-container-low border-r border-surface-container-high text-sm font-medium">+91</div>
                    <input type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="Enter mobile number" className="flex-1 px-4 h-12 bg-transparent outline-none text-sm" />
                  </div>
                </Field>
                <Field label="Email" error={errors.email}>
                  <input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="Enter your email" className={inputCls(errors.email)} />
                </Field>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="From Date" error={errors.fromDate}>
                  <input type="date" value={form.fromDate} min={today} onChange={(e) => {
                    update("fromDate", e.target.value)
                    if (form.toDate && e.target.value > form.toDate) update("toDate", "")
                  }} className={inputCls(errors.fromDate)} />
                </Field>
                <Field label="To Date" error={errors.toDate}>
                  <input type="date" value={form.toDate} min={form.fromDate || today} onChange={(e) => update("toDate", e.target.value)} className={inputCls(errors.toDate)} />
                </Field>
              </div>

              {/* Places */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="From Place">
                  <input type="text" value={form.fromPlace} onChange={(e) => update("fromPlace", e.target.value)} placeholder="Your departure city" className={inputCls()} />
                </Field>
                <Field label="To Place">
                  <input type="text" value={form.toPlace} onChange={(e) => update("toPlace", e.target.value)} placeholder="Destination" className={inputCls()} />
                </Field>
              </div>

              {/* Travelers & Tier */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Number of Travelers" error={errors.travelers}>
                  <input type="number" min="1" value={form.travelers} onChange={(e) => update("travelers", e.target.value)} className={inputCls(errors.travelers)} />
                  {pkg.groupSize && (
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      Note: Group size limits are between {pkg.groupSize.min} and {pkg.groupSize.max} travelers.
                    </p>
                  )}
                </Field>
                <Field label="Preferred Tier">
                  <div className="flex flex-wrap gap-3">
                    {normalizedTiers.map((t) => (
                      <button key={t.name} type="button" onClick={() => update("tier", t.name)} className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg border-2 text-sm font-semibold transition-all ${
                        form.tier === t.name ? "border-accent bg-accent/5 text-accent" : "border-surface-container-high text-on-surface-variant hover:border-primary/30"
                      }`}>
                        <span className="capitalize block text-center">{t.name}</span>
                        {t.price > 0 && (
                          <p className="price-tag text-xs mt-0.5 text-center">₹{t.price.toLocaleString("en-IN")}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Special Requirements */}
              <Field label="Special Requirements">
                <textarea value={form.specialRequirements} onChange={(e) => update("specialRequirements", e.target.value)} placeholder="Any dietary needs, accessibility requirements, or special requests..." rows={3} className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors" />
              </Field>

              {/* WhatsApp Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-green-50 rounded-lg border border-green-200/50">
                <input type="checkbox" checked={form.whatsappUpdates} onChange={(e) => update("whatsappUpdates", e.target.checked)} className="w-4 h-4 rounded text-green-600 focus:ring-green-500" />
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  <span className="text-sm font-medium text-green-800">Send me updates via WhatsApp</span>
                </div>
              </label>

              {/* Submit */}
              <button 
                type="submit" 
                disabled={hasExisting}
                className="w-full py-4 bg-accent text-white font-bold rounded-xl text-base hover:bg-accent/90 transition-all cta-glow flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">send</span>
                Send Inquiry
              </button>

              <p className="text-xs text-on-surface-variant text-center">
                By submitting, you agree to our <a href="#" className="text-primary underline">Privacy Policy</a>
              </p>
            </div>
          </form>

          {/* Sidebar */}
          <div className="w-full lg:w-[340px] flex-shrink-0">
            <div className="sticky top-28 space-y-4">
              {/* Package Card */}
              <div className="bg-white rounded-xl border border-surface-container-high shadow-soft overflow-hidden">
                <div className="relative h-40">
                  {pkg.images?.[0] ? (
                    <img src={pkg.images[0]} alt={pkg.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-surface-container flex items-center justify-center">
                      <span className="material-symbols-outlined text-[40px] text-outline">image</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white">
                    <p className="font-bold text-sm">{pkg.title}</p>
                    <p className="text-xs text-white/80">{pkg.duration?.days}D/{pkg.duration?.nights}N • {pkg.destination}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[16px] text-accent">schedule</span>
                    <span className="text-on-surface-variant">Duration: {pkg.duration?.nights}N / {pkg.duration?.days}D</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-[16px] text-accent">location_on</span>
                    <span className="text-on-surface-variant">{pkg.destination}</span>
                  </div>
                </div>
              </div>

              {/* Expert Assistance */}
              <div className="bg-primary/5 rounded-xl border border-primary/10 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
                  </div>
                  <div>
                    <p className="font-bold text-primary text-sm">Expert Assistance</p>
                    <p className="text-xs text-on-surface-variant">We respond within 24 hours</p>
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              {pkg.provider?.whatsapp && (
                <WhatsAppButton
                  phone={pkg.provider.whatsapp}
                  message={`Hi, I'm interested in "${pkg.title}" tour package. Can you share more details?`}
                  label="Chat with Provider"
                  fullWidth
                  size="lg"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</label>}
      {children}
      {error && <p className="text-[10px] text-red-500 font-medium">{error}</p>}
    </div>
  )
}

function inputCls(err) {
  return `w-full px-4 py-3 border ${err ? "border-red-400" : "border-surface-container-high"} rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors`
}

function generateRefNumber() {
  return `TQ-${Math.floor(100000 + Math.random() * 900000)}`
}
