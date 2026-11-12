import { useState } from 'react'
import {
  IconBellRinging,
  IconCloud,
  IconExternalLink,
  IconFolder,
  IconFolderPlus,
  IconFolders,
  IconRadar2,
  IconShieldCheck,
} from '@tabler/icons-react'
import { open } from '@tauri-apps/plugin-dialog'
import { mkdir } from '@tauri-apps/plugin-fs'
import { revealItemInDir } from '@tauri-apps/plugin-opener'
import { useDiagnostics } from '../../hooks/diagnostics'
import {
  CONTENT_KIND_IDS,
  CONTENT_KINDS,
  packsDir,
  type ContentKind,
} from '../../lib/content-kinds'
import { packStore } from '../../lib/content-store'
import { checkCompatibility, LIST_BASE_URL } from '../../lib/curseforge'
import { notify } from '../../lib/notify'
import { KIND_ICONS } from '../content-icons'
import { useDiagnosticsStore } from '../../stores/diagnostics'
import { usePreferencesStore } from '../../stores/preferences'
import { toast } from '../../stores/toasts'
import { Button } from '../common/button'
import { Section } from '../common/card'
import { MicroLabel } from '../common/micro-label'
import { Pill } from '../common/pill'
import { Skeleton } from '../common/skeleton'
import { Slot } from '../common/slot'

export function SettingsPage() {
  const mcDir = usePreferencesStore((s) => s.mcDir)
  const setMcDir = usePreferencesStore((s) => s.setMcDir)
  const targetVersion = usePreferencesStore((s) => s.targetVersion)
  const setTargetVersion = usePreferencesStore((s) => s.setTargetVersion)
  const targetLoader = usePreferencesStore((s) => s.targetLoader)
  const setTargetLoader = usePreferencesStore((s) => s.setTargetLoader)
  const notifyOnSync = usePreferencesStore((s) => s.notifyOnSync)
  const setNotifyOnSync = usePreferencesStore((s) => s.setNotifyOnSync)

  const { status, refresh } = useDiagnostics(mcDir)

  const [picking, setPicking] = useState(false)
  const [creating, setCreating] = useState<ContentKind | null>(null)
  const [reviewing, setReviewing] = useState(false)

  const [versionInput, setVersionInput] = useState(targetVersion)
  const [loaderInput, setLoaderInput] = useState(targetLoader)

  const configured = mcDir != null
  const modsDir = configured ? packsDir(mcDir, 'mod') : null

  const valid = versionInput.trim() !== '' && loaderInput.trim() !== ''
  const dirty =
    versionInput.trim() !== targetVersion ||
    loaderInput.trim() !== targetLoader

  async function pickDirectory() {
    if (picking) return

    setPicking(true)

    try {
      const dir = await open({
        directory: true,
        multiple: false,
        recursive: true,
        title: 'Selecciona tu carpeta de Minecraft',
        defaultPath: mcDir ?? undefined,
      })

      if (dir == null) return

      await setMcDir(dir)
      toast.success('Carpeta de Minecraft actualizada.')
      await refresh()
    } catch {
      toast.error('No se pudo abrir el selector de carpetas.')
    } finally {
      setPicking(false)
    }
  }

  async function createFolder(kind: ContentKind) {
    const path = mcDir == null ? null : packsDir(mcDir, kind)
    if (path == null) return

    setCreating(kind)

    try {
      await mkdir(path, { recursive: true })
      toast.success(`Carpeta ${CONTENT_KINDS[kind].folder} creada.`)
      await refresh()
    } catch (e) {
      toast.error('No se pudo crear la carpeta. Información completa: ' + e)
    } finally {
      setCreating(null)
    }
  }

  async function saveTargets() {
    if (!valid) {
      toast.error('La versión y el loader no pueden estar vacíos.')
      return
    }

    await setTargetVersion(versionInput)
    await setTargetLoader(loaderInput)
    toast.success('Objetivo de compatibilidad actualizado.')
  }

  async function reviewNow() {
    if (reviewing) return

    if (!valid) {
      toast.error('La versión y el loader no pueden estar vacíos.')
      return
    }

    setReviewing(true)

    try {
      await setTargetVersion(versionInput)
      await setTargetLoader(loaderInput)

      const target = {
        version: versionInput.trim(),
        loader: loaderInput.trim(),
      }

      let total = 0

      for (const kind of CONTENT_KIND_IDS) {
        const saved = await packStore.getByKind(kind)
        const warnings = saved.flatMap((pack) =>
          checkCompatibility(pack, target),
        )

        total += warnings.length
        await useDiagnosticsStore.getState().setWarnings(kind, warnings)
      }

      if (total === 0) {
        toast.success('Sin avisos de compatibilidad.')
      } else {
        toast.warning(`Se encontraron ${total} avisos. Revísalos en Estado.`)
      }
    } catch (e) {
      toast.error('No se pudo revisar la lista. Información completa: ' + e)
    } finally {
      setReviewing(false)
    }
  }

  async function toggleNotify() {
    const next = !notifyOnSync
    await setNotifyOnSync(next)

    if (next) {
      await notify('Souty Helper', 'Notificaciones activadas.')
    } else {
      toast.info('Notificaciones del sistema desactivadas.')
    }
  }

  return (
    <main className='min-h-0 flex-1 overflow-y-auto px-4 pb-8'>
      <div className='mx-auto flex w-full max-w-3xl min-w-0 flex-col gap-5 pt-5'>
        <Section
          icon={IconFolder}
          title='Carpeta de Minecraft'
          description='Normalmente se llama .minecraft.'>
          <div className='flex flex-col gap-3'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <p className='text-sm font-medium'>Carpeta de juego</p>
              <div className='flex gap-2'>
                {configured && modsDir != null && (
                  <Button
                    variant='secondary'
                    size='sm'
                    icon={<IconExternalLink size={14} />}
                    onClick={() => revealItemInDir(modsDir)}>
                    Abrir mods
                  </Button>
                )}
                <Button
                  size='sm'
                  disabled={picking}
                  icon={<IconFolder size={14} />}
                  onClick={pickDirectory}>
                  {picking ? 'Abriendo…' : configured ? 'Cambiar' : 'Seleccionar'}
                </Button>
              </div>
            </div>

            <div
              className='bevel-inset truncate rounded-xs bg-neutral-900 px-3 py-2 font-mono text-xs'
              title={mcDir ?? 'Sin configurar'}>
              {mcDir ?? 'Sin configurar'}
            </div>
          </div>
        </Section>

        <Section
          icon={IconFolders}
          title='Carpetas de contenido'
          description='Una carpeta por tipo, dentro de tu carpeta de juego.'>
          {!configured ? (
            <p className='text-xs text-neutral-400'>
              Selecciona primero tu carpeta de Minecraft.
            </p>
          ) : status == null ? (
            <div className='flex flex-col gap-2'>
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className='h-14' />
              ))}
            </div>
          ) : (
            <div className='flex flex-col gap-2'>
              {CONTENT_KIND_IDS.map((kind) => {
                const info = status[kind]
                const KindIcon = KIND_ICONS[kind]
                const path = info.path

                return (
                  <div
                    key={kind}
                    className='flex flex-wrap items-center gap-3 rounded-xs border border-edge bg-neutral-900/40 px-3 py-2.5'>
                    <Slot size={28} className='bg-neutral-800 text-neutral-300'>
                      <KindIcon size={15} />
                    </Slot>
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-semibold'>
                        {CONTENT_KINDS[kind].label}
                      </p>
                      <p
                        className='truncate font-mono text-[11px] text-neutral-400'
                        title={info.path ?? ''}>
                        {info.path ?? '—'}
                      </p>
                    </div>
                    {info.exists ? (
                      path != null && (
                        <Button
                          variant='ghost'
                          size='sm'
                          icon={<IconExternalLink size={14} />}
                          onClick={() => revealItemInDir(path)}>
                          Abrir
                        </Button>
                      )
                    ) : (
                      <Button
                        variant='primary'
                        size='sm'
                        icon={<IconFolderPlus size={14} />}
                        loading={creating === kind}
                        onClick={() => createFolder(kind)}>
                        Crear
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </Section>

        <Section
          icon={IconShieldCheck}
          title='Compatibilidad'
          description='Lo que se valida en cada "actualizar". El loader solo aplica a mods.'>
          <div className='flex flex-col gap-4'>
            <label className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-medium'>Versión de juego</p>
                <p className='text-xs text-neutral-400'>
                  Ej. 1.21.1 — aplica a mods, resource packs y shaders.
                </p>
              </div>
              <input
                value={versionInput}
                spellCheck={false}
                onChange={(e) => setVersionInput(e.target.value)}
                className='bevel-inset w-40 rounded-xs border border-edge bg-neutral-900 px-3 py-2 font-mono text-xs'
              />
            </label>

            <label className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-sm font-medium'>Loader</p>
                <p className='text-xs text-neutral-400'>
                  Ej. NeoForge — solo se valida en mods.
                </p>
              </div>
              <input
                value={loaderInput}
                spellCheck={false}
                onChange={(e) => setLoaderInput(e.target.value)}
                className='bevel-inset w-40 rounded-xs border border-edge bg-neutral-900 px-3 py-2 font-mono text-xs'
              />
            </label>

            <div className='flex flex-wrap items-center gap-2'>
              <Button
                size='sm'
                disabled={!dirty || !valid}
                onClick={saveTargets}>
                Guardar
              </Button>
              <Button
                variant='secondary'
                size='sm'
                loading={reviewing}
                icon={<IconRadar2 size={14} />}
                onClick={reviewNow}>
                Revisar ahora
              </Button>
              <p className='text-xs text-neutral-500'>
                Revisa la lista guardada sin conexión y guarda los avisos en
                Estado.
              </p>
            </div>
          </div>
        </Section>

        <Section
          icon={IconBellRinging}
          title='Avisos del sistema'
          description='Notificación del sistema cuando termina una descarga o eliminación masiva.'>
          <Pill
            tone='brand'
            active={notifyOnSync}
            icon={<IconBellRinging size={14} />}
            onClick={toggleNotify}>
            {notifyOnSync ? 'Activadas' : 'Desactivadas'}
          </Pill>
        </Section>

        <Section
          icon={IconCloud}
          title='Fuente de la lista'
          description='Los listados se descargan desde GitHub (solo lectura).'>
          <div className='flex flex-col gap-2'>
            <div
              className='bevel-inset truncate rounded-xs bg-neutral-900 px-3 py-2 font-mono text-xs'
              title={LIST_BASE_URL}>
              {LIST_BASE_URL}
            </div>
            {CONTENT_KIND_IDS.map((kind) => (
              <div
                key={kind}
                className='flex flex-wrap items-center justify-between gap-2 rounded-xs border border-edge bg-neutral-900/40 px-3 py-2'>
                <MicroLabel>{CONTENT_KINDS[kind].label}</MicroLabel>
                <span
                  className='min-w-0 truncate font-mono text-[11px] text-neutral-400'
                  title={CONTENT_KINDS[kind].listPath}>
                  {CONTENT_KINDS[kind].listPath}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </main>
  )
}
