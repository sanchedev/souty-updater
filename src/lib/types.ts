import { CurseModInfo } from './curse-info'

export interface FileInfo {
  kind: 'curseforge'
  modId: number
  fileId: number
}

export interface FileInfoSaved extends CurseModInfo {}
