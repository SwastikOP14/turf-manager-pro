import {
  createContext,
  useContext,
  useState
} from "react"

const AppContext = createContext()

export function AppProvider({ children }) {

  const [players, setPlayers] = useState([
    {
      name: "Arjun Sharma",
      phone: "+91 9888777665",
      balance: 1200
    },
    {
      name: "Chirag Sehgal",
      phone: "+91 9123456789",
      balance: -200
    },
    {
      name: "Priya Patel",
      phone: "+91 9876501234",
      balance: 750
    },
    {
      name: "Ritesh Mohapatra",
      phone: "+91 9876543210",
      balance: 500
    },
    {
      name: "Ritik Raj",
      phone: "+91 9000001111",
      balance: 100
    }
  ])
        const [bookings, setBookings] = useState([
        {
          turf: "Green Valley Ground",
          sport: "Cricket",
          amount: 2000,
          status: "Paid"
        },

        {
          turf: "City Sports Arena",
          sport: "Football",
          amount: 1500,
          status: "Partial"
        },

        {
          turf: "Victory Ground",
          sport: "Cricket",
          amount: 2500,
          status: "Pending"
        }
])
  // ADD PLAYER
  const addPlayer = (player) => {

    setPlayers((prev) => [
      ...prev,
      player
    ])
  }

  const deletePlayer = (phone) => {

  setPlayers((prev) =>
    prev.filter(
      (player) => player.phone !== phone
    )
  )
}
const addBooking = (booking) => {

  setBookings((prev) => [
    ...prev,
    booking
  ])
}

  return (
    <AppContext.Provider
      value={{
              players,
              addPlayer,
              deletePlayer,

              bookings,
              addBooking
            }}
    >

      {children}

    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)