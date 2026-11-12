import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'

/** Notificación del sistema; pide permiso la primera vez. Best-effort. */
export async function notify(title: string, body: string): Promise<void> {
  try {
    if (!(await isPermissionGranted())) {
      const permission = await requestPermission()
      if (permission !== 'granted') return
    }

    sendNotification({ title, body })
  } catch {
    // Si el sistema no da aviso, la app sigue funcionando con sus toasts.
  }
}
