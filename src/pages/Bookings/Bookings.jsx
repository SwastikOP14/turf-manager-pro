import MobileLayout from "../../components/layout/MobileLayout"
import { useApp } from "../../context/AppContext"
import BookingTabs from "../../components/booking/BookingTabs"
import BookingCard from "../../components/booking/BookingCard"

export default function Bookings() {
const { bookings } = useApp()
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
           {
              bookings.map((booking, index) => (

                <BookingCard
                  key={index}

                  turf={booking.turf}
                  sport={booking.sport}
                  amount={booking.amount}
                  status={booking.status}
                />

              ))
            }
        </div>

      </div>

    </MobileLayout>
  )
}