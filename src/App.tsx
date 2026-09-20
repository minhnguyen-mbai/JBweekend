import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppProvider } from './state/AppProvider'
import { ToastProvider } from './state/ToastProvider'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { TripsPage } from './pages/TripsPage'
import { TripDetailPage } from './pages/TripDetailPage'
import { BookingPage } from './pages/BookingPage'
import { StartTripPage } from './pages/StartTripPage'
import { MyTripsPage } from './pages/MyTripsPage'
import { SafetyPage } from './pages/SafetyPage'
import { NotFoundPage } from './pages/NotFoundPage'

export function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/trips" element={<TripsPage />} />
              <Route path="/trips/:slug" element={<TripDetailPage />} />
              <Route path="/book/:departureId" element={<BookingPage />} />
              <Route path="/start-trip" element={<StartTripPage />} />
              <Route path="/my-trips" element={<MyTripsPage />} />
              <Route path="/safety" element={<SafetyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AppProvider>
  )
}
