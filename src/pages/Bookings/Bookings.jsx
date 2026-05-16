import MobileLayout from "../../components/layout/MobileLayout"

import BookingTabs from "../../components/booking/BookingTabs"
import BookingCard from "../../components/booking/BookingCard"

export default function Bookings() {

  return (
    <MobileLayout>

      <div className="p-5 space-y-5">

        {/* Heading */}
        <div>

          <h1 className="
            text-3xl font-bold
            text-black dark:text-white
          ">
            Bookings
          </h1>

        </div>

        {/* Tabs */}
        <BookingTabs />

        {/* Cards */}
        <div className="space-y-4">

          <BookingCard status="Paid" />

          <BookingCard status="Partial" />

          <BookingCard status="Pending" />

        </div>

      </div>

    </MobileLayout>
  )
}