import { useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'

const links = [
  { to: '/trips', label: 'Explore trips' },
  { to: '/start-trip', label: 'Start a trip' },
  { to: '/my-trips', label: 'My trips' },
  { to: '/safety', label: 'Safety' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-sand/90 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-forest/10 text-forest' : 'text-charcoal/75 hover:bg-forest/5 hover:text-forest'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/trips" className="btn btn-forest">
            Find upcoming trips
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="-mr-2 grid size-10 place-items-center rounded-lg text-forest transition hover:bg-forest/5 md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="animate-fade border-t border-line bg-sand md:hidden">
          <nav aria-label="Mobile" className="wrap flex flex-col gap-1 py-3">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-[15px] font-medium transition ${
                    isActive ? 'bg-forest/10 text-forest' : 'text-charcoal/80'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <Link to="/trips" onClick={() => setOpen(false)} className="btn btn-forest mt-2">
              Find upcoming trips
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
