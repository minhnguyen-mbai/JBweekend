import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { Logo } from './Logo'

const links = [
  { to: '/trips', label: 'Explore trips' },
  { to: '/start-trip', label: 'Request a date' },
  { to: '/my-trips', label: 'My trips' },
  { to: '/safety', label: 'Safety' },
]

export function Header() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const { pathname } = useLocation()
  const lastPath = useRef(pathname)

  // Close on navigation, including a link to the page you are already on.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname
      setOpen(false)
    }
  }, [pathname])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    const trigger = triggerRef.current
    document.body.style.overflow = 'hidden'
    panelRef.current?.querySelector<HTMLElement>('a, button')?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
      ).filter((el) => el.offsetParent !== null)
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      trigger?.focus()
    }
  }, [open])

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-sand/90 backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-3">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-forest/10 text-forest'
                    : 'text-charcoal/75 hover:bg-forest/5 hover:text-forest'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/trips" className="btn btn-forest">
            View departures
          </Link>
        </div>

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(true)}
          className="-mr-1 grid size-11 shrink-0 place-items-center rounded-lg text-forest transition hover:bg-forest/5 md:hidden"
          aria-expanded={open}
          aria-haspopup="dialog"
          aria-controls="mobile-drawer"
          aria-label="Open menu"
        >
          <Menu className="size-6" aria-hidden="true" />
        </button>
      </div>

      {/* ---------------- Mobile drawer ---------------- */}
      {open && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="animate-fade absolute inset-0 bg-charcoal/55 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={panelRef}
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="animate-sheet absolute inset-y-0 right-0 flex w-[min(20rem,85vw)] flex-col bg-sand shadow-lift"
          >
            <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-1 grid size-11 shrink-0 place-items-center rounded-lg text-forest transition hover:bg-forest/5"
                aria-label="Close menu"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>

            <nav
              aria-label="Mobile"
              className="flex flex-1 flex-col gap-1 overflow-y-auto p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]"
            >
              {links.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-12 items-center rounded-xl px-3 text-base font-medium transition ${
                      isActive ? 'bg-forest text-sand' : 'text-charcoal/85 hover:bg-forest/5'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/trips" onClick={() => setOpen(false)} className="btn btn-forest mt-3 w-full">
                View departures
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  )
}
