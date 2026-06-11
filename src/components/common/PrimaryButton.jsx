export default function PrimaryButton({ text, onClick, disabled, icon: Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="btn-primary w-full"
    >
      {Icon && <Icon size={18} />}
      {text}
    </button>
  )
}
