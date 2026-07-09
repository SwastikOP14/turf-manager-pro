import { useHaptics } from "../../context/HapticsContext"

export default function PrimaryButton({ text, onClick, disabled, icon: Icon, variant = "primary", className = "" }) {
  const haptics = useHaptics()
  
  const baseClasses = "flex items-center justify-center gap-2 font-semibold rounded-2xl py-3.5 w-full transition-all duration-200 disabled:opacity-50"
  
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700 active:scale-97",
    secondary: "border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 bg-white dark:bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 active:scale-97",
    danger: "bg-red-500 text-white hover:bg-red-600 active:scale-97"
  }

  const handleClick = () => {
    haptics.trigger(8)
    onClick?.()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {text}
    </button>
  )
}
