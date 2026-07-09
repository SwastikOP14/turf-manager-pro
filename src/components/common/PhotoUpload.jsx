import { useRef } from "react"
import { Pencil } from "lucide-react"
import PlayerAvatar from "./PlayerAvatar"

export default function PhotoUpload({
  name = "",
  photo = null,
  onPhotoChange,
  size = "large", // "large" or "medium"
  type = "player", // "player" or "squad"
  className = ""
}) {
  const fileInputRef = useRef(null)

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const compressImage = (file, maxDimension = 300, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        const img = new Image()

        img.onload = () => {
          let { width, height } = img

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width)
              width = maxDimension
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height)
              height = maxDimension
            }
          }

          const canvas = document.createElement("canvas")
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext("2d")
          ctx.drawImage(img, 0, 0, width, height)

          const dataUrl = canvas.toDataURL("image/jpeg", quality)
          resolve(dataUrl)
        }

        img.onerror = () => reject(new Error("Failed to load image"))
        img.src = e.target.result
      }

      reader.onerror = () => reject(new Error("Failed to read file"))
      reader.readAsDataURL(file)
    })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    try {
      const compressedDataUrl = await compressImage(file, 300, 0.7)
      onPhotoChange(compressedDataUrl)
    } catch (error) {
      console.error('Error compressing image:', error)
      alert('Error processing image. Please try another file.')
    }
  }

  const sizeClasses = {
    large: "w-24 h-24",
    medium: "w-16 h-16"
  }

  const textSizes = {
    large: "text-2xl",
    medium: "text-xl"
  }

  const pencilButtonSize = {
    large: "w-8 h-8",
    medium: "w-6 h-6"
  }

  const pencilIconSize = {
    large: 14,
    medium: 11
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={handlePhotoClick}
          className={`
            ${sizeClasses[size]} rounded-full
            flex items-center justify-center
            transition-all hover:scale-105 active:scale-95
            ${photo
              ? "p-0 overflow-hidden bg-white"
              : "bg-green-500/15 text-green-500 border border-green-500/30"
            }
          `}
        >
          {photo ? (
            <img
              src={photo}
              alt="Photo"
              className="w-full h-full object-cover"
            />
          ) : name ? (
            <PlayerAvatar 
              player={{ name, photo: null }} 
              size={size === "large" ? 96 : 64} 
            />
          ) : type === "squad" ? (
            <svg 
              width={size === "large" ? 32 : 32} 
              height={size === "large" ? 32 : 32} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          ) : (
            <svg 
              width={size === "large" ? 32 : 32} 
              height={size === "large" ? 32 : 32} 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={handlePhotoClick}
          className={`
            absolute -bottom-1 -right-1 ${pencilButtonSize[size]}
            rounded-full bg-green-500 flex items-center justify-center
            border-2 border-white dark:border-[#0f172a]
            hover:bg-green-600 transition-colors
          `}
        >
          <Pencil size={pencilIconSize[size]} className="text-black" />
        </button>
      </div>

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