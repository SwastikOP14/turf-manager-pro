export default function SegmentedControl({ options, value, onChange }) {
  return (
    <div className="seg-control">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`seg-option ${value === option ? "active" : ""}`}
        >
          {option}
        </button>
      ))}
    </div>
  )
}
