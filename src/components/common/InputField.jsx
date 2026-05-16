export default function InputField({
  label,
  placeholder,
  type = "text",
  value,
  onChange
}) {

  return (

    <div className="flex flex-col gap-2">

      <label className="
        text-sm font-medium
        text-black dark:text-white
      ">
        {label}
      </label>

      <input
        type={type}

        value={value}
        onChange={onChange}

        placeholder={placeholder}

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
        "
      />

    </div>

  )
}