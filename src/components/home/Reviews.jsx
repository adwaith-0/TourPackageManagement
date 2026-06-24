const reviews = [
  {
    name: "Swadhinta Raj",
    destination: "Kashmir",
    initials: "SR",
    text: "Thank you TOURIQ for providing the amazing Kashmir itinerary. It was perfectly organised and the local agent maintained patience and provided the best possible experience.",
  },
  {
    name: "Shreya Ghoshrawat",
    destination: "Andaman",
    initials: "SG",
    text: "TOURIQ made our Andaman trip absolutely effortless and memorable. The itinerary was perfectly balanced — scenic beaches, peaceful sunsets, and unforgettable adventures.",
  },
  {
    name: "Bharati D Patil",
    destination: "Amarnath",
    initials: "BP",
    text: "Grateful to TOURIQ and our local guide for their excellent support throughout our Amarnath Yatra. The thoughtful arrangements made the experience spiritually fulfilling.",
  },
]

export default function Reviews() {
  return (
    <section className="py-16 bg-surface-container-lowest border-t border-surface-container-high">
      <div className="max-w-[1280px] mx-auto px-lg">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
          <div>
            <h2 className="font-headline-lg text-[32px] text-primary font-bold">
              Why Customers Love TOURIQ
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm font-bold text-on-surface-variant">
              <span>1M+ Happy Travelers</span>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span>4,000+ Tours</span>
              <span className="w-1 h-1 rounded-full bg-outline" />
              <span>50+ Awards</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4].map(i => (
              <span key={i} className="material-symbols-outlined text-secondary text-[24px]">star</span>
            ))}
            <span className="material-symbols-outlined text-secondary text-[24px]">star_half</span>
            <span className="font-bold text-primary ml-2">4.8/5 Average</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="bg-surface p-6 rounded-xl border border-surface-container-high">
              <div className="flex text-secondary text-[16px] mb-3">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="material-symbols-outlined">star</span>
                ))}
              </div>
              <p className="text-on-surface-variant text-sm mb-6 italic">"{r.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {r.initials}
                </div>
                <div>
                  <div className="font-bold text-primary text-sm">{r.name}</div>
                  <div className="text-xs text-outline">Travelled to {r.destination}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}