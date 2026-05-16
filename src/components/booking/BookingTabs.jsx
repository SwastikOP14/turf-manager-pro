const tabs = [
  {
    name: "All",
    count: 24
  },
  {
    name: "This Week",
    count: 6
  },
  {
    name: "This Month",
    count: 18
  },
  {
    name: "This Year",
    count: 48
  }
]

export default function BookingTabs() {

  return (
    <div className="
      flex gap-3
      overflow-x-auto
      scrollbar-hide
      pb-1
    ">

      {
        tabs.map((tab, index) => (

          <button
            key={tab.name}
            className={`
              min-w-fit
              px-4 py-2
              rounded-2xl

              border

              ${
                index === 0
                  ? `
                    bg-green-500
                    text-black
                    border-green-500
                  `
                  : `
                    bg-white/70
                    dark:bg-white/5

                    text-black
                    dark:text-white

                    border-black/5
                    dark:border-white/10
                  `
              }
            `}
          >

            <div className="text-xs font-medium">
              {tab.name}
            </div>

            <div className="text-sm font-bold">
              {tab.count}
            </div>

          </button>
        ))
      }

    </div>
  )
}