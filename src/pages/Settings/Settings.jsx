import { useState } from "react"

import MobileLayout from "../../components/layout/MobileLayout"

import GlassCard from "../../components/common/GlassCard"
import SettingItem from "../../components/common/SettingItem"
import PrimaryButton from "../../components/common/PrimaryButton"

export default function Settings() {

  const [notifications, setNotifications] = useState(true)

  return (
    <MobileLayout>

      <div className="p-5 space-y-5">

        {/* Header */}
        <div>

          <h1 className="
            text-3xl font-bold
            text-black dark:text-white
          ">
            Settings
          </h1>

          <p className="
            text-gray-500 dark:text-gray-400
          ">
            Manage your app preferences
          </p>

        </div>

        {/* Profile */}
        <GlassCard>

          <div className="
            flex items-center gap-4
          ">

            <div className="
              w-16 h-16
              rounded-full

              bg-green-500

              flex items-center justify-center

              text-black
              text-xl font-bold
            ">
              TM
            </div>

            <div>

              <h2 className="
                text-xl font-semibold
                text-black dark:text-white
              ">
                Turf Manager
              </h2>

              <p className="
                text-sm
                text-gray-500 dark:text-gray-400
              ">
                Professional Turf Booking App
              </p>

            </div>

          </div>

        </GlassCard>

        {/* Preferences */}
        <GlassCard>

          <SettingItem
            title="Notifications"
            subtitle="Receive booking alerts"

            rightElement={

              <button
                onClick={() =>
                  setNotifications(!notifications)
                }
                className={`
                  w-14 h-8
                  rounded-full
                  transition
                  relative

                  ${
                    notifications
                      ? "bg-green-500"
                      : "bg-gray-500"
                  }
                `}
              >

                <div className={`
                  absolute top-1

                  w-6 h-6
                  rounded-full
                  bg-white

                  transition

                  ${
                    notifications
                      ? "right-1"
                      : "left-1"
                  }
                `} />

              </button>

            }
          />

          <div className="
            border-t
            border-black/5
            dark:border-white/10
          ">

            <SettingItem
              title="Dark Mode"
              subtitle="Theme controlled from header"
            />

          </div>

        </GlassCard>

        {/* Data */}
        <GlassCard className="space-y-4">

          <h2 className="
            text-lg font-semibold
            text-black dark:text-white
          ">
            Data Management
          </h2>

          <PrimaryButton
            text="Export Booking Data"
          />

          <button className="
            w-full
            py-3

            rounded-2xl

            border border-red-500/30

            text-red-400
            font-semibold

            hover:bg-red-500/10

            transition
          ">
            Reset Application
          </button>

        </GlassCard>

        {/* Version */}
        <div className="
          text-center
          text-sm
          text-gray-500
        ">
          Turf Manager Pro v1.0.0
        </div>

      </div>

    </MobileLayout>
  )
}