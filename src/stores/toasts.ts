import { create } from 'zustand'

export type ToastTone = 'info' | 'success' | 'error' | 'warning'

export interface Toast {
  id: number
  tone: ToastTone
  message: string
}

interface ToastsStore {
  toasts: Toast[]
  push(tone: ToastTone, message: string, duration?: number): void
  dismiss(id: number): void
}

let nextId = 1

export const useToastsStore = create<ToastsStore>((set) => ({
  toasts: [],

  push: (tone, message, duration = 5000) => {
    const id = nextId++

    // Máximo 4 toasts visibles a la vez.
    set((s) => ({ toasts: [...s.toasts.slice(-3), { id, tone, message }] }))

    if (duration > 0) {
      setTimeout(() => useToastsStore.getState().dismiss(id), duration)
    }
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

/** Atajos para disparar toasts desde cualquier lado. */
export const toast = {
  info: (message: string) => useToastsStore.getState().push('info', message),
  success: (message: string) =>
    useToastsStore.getState().push('success', message),
  warning: (message: string) =>
    useToastsStore.getState().push('warning', message),
  error: (message: string) =>
    useToastsStore.getState().push('error', message, 8000),
}
