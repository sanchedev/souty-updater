import { IconPalette, IconPuzzle, IconSparkles, type Icon } from '@tabler/icons-react'
import type { ContentKind } from '../lib/content-kinds'

/** Icono representativo de cada tipo de contenido. */
export const KIND_ICONS: Record<ContentKind, Icon> = {
  mod: IconPuzzle,
  resourcepack: IconPalette,
  shaderpack: IconSparkles,
}
