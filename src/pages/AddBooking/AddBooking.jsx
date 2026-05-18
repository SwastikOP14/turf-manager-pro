import { useState } from "react"

import MobileLayout from "../../components/layout/MobileLayout"
import Modal from "../../components/common/Modal"

import { useApp } from "../../context/AppContext"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

import GlassCard from "../../components/common/GlassCard"
import SectionTitle from "../../components/common/SectionTitle"
import InputField from "../../components/common/InputField"
import SelectField from "../../components/common/SelectField"
import PrimaryButton from "../../components/common/PrimaryButton"

export default function AddBooking() {

  const [playerModal, setPlayerModal] =
    useState(false)

  const {
    players,
    addPlayer,
    addBooking
  } = useApp()

  /* PLAYER */

  const [playerName, setPlayerName] =
    useState("")

  const [playerPhone, setPlayerPhone] =
    useState("")

  const [playerError, setPlayerError] =
    useState("")

  /* BOOKING */

  const [turf, setTurf] = useState("")
  const [sport, setSport] = useState("")
  const [amount, setAmount] = useState("")

  const [status, setStatus] =
    useState("Paid")

  /* DATE */

  const [date, setDate] =
    useState(null)

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
    ) return ""

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

      <div className="p-5 space-y-5">

        {/* TITLE */}

        <h1 className="
          text-3xl
          font-bold

          text-black
          dark:text-white
        ">
          Add Booking
        </h1>

        {/* BOOKING DETAILS */}

        <GlassCard className="space-y-4">

          <SectionTitle
            title="Booking Details"
          />

          {/* SPORT */}

          <InputField
            label="Sport / Game"

            placeholder="Cricket"

            value={sport}

            onChange={(e) =>
              setSport(e.target.value)
            }
          />

          {/* TURF */}

          <InputField
            label="Turf / Ground"

            placeholder="Green Valley Ground"

            value={turf}

            onChange={(e) =>
              setTurf(e.target.value)
            }
          />

          {/* DATE */}

          <div className="space-y-2">

            <label className="
              text-sm
              font-medium

              text-black
              dark:text-white
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

              className="
                w-full

                rounded-2xl

                px-4 py-3

                text-center

                outline-none

                bg-white
                dark:bg-white/5

                border
                border-black/10
                dark:border-white/10

                text-black
                dark:text-white
              "
            />

          </div>

          {/* TIME SECTION */}

          <div className="
            grid
            grid-cols-2
            gap-4
          ">

            {/* START TIME */}

            <div className="space-y-2">

              <label className="
                text-sm
                font-medium

                text-black
                dark:text-white
              ">
                Start Time
              </label>

              <div className="
                flex
                gap-2
              ">

                {/* HOUR */}

                <select
                  value={startHour}

                  onChange={(e) =>
                    setStartHour(
                      e.target.value
                    )
                  }

                  className="
                    flex-1

                    rounded-2xl

                    px-3 py-3

                    bg-white
                    dark:bg-white/5

                    border
                    border-black/10
                    dark:border-white/10

                    text-black
                    dark:text-white

                    outline-none
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
                        value={String(hour).padStart(2, "0")}
                      >
                        {String(hour).padStart(2, "0")}
                      </option>

                    ))
                  }

                </select>

                {/* MINUTE */}

                <select
                  value={startMinute}

                  onChange={(e) =>
                    setStartMinute(
                      e.target.value
                    )
                  }

                  className="
                    flex-1

                    rounded-2xl

                    px-3 py-3

                    bg-white
                    dark:bg-white/5

                    border
                    border-black/10
                    dark:border-white/10

                    text-black
                    dark:text-white

                    outline-none
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
                    setStartPeriod(
                      e.target.value
                    )
                  }

                  className="
                    rounded-2xl

                    px-3 py-3

                    bg-white
                    dark:bg-white/5

                    border
                    border-black/10
                    dark:border-white/10

                    text-black
                    dark:text-white

                    outline-none
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

                text-black
                dark:text-white
              ">
                End Time
              </label>

              <div className="
                flex
                gap-2
              ">

                {/* HOUR */}

                <select
                  value={endHour}

                  onChange={(e) =>
                    setEndHour(
                      e.target.value
                    )
                  }

                  className="
                    flex-1

                    rounded-2xl

                    px-3 py-3

                    bg-white
                    dark:bg-white/5

                    border
                    border-black/10
                    dark:border-white/10

                    text-black
                    dark:text-white

                    outline-none
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
                        value={String(hour).padStart(2, "0")}
                      >
                        {String(hour).padStart(2, "0")}
                      </option>

                    ))
                  }

                </select>

                {/* MINUTE */}

                <select
                  value={endMinute}

                  onChange={(e) =>
                    setEndMinute(
                      e.target.value
                    )
                  }

                  className="
                    flex-1

                    rounded-2xl

                    px-3 py-3

                    bg-white
                    dark:bg-white/5

                    border
                    border-black/10
                    dark:border-white/10

                    text-black
                    dark:text-white

                    outline-none
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
                    setEndPeriod(
                      e.target.value
                    )
                  }

                  className="
                    rounded-2xl

                    px-3 py-3

                    bg-white
                    dark:bg-white/5

                    border
                    border-black/10
                    dark:border-white/10

                    text-black
                    dark:text-white

                    outline-none
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

          </div>

          {/* DURATION */}

          {
            startHour &&
            startMinute &&
            endHour &&
            endMinute && (

              <div className="
                flex
                items-center
                justify-between

                rounded-2xl

                px-4
                py-3

                bg-green-500/10

                border
                border-green-500/20
              ">

                <span className="
                  text-sm
                  font-medium

                  text-black
                  dark:text-white
                ">
                  Total Duration
                </span>

                <span className="
                  text-green-500
                  font-bold
                ">
                  {calculateDuration()}
                </span>

              </div>

            )
          }

          {/* CONTACT */}

          <InputField
            label="Turf Owner Contact"

            placeholder="+91 9876543210"
          />

        </GlassCard>

        {/* PAYMENT */}

        <GlassCard className="space-y-4">

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

          <InputField
            label="Paid Amount"

            placeholder="₹ 1500"
          />

          <div className="
            flex
            items-center
            justify-between

            text-sm
            font-semibold
          ">

            <span className="
              text-black
              dark:text-white
            ">
              Remaining Amount
            </span>

            <span className="
              text-orange-400
            ">
              ₹500
            </span>

          </div>

        </GlassCard>

        {/* PLAYERS */}

        <GlassCard className="space-y-4">

          <div className="
            flex
            items-center
            justify-between
          ">

            <SectionTitle
              title="Total Players"
            />

            <button
              onClick={() =>
                setPlayerModal(true)
              }

              className="
                text-sm
                font-medium

                text-green-500
              "
            >
              Add / Search Players
            </button>

          </div>

        </GlassCard>

        {/* CONTINUE */}

        <PrimaryButton
          text="Continue"

          onClick={() => {

            if (
              !turf ||
              !sport ||
              !amount ||
              !date ||
              !startHour ||
              !startMinute ||
              !endHour ||
              !endMinute
            ) return

            addBooking({

              turf,

              sport,

              amount:
                Number(amount),

              status,

              date,

              startTime:
                `${startHour}:${startMinute} ${startPeriod}`,

              endTime:
                `${endHour}:${endMinute} ${endPeriod}`,

              duration:
                calculateDuration()
            })

            /* RESET */

            setTurf("")
            setSport("")
            setAmount("")

            setStatus("Paid")

            setDate(null)

            setStartHour("")
            setStartMinute("")
            setStartPeriod("AM")

            setEndHour("")
            setEndMinute("")
            setEndPeriod("AM")
          }}
        />

      </div>

      {/* PLAYER MODAL */}

      <Modal
        open={playerModal}

        onClose={() =>
          setPlayerModal(false)
        }
      >

        <div className="space-y-5">

          <div className="
            flex
            items-center
            justify-between
          ">

            <h2 className="
              text-2xl
              font-bold
              text-white
            ">
              Add Player
            </h2>

            <button
              onClick={() =>
                setPlayerModal(false)
              }

              className="
                text-xl
                text-gray-400
              "
            >
              ✕
            </button>

          </div>

          <InputField
            label="Player Name"

            placeholder="Enter player name"

            value={playerName}

            onChange={(e) =>
              setPlayerName(
                e.target.value
              )
            }
          />

          <InputField
            label="Phone Number"

            placeholder="+91 9876543210"

            value={playerPhone}

            onChange={(e) =>
              setPlayerPhone(
                e.target.value
              )
            }
          />

          {
            playerError && (

              <div className="
                text-sm
                font-medium

                text-red-400
              ">
                {playerError}
              </div>

            )
          }

          <PrimaryButton
            text="Add Player"

            onClick={() => {

              const trimmedName =
                playerName.trim()

              const trimmedPhone =
                playerPhone.trim()

              if (
                !trimmedName ||
                !trimmedPhone
              ) {

                setPlayerError(
                  "All fields are required"
                )

                return
              }

              if (
                trimmedPhone.length < 7
              ) {

                setPlayerError(
                  "Phone number is too short"
                )

                return
              }

              const playerExists =
                players.some(
                  (player) =>
                    player.phone ===
                    trimmedPhone
                )

              if (playerExists) {

                setPlayerError(
                  "Player with this number already exists"
                )

                return
              }

              setPlayerError("")

              addPlayer({

                name: trimmedName,

                phone: trimmedPhone,

                balance: 0
              })

              setPlayerName("")
              setPlayerPhone("")

              setPlayerModal(false)
            }}
          />

        </div>

      </Modal>

    </MobileLayout>
  )
}