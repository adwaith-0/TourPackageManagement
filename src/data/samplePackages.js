// ─── Tour Packages Data ─────────────────────────────────────────────────────
// No demo data — only agent-created packages will appear in the marketplace.

export const samplePackages = []

// Helper to create a blank package template for agents
export const createBlankPackage = () => ({
  id: `pkg-${Date.now()}`,
  title: "",
  destination: "",
  description: "",
  duration: { nights: 1, days: 2 },
  groupSize: { min: 1, max: 10 },
  pickup: "",
  dropoff: "",
  type: "Group Tour",
  images: [],
  tiers: {
    luxury: { price: 0, hotel: "", inclusions: "" },
    budget: { price: 0, hotel: "", inclusions: "" },
  },
  itineraries: {
    luxury: [{ day: 1, title: "", activities: [{ time: "Morning", desc: "" }] }],
    budget: [{ day: 1, title: "", activities: [{ time: "Morning", desc: "" }] }],
  },
  inclusions: { luxury: [], budget: [] },
  exclusions: { luxury: [], budget: [] },
  experiences: [],
  provider: {
    name: "",
    phone: "",
    whatsapp: "",
    email: "",
    verified: false,
    rating: 0,
    reviewCount: 0,
    avatar: "",
  },
  rating: 0,
  reviewCount: 0,
  reviews: [],
  tags: [],
  featured: false,
  createdAt: new Date().toISOString().split("T")[0],
})
