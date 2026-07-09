import { useHaptics } from "../../context/HapticsContext"

export default function SegmentedControl({ options, value, onChange }) {
  const haptics = useHaptics()

  const handleChange = (option) => {
    haptics.trigger(8)
    onChange(option)
  }

  return (
    <div className="seg-control">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => handleChange(option)}
          className={`seg-option ${value === option ? "active" : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
