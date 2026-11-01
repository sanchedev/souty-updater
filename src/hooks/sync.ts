import { useCallback, useState } from 'react'
import { confirm } from '@tauri-apps/plugin-dialog'
import { join } from '@tauri-apps/api/path'
import { openUrl, revealItemInDir } from '@tauri-apps/plugin-opener'
import { remove } from '@tauri-apps/plugin-fs'
import { CONTENT_KINDS, type ContentKind } from '../lib/content-kinds'
import { packStore } from '../lib/content-store'
import {
  downloadPack,
  fetchPacks,
  packDownloadPage,
} from '../lib/curseforge'
import { isMissing, type ContentItem } from '../lib/content-types'
import { toast } from '../stores/toasts'

export interface SyncProgress {
  done: number
  total: number
  label: string
}

interface UseSyncOptions {
  kind: ContentKind
  dir: string | null
  items: ContentItem[]
  reload(): Promise<void>
  onError(msg: string): void
}

/**
 * Acciones de sincronización de la carpeta de un tipo de contenido:
 * actualizar lista, eliminar sobrantes y descargar faltantes.
 */
export function useSync({
  kind,
  dir,
  items,
  reload,
  onError,
}: UseSyncOptions) {
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<SyncProgress | null>(null)

  const meta = CONTENT_KINDS[kind]

  /** Descarga el listado publicado y lo guarda como nueva referencia. */
  const refreshList = useCallback(async () => {
    setBusy(true)
    try {
      const { packs, warnings } = await fetchPacks(kind)
      await packStore.replaceAll(kind, packs)
      toast.success(`Lista actualizada: ${packs.length} ${meta.label.toLowerCase()}.`)

      if (warnings.length > 0) {
        toast.warning(
          `${warnings.length} avisos de compatibilidad:\n` +
            warnings.slice(0, 3).join('\n') +
            (warnings.length > 3 ? `\n… y ${warnings.length - 3} más.` : ''),
        )
      }
    } catch (e) {
      onError('No se pudo cargar la lista nueva de elementos.\nError: ' + e)
    } finally {
      setBusy(false)
    }
  }, [kind, meta, onError])

  /** Elimina los archivos de la carpeta que no están en la lista. */
  const removeExtras = useCallback(async () => {
    if (dir == null) return

    const extras = items.filter((item) => item.status === 'unregistered')
    if (extras.length === 0) {
      toast.info(`No hay archivos sobrantes en ${meta.folder}.`)
      return
    }

    if (
      !(await confirm(
        `¿Desea eliminar ${extras.length} archivo(s) que no corresponden a ${meta.label}? Esta acción no se puede deshacer.`,
      ))
    )
      return

    setBusy(true)
    setProgress({ done: 0, total: extras.length, label: 'Eliminando…' })

    let removed = 0

    try {
      for (const [index, item] of extras.entries()) {
        try {
          await remove(await join(dir, item.fileName))
          removed++
        } catch (e) {
          onError(
            `No se pudo eliminar ${item.fileName}. Información completa: ${e}`,
          )
        } finally {
          setProgress({
            done: index + 1,
            total: extras.length,
            label: item.fileName,
          })
        }
      }

      await reload()

      if (removed > 0) {
        toast.success(`Se eliminaron ${removed} archivo(s) sobrante(s).`)
      }
    } finally {
      setProgress(null)
      setBusy(false)
    }
  }, [dir, items, meta, reload, onError])

  /** Descarga todo lo faltante; lo sin URL directa se abre a mano. */
  const downloadMissing = useCallback(async () => {
    if (dir == null) return

    const missing = items.filter(isMissing)
    if (missing.length === 0) return

    const installable = missing.filter((item) => item.downloadUrl != null)
    const manual = missing.filter((item) => item.downloadUrl == null)
    const noun = meta.label.toLowerCase()

    if (installable.length > 0) {
      if (
        !(await confirm(
          `¿Descargar ${installable.length} ${noun} faltantes? Las descargas no se pueden cancelar.`,
        ))
      )
        return

      setBusy(true)
      setProgress({ done: 0, total: installable.length, label: 'Descargando…' })

      let ok = 0

      try {
        for (const [index, pack] of installable.entries()) {
          setProgress({
            done: index,
            total: installable.length,
            label: pack.fileName,
          })

          try {
            await downloadPack(pack, dir)
            ok++
          } catch (e) {
            onError(
              `No se pudo descargar ${pack.fileName}. Información completa: ${e}`,
            )
          } finally {
            setProgress({
              done: index + 1,
              total: installable.length,
              label: pack.fileName,
            })
          }
        }
      } finally {
        setProgress(null)
        setBusy(false)
      }

      await reload()

      if (ok === installable.length) {
        toast.success(`Se descargaron los ${ok} ${noun} faltantes.`)
      } else {
        toast.warning(`Se descargaron ${ok} de ${installable.length} ${noun}.`)
      }
    }

    if (
      manual.length > 0 &&
      (await confirm(
        `${manual.length} elemento(s) no tienen descarga directa. ¿Abrir sus páginas en el navegador?`,
      ))
    ) {
      await Promise.allSettled(manual.map((pack) => openUrl(packDownloadPage(pack))))
    }
  }, [dir, items, meta, reload, onError])

  const openFolder = useCallback(
    () => (dir != null ? revealItemInDir(dir) : Promise.resolve()),
    [dir],
  )

  return { busy, progress, refreshList, removeExtras, downloadMissing, openFolder }
}
