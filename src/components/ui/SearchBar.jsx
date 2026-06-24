import { useState, useEffect, useRef, useMemo } from "react"
import { useApp } from "../../context/AppContext"

export default function SearchBar({ compact = false, onSearch, initialValues = {} }) {
  const { state } = useApp()
  const [from, setFrom] = useState(initialValues.from || "")
  const [to, setTo] = useState(initialValues.to || "")
  const [departure, setDeparture] = useState(initialValues.departure || "")
  const [returnDate, setReturnDate] = useState(initialValues.returnDate || "")
  
  // Travelers state subdivided into adults and children
  const [adults, setAdults] = useState(() => {
    const total = parseInt(initialValues.travelers) || 1
    return Math.max(1, total)
  })
  const [childrenCount, setChildrenCount] = useState(0)

  const [activeField, setActiveField] = useState(null) // 'from' | 'to' | 'departure' | 'return' | 'travelers' | null
  
  // Autocomplete search inputs (local filters)
  const [fromSearch, setFromSearch] = useState("")
  const [toSearch, setToSearch] = useState("")

  const containerRef = useRef(null)

  // Sync initial values if they change (important when user navigates or resets)
  const initialValuesKey = `${initialValues?.from || ""}-${initialValues?.to || ""}-${initialValues?.departure || ""}-${initialValues?.returnDate || ""}-${initialValues?.travelers || ""}`
  const [prevInitialValuesKey, setPrevInitialValuesKey] = useState(initialValuesKey)

  if (initialValuesKey !== prevInitialValuesKey) {
    setPrevInitialValuesKey(initialValuesKey)
    setFrom(initialValues.from || "")
    setTo(initialValues.to || "")
    setDeparture(initialValues.departure || "")
    setReturnDate(initialValues.returnDate || "")
    const total = parseInt(initialValues.travelers) || 1
    setAdults(Math.max(1, total))
    setChildrenCount(0)
  }

  // Close popovers on click outside
  useEffect(() => {
    function handleOutsideClick(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setActiveField(null)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  // Scan packages for unique locations
  const uniqueFroms = useMemo(() => {
    const list = state.packages || []
    const froms = list.map((p) => p.pickup?.trim()).filter(Boolean)
    const unique = []
    const seen = new Set()
    froms.forEach((f) => {
      const lower = f.toLowerCase()
      if (!seen.has(lower)) {
        seen.add(lower)
        unique.push(f)
      }
    })
    // Add defaults if empty
    return unique.length > 0 ? unique : ["Delhi", "Mumbai", "Kochi", "Bangalore", "Chennai"]
  }, [state.packages])

  const uniqueTos = useMemo(() => {
    const list = state.packages || []
    const tos = list.map((p) => p.destination?.trim()).filter(Boolean)
    const unique = []
    const seen = new Set()
    tos.forEach((t) => {
      const lower = t.toLowerCase()
      if (!seen.has(lower)) {
        seen.add(lower)
        unique.push(t)
      }
    })
    return unique.length > 0 ? unique : ["Kerala", "Rajasthan", "Ladakh", "Goa", "Manali"]
  }, [state.packages])

  // Filter lists based on typing
  const filteredFroms = useMemo(() => {
    const q = fromSearch.trim().toLowerCase()
    if (!q) return uniqueFroms
    return uniqueFroms.filter((f) => f.toLowerCase().includes(q))
  }, [uniqueFroms, fromSearch])

  const filteredTos = useMemo(() => {
    const q = toSearch.trim().toLowerCase()
    if (!q) return uniqueTos
    return uniqueTos.filter((t) => t.toLowerCase().includes(q))
  }, [uniqueTos, toSearch])

  // Total travelers count
  const totalTravelers = adults + childrenCount

  const handleSearchSubmit = () => {
    setActiveField(null)
    if (onSearch) {
      onSearch({
        from,
        to,
        departure,
        returnDate,
        travelers: totalTravelers,
      })
    }
  }

  // ─── Custom Calendar Component Logic ───────────────────────────────────────
  const [calendarDate, setCalendarDate] = useState(new Date()) // The month we are viewing
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [prevActiveField, setPrevActiveField] = useState(null)
  const [prevDeparture, setPrevDeparture] = useState("")
  const [prevReturnDate, setPrevReturnDate] = useState("")

  if (activeField !== prevActiveField || departure !== prevDeparture || returnDate !== prevReturnDate) {
    setPrevActiveField(activeField)
    setPrevDeparture(departure || "")
    setPrevReturnDate(returnDate || "")
    if (activeField === "departure" && departure) {
      const d = new Date(departure)
      if (!isNaN(d.getTime())) {
        setCalendarDate(d)
      }
    } else if (activeField === "return") {
      const targetDate = returnDate || departure
      if (targetDate) {
        const d = new Date(targetDate)
        if (!isNaN(d.getTime())) {
          setCalendarDate(d)
        } else {
          setCalendarDate(new Date())
        }
      } else {
        setCalendarDate(new Date())
      }
    } else if (activeField === "departure") {
      setCalendarDate(new Date())
    }
  }

  const isPastMonth = calendarDate.getFullYear() < today.getFullYear() || 
    (calendarDate.getFullYear() === today.getFullYear() && calendarDate.getMonth() <= today.getMonth())

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const calendarDays = useMemo(() => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    
    // Get first day of the month
    const firstDayIndex = new Date(year, month, 1).getDay()
    
    // Get total days in month
    const totalDays = new Date(year, month + 1, 0).getDate()
    
    const days = []
    
    // Empty blocks before the first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateObj: null })
    }
    
    // Fill days
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d)
      days.push({ dayNum: d, dateObj })
    }
    
    return days
  }, [calendarDate])

  const changeMonth = (offset) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + offset, 1))
  }

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "Select date"
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return "Select date"
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
  }

  const handleDateClick = (dateObj) => {
    if (!dateObj || dateObj < today) return

    const formatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`

    if (activeField === "departure") {
      setDeparture(formatted)
      // If return date is earlier than departure, clear return date
      if (returnDate && formatted > returnDate) {
        setReturnDate("")
      }
      // Automatically switch to return field to make flow seamless
      setActiveField("return")
    } else if (activeField === "return") {
      if (departure && formatted < departure) return // Return cannot be before departure
      setReturnDate(formatted)
      setActiveField(null)
    }
  }

  // Check if date is selected or in range
  const getDateStatus = (dateObj) => {
    if (!dateObj) return "empty"
    
    const formatted = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}-${String(dateObj.getDate()).padStart(2, "0")}`
    
    if (formatted === departure) return "selected-start"
    if (formatted === returnDate) return "selected-end"
    
    if (departure && returnDate && formatted > departure && formatted < returnDate) {
      return "in-range"
    }
    if (dateObj < today) return "disabled"
    
    return "active"
  }

  return (
    <div
      ref={containerRef}
      className={`w-full bg-white border border-surface-container-high relative ${
        compact 
          ? "rounded-2xl p-1.5 shadow-soft max-w-5xl" 
          : "rounded-[24px] p-2.5 shadow-elevated max-w-5xl"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center relative">
        
        {/* FROM FIELD */}
        <div
          onClick={() => {
            setActiveField("from")
            setFromSearch("")
            document.getElementById("from-input")?.focus()
          }}
          className={`flex-1 flex flex-col px-4 py-2 cursor-pointer transition-colors rounded-xl relative ${
            activeField === "from" ? "bg-primary/5 z-20" : "hover:bg-surface-container-low z-10"
          } ${compact ? "py-1.5" : "py-2.5"}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline mb-0.5">From</span>
          <div className="flex items-center gap-2 w-full">
            <span className="material-symbols-outlined text-primary text-[20px]">location_on</span>
            <input
              id="from-input"
              type="text"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setFromSearch(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setActiveField(null)
                  handleSearchSubmit()
                }
              }}
              placeholder="Your city"
              className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-primary placeholder:text-outline placeholder:font-normal truncate"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {activeField === "from" && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-surface-container-high shadow-elevated rounded-2xl p-4 z-50 animate-scale-in">
              <div className="max-h-56 overflow-y-auto custom-scroll">
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2 px-2">Popular Starting Points</p>
                {filteredFroms.length === 0 ? (
                  <p className="text-xs text-outline p-2">No locations found</p>
                ) : (
                  filteredFroms.map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setFrom(loc)
                        setActiveField("to") // Step to destination next
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-outline">pin_drop</span>
                      {loc}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-[1px] h-10 bg-surface-container-high self-center" />

        {/* TO FIELD */}
        <div
          onClick={() => {
            setActiveField("to")
            setToSearch("")
            document.getElementById("to-input")?.focus()
          }}
          className={`flex-1 flex flex-col px-4 py-2 cursor-pointer transition-colors rounded-xl relative ${
            activeField === "to" ? "bg-primary/5 z-20" : "hover:bg-surface-container-low z-10"
          } ${compact ? "py-1.5" : "py-2.5"}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline mb-0.5">To</span>
          <div className="flex items-center gap-2 w-full">
            <span className="material-symbols-outlined text-accent text-[20px]">search</span>
            <input
              id="to-input"
              type="text"
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setToSearch(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  setActiveField(null)
                  handleSearchSubmit()
                }
              }}
              placeholder="Destination"
              className="bg-transparent border-none outline-none w-full text-[15px] font-bold text-primary placeholder:text-outline placeholder:font-normal truncate"
            />
          </div>

          {/* Autocomplete Dropdown */}
          {activeField === "to" && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-surface-container-high shadow-elevated rounded-2xl p-4 z-50 animate-scale-in">
              <div className="max-h-56 overflow-y-auto custom-scroll">
                <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2 px-2">Popular Destinations</p>
                {filteredTos.length === 0 ? (
                  <p className="text-xs text-outline p-2">No destinations found</p>
                ) : (
                  filteredTos.map((loc) => (
                    <button
                      type="button"
                      key={loc}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setTo(loc)
                        setActiveField("departure") // Step to date next
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-primary font-semibold hover:bg-primary/5 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px] text-accent">explore</span>
                      {loc}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="hidden md:block w-[1px] h-10 bg-surface-container-high self-center" />

        {/* DEPARTURE FIELD */}
        <div
          onClick={() => setActiveField("departure")}
          className={`flex-1 flex flex-col px-4 py-2 cursor-pointer transition-colors rounded-xl ${
            activeField === "departure" ? "bg-primary/5" : "hover:bg-surface-container-low"
          } ${compact ? "py-1.5" : "py-2.5"}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline mb-0.5">Departure</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">calendar_today</span>
            <span className={`text-[15px] font-bold ${departure ? "text-primary" : "text-outline"}`}>
              {departure ? formatDisplayDate(departure) : "Add date"}
            </span>
          </div>
        </div>

        <div className="hidden md:block w-[1px] h-10 bg-surface-container-high self-center" />

        {/* RETURN FIELD */}
        <div
          onClick={() => setActiveField("return")}
          className={`flex-1 flex flex-col px-4 py-2 cursor-pointer transition-colors rounded-xl ${
            activeField === "return" ? "bg-primary/5" : "hover:bg-surface-container-low"
          } ${compact ? "py-1.5" : "py-2.5"}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline mb-0.5">Return</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-outline text-[20px]">calendar_today</span>
            <span className={`text-[15px] font-bold ${returnDate ? "text-primary" : "text-outline"}`}>
              {returnDate ? formatDisplayDate(returnDate) : "Add date"}
            </span>
          </div>
        </div>

        {/* SHARED CALENDAR POPOVER FOR DEPARTURE & RETURN */}
        {(activeField === "departure" || activeField === "return") && (
          <div className="absolute top-full left-0 md:left-[35%] mt-2 w-[340px] bg-white border border-surface-container-high shadow-elevated rounded-2xl p-4 z-50 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4 border-b border-surface-container-high pb-2">
              <button
                type="button"
                disabled={isPastMonth}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeMonth(-1) }}
                className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="font-bold text-primary text-sm">
                {monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}
              </span>
              <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); changeMonth(1) }} className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-outline mb-2">
              <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((cell, index) => {
                if (!cell.dayNum) {
                  return <div key={`empty-${index}`} />
                }

                const status = getDateStatus(cell.dateObj)
                const isPast = status === "disabled"
                
                let btnCls = "w-9 h-9 flex items-center justify-center text-sm font-semibold rounded-full transition-all duration-200 relative "
                if (status === "selected-start" || status === "selected-end") {
                  btnCls += "bg-accent text-white font-bold"
                } else if (status === "in-range") {
                  btnCls += "bg-accent/15 text-accent rounded-none"
                } else if (isPast) {
                  btnCls += "text-outline/40 cursor-not-allowed"
                } else {
                  btnCls += "text-primary hover:bg-primary/5 cursor-pointer"
                }

                return (
                  <button
                    type="button"
                    key={`day-${cell.dayNum}`}
                    disabled={isPast}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDateClick(cell.dateObj) }}
                    className={btnCls}
                  >
                    {cell.dayNum}
                  </button>
                )
              })}
            </div>
            
            {/* Quick helper info */}
            <div className="mt-4 pt-3 border-t border-surface-container-high flex justify-between items-center">
              <span className="text-[11px] text-outline font-semibold">
                {activeField === "departure" ? "Select departure date" : "Select return date"}
              </span>
              {(departure || returnDate) && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setDeparture("")
                    setReturnDate("")
                  }}
                  className="text-xs text-red-500 font-bold hover:underline"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>
        )}

        <div className="hidden md:block w-[1px] h-10 bg-surface-container-high self-center" />

        {/* TRAVELLERS FIELD */}
        <div
          onClick={() => setActiveField("travelers")}
          className={`flex-1 flex flex-col px-4 py-2 cursor-pointer transition-colors rounded-xl relative ${
            activeField === "travelers" ? "bg-primary/5 z-20" : "hover:bg-surface-container-low z-10"
          } ${compact ? "py-1.5" : "py-2.5"}`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-outline mb-0.5">Travellers</span>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">group</span>
            <span className={`text-[15px] font-bold truncate ${totalTravelers > 0 ? "text-primary" : "text-outline"}`}>
              {totalTravelers} {totalTravelers === 1 ? "Traveller" : "Travellers"}
            </span>
          </div>

          {/* Custom Traveler Selection Popover */}
          {activeField === "travelers" && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-surface-container-high shadow-elevated rounded-2xl p-4 z-50 animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-4">Select Group Size</p>
              
              {/* Adults Counter */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-sm font-bold text-primary">Adults</p>
                  <p className="text-xs text-outline">Ages 12 or above</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={adults <= 1}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdults(adults - 1) }}
                    className="w-8 h-8 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-surface-container-low transition-colors text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="w-4 text-center font-bold text-primary text-sm">{adults}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAdults(adults + 1) }}
                    className="w-8 h-8 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-surface-container-low transition-colors text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Children Counter */}
              <div className="flex justify-between items-center mb-5">
                <div>
                  <p className="text-sm font-bold text-primary">Children</p>
                  <p className="text-xs text-outline">Ages 2 – 11</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={childrenCount <= 0}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setChildrenCount(childrenCount - 1) }}
                    className="w-8 h-8 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-surface-container-low transition-colors text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="w-4 text-center font-bold text-primary text-sm">{childrenCount}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setChildrenCount(childrenCount + 1) }}
                    className="w-8 h-8 rounded-full border border-surface-container-high flex items-center justify-center hover:bg-surface-container-low transition-colors text-primary"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </div>

              {/* Action */}
              <div className="border-t border-surface-container-high pt-3 flex justify-between items-center">
                <span className="text-xs font-bold text-primary">Total: {totalTravelers}</span>
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveField(null) }}
                  className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/95 transition-colors font-semibold"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SEARCH BUTTON */}
        <button
          onClick={handleSearchSubmit}
          className={`bg-accent text-white font-bold rounded-xl hover:bg-accent/90 transition-all whitespace-nowrap flex items-center justify-center gap-2 shadow-soft hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
            compact 
              ? "px-6 py-2.5 text-sm md:ml-2 w-full md:w-auto" 
              : "px-8 py-3.5 text-base md:ml-3 mt-4 md:mt-0 w-full md:w-auto"
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">search</span>
          <span>SEARCH</span>
        </button>

      </div>
    </div>
  )
}
