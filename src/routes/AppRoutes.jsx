import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"

import Bookings from "../pages/Bookings/Bookings"
import Players from "../pages/Players/Players"
import Stats from "../pages/Stats/Stats"
import Settings from "../pages/Settings/Settings"
import AddBooking from "../pages/AddBooking/AddBooking"

export default function AppRoutes() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Bookings />}
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

        <Route
          path="/add-booking"
          element={<AddBooking />}
        />

      </Routes>

    </BrowserRouter>
  )
}