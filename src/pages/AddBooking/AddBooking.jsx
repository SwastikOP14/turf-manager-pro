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
const [date, setDate] = useState("")
const [time, setTime] = useState("")
  return (
    <MobileLayout hideFab>

      <div className="p-5 space-y-5">

        {/* Page Title */}
        <h1 className="
          text-3xl font-bold
          text-black dark:text-white
        ">
          Add Booking
        </h1>

        {/* Booking Details */}
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

          <div className="grid grid-cols-2 gap-3">

            <InputField
              label="Date"

              type="date"

              value={date}

              onChange={(e) =>
                setDate(e.target.value)
              }
            />

            <InputField
              label="Time"

              type="time"

              value={time}

              onChange={(e) =>
                setTime(e.target.value)
              }
            />
          </div>

          <InputField
            label="Turf Owner Contact"
            placeholder="+91 9876543210"
          />

        </GlassCard>

        {/* Payment Summary */}
        <GlassCard className="space-y-4">

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
            flex justify-between
            text-sm font-semibold
          ">

            <span className="
              text-black dark:text-white
            ">
              Remaining Amount
            </span>

            <span className="text-orange-400">
              ₹500
            </span>

          </div>

        </GlassCard>

        {/* Paid By */}
        <GlassCard className="space-y-4">

          <SectionTitle title="Paid By" />

          <SelectField
            label="Player"
            placeholder="Select player"
          />

        </GlassCard>

        {/* Players */}
        <GlassCard className="space-y-4">

          <div className="
            flex items-center justify-between
          ">

            <SectionTitle title="Total Players" />

              <button
                  onClick={() => setPlayerModal(true)}
                  className="
                    text-sm
                    text-green-500
                    font-medium
                  "
                >
                  Add / Search Players
              </button>

          </div>

          {/* Player Rows */}
          <div className="space-y-3">

            {
              ["Arjun", "Ritesh", "Sana"].map((player) => (

                <div
                  key={player}
                  className="
                    flex items-center justify-between
                  "
                >

                  <span className="
                    text-black dark:text-white
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

              date,

              time
            })

            setTurf("")
            setSport("")
            setAmount("")
            setStatus("Paid")
            setDate("")
            setTime("")
          }}
        />

      </div>
          <Modal
            open={playerModal}
            onClose={() => setPlayerModal(false)}
          >

            <div className="space-y-5">

              <div className="
                flex items-center justify-between
              ">

                <h2 className="
                  text-2xl font-bold
                  text-white
                ">
                  Add Player
                </h2>

                <button
                  onClick={() => setPlayerModal(false)}
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

                  const trimmedName = playerName.trim()
                  const trimmedPhone = playerPhone.trim()

                  // EMPTY CHECK
                  if (!trimmedName || !trimmedPhone) {

                    setPlayerError(
                      "All fields are required"
                    )

                    return
                  }

                  // PHONE LENGTH
                  if (trimmedPhone.length < 7) {

                    setPlayerError(
                      "Phone number is too short"
                    )

                    return
                  }

                  // DUPLICATE CHECK
                  const playerExists = players.some(
                    (player) =>
                      player.phone === trimmedPhone
                  )

                  if (playerExists) {

                    setPlayerError(
                      "Player with this number already exists"
                    )

                    return
                  }

                  // CLEAR ERROR
                  setPlayerError("")

                  // ADD PLAYER
                  addPlayer({
                    name: trimmedName,
                    phone: trimmedPhone,
                    balance: 0
                  })

                  // RESET
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