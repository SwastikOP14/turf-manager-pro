import MobileLayout from "../../components/layout/MobileLayout"
import { useState } from "react"
import { useApp } from "../../context/AppContext"
import BookingTabs from "../../components/booking/BookingTabs"
import BookingCard from "../../components/booking/BookingCard"
export default function Bookings() {
const { bookings } = useApp()
const [filter, setFilter] = useState("All")
const filteredBookings =
  filter === "All"
    ? bookings
    : bookings.filter(
        (booking) =>
          booking.status === filter
      )
  return (
    <MobileLayout>

      <div className="p-5 space-y-5">
      <div className="
          flex gap-3
          overflow-x-auto
        ">

          {
            [
              "All",
              "Paid",
              "Partial",
              "Pending"
            ].map((item) => (

              <button
                key={item}

                onClick={() =>
                  setFilter(item)
                }

                className={`
                  px-4 py-2

                  rounded-2xl

                  whitespace-nowrap

                  transition

                  ${
                    filter === item
                      ? "bg-green-500 text-black"
                      : `
                        bg-white/70
                        dark:bg-white/5

                        text-black
                        dark:text-white
                      `
                  }
                `}
              >

                {item}

              </button>

            ))
          }

        </div>
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
              filteredBookings.map((booking, index) => (

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