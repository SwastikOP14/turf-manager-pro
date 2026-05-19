import { useState } from "react"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import MobileLayout from "../../components/layout/MobileLayout"

import GlassCard from "../../components/common/GlassCard"
import SectionTitle from "../../components/common/SectionTitle"
import InputField from "../../components/common/InputField"
import SelectField from "../../components/common/SelectField"
import PrimaryButton from "../../components/common/PrimaryButton"

export default function AddBooking() {

  const [sport, setSport] =
    useState("")

  const [turf, setTurf] =
    useState("")

  const [date, setDate] =
    useState(null)

  const [amount, setAmount] =
    useState("")

  const [status, setStatus] =
    useState("Paid")

  /* START TIME */

  const [startHour, setStartHour] =
    useState("")

  const [startMinute, setStartMinute] =
    useState("")

  const [startPeriod, setStartPeriod] =
    useState("AM")

  /* END TIME */

  const [endHour, setEndHour] =
    useState("")

  const [endMinute, setEndMinute] =
    useState("")

  const [endPeriod, setEndPeriod] =
    useState("AM")

  /* DURATION */

  const calculateDuration = () => {

    if (
      !startHour ||
      !startMinute ||
      !endHour ||
      !endMinute
    ) return "0 hrs"

    const convertTo24Hour = (
      hour,
      minute,
      period
    ) => {

      let h = parseInt(hour)

      if (
        period === "PM" &&
        h !== 12
      ) {
        h += 12
      }

      if (
        period === "AM" &&
        h === 12
      ) {
        h = 0
      }

      return `${String(h).padStart(2, "0")}:${minute}`
    }

    const start =
      new Date(
        `1970-01-01T${
          convertTo24Hour(
            startHour,
            startMinute,
            startPeriod
          )
        }`
      )

    const end =
      new Date(
        `1970-01-01T${
          convertTo24Hour(
            endHour,
            endMinute,
            endPeriod
          )
        }`
      )

    const diffMs = end - start

    const hours =
      diffMs / (1000 * 60 * 60)

    return `${hours} hrs`
  }

  return (

    <MobileLayout hideFab>

      <div className="
        p-5
        space-y-6
      ">

        {/* PAGE TITLE */}

        <h1 className="
          text-3xl
          font-bold
          text-white
        ">
          Add Booking
        </h1>

        {/* BOOKING DETAILS */}

        <GlassCard className="space-y-9">

          <SectionTitle
            title="Booking Details"
          />

          {/* SPORT */}

          <div className="space-y-3">

            <label className="
              text-sm
              font-medium
              text-white
            ">
              Sport / Game
            </label>

            <InputField
              placeholder="Cricket"

              value={sport}

              onChange={(e) =>
                setSport(e.target.value)
              }
            />

          </div>

          {/* TURF */}

          <div className="space-y-3">

            <label className="
              text-sm
              font-medium
              text-white
            ">
              Turf / Ground
            </label>

            <InputField
              placeholder="Green Valley Ground"

              value={turf}

              onChange={(e) =>
                setTurf(e.target.value)
              }
            />

          </div>

          {/* CONTACT */}

          <div className="space-y-2">

            <label className="
              text-sm
              font-medium
              text-white
            ">
              Turf Owner Contact
            </label>

            <InputField
              placeholder="+91 9876543210"
            />

          </div>

          {/* DATE */}

         <div className="
            flex
            flex-col
            gap-3
          ">

            <label className="
              text-sm
              font-medium
              text-white
            ">
              Date
            </label>

            <DatePicker
              selected={date}

              onChange={(selectedDate) =>
                setDate(selectedDate)
              }

              dateFormat="dd-MM-yyyy"

              placeholderText="DD-MM-YYYY"

              popperPlacement="top-start"

              portalId="root-portal"

              popperClassName="react-datepicker-popper-custom"

              className="
                w-full
                h-11

                rounded-2xl

                px-4

                bg-[#1E293B]

                border
                border-white/10

                text-white

                outline-none

                caret-transparent
              "
            />

          </div>

          {/* START TIME */}

          <div className="space-y-40">

            <label className="
              text-sm
              font-medium
              text-white
            ">
              Start Time
            </label>

            <div className="
              flex
              items-center
              gap-3
            ">

              {/* HH */}

              <select
                value={startHour}

                onChange={(e) =>
                  setStartHour(e.target.value)
                }

                className="
                  flex-1
                  h-14

                  rounded-2xl

                  text-center

                  leading-none

                  bg-[#1E293B]

                  border
                  border-white/10

                  text-white

                  outline-none

                  appearance-none
                "
              >

                <option value="">
                  HH
                </option>

                {
                  Array.from(
                    { length: 12 },
                    (_, i) => i + 1
                  ).map((hour) => (

                    <option
                      key={hour}
                      className="text-black"
                      value={String(hour).padStart(2, "0")}
                    >
                      {String(hour).padStart(2, "0")}
                    </option>

                  ))
                }

              </select>

              {/* MM */}

              <select
                value={startMinute}

                onChange={(e) =>
                  setStartMinute(e.target.value)
                }

                className="
                  w-full
                  h-11

                  rounded-2xl

                  text-center

                  bg-[#1E293B]

                  border
                  border-white/10

                  text-white

                  outline-none

                  appearance-none
                "
              >

                <option value="">
                  MM
                </option>

                {
                  ["00", "15", "30", "45"]
                    .map((minute) => (

                      <option
                        key={minute}
                        className="text-black"
                        value={minute}
                      >
                        {minute}
                      </option>

                    ))
                }

              </select>

              {/* AM PM */}

              <select
                value={startPeriod}

                onChange={(e) =>
                  setStartPeriod(e.target.value)
                }

                className="
                  w-full
                  h-11

                  rounded-2xl

                  text-center

                  bg-[#1E293B]

                  border
                  border-white/10

                  text-white

                  outline-none

                  appearance-none
                "
              >

                <option>
                  AM
                </option>

                <option>
                  PM
                </option>

              </select>

            </div>

          </div>

          {/* END TIME */}

          <div className="space-y-2">

            <label className="
              text-sm
              font-medium
              text-white
            ">
              End Time
            </label>

            <div className="
              flex
              items-center
              gap-3
            ">

              {/* HH */}

              <select
                value={endHour}

                onChange={(e) =>
                  setEndHour(e.target.value)
                }

                className="
                  flex-1
                  h-14

                  rounded-2xl

                  text-center

                  leading-none

                  bg-[#1E293B]

                  border
                  border-white/10

                  text-white

                  outline-none

                  appearance-none
                "
              >

                <option value="">
                  HH
                </option>

                {
                  Array.from(
                    { length: 12 },
                    (_, i) => i + 1
                  ).map((hour) => (

                    <option
                      key={hour}
                      className="text-black"
                      value={String(hour).padStart(2, "0")}
                    >
                      {String(hour).padStart(2, "0")}
                    </option>

                  ))
                }

              </select>

              {/* MM */}

              <select
                value={endMinute}

                onChange={(e) =>
                  setEndMinute(e.target.value)
                }

                className="
                  w-full
                  h-11

                  rounded-2xl

                  text-center

                  bg-[#1E293B]

                  border
                  border-white/10

                  text-white

                  outline-none

                  appearance-none
                "
              >

                <option value="">
                  MM
                </option>

                {
                  ["00", "15", "30", "45"]
                    .map((minute) => (

                      <option
                        key={minute}
                        className="text-black"
                        value={minute}
                      >
                        {minute}
                      </option>

                    ))
                }

              </select>

              {/* AM PM */}

              <select
                value={endPeriod}

                onChange={(e) =>
                  setEndPeriod(e.target.value)
                }

                className="
                  w-full
                  h-11

                  rounded-2xl

                  text-center

                  bg-[#1E293B]

                  border
                  border-white/10

                  text-white

                  outline-none

                  appearance-none
                "
              >

                <option>
                  AM
                </option>

                <option>
                  PM
                </option>

              </select>

            </div>

          </div>

          {/* DURATION */}

          <div className="space-y-2">

            <label className="
              text-sm
              font-medium
              text-white
            ">
              Total Duration
            </label>

            <div className="
              w-full
              h-11

              rounded-2xl

              flex
              items-center
              justify-center

              bg-[#1E293B]

              border
              border-white/10

              text-green-400
              font-semibold
              text-lg
            ">

              {calculateDuration()}

            </div>

          </div>

        </GlassCard>

        {/* PAYMENT */}

        <GlassCard className="space-y-5">

          <SectionTitle
            title="Payment Summary"
          />

          <InputField
            label="Total Amount"

            placeholder="2000"

            value={amount}

            onChange={(e) =>
              setAmount(e.target.value)
            }
          />

          <SelectField
            label="Payment Status"

            value={status}

            onChange={(e) =>
              setStatus(e.target.value)
            }

            options={[
              "Paid",
              "Partial",
              "Pending"
            ]}
          />

        </GlassCard>

        {/* BUTTON */}

        <PrimaryButton
          text="Create Booking"
        />

      </div>

    </MobileLayout>
  )
}