import { useState } from "react"
import { useNavigate } from "react-router-dom"

import MobileLayout from "../../components/layout/MobileLayout"
import GlassCard from "../../components/common/GlassCard"
import InputField from "../../components/common/InputField"
import SegmentedControl from "../../components/common/SegmentedControl"
import PrimaryButton from "../../components/common/PrimaryButton"
import PhotoUpload from "../../components/common/PhotoUpload"
import { useApp } from "../../context/useApp"
import { formatPhoneInput } from "../../utils/phone"

export default function AddPlayer() {
  const navigate = useNavigate()
  const { addPlayer } = useApp()

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("+91 ")
  const [address, setAddress] = useState("")
  const [preferredPayment, setPreferredPayment] = useState("UPI")
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState("")

  const handleSave = () => {
    // Validate all required fields
    if (!name.trim()) {
      setError("Please fill player name")
      return
    }
    
    if (!phone || phone === "+91 ") {
      setError("Please fill mobile number")
      return
    }
    
    if (!address.trim()) {
      setError("Please fill address")
      return
    }

    const result = addPlayer({
      name,
      phone,
      address,
      preferredPayment,
      photo
    })

    if (!result.ok) {
      setError(result.error)
      return
    }

    navigate("/players")
  }

  return (
    <MobileLayout hideFab>
      <div className="pt-2 px-5 pb-5 space-y-4 animate-fade-in-up">
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-1">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Player</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Add a new team member</p>
          </div>
        </div>

        <GlassCard className="flex flex-col items-center gap-3 py-6">
          <PhotoUpload
            name={name}
            photo={photo}
            onPhotoChange={setPhoto}
            size="large"
          />
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
            <label className="text-[14px] font-medium text-slate-700 dark:text-slate-300">
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
          <p className="text-[12px] text-red-500 text-center font-normal">{error}</p>
        )}

        <PrimaryButton
          text="Save Player"
          onClick={handleSave}
        />
      </div>
    </MobileLayout>
  )
}
