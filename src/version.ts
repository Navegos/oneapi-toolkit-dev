import * as core from '@actions/core'
import {OSType, getOs} from './platform.js'
import {AbstractLinks} from './links/links.js'
import {Method} from './method.js'
import {SemVer} from 'semver'
import {WindowsLinks} from './links/windows-links.js'
import {getLinks} from './links/get-links.js'

export const SUPPORTED_ONEAPI_VERSIONS: string[] = [
  '2026.1.1',
  '2026.1.0',
  '2026.0.1',
  '2026.0.0'
]

export const SUPPORTED_DLE_VERSIONS: string[] = [
  '2026.1.4',
  '2026.1.3',
  '2026.1.2',
  '2026.1.1',
  '2026.1.0',
  '2026.0.0',
  '2025.3.3',
  '2025.3.2',
  '2025.3.1',
  '2025.3.0',
  '2025.2.1',
  '2025.2.0',
  '2025.1.3',
  '2025.1.2',
  '2025.1.1',
  '2025.1.0',
  '2025.0.2',
  '2025.0.1'
]

export function normalizeVersionString(versionString: string): string {
  // Normalize strings like 20261.0 -> 2026.1.0, 20261.2 -> 2026.1.2
  const typoMatch = versionString.match(/^20261\.(\d+)$/)
  if (typoMatch) {
    return `2026.1.${typoMatch[1]}`
  }
  return versionString
}

// Helper for converting string to SemVer and verifying it exists in the links
export async function getVersion(
  versionString: string,
  method: Method
): Promise<SemVer> {
  const normalized = normalizeVersionString(versionString)
  const version = new SemVer(normalized)
  const links: AbstractLinks = await getLinks()
  let versions: SemVer[]

  switch (method) {
    case 'local':
      versions = links.getAvailableLocalVersions()
      break
    case 'network':
      switch (await getOs()) {
        case OSType.linux:
          versions = links.getAvailableNetworkVersions()
          break
        case OSType.windows:
          versions = (links as WindowsLinks).getAvailableNetworkVersions()
          break
      }
      break
  }

  core.debug(`Available versions: ${versions}`)
  if (versions.some(v => v.compare(version) === 0)) {
    core.debug(`Version available: ${version}`)
    return version
  } else {
    core.debug(`Version not available error!`)
    throw new Error(`Version not available: ${version}`)
  }
}
