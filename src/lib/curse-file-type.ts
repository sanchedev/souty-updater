export interface CurseFileResponse {
  data: CurseFileData
}

export interface CurseFileData {
  alternateFileId: number
  dependencies: any[]
  displayName: string
  downloadCount: number
  downloadUrl: string | null
  fileDate: Date
  fileFingerprint: number
  fileLength: number
  fileName: string
  fileSizeOnDisk: number
  fileStatus: number
  gameId: number
  gameVersions: string[]
  hashes: Hash[]
  id: number
  isAvailable: boolean
  isServerPack: boolean
  modId: number
  modules: Module[]
  releaseType: number
  sortableGameVersions: SortableGameVersion[]
}

interface Hash {
  algo: number
  value: string
}

interface Module {
  fingerprint: number
  name: string
}

interface SortableGameVersion {
  gameVersion: string
  gameVersionName: string
  gameVersionPadded: string
  gameVersionReleaseDate: Date
  gameVersionTypeId: number
}
