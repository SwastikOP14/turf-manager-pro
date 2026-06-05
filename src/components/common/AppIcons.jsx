/**
 * Custom app icons — neon green outline, lucide style, transparent background
 * Use these wherever the ₹ rupee symbol or 📅 calendar emoji appear in UI labels.
 */

export function RupeeIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={`text-green-500 ${className}`}
    >
      {/* Horizontal lines */}
      <line x1="6" y1="5" x2="18" y2="5" />
      <line x1="6" y1="9" x2="18" y2="9" />
      {/* Vertical stem */}
      <path d="M6 5 h6 a4 4 0 0 1 0 8 H6" />
      {/* Diagonal down-stroke */}
      <line x1="12" y1="13" x2="6" y2="21" />
    </svg>
  )
}

export function CalendarIcon({ size = 20, className = "" }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={`text-green-500 ${className}`}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8"  y1="2" x2="8"  y2="6" />
      <line x1="3"  y1="10" x2="21" y2="10" />
    </svg>
  )
}
