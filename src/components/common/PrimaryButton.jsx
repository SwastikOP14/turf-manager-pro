export default function PrimaryButton({
  text,
  onClick
}) {

  return (

    <button
      onClick={onClick}

      className="
        w-full
        py-4

        rounded-2xl

        bg-green-500

        text-black
        font-semibold

        active:scale-[0.98]
        transition
      "
    >

      {text}

    </button>

  )
}