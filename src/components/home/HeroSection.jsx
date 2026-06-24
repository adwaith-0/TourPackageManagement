import { useNavigate } from "react-router-dom"
import SearchBar from "../ui/SearchBar"

export default function HeroSection() {
  const navigate = useNavigate()

  const handleSearch = (searchData) => {
    const params = new URLSearchParams()
    if (searchData.to) params.set("to", searchData.to.trim())
    if (searchData.from) params.set("from", searchData.from.trim())
    if (searchData.departure) params.set("departure", searchData.departure)
    if (searchData.returnDate) params.set("return", searchData.returnDate)
    if (searchData.travelers) params.set("travelers", searchData.travelers)
    navigate(`/search?${params.toString()}`)
  }

  const handlePopularClick = (place) => {
    navigate(`/search?to=${encodeURIComponent(place)}`)
  }

  return (
    <div className="relative w-full h-[600px] bg-primary z-20">
      
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url("https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1400&q=80")`,
        }}
      />
      <div className="absolute inset-0 hero-gradient" />

      {/* Content */}
      <div className="relative h-full max-w-[1280px] mx-auto px-lg flex flex-col justify-center items-center text-center pt-10">
        <h1 className="font-display-lg text-[40px] md:text-[56px] text-white font-bold mb-2 drop-shadow-lg">
          Incredible India, Handpicked for You
        </h1>
        <p className="text-[18px] text-white/90 mb-10 max-w-2xl font-medium drop-shadow-md">
          Local Wonders, Expertly Curated
        </p>

        {/* Search Card */}
        <div className="w-full max-w-5xl mb-6">
          <SearchBar onSearch={handleSearch} />
        </div>

        {/* Popular Tags */}
        <div className="flex gap-4 text-white/90 text-sm font-medium drop-shadow-md">
          <span className="opacity-80">Popular:</span>
          {["Kerala", "Rajasthan", "Ladakh", "Goa", "Manali"].map((place) => (
            <button key={place} onClick={() => handlePopularClick(place)} className="hover:text-white underline decoration-white/50 cursor-pointer">
              {place}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}