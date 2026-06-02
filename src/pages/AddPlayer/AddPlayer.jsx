import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Plus } from "lucide-react"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import InputField from "../../components/common/InputField"
import SegmentedControl from "../../components/common/SegmentedControl"
import PrimaryButton from "../../components/common/PrimaryButton"
import { useApp } from "../../context/useApp"
import { formatPhoneInput } from "../../utils/phone"
import { getInitials } from "../../utils/players"

export default function AddPlayer() {
  const navigate = useNavigate()
  const { addPlayer } = useApp()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+91 ")
  const [address, setAddress] = useState("")
  const [preferredPayment, setPreferredPayment] = useState("UPI")
  const [error, setError] = useState("")

  const handleSave = () => {
    const result = addPlayer({
      name,
      phone,
      address,
      preferredPayment
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate("/players")
  }

  return (
    <MobileLayout hideFab>
      <div className="p-5 space-y-5 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Add Player
        </h1>

        <GlassCard className="flex flex-col items-center gap-3 py-6">
          <div className="
            w-24 h-24 rounded-full
            bg-green-500/15 text-green-500
            border border-green-500/30
            flex items-center justify-center
          ">
            {name ? (
              <span className="text-2xl font-bold">
                {getInitials(name)}
              </span>
            ) : (
              <Plus size={32} />
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-gray-400">
            Tap + to add player photo
          </p>
        </GlassCard>

        <GlassCard className="space-y-4">
          <InputField
            label="Player Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <InputField
            label="Mobile Number"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
          />

          <InputField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900 dark:text-white">
              Preferred Payment
            </label>
            <SegmentedControl
              options={["UPI", "Cash"]}
              value={preferredPayment}
              onChange={setPreferredPayment}
            />
          </div>
        </GlassCard>

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <PrimaryButton
          text="Save Player"
          onClick={handleSave}
        />
      </div>
    </MobileLayout>
  )
}
