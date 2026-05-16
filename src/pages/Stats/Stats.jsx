import MobileLayout from "../../components/layout/MobileLayout"

import StatCard from "../../components/stats/StatCard"

import GlassCard from "../../components/common/GlassCard"

export default function Stats() {

  return (
    <MobileLayout>

      <div className="p-5 space-y-5">

        {/* Header */}
        <div>

          <h1 className="
            text-3xl font-bold
            text-black dark:text-white
          ">
            Statistics
          </h1>

          <p className="
            text-gray-500 dark:text-gray-400
          ">
            Turf business overview
          </p>

        </div>

        {/* Top Stats */}
        <div className="
          grid grid-cols-2 gap-4
        ">

          <StatCard
            title="Total Revenue"
            value="₹48K"
          />

          <StatCard
            title="Bookings"
            value="126"
            color="text-blue-400"
          />

          <StatCard
            title="Pending"
            value="₹4.5K"
            color="text-red-400"
          />

          <StatCard
            title="Players"
            value="62"
            color="text-orange-400"
          />

        </div>

        {/* Monthly Overview */}
        <GlassCard className="space-y-4">

          <div className="
            flex items-center justify-between
          ">

            <h2 className="
              text-lg font-semibold
              text-black dark:text-white
            ">
              Monthly Overview
            </h2>

            <span className="
              text-sm
              text-green-500
            ">
              May 2026
            </span>

          </div>

          {/* Fake Chart Bars */}
          <div className="
            flex items-end justify-between
            h-40 gap-3
          ">

            {
              [40, 70, 55, 90, 65, 85, 50].map((height, index) => (

                <div
                  key={index}
                  className="
                    flex-1

                    rounded-t-2xl

                    bg-green-500/80
                  "
                  style={{
                    height: `${height}%`
                  }}
                />

              ))
            }

          </div>

          {/* Labels */}
          <div className="
            flex justify-between
            text-xs
            text-gray-500
          ">

            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>

          </div>

        </GlassCard>

        {/* Additional Insights */}
        <GlassCard className="space-y-3">

          <h2 className="
            text-lg font-semibold
            text-black dark:text-white
          ">
            Insights
          </h2>

          <div className="
            flex justify-between
            text-sm
          ">

            <span className="
              text-gray-500 dark:text-gray-400
            ">
              Most Popular Sport
            </span>

            <span className="
              text-green-500 font-medium
            ">
              Cricket
            </span>

          </div>

          <div className="
            flex justify-between
            text-sm
          ">

            <span className="
              text-gray-500 dark:text-gray-400
            ">
              Peak Booking Time
            </span>

            <span className="
              text-blue-400 font-medium
            ">
              6 PM - 9 PM
            </span>

          </div>

          <div className="
            flex justify-between
            text-sm
          ">

            <span className="
              text-gray-500 dark:text-gray-400
            ">
              Average Booking
            </span>

            <span className="
              text-orange-400 font-medium
            ">
              ₹1,850
            </span>

          </div>

        </GlassCard>

      </div>

    </MobileLayout>
  )
}