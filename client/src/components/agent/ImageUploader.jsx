import { useRef, useState } from "react"

export default function ImageUploader({ images = [], onChange, maxImages = 10 }) {
  const fileRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const handleFiles = async (files) => {
    const remaining = maxImages - images.length
    const toProcess = Array.from(files).slice(0, remaining)
    if (toProcess.length === 0) return

    const promises = toProcess.map((file) => {
      if (!file.type.startsWith("image/")) return Promise.resolve(null)
      if (file.size > 5 * 1024 * 1024) return Promise.resolve(null) // 5MB limit

      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(file)
      })
    })

    const results = await Promise.all(promises)
    const validResults = results.filter(Boolean)
    if (validResults.length > 0) {
      onChange([...images, ...validResults])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleRemove = (index) => {
    onChange(images.filter((_, i) => i !== index))
  }

  const handleAddUrl = () => {
    if (!urlInput.trim()) return
    if (images.length >= maxImages) return
    onChange([...images, urlInput.trim()])
    setUrlInput("")
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      {images.length < maxImages && (
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            dragging ? "dropzone-active border-accent bg-accent/5" : "border-surface-container-high hover:border-accent/50 bg-surface-container-lowest"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragging(false)}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <span className="material-symbols-outlined text-[48px] text-accent/50 mb-3 block">cloud_upload</span>
          <p className="font-semibold text-primary text-sm">Drag & drop images here</p>
          <p className="text-on-surface-variant text-xs mt-1">or click to browse files</p>
          <p className="text-outline text-[11px] mt-3">JPG, PNG • Max 5MB each</p>
        </div>
      )}

      {/* URL Input */}
      <div className="flex gap-2">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
          placeholder="Or paste an image URL..."
          className="flex-1 h-10 px-4 border border-surface-container-high rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
        />
        <button
          onClick={handleAddUrl}
          disabled={!urlInput.trim() || images.length >= maxImages}
          className="px-4 h-10 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">
          <span className="font-semibold text-primary">{images.length}</span> of {maxImages} photos uploaded
        </p>
        {images.length >= maxImages && (
          <span className="text-xs text-accent font-medium">Maximum reached</span>
        )}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group rounded-xl overflow-hidden aspect-[4/3] bg-surface-container border border-surface-container-high">
              <img
                src={img}
                alt={`Upload ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = ""; e.target.className = "hidden" }}
              />
              {/* Cover Badge */}
              {i === 0 && (
                <div className="absolute top-2 left-2 bg-secondary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px] filled">star</span>
                  Cover
                </div>
              )}
              {/* Delete Button */}
              <button
                onClick={(e) => { e.stopPropagation(); handleRemove(i) }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
              {/* Index */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {i + 1}
              </div>
            </div>
          ))}
          {/* Empty Slots */}
          {Array.from({ length: Math.min(maxImages - images.length, 4) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              onClick={() => fileRef.current?.click()}
              className="rounded-xl border-2 border-dashed border-surface-container-high aspect-[4/3] flex items-center justify-center cursor-pointer hover:border-accent/50 transition-colors"
            >
              <span className="material-symbols-outlined text-[24px] text-outline">add</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
