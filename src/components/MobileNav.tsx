import { NavLink } from 'react-router-dom'
import { CalendarPlus, Compass, House, Ticket } from 'lucide-react'

const items = [
  { to: '/', label: 'Home', Icon: House, end: true },
  { to: '/trips', label: 'Explore', Icon: Compass, end: false },
  { to: '/start-trip', label: 'Start trip', Icon: CalendarPlus, end: false },
  { to: '/my-trips', label: 'My trips', Icon: Ticket, end: false },
]

export function MobileNav() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-sand/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="grid grid-cols-4">
        {items.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition ${
                  isActive ? 'text-coral' : 'text-sage'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-5" strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
