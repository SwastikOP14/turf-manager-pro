import { useState } from "react"

import MobileLayout from "../../components/layout/MobileLayout"
import Modal from "../../components/common/Modal"

import { useApp } from "../../context/AppContext"

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

  const [playerName, setPlayerName] =
    useState("")

  const [playerPhone, setPlayerPhone] =
    useState("")

  const [playerError, setPlayerError] =
    useState("")

  const [turf, setTurf] = useState("")
  const [sport, setSport] = useState("")
  const [amount, setAmount] = useState("")

  const [status, setStatus] =
    useState("Paid")

  /* DATE */

  const [date, setDate] = useState("")

  /* TIME */

  const [startTime, setStartTime] =
    useState("")

  const [endTime, setEndTime] =
    useState("")

  /* DURATION */

  const calculateDuration = () => {

    if (!startTime || !endTime)
      return ""

    const start =
      new Date(
        `1970-01-01T${startTime}`
      )

    const end =
      new Date(
        `1970-01-01T${endTime}`
      )

    const diffMs = end - start

    const hours =
      diffMs / (1000 * 60 * 60)

    return `${hours} hrs`
  }

  return (

    <MobileLayout hideFab>

      <div className="p-5 space-y-5">

        {/* PAGE TITLE */}

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

          <InputField
            label="Date"

            type="date"

            value={date}

            onChange={(e) =>
              setDate(e.target.value)
            }

            placeholder="DD-MM-YYYY"

            centered
          />

          {/* START + END TIME */}

          <div className="
            grid
            grid-cols-2
            gap-3
          ">

            {/* START TIME */}

            <InputField
              label="Start Time"

              type="time"

              value={startTime}

              onChange={(e) =>
                setStartTime(e.target.value)
              }

              placeholder="00:00"

              centered
            />

            {/* END TIME */}

            <InputField
              label="End Time"

              type="time"

              value={endTime}

              onChange={(e) =>
                setEndTime(e.target.value)
              }

              placeholder="00:00"

              centered
            />

          </div>

          {/* TOTAL DURATION */}

          {
            startTime &&
            endTime && (

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

        {/* PAYMENT SUMMARY */}

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

          <div className="space-y-3">

            {
              ["Arjun", "Ritesh", "Sana"]
                .map((player) => (

                  <div
                    key={player}

                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <span className="
                      text-black
                      dark:text-white
                    ">
                      {player}
                    </span>

                    <span className="
                      font-semibold
                      text-green-500
                    ">
                      ₹400
                    </span>

                  </div>

                ))
            }

          </div>

        </GlassCard>

        {/* CONTINUE BUTTON */}

        <PrimaryButton
          text="Continue"

          onClick={() => {

            if (
              !turf ||
              !sport ||
              !amount ||
              !date ||
              !startTime ||
              !endTime
            ) return

            addBooking({

              turf,

              sport,

              amount:
                Number(amount),

              status,

              date,

              startTime,

              endTime,

              duration:
                calculateDuration()
            })

            /* RESET */

            setTurf("")
            setSport("")
            setAmount("")

            setStatus("Paid")

            setDate("")

            setStartTime("")
            setEndTime("")
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