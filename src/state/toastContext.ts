import { createContext, useContext } from 'react'

export type ToastTone = 'success' | 'info' | 'error'

export type Toast = {
  id: number
  message: string
  tone: ToastTone
}

export type ToastContextValue = {
  toasts: Toast[]
  pushToast: (message: string, tone?: ToastTone) => void
  dismissToast: (id: number) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
