import { useState } from "react"

export default function ItineraryTimeline({ itinerary = [] }) {
  const [openDay, setOpenDay] = useState(0)

  if (!itinerary || itinerary.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant">
        <span className="material-symbols-outlined text-[40px] text-outline">event_note</span>
        <p className="mt-2 text-sm">No itinerary available</p>
      </div>
    )
  }

  const getTimeConfig = (timeStr) => {
    const s = (timeStr || "").toLowerCase()
    if (s.includes("morn")) {
      return { color: "bg-amber-500", lightBg: "bg-amber-50", text: "text-amber-700", icon: "wb_sunny" }
    }
    if (s.includes("noon") || s.includes("after")) {
      return { color: "bg-blue-500", lightBg: "bg-blue-50", text: "text-blue-700", icon: "wb_cloudy" }
    }
    if (s.includes("eve") || s.includes("night")) {
      return { color: "bg-purple-500", lightBg: "bg-purple-50", text: "text-purple-700", icon: "dark_mode" }
    }
    return { color: "bg-primary", lightBg: "bg-primary/5", text: "text-primary", icon: "schedule" }
  }

  return (
    <div className="relative">
      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scroll pb-1">
        {itinerary.map((day, i) => (
          <button
            key={i}
            onClick={() => setOpenDay(i)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
              openDay === i
                ? "bg-accent text-white border-accent shadow-md"
                : "bg-white text-on-surface-variant border-surface-container-high hover:border-accent/40 hover:text-accent"
            }`}
          >
            Day {day.day || i + 1}
          </button>
        ))}
      </div>

      {/* Active Day Content */}
      {itinerary.map((day, i) => (
        <div key={i} className={`${openDay === i ? "block animate-fade-in-up" : "hidden"}`}>
          {/* Day Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-accent rounded-2xl flex flex-col items-center justify-center text-white shadow-md flex-shrink-0">
              <span className="text-[10px] font-bold uppercase leading-none">Day</span>
              <span className="text-xl font-bold leading-none">{day.day || i + 1}</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">{day.title || `Day ${day.day || i + 1}`}</h3>
              <p className="text-xs text-on-surface-variant">
                {day.activities?.length || 0} activities planned
              </p>
            </div>
          </div>

          {/* Timeline Activities */}
          <div className="space-y-4">
            {day.activities?.map((act, j) => {
              const tc = getTimeConfig(act.time)
              return (
                <div key={j} className="relative group">
                  {/* Activity Card */}
                  <div className={`${tc.lightBg} rounded-xl p-4 border border-white/80 shadow-sm hover:shadow-md transition-all group-hover:-translate-y-0.5`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${tc.text} px-2.5 py-0.5 rounded-full ${tc.lightBg} border ${tc.text.replace("text", "border")}/20`}>
                        {act.time}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface leading-relaxed">{act.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Day Navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-surface-container-high">
            <button
              onClick={() => setOpenDay(Math.max(0, i - 1))}
              disabled={i === 0}
              className="flex items-center gap-1 text-sm font-semibold text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:text-accent transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              Previous Day
            </button>
            <span className="text-xs text-on-surface-variant">
              Day {i + 1} of {itinerary.length}
            </span>
            <button
              onClick={() => setOpenDay(Math.min(itinerary.length - 1, i + 1))}
              disabled={i === itinerary.length - 1}
              className="flex items-center gap-1 text-sm font-semibold text-primary disabled:opacity-30 disabled:cursor-not-allowed hover:text-accent transition-colors"
            >
              Next Day
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
