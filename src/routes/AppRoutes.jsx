import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom"

import Bookings from "../pages/Bookings/Bookings"
import Players from "../pages/Players/Players"
import Stats from "../pages/Stats/Stats"
import Settings from "../pages/Settings/Settings"
import BookingForm from "../pages/BookingForm/BookingForm"
import AddPlayer from "../pages/AddPlayer/AddPlayer"
import EditPlayer from "../pages/EditPlayer/EditPlayer"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Bookings />} />
        <Route path="/players" element={<Players />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/settings" element={<Settings />} />

        <Route path="/booking/new" element={<BookingForm />} />
        <Route path="/booking/:id/edit" element={<BookingForm />} />
        <Route path="/add-booking" element={<Navigate to="/booking/new" replace />} />

        <Route path="/player/new" element={<AddPlayer />} />
        <Route path="/player/:id" element={<EditPlayer />} />
      </Routes>
    </BrowserRouter>
  )
}
