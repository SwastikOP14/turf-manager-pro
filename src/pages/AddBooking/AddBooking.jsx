import { useState } from "react"

import MobileLayout from "../../components/layout/MobileLayout"
import Modal from "../../components/common/Modal"

import { useApp } from "../../context/AppContext"

import GlassCard from "../../components/common/GlassCard"
import SectionTitle from "../../components/common/SectionTitle"
import InputField from "../../components/common/InputField"
import SelectField from "../../components/common/SelectField"
import PrimaryButton from "../../components/common/PrimaryButton"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

export default function AddBooking() {

  const [playerModal, setPlayerModal] = useState(false)

  const {
    players,
    addPlayer,
    addBooking
  } = useApp()

  const [playerName, setPlayerName] = useState("")
  const [playerPhone, setPlayerPhone] = useState("")
  const [playerError, setPlayerError] = useState("")

  const [turf, setTurf] = useState("")
  const [sport, setSport] = useState("")
  const [amount, setAmount] = useState("")
  const [status, setStatus] = useState("Paid")

  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)

  return (

    <MobileLayout hideFab>

      <div className="
          p-5
          space-y-5

          relative
          z-50
        ">

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

          <SectionTitle title="Booking Details" />

          <InputField
            label="Sport / Game"
            placeholder="Cricket"

            value={sport}

            onChange={(e) =>
              setSport(e.target.value)
            }
          />

          <InputField
            label="Turf / Ground"
            placeholder="Green Valley Ground"

            value={turf}

            onChange={(e) =>
              setTurf(e.target.value)
            }
          />

          {/* DATE + TIME */}
          <div className="grid grid-cols-2 gap-3">

            {/* DATE */}
            <div className="flex flex-col gap-2">

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

                withPortal

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

            {/* TIME */}
            <div className="flex flex-col gap-2">

              <label className="
                text-sm
                font-medium
                text-black
                dark:text-white
              ">
                Time
              </label>

              <DatePicker
                selected={time}

                onChange={(selectedTime) =>
                  setTime(selectedTime)
                }

                withPortal

                showTimeSelect

                showTimeSelectOnly

                timeIntervals={5}

                timeCaption="Select Time"

                dateFormat="hh:mm aa"

                placeholderText="00:00 AM"

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

          </div>

          <InputField
            label="Turf Owner Contact"
            placeholder="+91 9876543210"
          />

        </GlassCard>

        {/* PAYMENT SUMMARY */}
        <GlassCard className="relative z-0" >

          <SectionTitle title="Payment Summary" />

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

            <span className="text-orange-400">
              ₹500
            </span>

          </div>

        </GlassCard>

        {/* PAID BY */}
        <GlassCard className="space-y-4">

          <SectionTitle title="Paid By" />

          <SelectField
            label="Player"
            placeholder="Select player"
          />

        </GlassCard>

        {/* PLAYERS */}
        <GlassCard className="space-y-4">

          <div className="
            flex
            items-center
            justify-between
          ">

            <SectionTitle title="Total Players" />

            <button
              onClick={() =>
                setPlayerModal(true)
              }

              className="
                text-sm
                text-green-500
                font-medium
              "
            >
              Add / Search Players
            </button>

          </div>

          <div className="space-y-3">

            {
              ["Arjun", "Ritesh", "Sana"].map((player) => (

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
                    text-green-500
                    font-semibold
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
              !time
            ) return

            addBooking({

              turf,

              sport,

              amount: Number(amount),

              status,

              date: date?.toLocaleDateString(),

              time: time?.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit"
              })
            })

            setTurf("")
            setSport("")
            setAmount("")
            setStatus("Paid")

            setDate(null)
            setTime(null)
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
                text-gray-400
                text-xl
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
              setPlayerName(e.target.value)
            }
          />

          <InputField
            label="Phone Number"
            placeholder="+91 9876543210"

            value={playerPhone}

            onChange={(e) =>
              setPlayerPhone(e.target.value)
            }
          />

          {
            playerError && (

              <div className="
                text-red-400
                text-sm
                font-medium
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
                    player.phone === trimmedPhone
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