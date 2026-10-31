import type { CurseModResponse } from './curse-mod-types'

export async function loadCurseMod(
  modId: number,
  signal?: AbortSignal,
): Promise<CurseModResponse> {
  const res = await fetch(`https://api.curseforge.com/v1/mods/${modId}`, {
    headers: {
      Accept: 'application/json',
      'x-api-key': import.meta.env.CURSEFORGE_API_KEY,
    },
    signal,
  })

  if (!res.ok) {
    throw new Error(`No se pudo cargar el mod ${modId} (${res.status}).`)
  }

  return await res.json()
}
