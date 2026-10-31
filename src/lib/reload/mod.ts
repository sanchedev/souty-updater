import { loadCurseModInfo } from '../curse-info'
import { fetchModsList } from '../mods-list'

export async function fetchMods() {
  const list = await fetchModsList()

  const mods = await Promise.all(list.map((fi) => loadCurseModInfo(fi)))

  return mods
}

/*

  async function downloadModIfMissing(info: FileInfo) {
    if (downloading[info.modId]) return

    setDownloading((d) => ({ ...d, [info.modId]: true }))

    try {
      const state = curseInfo[info.modId]

      if (!state || state.status !== 'success') {
        setCurseInfo((c) => ({
          ...c,
          [info.modId]: {
            status: 'error',
            message:
              'Primero prueba la API para obtener los datos del archivo.',
          },
        }))
        return
      }

      const { title, logo, pageUrl, downloadUrl, fileName } = state.info

      const mcDir = await preferences.get('mcDir')
      const modsDir = await join(mcDir ?? '', 'mods')
      const filePath = await join(modsDir, fileName)

      const alreadyExists = await exists(filePath)

      if (!alreadyExists) {
        if (!downloadUrl) {
          setCurseInfo((c) => ({
            ...c,
            [info.modId]: {
              status: 'error',
              message: 'No hay URL de descarga disponible.',
            },
          }))
          return
        }

        const res = await fetch(downloadUrl, {
          headers: {
            'x-api-key': import.meta.env.CURSEFORGE_API_KEY,
          },
        })
        if (!res.ok) {
          throw new Error(`No se pudo descargar el archivo (${res.status}).`)
        }

        const array = await res.arrayBuffer()
        await writeFile(filePath, new Uint8Array(array))
      }

      await modsStore.add({
        title,
        logo,
        fileName,
        modId: info.modId,
        fileId: info.fileId,
        curseUrl: pageUrl,
      })

      setCurseInfo((c) => ({
        ...c,
        [info.modId]: { status: 'success', info: state.info },
      }))
    } catch (error) {
      setCurseInfo((c) => ({
        ...c,
        [info.modId]: {
          status: 'error',
          message: (error as Error).message,
        },
      }))
    } finally {
      setDownloading((d) => {
        const copy = { ...d }
        delete copy[info.modId]
        return copy
      })
    }
  }
*/
