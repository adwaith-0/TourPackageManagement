import { useState } from "react"

export default function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(0)

  const [prevImagesKey, setPrevImagesKey] = useState("")
  const imagesKey = (images || []).join(",")
  if (imagesKey !== prevImagesKey) {
    setPrevImagesKey(imagesKey)
    setActive(0)
  }

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-[300px] md:h-[400px] bg-surface-container rounded-xl flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-[64px] text-outline">image</span>
          <p className="text-on-surface-variant text-sm mt-2">No images available</p>
        </div>
      </div>
    )
  }

  const goTo = (dir) => {
    setActive((prev) => {
      if (dir === "prev") return prev === 0 ? images.length - 1 : prev - 1
      return prev === images.length - 1 ? 0 : prev + 1
    })
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative w-full h-[250px] md:h-[400px] rounded-xl overflow-hidden group">
        <img
          src={images[active]}
          alt={`Gallery ${active + 1}`}
          className="w-full h-full object-cover transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo("prev")}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
            >
              <span className="material-symbols-outlined text-primary">chevron_left</span>
            </button>
            <button
              onClick={() => goTo("next")}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md"
            >
              <span className="material-symbols-outlined text-primary">chevron_right</span>
            </button>
          </>
        )}

        {/* Counter */}
        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-lg">
          {active + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scroll pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 gallery-thumb transition-all ${
                i === active ? "active border-accent" : "border-transparent hover:border-surface-container-high"
              }`}
            >
              <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
