import GlassCard from "../common/GlassCard"

import {
  Calendar,
  Clock3,
  Trophy
} from "lucide-react"

export default function BookingCard({
        turf,
        sport,
        amount,
        status
      }){

  const statusColors = {
    Paid: "text-green-500",
    Partial: "text-orange-400",
    Pending: "text-red-500"
  }

  return (
    <GlassCard className="space-y-4">

      {/* Top */}
      <div className="flex justify-between">

        {/* Left */}
        <div className="flex gap-3">

          {/* Sport Icon */}
          <div className="
            w-12 h-12
            rounded-2xl

            bg-green-500/15
            text-green-500

            flex items-center justify-center
          ">
            <Trophy size={22} />
          </div>

          {/* Details */}
          <div>

            <h3 className="
              text-black dark:text-white
              font-semibold text-lg
            ">
              {turf}
            </h3>

            <p className="
              text-sm
              text-gray-500 dark:text-gray-400
            ">
              {sport}
            </p>

            <p className="
              text-xs mt-1
              text-gray-400
            ">
              BK0024
            </p>

          </div>

        </div>

        {/* Right */}
        <div className="text-right">

          <h3 className="
            text-green-500
            font-bold text-xl
          ">
            ₹{amount}
          </h3>

          <p className={`
            text-sm font-medium
            ${statusColors[status]}
          `}>
            {status}
          </p>

        </div>

      </div>

      {/* Bottom */}
      <div className="
        flex items-center gap-5
        text-xs
        text-gray-500 dark:text-gray-400
      ">

        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>18 May 2026</span>
        </div>

        <div className="flex items-center gap-1">
          <Clock3 size={14} />
          <span>08:00 AM - 10:00 AM</span>
        </div>

      </div>

      {/* Partial Info */}
      {
        status === "Partial" && (
          <div className="
            flex justify-between
            text-sm font-medium
          ">

            <span className="text-green-500">
              Paid ₹1,500
            </span>

            <span className="text-orange-400">
              Remaining ₹500
            </span>

          </div>
        )
      }

    </GlassCard>
  )
}