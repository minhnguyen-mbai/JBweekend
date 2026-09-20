import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react'
import type { Toast } from '../state/toastContext'

const toneStyles = {
  success: { icon: CheckCircle2, ring: 'ring-forest/20', accent: 'text-gold' },
  info: { icon: Info, ring: 'ring-teal/25', accent: 'text-teal-soft' },
  error: { icon: TriangleAlert, ring: 'ring-coral/40', accent: 'text-coral' },
} as const

export function ToastShelf({
  toasts,
  onDismiss,
}: {
  toasts: Toast[]
  onDismiss: (id: number) => void
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:px-6"
    >
      {toasts.map((toast) => {
        const { icon: Icon, ring, accent } = toneStyles[toast.tone]
        return (
          <div
            key={toast.id}
            className={`animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl bg-forest px-4 py-3 text-sand shadow-lift ring-1 ${ring}`}
          >
            <Icon className={`mt-0.5 size-[18px] shrink-0 ${accent}`} aria-hidden="true" />
            <p className="flex-1 text-sm leading-snug">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="-m-1 rounded p-1 text-sand/60 transition hover:text-sand"
              aria-label="Dismiss notification"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
