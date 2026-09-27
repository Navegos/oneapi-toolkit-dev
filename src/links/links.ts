import {SemVer} from 'semver'

// Interface for getting oneAPI/DLE versions and corresponding download URLs
export abstract class AbstractLinks {
  protected versionToURL: Map<string, string> = new Map()
  protected versionToNetworkURL: Map<string, string> = new Map()

  get oneapiVersionToURL(): Map<string, string> {
    return this.versionToURL
  }

  set oneapiVersionToURL(map: Map<string, string>) {
    this.versionToURL = map
  }

  get oneapiVersionToNetworkUrl(): Map<string, string> {
    return this.versionToNetworkURL
  }

  set oneapiVersionToNetworkUrl(map: Map<string, string>) {
    this.versionToNetworkURL = map
  }

  getAvailableLocalVersions(): SemVer[] {
    return Array.from(this.versionToURL.keys())
      .map(s => new SemVer(s))
      .sort((a, b) => b.compare(a))
  }

  getAvailableNetworkVersions(): SemVer[] {
    return Array.from(this.versionToNetworkURL.keys())
      .map(s => new SemVer(s))
      .sort((a, b) => b.compare(a))
  }

  async getLocalURLFromVersion(version: SemVer): Promise<URL> {
    const urlString = this.versionToURL.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }

  async getNetworkURLFromVersion(version: SemVer): Promise<URL> {
    const urlString = this.versionToNetworkURL.get(`${version}`)
    if (urlString === undefined) {
      throw new Error(`Invalid version: ${version}`)
    }
    return new URL(urlString)
  }

  // Backward compatibility aliases
  getAvailableLocaloneAPIVersions(): SemVer[] {
    return this.getAvailableLocalVersions()
  }

  getAvailableNetworkoneAPIVersions(): SemVer[] {
    return this.getAvailableNetworkVersions()
  }

  async getLocalURLFromoneAPIVersion(version: SemVer): Promise<URL> {
    return this.getLocalURLFromVersion(version)
  }

  async getNetworkURLFromoneAPIVersion(version: SemVer): Promise<URL> {
    return this.getNetworkURLFromVersion(version)
  }
}
