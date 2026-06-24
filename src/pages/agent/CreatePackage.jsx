import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import AgentSidebar from "../../components/agent/AgentSidebar"
import StepProgress from "../../components/agent/StepProgress"
import ImageUploader from "../../components/agent/ImageUploader"
import { useApp } from "../../context/AppContext"
import ImageGallery from "../../components/package/ImageGallery"
import ItineraryTimeline from "../../components/package/ItineraryTimeline"
import InclusionsList from "../../components/package/InclusionsList"

const STEPS = ["Basic Info", "Itinerary", "Gallery", "Inclusions", "Preview", "Publish"]


function ensureNewFormat(p, user) {
  const blank = {
    id: p?.id || `pkg-${Date.now()}`,
    title: p?.title || "",
    fromLocation: p?.fromLocation || "",
    destination: p?.destination || "",
    description: p?.description || "",
    duration: p?.duration || { nights: 1, days: 2 },
    groupSize: p?.groupSize || { min: 1, max: 10 },
    pickup: p?.pickup || "",
    dropoff: p?.dropoff || "",
    type: p?.type || "Group Tour",
    images: p?.images || [],
    experiences: p?.experiences || [],
    rating: p?.rating || 0,
    reviewCount: p?.reviewCount || 0,
    reviews: p?.reviews || [],
    tags: p?.tags || [],
    featured: p?.featured || false,
    shoppingTips: p?.shoppingTips || "",
    provider: p?.provider || {
      name: user?.name || "",
      phone: user?.phone || "",
      whatsapp: user?.phone || "",
      email: user?.email || "",
      verified: false,
      rating: 0,
      reviewCount: 0,
      avatar: user?.name?.[0] || "A",
    },
    status: p?.status || "pending",
  }

  // Tiers migration
  if (p?.tiers && Array.isArray(p.tiers)) {
    blank.tiers = JSON.parse(JSON.stringify(p.tiers))
  } else if (p?.tiers) {
    blank.tiers = []
    if (p.tiers.budget) {
      blank.tiers.push({
        name: "Budget",
        price: p.tiers.budget.price || 0,
        bedSize: "Twin Sharing",
        hotel: p.tiers.budget.hotel || "",
        specialInclusions: p.tiers.budget.inclusions || "",
        specialExclusions: "",
      })
    }
    if (p.tiers.luxury) {
      blank.tiers.push({
        name: "Luxury",
        price: p.tiers.luxury.price || 0,
        bedSize: "Twin Sharing",
        hotel: p.tiers.luxury.hotel || "",
        specialInclusions: p.tiers.luxury.inclusions || "",
        specialExclusions: "",
      })
    }
  } else {
    blank.tiers = [
      {
        name: "Standard",
        price: 0,
        bedSize: "Twin Sharing",
        hotel: "",
        specialInclusions: "",
        specialExclusions: "",
      }
    ]
  }

  // Itinerary migration
  if (p?.itinerary && Array.isArray(p.itinerary)) {
    blank.itinerary = JSON.parse(JSON.stringify(p.itinerary))
  } else if (p?.itineraries) {
    const legacyItinerary = p.itineraries.luxury || p.itineraries.budget || []
    blank.itinerary = JSON.parse(JSON.stringify(legacyItinerary))
  } else {
    blank.itinerary = [
      { day: 1, title: "", activities: [{ time: "Morning", desc: "" }] }
    ]
  }

  // Inclusions migration
  if (p?.inclusions && Array.isArray(p.inclusions)) {
    blank.inclusions = [...p.inclusions]
  } else if (p?.inclusions && typeof p.inclusions === "object") {
    const merged = new Set([
      ...(p.inclusions.budget || []),
      ...(p.inclusions.luxury || [])
    ])
    blank.inclusions = Array.from(merged)
  } else {
    blank.inclusions = []
  }

  // Exclusions migration
  if (p?.exclusions && Array.isArray(p.exclusions)) {
    blank.exclusions = [...p.exclusions]
  } else if (p?.exclusions && typeof p.exclusions === "object") {
    const merged = new Set([
      ...(p.exclusions.budget || []),
      ...(p.exclusions.luxury || [])
    ])
    blank.exclusions = Array.from(merged)
  } else {
    blank.exclusions = []
  }

  return blank
}

export default function CreatePackage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch } = useApp()
  const [step, setStep] = useState(0)
  const [errors, setErrors] = useState({})

  // Authentication check
  useEffect(() => {
    if (!state.user || state.user.type !== "agent") {
      dispatch({ type: "OPEN_LOGIN_MODAL", payload: { accountType: "agent" } })
      navigate("/", { replace: true })
    }
  }, [state.user, navigate, dispatch])

  // Load existing package for editing, or start blank
  const existingPkg = id ? state.packages.find((p) => p.id === id) : null
  const [pkg, setPkg] = useState(() => ensureNewFormat(existingPkg, state.user))

  const [prevId, setPrevId] = useState(id)
  const [prevUserId, setPrevUserId] = useState(state.user?.id)

  if (id !== prevId) {
    setPrevId(id)
    setPkg(ensureNewFormat(existingPkg, state.user))
  }

  if (!id && state.user && state.user.id !== prevUserId) {
    setPrevUserId(state.user.id)
    setPkg((p) => {
      if (!p.provider.name) {
        return {
          ...p,
          provider: {
            ...p.provider,
            name: state.user.name || "",
            phone: state.user.phone || "",
            whatsapp: state.user.phone || "",
            email: state.user.email || "",
            avatar: state.user.name?.[0] || "A",
          }
        }
      }
      return p
    })
  }

  const update = (field, val) => {
    setPkg((p) => ({ ...p, [field]: val }))
    setErrors((e) => ({ ...e, [field]: "" }))
  }

  const updateNested = (path, val) => {
    setPkg((p) => {
      const copy = JSON.parse(JSON.stringify(p))
      const keys = path.split(".")
      let obj = copy
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]]
      obj[keys[keys.length - 1]] = val
      return copy
    })
  }

  const completedSteps = []
  if (pkg.title && pkg.destination && pkg.fromLocation) completedSteps.push(0)
  if (pkg.itinerary?.length > 0 && pkg.itinerary[0]?.title) completedSteps.push(1)
  if (pkg.images?.length > 0) completedSteps.push(2)
  if (pkg.inclusions?.length > 0) completedSteps.push(3)
  if (completedSteps.includes(0) && completedSteps.includes(1) && completedSteps.includes(2) && completedSteps.includes(3)) completedSteps.push(4)

  const goNext = () => {
    if (step === 0) {
      const errs = {}
      if (!pkg.title.trim()) errs.title = "Required"
      if (!pkg.fromLocation?.trim()) errs.fromLocation = "Required"
      if (!pkg.destination.trim()) errs.destination = "Required"
      if (Object.keys(errs).length > 0) { setErrors(errs); return }
    }
    if (step === 1) {
      const errs = {}
      if (!pkg.tiers || pkg.tiers.length === 0) {
        errs.pricing = "Please add at least one pricing tier"
      } else {
        const invalidTier = pkg.tiers.find(t => !t.name.trim() || t.price <= 0)
        if (invalidTier) {
          errs.pricing = "All pricing tiers must have a name and a price greater than ₹0"
        }
      }
      if (Object.keys(errs).length > 0) { setErrors(errs); return }
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }
  const goBack = () => setStep((s) => Math.max(s - 1, 0))

  const handlePublish = () => {
    const finalPkg = {
      ...pkg,
      provider: { ...pkg.provider, verified: true },
    }

    if (existingPkg) {
      dispatch({ type: "UPDATE_PACKAGE", payload: finalPkg })
    } else {
      dispatch({ type: "ADD_PACKAGE", payload: finalPkg })
    }
    navigate("/agent/dashboard")
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <AgentSidebar activePage="create" />

      <main className="flex-1 md:ml-[256px] overflow-y-auto pb-28 md:pb-24">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-surface-container-high z-30 px-6 md:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-primary">{id ? "Edit Package" : "Create Package"}</h1>
            <button onClick={() => navigate("/agent/dashboard")} className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">close</span> Cancel
            </button>
          </div>
          <StepProgress steps={STEPS} currentStep={step} completedSteps={completedSteps} />
        </div>

        {/* Step Content */}
        <div className="p-6 md:p-8 max-w-[900px]">
          {step === 0 && <StepBasicInfo pkg={pkg} update={update} updateNested={updateNested} errors={errors} />}
          {step === 1 && <StepItinerary pkg={pkg} setPkg={setPkg} errors={errors} updateNested={updateNested} />}
          {step === 2 && <StepGallery pkg={pkg} update={update} />}
          {step === 3 && <StepInclusions pkg={pkg} setPkg={setPkg} />}
          {step === 4 && <StepPreview pkg={pkg} />}
          {step === 5 && <StepPublish pkg={pkg} updateNested={updateNested} onPublish={handlePublish} isEdit={!!id} />}
        </div>

        {/* Bottom Nav */}
        <div className="fixed bottom-[60px] md:bottom-0 left-0 md:left-[256px] right-0 bg-white border-t border-surface-container-high z-30 px-4 md:px-8 py-3 md:py-4 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
          <div className="flex items-center justify-between max-w-[900px] gap-3">
            <button onClick={goBack} disabled={step === 0} className="px-4 md:px-6 py-2.5 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm md:text-base whitespace-nowrap">
              Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={goNext} className="px-4 md:px-8 py-2.5 bg-accent text-white font-semibold rounded-lg hover:bg-accent/90 transition-colors cta-glow text-sm md:text-base whitespace-nowrap">
                Next: {STEPS[step + 1]}
              </button>
            ) : (
              <button onClick={handlePublish} className="px-4 md:px-8 py-2.5 bg-accent text-white font-bold rounded-lg hover:bg-accent/90 transition-colors cta-glow flex items-center gap-2 text-sm md:text-base whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">publish</span>
                {id ? "Update" : "Publish"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// ─── Step 1: Basic Info ──────────────────────────────────────────────────────
function StepBasicInfo({ pkg, update, updateNested, errors }) {
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    if (!tagInput.trim()) return
    if (!pkg.tags.includes(tagInput.trim())) {
      update("tags", [...pkg.tags, tagInput.trim()])
    }
    setTagInput("")
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card title="Package Details" icon="edit_note">
        <div className="space-y-4">
          <FormField label="Package Title *" error={errors.title}>
            <input type="text" value={pkg.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. Unforgettable Alappuzha" className={iCls(errors.title)} />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Starting From (From Location) *" error={errors.fromLocation}>
              <input type="text" value={pkg.fromLocation || ""} onChange={(e) => update("fromLocation", e.target.value)} placeholder="e.g. Kochi, Bangalore" className={iCls(errors.fromLocation)} />
            </FormField>

            <FormField label="Destination (To Location) *" error={errors.destination}>
              <input type="text" value={pkg.destination} onChange={(e) => update("destination", e.target.value)} placeholder="e.g. Srinagar, Kashmir" className={iCls(errors.destination)} />
            </FormField>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormField label="Nights">
              <input type="number" min="1" max="30" value={pkg.duration.nights} onChange={(e) => {
                const n = Math.max(1, Math.min(30, parseInt(e.target.value) || 1))
                updateNested("duration.nights", n)
                updateNested("duration.days", n + 1)
              }} className={iCls()} />
            </FormField>
            <FormField label="Days">
              <input type="number" value={pkg.duration.days} readOnly className={iCls() + " bg-surface-container-low cursor-not-allowed"} />
            </FormField>
            <FormField label="Min Group">
              <input type="number" min="1" value={pkg.groupSize.min} onChange={(e) => updateNested("groupSize.min", parseInt(e.target.value) || 1)} className={iCls()} />
            </FormField>
            <FormField label="Max Group">
              <input type="number" min="1" value={pkg.groupSize.max} onChange={(e) => updateNested("groupSize.max", parseInt(e.target.value) || 10)} className={iCls()} />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Pickup Location">
              <input type="text" value={pkg.pickup} onChange={(e) => update("pickup", e.target.value)} placeholder="e.g. Kochi Airport" className={iCls()} />
            </FormField>
            <FormField label="Drop-off Location">
              <input type="text" value={pkg.dropoff} onChange={(e) => update("dropoff", e.target.value)} placeholder="e.g. Kochi Airport" className={iCls()} />
            </FormField>
          </div>

          <FormField label="Package Type">
            <select value={pkg.type} onChange={(e) => update("type", e.target.value)} className={iCls() + " cursor-pointer"}>
              {["Group Tour", "Private Tour", "Honeymoon", "Adventure", "Pilgrimage", "Wildlife", "Cultural"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </FormField>

          <FormField label="Description">
            <textarea value={pkg.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your tour package..." rows={4} className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-colors" />
            <p className="text-xs text-on-surface-variant mt-1 text-right">{pkg.description.length} characters</p>
          </FormField>
        </div>
      </Card>

      {/* Tags */}
      <Card title="Tags" icon="label">
        <div className="flex flex-wrap gap-2 mb-3">
          {pkg.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1.5 bg-primary/5 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-primary/10">
              {tag}
              <button onClick={() => update("tags", pkg.tags.filter((t) => t !== tag))} className="hover:text-red-500">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} placeholder="Type a tag and press Enter" className={iCls() + " flex-1"} />
          <button onClick={addTag} className="px-4 h-12 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors">Add</button>
        </div>
      </Card>
    </div>
  )
}

function StepItinerary({ pkg, setPkg, errors, updateNested }) {
  const days = pkg.itinerary || []

  // Auto-fill/trim days based on duration
  useEffect(() => {
    setPkg((p) => {
      const targetCount = p.duration.days || 1
      let changed = false
      const newItinerary = [...(p.itinerary || [])]

      if (newItinerary.length !== targetCount) {
        changed = true
        if (newItinerary.length < targetCount) {
          for (let i = newItinerary.length; i < targetCount; i++) {
            newItinerary.push({ day: i + 1, title: "", activities: [{ time: "Morning", desc: "" }] })
          }
        } else {
          newItinerary.splice(targetCount)
        }
      }

      if (changed) return { ...p, itinerary: newItinerary }
      return p
    })
  }, [pkg.duration.days, setPkg])

  const updateDay = (dayIdx, field, val) => {
    setPkg((p) => {
      const newItinerary = [...(p.itinerary || [])]
      newItinerary[dayIdx] = { ...newItinerary[dayIdx], [field]: val }
      return { ...p, itinerary: newItinerary }
    })
  }

  const updateActivity = (dayIdx, actIdx, field, val) => {
    setPkg((p) => {
      const newItinerary = [...(p.itinerary || [])]
      const acts = [...newItinerary[dayIdx].activities]
      acts[actIdx] = { ...acts[actIdx], [field]: val }
      newItinerary[dayIdx] = { ...newItinerary[dayIdx], activities: acts }
      return { ...p, itinerary: newItinerary }
    })
  }

  const addActivity = (dayIdx) => {
    setPkg((p) => {
      const newItinerary = [...(p.itinerary || [])]
      newItinerary[dayIdx] = {
        ...newItinerary[dayIdx],
        activities: [...newItinerary[dayIdx].activities, { time: "Morning", desc: "" }]
      }
      return { ...p, itinerary: newItinerary }
    })
  }

  const removeActivity = (dayIdx, actIdx) => {
    setPkg((p) => {
      const newItinerary = [...(p.itinerary || [])]
      newItinerary[dayIdx] = {
        ...newItinerary[dayIdx],
        activities: newItinerary[dayIdx].activities.filter((_, i) => i !== actIdx)
      }
      return { ...p, itinerary: newItinerary }
    })
  }

  // Tier pricing handlers
  const addTier = () => {
    setPkg((p) => {
      const newTiers = [...(p.tiers || [])]
      newTiers.push({
        name: `Tier ${newTiers.length + 1}`,
        price: 0,
        bedSize: "Twin Sharing",
        hotel: "",
        specialInclusions: "",
        specialExclusions: ""
      })
      return { ...p, tiers: newTiers }
    })
  }

  const updateTier = (idx, field, val) => {
    setPkg((p) => {
      const newTiers = [...(p.tiers || [])]
      newTiers[idx] = { ...newTiers[idx], [field]: val }
      return { ...p, tiers: newTiers }
    })
  }

  const removeTier = (idx) => {
    setPkg((p) => {
      const newTiers = (p.tiers || []).filter((_, i) => i !== idx)
      return { ...p, tiers: newTiers }
    })
  }

  const bedSizes = ["Twin Sharing", "Triple Sharing", "Dormitory Single", "Single Occupancy"]

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Tier Pricing */}
      <Card title="Pricing Tiers" icon="payments">
        {errors?.pricing && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errors.pricing}
          </div>
        )}
        
        <div className="space-y-4">
          {(pkg.tiers || []).map((t, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-surface-container-high bg-surface-container-lowest relative group/tier">
              {pkg.tiers.length > 1 && (
                <button 
                  onClick={() => removeTier(idx)} 
                  className="absolute top-4 right-4 w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg flex items-center justify-center transition-colors"
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Tier Name *">
                  <input type="text" value={t.name} onChange={(e) => updateTier(idx, "name", e.target.value)} placeholder="e.g. Economy, Luxury, Standard" className={iCls()} />
                </FormField>
                
                <FormField label="Price per Person (₹) *">
                  <input type="number" value={t.price || ""} onChange={(e) => updateTier(idx, "price", parseInt(e.target.value) || 0)} placeholder="0" className={iCls()} />
                </FormField>

                <FormField label="Bed Size Category">
                  <select value={t.bedSize || "Twin Sharing"} onChange={(e) => updateTier(idx, "bedSize", e.target.value)} className={iCls() + " cursor-pointer"}>
                    {bedSizes.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <FormField label="Hotel Category / Details">
                  <input type="text" value={t.hotel || ""} onChange={(e) => updateTier(idx, "hotel", e.target.value)} placeholder="e.g. 3 Star Guest House" className={iCls()} />
                </FormField>
                
                <FormField label="Special Inclusions for this Tier">
                  <input type="text" value={t.specialInclusions || ""} onChange={(e) => updateTier(idx, "specialInclusions", e.target.value)} placeholder="e.g. Free spa, candle light dinner" className={iCls()} />
                </FormField>

                <FormField label="Special Exclusions for this Tier">
                  <input type="text" value={t.specialExclusions || ""} onChange={(e) => updateTier(idx, "specialExclusions", e.target.value)} placeholder="e.g. Flights not included" className={iCls()} />
                </FormField>
              </div>
            </div>
          ))}

          <button 
            type="button" 
            onClick={addTier} 
            className="flex items-center gap-1 text-sm text-accent font-semibold hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span> Add Pricing Tier
          </button>
        </div>
      </Card>

      {/* Day-by-Day Itinerary */}
      <Card title="Day-by-Day Itinerary" icon="map">
        <div className="space-y-4">
          {days.slice(0, pkg.duration.days).map((day, dayIdx) => (
            <div key={dayIdx} className="border border-surface-container-high rounded-xl overflow-hidden bg-white">
              {/* Day Header */}
              <div className="bg-surface-container-low px-4 py-3 flex items-center gap-3">
                <span className="bg-accent text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">{day.day || dayIdx + 1}</span>
                <input
                  type="text"
                  value={day.title}
                  onChange={(e) => updateDay(dayIdx, "title", e.target.value)}
                  placeholder={`Day ${dayIdx + 1} Title (e.g. Arrival & Exploration)`}
                  className="flex-1 bg-transparent border-none outline-none text-sm font-semibold text-primary placeholder:text-on-surface-variant"
                />
              </div>

              {/* Activities */}
              <div className="p-4 space-y-3">
                {day.activities.map((act, actIdx) => (
                  <div key={actIdx} className="flex items-start gap-2">
                    <input
                      type="text"
                      value={act.time}
                      onChange={(e) => updateActivity(dayIdx, actIdx, "time", e.target.value)}
                      placeholder="Time (e.g. Morning, 09:00 AM)"
                      className="h-10 px-3 border border-surface-container-high rounded-lg text-sm w-36 focus:border-primary outline-none"
                    />
                    <input
                      type="text"
                      value={act.desc}
                      onChange={(e) => updateActivity(dayIdx, actIdx, "desc", e.target.value)}
                      placeholder="Describe the activity..."
                      className="flex-1 h-10 px-3 border border-surface-container-high rounded-lg text-sm focus:border-primary outline-none"
                    />
                    {day.activities.length > 1 && (
                      <button onClick={() => removeActivity(dayIdx, actIdx)} className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    )}
                  </div>
                ))}
                <button onClick={() => addActivity(dayIdx)} className="text-xs text-accent font-semibold flex items-center gap-1 hover:underline">
                  <span className="material-symbols-outlined text-[16px]">add</span> Add Activity
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => {
              const currentNights = pkg.duration.nights || 1
              updateNested("duration.nights", currentNights + 1)
              updateNested("duration.days", currentNights + 2)
            }}
            className="w-full py-3 border-2 border-dashed border-surface-container-high rounded-xl text-primary font-bold text-sm hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span> Add Next Day
          </button>
        </div>
      </Card>

      {/* Shopping Recommendations */}
      <Card title="Shopping Recommendations" icon="shopping_bag">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">Add recommended local markets, shops, or souvenirs for travelers to look out for during this trip.</p>
          <textarea
            value={pkg.shoppingTips || ""}
            onChange={(e) => setPkg(p => ({ ...p, shoppingTips: e.target.value }))}
            placeholder="e.g. Kashmir Arts Emporium (near Lal Chowk) for Pashmina shawls, local spice markets, etc."
            rows={4}
            className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-sm focus:border-primary outline-none resize-none"
          />
        </div>
      </Card>
    </div>
  )
}

// ─── Step 3: Gallery ─────────────────────────────────────────────────────────
function StepGallery({ pkg, update }) {
  return (
    <div className="animate-fade-in-up">
      <Card title="Package Gallery" icon="photo_library">
        <p className="text-sm text-on-surface-variant mb-4">Upload photos of destinations, hotels, and activities. The first image will be your cover photo.</p>
        <ImageUploader images={pkg.images} onChange={(imgs) => update("images", imgs)} maxImages={10} />
      </Card>
    </div>
  )
}

function StepInclusions({ pkg, setPkg }) {
  const [incInput, setIncInput] = useState("")
  const [excInput, setExcInput] = useState("")
  const [expIcon, setExpIcon] = useState("")
  const [expLabel, setExpLabel] = useState("")

  const inclusions = pkg.inclusions || []
  const exclusions = pkg.exclusions || []

  const addInclusion = () => {
    if (!incInput.trim()) return
    setPkg((p) => ({
      ...p,
      inclusions: [...(p.inclusions || []), incInput.trim()]
    }))
    setIncInput("")
  }
  const addExclusion = () => {
    if (!excInput.trim()) return
    setPkg((p) => ({
      ...p,
      exclusions: [...(p.exclusions || []), excInput.trim()]
    }))
    setExcInput("")
  }
  const addExperience = () => {
    if (!expLabel.trim()) return
    setPkg((p) => ({ ...p, experiences: [...p.experiences, { icon: expIcon || "star", label: expLabel.trim() }] }))
    setExpIcon("")
    setExpLabel("")
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inclusions */}
        <Card title="General Inclusions" icon="check_circle" iconColor="text-green-600">
          <div className="space-y-2 mb-3">
            {inclusions.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-green-50 p-2.5 rounded-lg">
                <span className="material-symbols-outlined filled text-[16px] text-green-500">check_circle</span>
                <span className="flex-1 text-sm">{item}</span>
                <button onClick={() => setPkg((p) => ({ ...p, inclusions: p.inclusions.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600" type="button">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={incInput} onChange={(e) => setIncInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addInclusion())} placeholder="e.g. Airport transfers" className={iCls() + " flex-1"} />
            <button onClick={addInclusion} type="button" className="px-3 h-12 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700">Add</button>
          </div>
        </Card>

        {/* Exclusions */}
        <Card title="General Exclusions" icon="cancel" iconColor="text-red-500">
          <div className="space-y-2 mb-3">
            {exclusions.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-red-50 p-2.5 rounded-lg">
                <span className="material-symbols-outlined filled text-[16px] text-red-400">cancel</span>
                <span className="flex-1 text-sm">{item}</span>
                <button onClick={() => setPkg((p) => ({ ...p, exclusions: p.exclusions.filter((_, j) => j !== i) }))} className="text-red-400 hover:text-red-600" type="button">
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input type="text" value={excInput} onChange={(e) => setExcInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExclusion())} placeholder="e.g. Airfare" className={iCls() + " flex-1"} />
            <button onClick={addExclusion} type="button" className="px-3 h-12 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600">Add</button>
          </div>
        </Card>
      </div>

      {/* Key Experiences */}
      <Card title="Key Experiences" icon="auto_awesome">
        <p className="text-xs text-on-surface-variant mb-3">Select an icon and add a label for each experience your tour offers.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {pkg.experiences.map((exp, i) => (
            <span key={i} className="flex items-center gap-1.5 bg-accent/5 text-accent text-xs font-medium px-3 py-2 rounded-full border border-accent/10">
              <span className="material-symbols-outlined text-[16px]">{exp.icon}</span>
              {exp.label}
              <button onClick={() => setPkg((p) => ({ ...p, experiences: p.experiences.filter((_, j) => j !== i) }))} className="hover:text-red-500 ml-1" type="button">
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap md:flex-nowrap">
          <div className="relative w-full md:w-44">
            <select value={expIcon} onChange={(e) => setExpIcon(e.target.value)} className={iCls() + " cursor-pointer appearance-none pr-8"}>
              <option value="">Select Icon</option>
              <option value="sailing">⛵ Boat Trip</option>
              <option value="beach_access">🏖️ Beach</option>
              <option value="landscape">🏔️ Mountains</option>
              <option value="forest">🌲 Forest</option>
              <option value="temple_hindu">🛕 Temple</option>
              <option value="church">⛪ Church</option>
              <option value="museum">🏛️ Museum</option>
              <option value="restaurant">🍽️ Dining</option>
              <option value="hotel">🏨 Hotel</option>
              <option value="hiking">🥾 Trekking</option>
              <option value="scuba_diving">🤿 Scuba Diving</option>
              <option value="surfing">🏄 Water Sports</option>
              <option value="kayaking">🛶 Rafting</option>
              <option value="spa">💆 Spa</option>
              <option value="local_cafe">☕ Cafe</option>
              <option value="nightlife">🌃 Nightlife</option>
              <option value="shopping_bag">🛍️ Shopping</option>
              <option value="photo_camera">📷 Photography</option>
              <option value="self_improvement">🧘 Yoga</option>
              <option value="pets">🐪 Safari</option>
              <option value="ac_unit">❄️ Snow</option>
              <option value="paragliding">🪂 Paragliding</option>
              <option value="directions_car">🚗 Road Trip</option>
              <option value="train">🚂 Train</option>
              <option value="lighthouse">🗼 Lighthouse</option>
              <option value="water">💧 Waterfall</option>
              <option value="star">⭐ Special</option>
            </select>
          </div>
          <input type="text" value={expLabel} onChange={(e) => setExpLabel(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExperience())} placeholder="Experience label (e.g. Boat Trip)" className={iCls() + " flex-1"} />
          <button onClick={addExperience} type="button" className="px-4 h-12 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent/90 whitespace-nowrap">Add</button>
        </div>
      </Card>
    </div>
  )
}

function StepPublish({ pkg, updateNested, onPublish, isEdit }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <Card title="Provider Details" icon="person">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Provider / Agency Name">
            <input type="text" value={pkg.provider.name} onChange={(e) => updateNested("provider.name", e.target.value)} className={iCls()} />
          </FormField>
          <FormField label="Phone">
            <input type="tel" value={pkg.provider.phone} onChange={(e) => updateNested("provider.phone", e.target.value)} className={iCls()} />
          </FormField>
          <FormField label="WhatsApp Number">
            <input type="tel" value={pkg.provider.whatsapp} onChange={(e) => updateNested("provider.whatsapp", e.target.value)} placeholder="e.g. 919876543210" className={iCls()} />
          </FormField>
          <FormField label="Email">
            <input type="email" value={pkg.provider.email} onChange={(e) => updateNested("provider.email", e.target.value)} className={iCls()} />
          </FormField>
        </div>
      </Card>

      {/* Preview Card */}
      <div className="bg-primary rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2">Everything looks good?</h3>
          <p className="text-white/70 text-sm mb-4">Review how your package will appear to travelers before publishing.</p>
          <div className="flex gap-3">
            <button onClick={onPublish} className="px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all cta-glow flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">publish</span>
              {isEdit ? "Update Package" : "Publish Package"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Card title="Package Summary" icon="summarize">
        <div className="space-y-3 text-sm">
          <SummaryRow label="Title" value={pkg.title || "—"} />
          <SummaryRow label="Starting From" value={pkg.fromLocation || "—"} />
          <SummaryRow label="Destination" value={pkg.destination || "—"} />
          <SummaryRow label="Duration" value={pkg.duration ? `${pkg.duration.nights}N/${pkg.duration.days}D` : "—"} />
          <SummaryRow label="Group Size" value={pkg.groupSize ? `${pkg.groupSize.min}–${pkg.groupSize.max}` : "—"} />
          
          {pkg.tiers?.map((t, idx) => (
            <SummaryRow 
              key={idx} 
              label={`${t.name} Price`} 
              value={t.price ? `₹${t.price.toLocaleString("en-IN")} / person (${t.bedSize || "Twin Sharing"})` : "—"} 
            />
          ))}

          <SummaryRow label="Images" value={`${pkg.images?.length || 0} uploaded`} />
          <SummaryRow label="General Inclusions" value={`${pkg.inclusions?.length || 0} items`} />
          <SummaryRow label="General Exclusions" value={`${pkg.exclusions?.length || 0} items`} />
          <SummaryRow label="Tags" value={pkg.tags?.join(", ") || "—"} />
        </div>
      </Card>
    </div>
  )
}

// ─── Shared Components ───────────────────────────────────────────────────────
function Card({ title, icon, iconColor = "text-accent", children }) {
  return (
    <div className="bg-white rounded-xl border border-surface-container-high shadow-soft p-5 md:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className={`material-symbols-outlined text-[20px] ${iconColor}`}>{icon}</span>
        <h3 className="font-bold text-primary text-sm">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function FormField({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-surface-container-high last:border-0">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-medium text-primary">{value}</span>
    </div>
  )
}

function iCls(err) {
  return `w-full h-12 px-4 border rounded-lg text-sm outline-none transition-colors ${
    err ? "border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-surface-container-high focus:border-primary focus:ring-1 focus:ring-primary"
  }`
}

function StepPreview({ pkg }) {
  const normalizedTiers = Array.isArray(pkg.tiers) ? pkg.tiers : []
  const [activeTierIdx, setActiveTierIdx] = useState(0)
  const activeTierData = normalizedTiers[activeTierIdx] || normalizedTiers[0] || { name: "", price: 0, hotel: "", specialInclusions: "", specialExclusions: "" }
  const displayItinerary = pkg.itinerary || []

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-[24px]">devices</span>
        <div>
          <h4 className="font-bold text-primary text-sm">Interactive Package Preview</h4>
          <p className="text-xs text-on-surface-variant font-medium">This is a live sandbox preview of how travelers will experience your tour page. Try selecting different tiers!</p>
        </div>
      </div>

      {/* Browser Mockup Frame */}
      <div className="border border-surface-container-high rounded-2xl shadow-elevated bg-surface overflow-hidden">
        {/* Browser Top Bar Mockup */}
        <div className="bg-surface-container-low border-b border-surface-container-high px-4 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
          </div>
          <div className="flex-1 max-w-[400px] mx-auto bg-white border border-surface-container rounded-md py-1 px-3 text-[10px] text-center text-on-surface-variant font-medium truncate select-none">
            touriq.com/package/{pkg.id || "preview"}
          </div>
        </div>

        {/* Live Detail Page Preview Content */}
        <div className="p-4 md:p-6 space-y-6 max-h-[600px] overflow-y-auto bg-surface-bright">
          {/* Gallery */}
          {pkg.images && pkg.images.length > 0 ? (
            <ImageGallery images={pkg.images} />
          ) : (
            <div className="w-full h-48 bg-surface-container-low border border-surface-container border-dashed rounded-xl flex flex-col items-center justify-center text-outline">
              <span className="material-symbols-outlined text-[48px]">photo_library</span>
              <p className="text-xs font-semibold mt-1">No images uploaded yet</p>
            </div>
          )}

          {/* Header info */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">{pkg.type}</span>
              {pkg.duration && (
                <span className="bg-accent/10 text-accent text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pkg.duration.nights}N / {pkg.duration.days}D
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-primary">{pkg.title || "Untitled Package"}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-on-surface-variant text-[11px]">
              {pkg.fromLocation && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px] text-accent">flight_land</span>
                  <span className="font-semibold text-outline text-[8px] uppercase">From:</span> {pkg.fromLocation}
                </span>
              )}
              <span className="flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[13px] text-accent">location_on</span>
                <span className="font-semibold text-outline text-[8px] uppercase">To:</span> {pkg.destination || "Destination"}
              </span>
              {pkg.groupSize && (
                <span className="flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">group</span>
                  {pkg.groupSize.min}–{pkg.groupSize.max} travelers
                </span>
              )}
            </div>
          </div>

          {/* Details split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col */}
            <div className="lg:col-span-2 space-y-6">
              {/* Overview */}
              <section>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Overview</h4>
                <p className="text-xs text-on-surface leading-relaxed whitespace-pre-line">{pkg.description || "No overview provided yet."}</p>
              </section>

              {/* Key Experiences */}
              {pkg.experiences && pkg.experiences.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Key Experiences</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {pkg.experiences.map((exp, i) => (
                      <div key={i} className="bg-white rounded-lg border border-surface-container-high p-2 text-center flex flex-col items-center justify-center">
                        <span className="material-symbols-outlined text-accent text-[20px]">{exp.icon}</span>
                        <p className="text-[10px] font-semibold text-primary mt-1">{exp.label}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Itinerary */}
              {displayItinerary.length > 0 && (
                <section>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Detailed Itinerary</h4>
                  <div className="bg-white rounded-xl border border-surface-container-high p-4">
                    <ItineraryTimeline itinerary={displayItinerary} />
                  </div>
                </section>
              )}

              {/* Inclusions */}
              <section>
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Inclusions & Exclusions</h4>
                <InclusionsList
                  inclusions={pkg.inclusions || []}
                  exclusions={pkg.exclusions || []}
                  specialInclusions={activeTierData.specialInclusions}
                  specialExclusions={activeTierData.specialExclusions}
                  activeTier={activeTierData.name}
                />
              </section>

              {/* Shopping Recommendations */}
              {pkg.shoppingTips && (
                <section>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-accent text-[16px]">shopping_bag</span>
                    Shopping Recommendations
                  </h4>
                  <div className="bg-white rounded-xl border border-surface-container-high p-4 shadow-soft">
                    <p className="text-xs text-on-surface leading-relaxed whitespace-pre-line">{pkg.shoppingTips}</p>
                  </div>
                </section>
              )}
            </div>

            {/* Right sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-surface-container-high shadow-soft p-4">
                {/* Tier Selector */}
                {normalizedTiers.length > 1 && (
                  <div className="flex bg-surface-container-low rounded-lg p-0.5 mb-3 overflow-x-auto hide-scroll">
                    {normalizedTiers.map((t, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTierIdx(idx)}
                        className={`flex-1 py-1.5 px-2.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                          activeTierIdx === idx ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:text-primary"
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="text-center mb-3">
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-2xl font-bold text-accent">₹{(activeTierData.price || 0).toLocaleString("en-IN")}</span>
                    <span className="text-[10px] text-on-surface-variant">/person</span>
                  </div>
                  {activeTierData.bedSize && (
                    <p className="text-[10px] font-semibold text-accent mt-0.5">{activeTierData.bedSize}</p>
                  )}
                  {activeTierData.hotel && (
                    <p className="text-[10px] text-on-surface-variant mt-0.5">{activeTierData.hotel}</p>
                  )}
                </div>
                
                <button className="w-full py-2 bg-accent text-white font-bold rounded-lg text-xs opacity-70 cursor-not-allowed text-center select-none" disabled>
                  Show Interest (Traveler Button)
                </button>
              </div>

              {/* Provider Info */}
              <div className="bg-white rounded-xl border border-surface-container-high p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs select-none">
                  {pkg.provider?.avatar || pkg.provider?.name?.[0] || "A"}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-primary text-xs truncate">{pkg.provider?.name || "Agency Name"}</p>
                  <p className="text-[10px] text-on-surface-variant truncate">{pkg.provider?.email || "Email"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

