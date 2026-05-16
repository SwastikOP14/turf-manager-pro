import { useState } from "react"
import { useApp } from "../../context/AppContext"
import MobileLayout from "../../components/layout/MobileLayout"
import Modal from "../../components/common/Modal"
import PlayerCard from "../../components/player/PlayerCard"

import {
  Search,
  ChevronDown
} from "lucide-react"

export default function Players() {

  const [search, setSearch] = useState("")
  const [sortOpen, setSortOpen] = useState(false)
  const [sortType, setSortType] = useState("A-Z")
  const [deleteModal, setDeleteModal] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
const {
        players,
        deletePlayer
      } = useApp()

  let filteredPlayers = players.filter((player) =>
    player.name
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  if (sortType === "A-Z") {
    filteredPlayers.sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }

  if (sortType === "Z-A") {
    filteredPlayers.sort((a, b) =>
      b.name.localeCompare(a.name)
    )
  }

  if (sortType === "Positive") {
    filteredPlayers.sort((a, b) =>
      b.balance - a.balance
    )
  }

  if (sortType === "Negative") {
    filteredPlayers.sort((a, b) =>
      a.balance - b.balance
    )
  }

  return (
    <MobileLayout>

      <div className="p-5 space-y-5">

        {/* Header */}
        <div>

          <h1 className="
            text-3xl font-bold
            text-black dark:text-white
          ">
            Players
          </h1>

        </div>

        {/* Top Controls */}
        <div className="flex gap-3">

          {/* Count */}
          <div className="
            px-4
            rounded-2xl

            bg-green-500
            text-black

            flex items-center justify-center

            font-semibold
          ">
            {filteredPlayers.length} Players
          </div>

          {/* Search */}
          <div className="
            flex-1

            flex items-center gap-2

            px-4 py-3

            rounded-2xl

            bg-white/70
            dark:bg-white/5

            border
            border-black/5
            dark:border-white/10
          ">

            <Search size={18} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}

              placeholder="Search players..."

              className="
                bg-transparent
                outline-none
                w-full

                text-black
                dark:text-white
              "
            />

          </div>

          {/* Sort */}
          <div className="relative">

            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="
                px-4 py-3

                flex items-center gap-2

                rounded-2xl

                bg-white/70
                dark:bg-white/5

                border
                border-black/5
                dark:border-white/10

                text-black
                dark:text-white
              "
            >

              Sort

              <ChevronDown size={18} />

            </button>

            {/* Dropdown */}
            {
              sortOpen && (

                <div className="
                  absolute right-0 top-16
                  w-48

                  rounded-2xl

                  bg-[#111827]
                  border border-white/10

                  shadow-2xl

                  overflow-hidden

                  z-50
                ">

                  {
                    [
                      "A-Z",
                      "Z-A",
                      "Positive",
                      "Negative"
                    ].map((option) => (

                      <button
                        key={option}

                        onClick={() => {
                          setSortType(option)
                          setSortOpen(false)
                        }}

                        className={`
                          w-full
                          px-4 py-3
                          text-left

                          transition

                          ${
                            sortType === option
                              ? "bg-green-500 text-black"
                              : "text-white hover:bg-white/5"
                          }
                        `}
                      >

                        {option}

                      </button>
                    ))
                  }

                </div>

              )
            }

          </div>

        </div>

        {/* Players List */}
        <div className="space-y-4">

          {
            filteredPlayers.map((player) => (

              <PlayerCard
                key={player.phone}

                name={player.name}
                phone={player.phone}
                balance={player.balance}

                onDelete={() => {

                  setSelectedPlayer(player)

                  setDeleteModal(true)
                }}
              />
            ))
          }

        </div>

      </div>
<Modal
  open={deleteModal}
  onClose={() => setDeleteModal(false)}
>

  <div className="space-y-5">

    {/* Title */}
    <div>

      <h2 className="
        text-2xl font-bold
        text-white
      ">
        Delete Player?
      </h2>

      <p className="
        text-gray-400
        mt-2
      ">
        This action cannot be undone.
      </p>

    </div>

    {/* Player Info */}
    {
      selectedPlayer && (

        <div className="
          rounded-2xl
          p-4

          bg-white/5

          border border-white/10
        ">

          <h3 className="
            text-white
            font-semibold
          ">
            {selectedPlayer.name}
          </h3>

          <p className="
            text-gray-400
            text-sm
          ">
            {selectedPlayer.phone}
          </p>

        </div>

      )
    }

    {/* Actions */}
    <div className="
      flex gap-3
    ">

      {/* Cancel */}
      <button
        onClick={() =>
          setDeleteModal(false)
        }

        className="
          flex-1
          py-3

          rounded-2xl

          border border-white/10

          text-white
        "
      >
        Cancel
      </button>

      {/* Delete */}
      <button
        onClick={() => {

          deletePlayer(selectedPlayer.phone)

          setDeleteModal(false)

          setSelectedPlayer(null)
        }}

        className="
          flex-1
          py-3

          rounded-2xl

          bg-red-500

          text-white
          font-semibold
        "
      >
        Delete
      </button>

    </div>

  </div>

</Modal>
    </MobileLayout>
  )
}