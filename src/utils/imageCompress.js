/**
 * Compresses an image file by resizing it and reducing JPEG quality.
 * Returns a base64 data URL string, small enough to safely store in localStorage.
 */
export function compressImage(file, maxDimension = 200, quality = 0.7) {
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