import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import Bookings from "./pages/Bookings/Bookings"
import AddBooking from "./pages/AddBooking/AddBooking"
import Players from "./pages/Players/Players"
import Stats from "./pages/Stats/Stats"
import Settings from "./pages/Settings/Settings"

export default function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Bookings />}
        />

        <Route
          path="/add-booking"
          element={<AddBooking />}
        />

        <Route
          path="/players"
          element={<Players />}
        />

        <Route
          path="/stats"
          element={<Stats />}
        />

        <Route
          path="/settings"
          element={<Settings />}
        />

      </Routes>

    </BrowserRouter>

  )
}