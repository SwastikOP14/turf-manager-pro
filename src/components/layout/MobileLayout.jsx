import Header from "./Header"

import BottomNavbar from "./BottomNavbar"

import FloatingButton from "./FloatingButton"

export default function MobileLayout({
  children,
  hideFab = false
}) {

  return (

    <div className="
      min-h-screen

      bg-[#020817]

      flex
      justify-center
    ">

      {/* Mobile Container */}
      <div className="
        w-full
        max-w-md

        min-h-screen

        relative

        overflow-visible

        border-x
        border-white/10

        bg-[#020817]
      ">

        <Header />

        <main className="
          pb-32

          overflow-visible

          scroll-smooth
        ">

          {children}

        </main>

        <BottomNavbar />

        {
          !hideFab &&
          <FloatingButton />
        }

      </div>

    </div>

  )
}