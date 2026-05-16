import { ChevronDown } from "lucide-react"

export default function SelectField({
  label,
  placeholder
}) {

  return (
    <div className="flex flex-col gap-2">

      <label className="
        text-sm font-medium
        text-black dark:text-white
      ">
        {label}
      </label>

      <button className="
        w-full
        rounded-2xl

        px-4 py-3

        flex items-center justify-between

        bg-white
        dark:bg-white/5

        border
        border-black/10
        dark:border-white/10

        text-black
        dark:text-white
      ">

        <span className="text-gray-400">
          {placeholder}
        </span>

        <ChevronDown size={18} />

      </button>

    </div>
  )
}