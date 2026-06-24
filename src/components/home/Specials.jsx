import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../../context/AppContext"

export default function Specials() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [dynamicSpecials, setDynamicSpecials] = useState([])

  useEffect(() => {
    const list = state.packages || []

    const fallbacks = [
      {
        title: "India and Around Holidays",
        label: "Buy 1 Get 1 FREE!",
        price: "Starting at ₹42,000",
        img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
        searchQuery: "India"
      },
      {
        title: "Ladakh - Just Pack, We'll Handle The Rest",
        label: "All-Inclusive",
        price: "Starting at ₹34,000",
        img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
        searchQuery: "Ladakh"
      },
      {
        title: "Nepal - Where Culture Lives Among Clouds",
        label: "Culture & Heritage",
        price: "Starting at ₹18,400",
        img: "https://images.unsplash.com/photo-1585016495481-91613db2a8d1?w=600&q=80",
        searchQuery: "Nepal"
      }
    ]

    const labels = ["Best Deal", "Trending", "Special Tour", "All-Inclusive", "Limited Offer", "Super Value"]

    // Map existing packages to specials layout
    const items = list.map((p, idx) => {
      const prices = [p.tiers?.budget?.price, p.tiers?.luxury?.price].filter(val => typeof val === 'number' && val > 0)
      const priceVal = prices.length > 0 ? Math.min(...prices) : 0
      const priceText = priceVal ? `Starting at ₹${priceVal.toLocaleString("en-IN")}` : "Contact for Details"

      return {
        title: p.title,
        label: labels[idx % labels.length],
        price: priceText,
        img: p.images?.[0] || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
        packageId: p.id
      }
    })

    // Randomize package specials
    const shuffledItems = items.sort(() => 0.5 - Math.random())
    const finalItems = [...shuffledItems]

    // Randomize fallback specials
    const shuffledFallbacks = [...fallbacks].sort(() => 0.5 - Math.random())

    // Populate remaining items with fallbacks up to 3
    for (let i = 0; i < shuffledFallbacks.length; i++) {
      if (finalItems.length >= 3) break
      if (!finalItems.some(item => item.title === shuffledFallbacks[i].title)) {
        finalItems.push(shuffledFallbacks[i])
      }
    }

    // fallback filler if needed
    while (finalItems.length < 3) {
      finalItems.push(shuffledFallbacks[finalItems.length % shuffledFallbacks.length])
    }

    const timer = setTimeout(() => {
      setDynamicSpecials(finalItems.slice(0, 3))
    }, 0)
    return () => clearTimeout(timer)
  }, [state.packages])

  const handleClick = (s) => {
    if (s.packageId) {
      navigate(`/package/${s.packageId}`)
    } else {
      navigate(`/search?to=${encodeURIComponent(s.searchQuery)}`)
    }
  }

  return (
    <section className="py-16 bg-surface-container-low border-y border-surface-container-high">
      <div className="max-w-[1280px] mx-auto px-lg">
        <h2 className="font-headline-lg text-[32px] text-primary font-bold mb-8">
          TOURIQ Specials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {dynamicSpecials.map((s, i) => (
            <div
              key={i}
              onClick={() => handleClick(s)}
              className="relative rounded-2xl overflow-hidden h-[240px] group cursor-pointer shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              <img
                src={s.img}
                alt={s.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-6 w-full text-white">
                <div className="text-secondary font-bold text-sm tracking-wider uppercase mb-1">
                  {s.label}
                </div>
                <h3 className="text-xl font-bold mb-2 line-clamp-1">{s.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-sm opacity-90">{s.price}</span>
                  <span className="bg-white text-primary text-xs font-bold px-3 py-1.5 rounded group-hover:bg-accent group-hover:text-white transition-colors">
                    View Details
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}