export function normalizeStoragePath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/\s+/g, '-').toLowerCase()
}

export function localCatalogUrl(bucket: string, storagePath: string): string {
  return `/catalog/${bucket}/${storagePath}`
}
