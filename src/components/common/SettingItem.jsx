export default function SettingItem({
  title,
  subtitle,
  rightElement
}) {

  return (
    <div className="
      flex items-center justify-between
      py-3
    ">

      <div>

        <h3 className="
          font-medium
          text-black dark:text-white
        ">
          {title}
        </h3>

        {
          subtitle && (
            <p className="
              text-sm
              text-gray-500 dark:text-gray-400
            ">
              {subtitle}
            </p>
          )
        }

      </div>

      {rightElement}

    </div>
  )
}