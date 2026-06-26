const cards = [
  {
    icon: "verified_user",
    title: "Trusted Advisor",
    desc: "Trusted Since 1881, providing expert guidance for modern journeys.",
  },
  {
    icon: "travel_explore",
    title: "Customized Holidays",
    desc: "Personalize every detail of your trip to match your unique travel style.",
  },
  {
    icon: "flight_takeoff",
    title: "Seamless Booking",
    desc: "Effortless planning with secure payments and instant confirmations.",
  },
  {
    icon: "auto_awesome",
    title: "Convenient Holidays",
    desc: "All-inclusive plans covering flights, stays, meals, and local experiences.",
  },
]

export default function WhyTouriq() {
  return (
    <section className="py-16 bg-surface">
      <div className="max-w-[1280px] mx-auto px-lg">
        <div className="relative rounded-[24px] overflow-hidden min-h-[520px] h-auto py-12 md:py-0 shadow-elevated">
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1400&q=80"
            alt="Why TOURIQ"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative h-full flex flex-col md:flex-row items-center justify-center px-6 md:px-8 gap-6 md:gap-4">
            {cards.map((card, i) => (
              <div
                key={i}
                className={`bg-white/95 backdrop-blur-sm p-8 rounded-[24px] w-full max-w-[280px] md:w-64 h-[320px] md:h-[380px] flex flex-col shadow-lg border border-white/20 ${
                  i === 1 || i === 2 ? "md:mt-12" : ""
                }`}
              >
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-accent text-[32px]">
                    {card.icon}
                  </span>
                </div>
                <h3 className="text-primary font-bold text-xl mb-4">{card.title}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}