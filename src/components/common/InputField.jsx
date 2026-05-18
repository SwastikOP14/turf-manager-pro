export default function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  centered = false
}) {

  return (

    <div className="flex flex-col gap-2">

      <label
        className="
          text-sm
          font-medium
          text-black
          dark:text-white
        "
      >
        {label}
      </label>

      <input
        type={type}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        style={{
          textAlign:
            centered
              ? "center"
              : "left"
        }}

        className="
          w-full

          rounded-2xl

          px-4 py-3

          outline-none

          bg-white
          dark:bg-white/5

          border
          border-black/10
          dark:border-white/10

          text-black
          dark:text-white

          placeholder:text-gray-400

          transition-all
          duration-200

          focus:border-green-500
          focus:ring-2
          focus:ring-green-500/20
        "
      />

    </div>

  )
}