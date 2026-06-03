import { useRef } from "react"
import { Plus, Camera } from "lucide-react"
import { getInitials } from "../../utils/players"

export default function PhotoUpload({
  name = "",
  photo = null,
  onPhotoChange,
  size = "large", // "large" for AddPlayer, "medium" for EditPlayer
  className = ""
}) {
  const fileInputRef = useRef(null)

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Convert to base64
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      onPhotoChange(base64)
    }
    reader.onerror = () => {
      alert('Error reading image file')
    }
    reader.readAsDataURL(file)
  }

  const sizeClasses = {
    large: "w-24 h-24",
    medium: "w-16 h-16"
  }

  const iconSizes = {
    large: 32,
    medium: 20
  }

  const textSizes = {
    large: "text-2xl",
    medium: "text-xl"
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handlePhotoClick}
        className={`
          ${sizeClasses[size]} rounded-full
          border border-green-500/30 
          flex items-center justify-center
          transition-all hover:scale-105 active:scale-95
          ${photo
            ? "p-0 overflow-hidden bg-white"
            : "bg-green-500/15 text-green-500"
          }
        `}
      >
        {photo ? (
          <div className="relative w-full h-full">
            <img
              src={photo}
              alt="Player"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera size={iconSizes[size]} className="text-white" />
            </div>
          </div>
        ) : name ? (
          <span className={`font-bold ${textSizes[size]}`}>
            {getInitials(name)}
          </span>
        ) : (
          <Plus size={iconSizes[size]} />
        )}
      </button>

      {((size === "large") || (size === "medium" && !photo)) && (
        <p className="text-sm text-slate-500 dark:text-gray-400 text-center">
          {photo ? "Tap to change photo" : size === "large" ? "Tap + to add player photo" : "Add Photo"}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}