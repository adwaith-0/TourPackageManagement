// ─── Package API Service ──────────────────────────────────────────
// All package CRUD via backend at localhost:3001.
// Maps between backend shape (PackageDocument / PackageListItem)
// and the frontend shape used by components.

const API_BASE = 'http://localhost:3001'

// ─── Backend Full Document → Frontend Shape ──────────────────────

export function mapBackendToFrontend(doc) {
  if (!doc) return null
  const numDays = doc.itineraries?.length || 1
  const numNights = Math.max(numDays - 1, 0)

  const tiers = (doc.costPackages || []).map((cp) => ({
    name: cp.name || '',
    price: parseFloat(cp.amount) || 0,
    hotel: cp.hotel || '',
    specialInclusions: Array.isArray(cp.inclusions) ? cp.inclusions.join(', ') : cp.inclusions || '',
    specialExclusions: [],
    bedSize: '',
  }))

  const itinerary = (doc.itineraries || []).map((it) => ({
    day: it.dayNumber,
    title: `Day ${it.dayNumber}`,
    activities: (it.items || []).map((item) => ({ time: '', desc: item })),
  }))

  const experiences = (doc.experiencesOffered || []).map((exp) => ({
    icon: '',
    label: exp,
  }))

  return {
    id: doc.packageId,
    agentId: doc.userId,
    title: doc.packageName || '',
    destination: doc.place || '',
    fromLocation: '',
    description: doc.description || '',
    pickup: doc.pickupLocation || '',
    dropoff: doc.dropoffLocation || '',
    startDate: toHTMLDate(doc.startDate),
    endDate: toHTMLDate(doc.endDate),
    duration: { nights: numNights, days: numDays },
    groupSize: { min: doc.minNumGuests || 1, max: doc.maxNumGuests || 10 },
    images: doc.gallery || [],
    experiences,
    shoppingTips: (doc.shopping || []).join(', '),
    shopping: doc.shopping || [],
    itinerary,
    tiers,
    inclusions: doc.inclusions || [],
    exclusions: doc.exclusions || [],
    paymentDetails: doc.paymentDetails || {},
    provider: {
      name: doc.contact?.name || '',
      phone: doc.contact?.phoneNumber || '',
      whatsapp: doc.contact?.phoneNumber || '',
      email: doc.contact?.email || '',
      verified: false,
      rating: 0,
      reviewCount: 0,
      avatar: doc.contact?.name?.[0] || 'T',
    },
    contact: doc.contact || {},
    status: doc.status === 'Active' ? 'approved' : 'inactive',
    archived: doc.status === 'Inactive',
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
    type: 'Group Tour',
    tags: [],
    rating: 0,
    reviewCount: 0,
    reviews: [],
    featured: false,
  }
}

// ─── Backend List Item (Summary) → Frontend Shape ────────────────

export function mapListItemToFrontend(item) {
  if (!item) return null

  const getFallbackImage = (destination) => {
    const dest = String(destination || "").toLowerCase()
    if (dest.includes("alappuzha")) {
      return "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&auto=format&fit=crop&q=60"
    }
    if (dest.includes("thiruvananthapuram") || dest.includes("trivandrum")) {
      return "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=600&auto=format&fit=crop&q=60"
    }
    if (dest.includes("munnar")) {
      return "https://images.unsplash.com/photo-1506461883276-594a12b11cc3?w=600&auto=format&fit=crop&q=60"
    }
    if (dest.includes("wayanad")) {
      return "https://images.unsplash.com/photo-1581791538302-03537b9c97bf?w=600&auto=format&fit=crop&q=60"
    }
    if (dest.includes("kochi") || dest.includes("cochin")) {
      return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&auto=format&fit=crop&q=60"
    }
    return "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&auto=format&fit=crop&q=60"
  }

  const image = getFallbackImage(item.place)

  return {
    id: item.packageId,
    title: item.packageName,
    destination: item.place,
    startDate: item.startDate,
    endDate: item.endDate,
    description: item.description,
    groupSize: { min: item.minNumGuests, max: item.maxNumGuests },
    startingPrice: item.minAmount,
    images: [image],
    duration: { nights: 0, days: 0 },
    tiers:
      item.minAmount != null
        ? [{ name: 'Starting', price: item.minAmount, hotel: '', specialInclusions: [], specialExclusions: [], bedSize: '' }]
        : [],
    experiences: [],
    rating: 0,
    reviewCount: 0,
    provider: { name: '', phone: '', whatsapp: '', email: '', verified: false, rating: 0, reviewCount: 0, avatar: 'T' },
    type: '',
    tags: [],
    status: 'approved',
    archived: false,
    itinerary: [],
    inclusions: [],
    exclusions: [],
    featured: false,
    reviews: [],
    fromLocation: '',
    pickup: '',
    dropoff: '',
    shoppingTips: '',
    shopping: [],
    paymentDetails: {},
    contact: {},
    createdAt: '',
    updatedAt: '',
    agentId: '',
  }
}

// ─── Frontend → Backend Shape (for create / update) ──────────────

function toHTMLDate(backendDate) {
  if (!backendDate) return ""
  const d = new Date(backendDate)
  if (isNaN(d.getTime())) return ""
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatDateDDMMMYYYY(date) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`
}

export function mapFrontendToBackend(pkg, userId) {
  const itineraries = (pkg.itinerary || []).map((day) => ({
    dayNumber: day.day || 1,
    items: (day.activities || [])
      .map((act) => (typeof act === 'string' ? act : act.desc || ''))
      .filter(Boolean),
  }))
  if (itineraries.length === 0) itineraries.push({ dayNumber: 1, items: ['Arrival & Check-in'] })

  const costPackages = (Array.isArray(pkg.tiers) ? pkg.tiers : []).map((tier) => {
    const rawInclusions = tier.specialInclusions
    const inclusions = typeof rawInclusions === 'string'
      ? rawInclusions.split(',').map((x) => x.trim()).filter(Boolean)
      : Array.isArray(rawInclusions)
        ? rawInclusions
        : []
    return {
      name: tier.name || 'Standard',
      hotel: tier.hotel || '3 Star',
      inclusions: inclusions.length > 0 ? inclusions : ['As per package'],
      amount: String(tier.price || '0'),
      currency: 'INR',
    }
  })
  if (costPackages.length === 0)
    costPackages.push({ name: 'Standard', hotel: '3 Star', inclusions: ['As per package'], amount: '0', currency: 'INR' })

  const experiencesOffered = (pkg.experiences || [])
    .map((exp) => (typeof exp === 'string' ? exp : exp.label || ''))
    .filter(Boolean)
  if (experiencesOffered.length === 0) experiencesOffered.push('Sightseeing')

  const shopping = Array.isArray(pkg.shopping)
    ? pkg.shopping
    : typeof pkg.shoppingTips === 'string'
      ? pkg.shoppingTips.split(',').map((s) => s.trim()).filter(Boolean)
      : []
  if (shopping.length === 0) shopping.push('Local Markets')

  const contact = {
    name: pkg.provider?.name || pkg.contact?.name || 'Contact',
    phoneNumber: pkg.provider?.phone || pkg.contact?.phoneNumber || '0000000000',
    email: pkg.provider?.email || pkg.contact?.email || 'contact@touriq.com',
  }

  const paymentDetails =
    pkg.paymentDetails && pkg.paymentDetails.upiId
      ? pkg.paymentDetails
      : { upiId: 'na', upiPhoneNumber: '0000000000', accountNumber: '0000000000', bank: 'na', ifsc: 'XXXX0000000' }

  const startDate = pkg.startDate ? formatDateDDMMMYYYY(pkg.startDate) : formatDateDDMMMYYYY(new Date())
  const endDate = pkg.endDate ? formatDateDDMMMYYYY(pkg.endDate) : formatDateDDMMMYYYY(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000))

  const inclusions = (Array.isArray(pkg.inclusions) ? pkg.inclusions : []).filter(Boolean)
  if (inclusions.length === 0) inclusions.push('As per package')

  const exclusions = (Array.isArray(pkg.exclusions) ? pkg.exclusions : []).filter(Boolean)
  if (exclusions.length === 0) exclusions.push('Items not mentioned in inclusions')

  return {
    userId: userId || pkg.agentId || '',
    place: pkg.destination || '',
    packageName: pkg.title || '',
    startDate,
    endDate,
    description: pkg.description || '',
    pickupLocation: pkg.pickup || '',
    dropoffLocation: pkg.dropoff || '',
    minNumGuests: pkg.groupSize?.min || 1,
    maxNumGuests: pkg.groupSize?.max || 10,
    gallery: (pkg.images || []).filter(Boolean),
    experiencesOffered,
    shopping,
    itineraries,
    inclusions,
    exclusions,
    costPackages,
    paymentDetails,
    contact,
  }
}

// ─── Date format helper for search ───────────────────────────────
// Converts YYYY-MM-DD (HTML date input) → DD-MMM-YYYY (backend)
export function toBackendDate(htmlDate) {
  if (!htmlDate) return ''
  return formatDateDDMMMYYYY(htmlDate)
}

// ─── API Calls ───────────────────────────────────────────────────

export function saveCustomDestination(place) {
  if (!place) return
  try {
    const key = 'touriq_custom_destinations'
    const stored = JSON.parse(localStorage.getItem(key) || '[]')
    const cleaned = place.trim()
    if (cleaned && !stored.some(d => d.toLowerCase() === cleaned.toLowerCase())) {
      stored.push(cleaned)
      localStorage.setItem(key, JSON.stringify(stored))
    }
  } catch (e) {
    console.error('Failed to save custom destination:', e)
  }
}

async function enhanceListWithDetails(listItems) {
  try {
    return await Promise.all(
      listItems.map(async (item) => {
        try {
          const detailRes = await fetch(`${API_BASE}/packages/details?packageId=${encodeURIComponent(item.id)}&t=${Date.now()}`)
          const detailJson = await detailRes.json()
          if (detailJson.success && detailJson.data?.gallery && detailJson.data.gallery.length > 0) {
            return {
              ...item,
              images: detailJson.data.gallery,
            }
          }
        } catch (e) {
          console.error("Error fetching details for list image:", e)
        }
        return item
      })
    )
  } catch (err) {
    console.error("Error enhancing list:", err)
    return listItems
  }
}

export async function createPackageAPI(frontendPkg, userId) {
  const body = mapFrontendToBackend(frontendPkg, userId)
  const res = await fetch(`${API_BASE}/packages/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.errorMessage || 'Failed to create package')
  if (body.place) {
    saveCustomDestination(body.place)
  }
  return mapBackendToFrontend(json.data)
}

export async function updatePackageAPI(frontendPkg, userId) {
  const body = mapFrontendToBackend(frontendPkg, userId)
  body.packageId = frontendPkg.id
  const res = await fetch(`${API_BASE}/packages/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.errorMessage || 'Failed to update package')
  if (body.place) {
    saveCustomDestination(body.place)
  }
  return mapBackendToFrontend(json.data)
}

export async function inactivatePackageAPI(packageId) {
  const res = await fetch(`${API_BASE}/packages/inactivate?packageId=${encodeURIComponent(packageId)}`, {
    method: 'PUT',
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.errorMessage || 'Failed to inactivate package')
  return mapBackendToFrontend(json.data)
}

export async function activatePackageAPI(packageId) {
  const res = await fetch(`${API_BASE}/packages/activate?packageId=${encodeURIComponent(packageId)}`, {
    method: 'PUT',
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.errorMessage || 'Failed to activate package')
  return mapBackendToFrontend(json.data)
}

export async function listPackagesAPI(place, date) {
  const params = new URLSearchParams()
  if (place) params.set('place', place)
  if (date) params.set('date', date)
  params.set('t', Date.now().toString())
  const res = await fetch(`${API_BASE}/packages/list?${params.toString()}`)
  const json = await res.json()
  if (!json.success) return []
  const listItems = (json.data || []).map(mapListItemToFrontend)
  return enhanceListWithDetails(listItems)
}

export async function getPackageDetailsAPI(packageId) {
  const res = await fetch(`${API_BASE}/packages/details?packageId=${encodeURIComponent(packageId)}&t=${Date.now()}`)
  const json = await res.json()
  if (!json.success) return null
  return mapBackendToFrontend(json.data)
}

export async function listPackagesByUserAPI(userId) {
  try {
    const [activeRes, inactiveRes] = await Promise.all([
      fetch(`${API_BASE}/packages/listByUser?userId=${encodeURIComponent(userId)}&status=Active&t=${Date.now()}`),
      fetch(`${API_BASE}/packages/listByUser?userId=${encodeURIComponent(userId)}&status=Inactive&t=${Date.now()}`)
    ])
    
    const activeJson = await activeRes.json()
    const inactiveJson = await inactiveRes.json()
    
    const activePkgs = activeJson.success 
      ? (activeJson.data || []).map(p => {
          if (p.place) saveCustomDestination(p.place)
          return { ...mapListItemToFrontend(p), status: 'approved' }
        }) 
      : []
      
    const inactivePkgs = inactiveJson.success 
      ? (inactiveJson.data || []).map(p => {
          if (p.place) saveCustomDestination(p.place)
          return { ...mapListItemToFrontend(p), status: 'inactive' }
        }) 
      : []
      
    const combined = [...activePkgs, ...inactivePkgs]
    return enhanceListWithDetails(combined)
  } catch (err) {
    console.error("Error fetching packages by user:", err)
    return []
  }
}

