import Header from "./Header"
import BottomNav from "./BottomNav"
import FloatingButton from "./FloatingButton"

export default function MobileLayout({
        children,
        hideFab = false
      }) {

  return (
    <div className="
      min-h-screen
      bg-[#dfe5ec] dark:bg-[#081028]
      flex justify-center
      transition-colors duration-300
    ">

      <div className="
        w-full max-w-md min-h-screen relative
        border-x
        border-black/5 dark:border-white/10

        bg-[#f5f7fa]
        dark:bg-linear-to-b
        dark:from-[#081028]
        dark:to-[#0f172a]

        transition-colors duration-300
      ">

        <Header />

        <main className="pb-40">
          {children}
        </main>

        {
          !hideFab && <FloatingButton />
        }

        <BottomNav />

      </div>

    </div>
  )
}