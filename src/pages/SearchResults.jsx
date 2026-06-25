import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import TopBar from "../components/Topbar"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import PackageCard from "../components/package/PackageCard"
import SearchBar from "../components/ui/SearchBar"
import { useApp } from "../context/AppContext"
import { listPackagesAPI, toBackendDate } from "../utils/packageApi"

export default function SearchResults() {
  const { state } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sortBy, setSortBy] = useState("recommended")

  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [filters, setFilters] = useState({
    to: searchParams.get("to") || "",
    from: searchParams.get("from") || "",
    departure: searchParams.get("departure") || "",
    returnDate: searchParams.get("return") || "",
    travelers: searchParams.get("travelers") || "",
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

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    if (!filters.to || !filters.departure) {
      // Load all packages by querying known destinations for today's date
      const defaultDestinations = ['Alappuzha', 'Thiruvananthapuram', 'Munnar', 'Wayanad', 'Kochi', 'adw']
      const customDestinations = []
      try {
        const stored = localStorage.getItem('touriq_custom_destinations')
        if (stored) {
          customDestinations.push(...JSON.parse(stored))
        }
      } catch (e) {
        console.error(e)
      }
      
      const destinations = [...new Set([...defaultDestinations, ...customDestinations])]
      const today = new Date()
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}-${months[today.getMonth()]}-${today.getFullYear()}`

      Promise.all(
        destinations.map(dest => listPackagesAPI(dest, formattedDate).catch(() => []))
      ).then((results) => {
        if (active) {
          const allPkgs = results.flat()
          // Deduplicate packages by packageId (id)
          const seen = new Set()
          const uniquePkgs = allPkgs.filter(p => {
            if (seen.has(p.id)) return false
            seen.add(p.id)
            return true
          })
          setPackages(uniquePkgs)
          setLoading(false)
        }
      }).catch((err) => {
        if (active) {
          console.error("Failed to fetch all packages:", err)
          setError("Failed to load packages.")
          setPackages([])
          setLoading(false)
        }
      })

      return () => {
        active = false
      }
    }

    const formattedDate = toBackendDate(filters.departure)

    listPackagesAPI(filters.to, formattedDate)
      .then((data) => {
        if (active) {
          setPackages(data)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to fetch packages:", err)
          setError("Failed to fetch packages from server.")
          setPackages([])
          setLoading(false)
        }
      })

    return () => {
      active = false
    }
  }, [filters.to, filters.departure])


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
    let pkgs = [...packages]

    const getStartPrice = (p) => {
      const prices = (p.tiers && Array.isArray(p.tiers) ? p.tiers : Object.values(p.tiers || {}))
        .map(t => t?.price)
        .filter(p => typeof p === 'number' && p > 0)
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
  }, [packages, filters, sortBy])

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

  const handleReset = () => {
    setFilters({
      to: "",
      from: "",
      departure: "",
      returnDate: "",
      travelers: ""
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
        <div className="w-full">
          {loading ? (
            <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center shadow-soft animate-pulse">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4 block animate-spin">sync</span>
              <h3 className="text-lg font-bold text-primary mb-2">Loading Packages...</h3>
              <p className="text-on-surface-variant text-sm">Fetching tour packages from the server...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center shadow-soft">
              <span className="material-symbols-outlined text-[64px] text-red-500 mb-4 block">error_outline</span>
              <h3 className="text-lg font-bold text-red-500 mb-2">Error Loading Packages</h3>
              <p className="text-on-surface-variant text-sm mb-6">{error}</p>
              <button 
                onClick={() => {
                  const formattedDate = toBackendDate(filters.departure)
                  setLoading(true)
                  setError(null)
                  listPackagesAPI(filters.to, formattedDate)
                    .then(setPackages)
                    .catch(err => setError(err.message || "Failed to load packages"))
                    .finally(() => setLoading(false))
                }} 
                className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors"
              >
                Retry Search
              </button>
            </div>
          ) : (!filters.to || !filters.departure) && packages.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center shadow-soft">
              <span className="material-symbols-outlined text-[64px] text-accent mb-4 block">search_insights</span>
              <h3 className="text-lg font-bold text-primary mb-2">Search Tour Packages</h3>
              <p className="text-on-surface-variant text-sm max-w-md mx-auto">Please enter both a destination and departure date in the search bar above to fetch live packages from the server.</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-2xl border border-surface-container-high p-12 text-center shadow-soft">
              <span className="material-symbols-outlined text-[64px] text-outline mb-4 block">travel_explore</span>
              <h3 className="text-lg font-bold text-primary mb-2">No packages found</h3>
              <p className="text-on-surface-variant text-sm mb-6">Try adjusting your search parameters.</p>
              <button onClick={handleReset} className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                Clear Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((pkg) => (
                <PackageCard key={pkg.id} pkg={pkg} />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
