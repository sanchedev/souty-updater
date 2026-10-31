export interface CurseModResponse {
  data: CurseModData
}

export interface CurseModData {
  allowModDistribution: boolean
  authors: Author[]
  categories: Category[]
  classId: number
  dateCreated: Date
  dateModified: Date
  dateReleased: Date
  downloadCount: number
  favoriteCount: number
  featuredProjectTag: number
  gameId: number
  gamePopularityRank: number
  hasCommentsEnabled: boolean
  id: number
  isAvailable: boolean
  isFeatured: boolean
  latestEarlyAccessFilesIndexes: any[]
  latestFiles: LatestFile[]
  latestFilesIndexes: LatestFilesIndex[]
  licenseType: string
  links: Links
  logo: Logo
  mainFileId: number
  name: string
  primaryCategoryId: number
  screenshots: Logo[]
  serverAffiliation: ServerAffiliation
  slug: string
  socialLinks: SocialLink[]
  status: number
  summary: string
  thumbsUpCount: number
}

interface Author {
  avatarUrl: string
  id: number
  name: string
  url: string
  userTierInfo: UserTierInfo
}

interface UserTierInfo {
  downloadsThreshold: number
  tierLevel: number
}

interface Category {
  classId: number
  dateModified: Date
  gameId: number
  iconUrl: string
  id: number
  isClass: boolean
  name: string
  parentCategoryId: number
  slug: string
  url: string
}

interface LatestFile {
  alternateFileId: number
  dependencies: Dependency[]
  displayName: string
  downloadCount: number
  downloadUrl: string
  fileDate: Date
  fileFingerprint: number
  fileLength: number
  fileName: string
  fileSizeOnDisk?: number
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

interface Dependency {
  modId: number
  relationType: number
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

interface LatestFilesIndex {
  fileId: number
  filename: string
  gameVersion: string
  gameVersionTypeId: number
  modLoader?: number
  releaseType: number
}

interface Links {
  issuesUrl: string
  sourceUrl: string
  websiteUrl: string
  wikiUrl: string
}

interface Logo {
  description: string
  id: number
  modId: number
  thumbnailUrl: string
  title: string
  url: string
}

interface ServerAffiliation {
  affiliationLink: string
  affiliationService: number
  customImageUrl: string
  hasDiscount: boolean
  isDefaultBanner: boolean
  isEnabled: boolean
}

interface SocialLink {
  type: number
  url: string
}
