import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useApp } from "../../context/AppContext"

export default function ThemeCards() {
  const { state } = useApp()
  const navigate = useNavigate()
  const [dynamicThemes, setDynamicThemes] = useState([])

  useEffect(() => {
    const list = state.packages || []

    const fallbacks = [
      {
        title: "Honeymoon",
        desc: "Celebrate love with dreamy honeymoon getaways.",
        tags: ["Sunset Dinner", "Cruise", "Shikara Ride"],
        img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=80",
        searchQuery: "Honeymoon"
      },
      {
        title: "Adventure",
        desc: "Conquer the peaks of the majestic Himalayas.",
        tags: ["Mountain Trails", "Expert Guides", "Camping"],
        img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
        searchQuery: "Adventure"
      },
      {
        title: "Cultural",
        desc: "Experience the finest Indian hospitality.",
        tags: ["5-Star Stays", "Private Transfers", "Unique Experiences"],
        img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&q=80",
        searchQuery: "Cultural"
      },
      {
        title: "Group Tour",
        desc: "A journey through India's iconic coastlines.",
        tags: ["Beach Resorts", "Water Sports", "Nightlife"],
        img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&q=80",
        searchQuery: "Group Tour"
      },
      {
        title: "Wildlife",
        desc: "Discover the untamed beauty of nature.",
        tags: ["Safari Rides", "Expert Guides", "National Parks"],
        img: "https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=600&q=80",
        searchQuery: "Wildlife"
      }
    ]

    // Create dynamic theme cards from existing packages
    const items = list.map(p => ({
      title: p.title || "Special Tour",
      desc: p.destination || p.type || "Explore destinations",
      tags: p.tags?.slice(0, 3) || [p.destination].filter(Boolean),
      img: p.images?.[0] || "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=80",
      searchQuery: p.type || p.destination || p.title,
      packageId: p.id
    }))

    // Randomize the package cards
    const shuffledItems = items.sort(() => 0.5 - Math.random())

    const finalItems = [...shuffledItems]
    // Randomize the fallback cards so we always display something fresh
    const shuffledFallbacks = [...fallbacks].sort(() => 0.5 - Math.random())

    // Fill in missing cards using fallbacks up to a total of 5 cards, avoiding duplicate titles
    for (let i = 0; i < shuffledFallbacks.length; i++) {
      if (finalItems.length >= 5) break
      if (!finalItems.some(item => item.title === shuffledFallbacks[i].title)) {
        finalItems.push(shuffledFallbacks[i])
      }
    }

    // fallback filler if needed
    while (finalItems.length < 5) {
      finalItems.push(shuffledFallbacks[finalItems.length % shuffledFallbacks.length])
    }

    const timer = setTimeout(() => {
      setDynamicThemes(finalItems.slice(0, 5))
    }, 0)
    return () => clearTimeout(timer)
  }, [state.packages])

  const handleThemeClick = (theme) => {
    if (theme.packageId) {
      navigate(`/package/${theme.packageId}`)
    } else {
      navigate(`/search?to=${encodeURIComponent(theme.searchQuery)}`)
    }
  }

  return (
    <section className="py-16 bg-surface-bright">
      <div className="max-w-[1280px] mx-auto px-lg">
        <h2 className="font-display-lg text-[28px] text-primary font-bold mb-8">
          Explore Themes that Inspire Travel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 h-auto md:h-[520px]">
          {dynamicThemes.map((theme, i) => (
            <div
              key={i}
              onClick={() => handleThemeClick(theme)}
              className="relative rounded-[24px] overflow-hidden group cursor-pointer shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated h-[220px] md:h-full"
            >
              <img
                src={theme.img}
                alt={theme.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

              {/* Tags */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2 max-w-[85%]">
                {theme.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-primary/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Arrow */}
              <div className="absolute top-4 right-4 w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="material-symbols-outlined">arrow_outward</span>
              </div>

              {/* Bottom Text */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-1 line-clamp-1">{theme.title}</h3>
                <p className="text-sm opacity-90 line-clamp-2">{theme.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}