import {AbstractLinks} from './links.js'
import {SemVer} from 'semver'
import {CPUArch, getArch} from '../arch.js'

/**
 * Singleton class for windows links.
 */
export class WindowsLinks extends AbstractLinks {
  // Singleton instance
  private static _instance: WindowsLinks

  // Private constructor to prevent instantiation
  private constructor() {
    super()
    this.versionToNetworkURL = new Map([
      [
        '2026.1.1',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/0cb67a0d-67f6-410b-868b-f4a0a17ff0cf/intel-oneapi-toolkit-2026.1.1.32.exe'
      ],
      [
        '2026.1.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/4144bec3-82ce-4672-bd71-5c93a79cd5e7/intel-oneapi-toolkit-2026.1.0.191.exe'
      ],
      [
        '2026.0.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/bae85ab1-cfcd-4251-8d42-a0c27949ea33/intel-oneapi-toolkit-2026.0.0.193.exe'
      ],
      [
        '2025.3.3',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/b60765d1-2b85-4e85-86b6-cb0e9563a699/intel-deep-learning-essentials-2025.3.3.18_offline.exe'
      ]
    ])

    this.versionToURL = new Map([
      [
        '2026.1.1',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/0cb67a0d-67f6-410b-868b-f4a0a17ff0cf/intel-oneapi-toolkit-2026.1.1.32_offline.exe'
      ],
      [
        '2026.1.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/4144bec3-82ce-4672-bd71-5c93a79cd5e7/intel-oneapi-toolkit-2026.1.0.191_offline.exe'
      ],
      [
        '2026.0.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/bae85ab1-cfcd-4251-8d42-a0c27949ea33/intel-oneapi-toolkit-2026.0.0.193_offline.exe'
      ],
      [
        '2025.3.3',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/b60765d1-2b85-4e85-86b6-cb0e9563a699/intel-deep-learning-essentials-2025.3.3.18_offline.exe'
      ]
    ])
  }

  static get Instance(): WindowsLinks {
    return this._instance || (this._instance = new this())
  }

  async getLocalURLFromVersion(version: SemVer): Promise<URL> {
    const link = await super.getLocalURLFromVersion(version)
    return await this.urlForCurrentArch(link, version)
  }

  async getNetworkURLFromVersion(version: SemVer): Promise<URL> {
    const link = await super.getNetworkURLFromVersion(version)
    return await this.urlForCurrentArch(link, version)
  }

  async getLocalURLFromoneAPIVersion(version: SemVer): Promise<URL> {
    return this.getLocalURLFromVersion(version)
  }

  async getNetworkURLFromoneAPIVersion(version: SemVer): Promise<URL> {
    return this.getNetworkURLFromVersion(version)
  }

  private async urlForCurrentArch(url: URL, version: SemVer): Promise<URL> {
    const arch: CPUArch = await getArch()
    if (arch !== CPUArch.x86_64) {
      throw new Error(
        `Link only available for x86_64: ${arch}. Version ${version}`
      )
    }
    return url
  }
}
