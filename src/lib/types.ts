export interface FileInfo {
  kind: 'curseforge'
  modId: number
  fileId: number
}

export interface FileInfoSaved {
  title: string
  logo: string
  fileName: string
  modId: number
  fileId: number
  curseUrl: string
}
