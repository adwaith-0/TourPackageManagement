import { useState, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import TopBar from "../components/Topbar"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PackageCard from "../components/package/PackageCard"
import FilterSidebar from "../components/ui/FilterSidebar"
import SearchBar from "../components/ui/SearchBar"
import { useApp } from "../context/AppContext"

export default function SearchResults() {
  const { state } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState("recommended")

  const [filters, setFilters] = useState({
    to: searchParams.get("to") || "",
    from: searchParams.get("from") || "",
    departure: searchParams.get("departure") || "",
    returnDate: searchParams.get("return") || "",
    travelers: searchParams.get("travelers") || "",
    minPrice: "",
    maxPrice: "",
    durations: [],
    minRating: null,
    types: [],
  })

  // Helper to update URL parameters reactively
  const updateURLParam = (key, value) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params, { replace: true })
  }

  // Keep state synced if query parameters change (e.g. clicking popular link)
  const searchParamsStr = searchParams.toString()
  const [prevSearchParamsStr, setPrevSearchParamsStr] = useState(searchParamsStr)

  if (searchParamsStr !== prevSearchParamsStr) {
    setPrevSearchParamsStr(searchParamsStr)
    setFilters((prev) => ({
      ...prev,
      to: searchParams.get("to") || "",
      from: searchParams.get("from") || "",
      departure: searchParams.get("departure") || "",
      returnDate: searchParams.get("return") || "",
      travelers: searchParams.get("travelers") || "",
    }))
  }

  // Handle search submit from custom SearchBar
  const handleSearch = (searchData) => {
    const params = new URLSearchParams()
    if (searchData.to?.trim()) params.set("to", searchData.to.trim())
    if (searchData.from?.trim()) params.set("from", searchData.from.trim())
    if (searchData.departure) params.set("departure", searchData.departure)
    if (searchData.returnDate) params.set("return", searchData.returnDate)
    if (searchData.travelers) params.set("travelers", searchData.travelers)
    setSearchParams(params, { replace: true })
  }

  // Levenshtein distance for typo tolerance
  const getEditDistance = (a, b) => {
    if (a.length === 0) return b.length
    if (b.length === 0) return a.length
    const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null))
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const indicator = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1, // deletion
          matrix[i - 1][j - 1] + indicator // substitution
        )
      }
    }
    return matrix[a.length][b.length]
  }

  // Helper to check if a query fuzzy matches a text
  const fuzzyMatch = (query, text) => {
    if (!text || !query) return false
    const t = text.toLowerCase()
    const q = query.toLowerCase().trim()
    if (t.includes(q)) return true
    
    // Only apply fuzzy matching for words that are decently long
    if (q.length > 3) {
      const words = t.split(/[\s,]+/)
      for (const w of words) {
        if (w.length > 3) {
          const dist = getEditDistance(q, w)
          // Allow up to 2 typos for longer words
          if (dist <= 2) return true
        }
      }
    }
    return false
  }

  // Filter + Sort packages
  const results = useMemo(() => {
    let pkgs = [...state.packages]

    const getStartPrice = (p) => {
      const prices = [p.tiers?.budget?.price, p.tiers?.luxury?.price].filter(
        (val) => typeof val === "number" && val > 0
      )
      return prices.length > 0 ? Math.min(...prices) : 0
    }

    // Text search across title, destination, tags, description, type (To field)
    if (filters.to) {
      const q = filters.to
      pkgs = pkgs.filter((p) =>
        fuzzyMatch(q, p.title) ||
        fuzzyMatch(q, p.destination) ||
        fuzzyMatch(q, p.type) ||
        fuzzyMatch(q, p.description) ||
        p.tags?.some((t) => fuzzyMatch(q, t)) ||
        fuzzyMatch(q, p.pickup) ||
        fuzzyMatch(q, p.dropoff)
      )
    }



    // Departure and return dates (Duration verification)
    if (filters.departure && filters.returnDate) {
      const dep = new Date(filters.departure)
      const ret = new Date(filters.returnDate)
      const diffTime = Math.abs(ret - dep)
      const diffNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Filter out packages where the package duration is longer than the user's available nights
      pkgs = pkgs.filter((p) => {
        const pNights = p.duration?.nights || 0
        return pNights <= diffNights
      })
    }

    // Travelers count vs group size limits
    if (filters.travelers) {
      const guests = Number(filters.travelers)
      pkgs = pkgs.filter((p) => {
        const min = p.groupSize?.min ?? 1
        const max = p.groupSize?.max ?? 100
        return guests >= min && guests <= max
      })
    }

    // Price range
    if (filters.minPrice) {
      pkgs = pkgs.filter((p) => getStartPrice(p) >= Number(filters.minPrice))
    }
    if (filters.maxPrice) {
      pkgs = pkgs.filter((p) => getStartPrice(p) <= Number(filters.maxPrice))
    }

    // Duration
    if (filters.durations.length > 0) {
      pkgs = pkgs.filter((p) => {
        const n = p.duration?.nights || 0
        return filters.durations.some((d) => {
          if (d === "1 Night") return n === 1
          if (d === "2-3 Nights") return n >= 2 && n <= 3
          if (d === "4-6 Nights") return n >= 4 && n <= 6
          if (d === "7+ Nights") return n >= 7
          return false
        })
      })
    }

    // Rating
    if (filters.minRating) {
      pkgs = pkgs.filter((p) => (p.rating || 0) >= filters.minRating)
    }

    // Type
    if (filters.types.length > 0) {
      pkgs = pkgs.filter((p) => filters.types.includes(p.type))
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        pkgs.sort((a, b) => getStartPrice(a) - getStartPrice(b))
        break
      case "price-high":
        pkgs.sort((a, b) => getStartPrice(b) - getStartPrice(a))
        break
      case "rating":
        pkgs.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
      case "duration":
        pkgs.sort((a, b) => (a.duration?.nights || 0) - (b.duration?.nights || 0))
        break
      case "newest":
        pkgs.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""))
        break
    }

    return pkgs
  }, [state.packages, filters, sortBy])

  // Active filter chips
  const activeFilters = []
  if (filters.to) {
    activeFilters.push({
      label: `To: "${filters.to}"`,
      clear: () => {
        setFilters((f) => ({ ...f, to: "" }))
        updateURLParam("to", "")
      }
    })
  }
  if (filters.from) {
    activeFilters.push({
      label: `From: "${filters.from}"`,
      clear: () => {
        setFilters((f) => ({ ...f, from: "" }))
        updateURLParam("from", "")
      }
    })
  }
  if (filters.departure) {
    activeFilters.push({
      label: `Dep: ${filters.departure}`,
      clear: () => {
        setFilters((f) => ({ ...f, departure: "" }))
        updateURLParam("departure", "")
      }
    })
  }
  if (filters.returnDate) {
    activeFilters.push({
      label: `Ret: ${filters.returnDate}`,
      clear: () => {
        setFilters((f) => ({ ...f, returnDate: "" }))
        updateURLParam("return", "")
      }
    })
  }
  if (filters.travelers) {
    activeFilters.push({
      label: `${filters.travelers} Guests`,
      clear: () => {
        setFilters((f) => ({ ...f, travelers: "" }))
        updateURLParam("travelers", "")
      }
    })
  }
  if (filters.minPrice) activeFilters.push({ label: `Min ₹${filters.minPrice}`, clear: () => setFilters((f) => ({ ...f, minPrice: "" })) })
  if (filters.maxPrice) activeFilters.push({ label: `Max ₹${filters.maxPrice}`, clear: () => setFilters((f) => ({ ...f, maxPrice: "" })) })
  filters.durations.forEach((d) => activeFilters.push({ label: d, clear: () => setFilters((f) => ({ ...f, durations: f.durations.filter((x) => x !== d) })) }))
  filters.types.forEach((t) => activeFilters.push({ label: t, clear: () => setFilters((f) => ({ ...f, types: f.types.filter((x) => x !== t) })) }))
  if (filters.minRating) activeFilters.push({ label: `${filters.minRating}+ stars`, clear: () => setFilters((f) => ({ ...f, minRating: null })) })

  const handleReset = () => {
    setFilters({
      to: "",
      from: "",
      departure: "",
      returnDate: "",
      travelers: "",
      minPrice: "",
      maxPrice: "",
      durations: [],
      minRating: null,
      types: []
    })
    setSearchParams({}, { replace: true })
  }

  return (
    <div className="min-h-screen bg-surface">
      <TopBar />
      <Navbar />

      {/* Search Bar */}
      <div className="bg-primary py-4 relative z-20">
        <div className="max-w-[1280px] mx-auto px-lg flex justify-center">
          <SearchBar
            compact={true}
            onSearch={handleSearch}
            initialValues={{
              to: filters.to,
              from: filters.from,
              departure: filters.departure,
              returnDate: filters.returnDate,
              travelers: filters.travelers,
            }}
          />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-lg py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-headline-lg text-[28px] text-primary font-bold">
              {filters.to ? `Results for "${filters.to}"` : "All Tour Packages"}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1">{results.length} package{results.length !== 1 ? "s" : ""} found</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-surface-container-high rounded-lg text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filters
              {activeFilters.length > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeFilters.length}</span>
              )}
            </button>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-4 pr-8 border border-surface-container-high rounded-lg text-sm font-medium bg-white focus:border-primary outline-none cursor-pointer"
            >
              <option value="recommended">Recommended</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="duration">Duration</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {activeFilters.map((f, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-primary/5 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-primary/10">
                {f.label}
                <button onClick={f.clear} className="hover:text-red-500">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </span>
            ))}
            <button onClick={handleReset} className="text-xs text-red-500 font-semibold hover:underline ml-2">
              Clear All
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex gap-8">
          {/* Sidebar - Desktop always, Mobile toggle */}
          <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-[260px] flex-shrink-0`}>
            <FilterSidebar filters={filters} setFilters={setFilters} onReset={handleReset} />
          </div>

          {/* Results Grid */}
          <div className="flex-1">
            {results.length === 0 ? (
              <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center">
                <span className="material-symbols-outlined text-[64px] text-outline mb-4 block">travel_explore</span>
                <h3 className="text-lg font-bold text-primary mb-2">No packages found</h3>
                <p className="text-on-surface-variant text-sm mb-6">Try adjusting your search or filters.</p>
                <button onClick={handleReset} className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.map((pkg) => (
                  <PackageCard key={pkg.id} pkg={pkg} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
