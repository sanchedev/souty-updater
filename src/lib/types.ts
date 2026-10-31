export type FileInfo = FileInfoCurseForge | FileInfoRawFile

export interface FileInfoCurseForge {
  kind: 'curseforge'
  modId: number
  fileId: number
}

export interface FileInfoRawFile {
  kind: 'raw'
  title: string
  url: string
}
