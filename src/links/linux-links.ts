import {SemVer} from 'semver'
import {AbstractLinks} from './links.js'
import {CPUArch, getArch} from '../arch.js'

/**
 * Singleton class for linux links.
 */
export class LinuxLinks extends AbstractLinks {
  // Singleton instance
  private static _instance: LinuxLinks

  // Private constructor to prevent instantiation
  private constructor() {
    super()
    this.versionToNetworkURL = new Map([
      [
        '2026.1.1',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/5996e26b-f48a-42b1-8db0-b002ad0bd8d7/intel-oneapi-toolkit-2026.1.1.33.sh'
      ],
      [
        '2026.1.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/33cb2a22-ddf1-4aa9-8d68-1f5a118acaf2/intel-oneapi-toolkit-2026.1.0.192.sh'
      ],
      [
        '2026.0.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/71180075-e4e3-4c6f-bbbb-19017ed0cf7d/intel-oneapi-toolkit-2026.0.0.198.sh'
      ],
      [
        '2025.1.2',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/73863085-58a9-4dbb-ae65-83497edb05fa/intel-deep-learning-essentials-2025.1.2.13_offline.sh'
      ],
      [
        '2025.1.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/e04d067d-4bce-4eed-a6fc-80a5df45c78c/intel-deep-learning-essentials-2025.1.0.581_offline.sh'
      ]
    ])

    this.versionToURL = new Map([
      [
        '2026.1.1',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/5996e26b-f48a-42b1-8db0-b002ad0bd8d7/intel-oneapi-toolkit-2026.1.1.33_offline.sh'
      ],
      [
        '2026.1.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/33cb2a22-ddf1-4aa9-8d68-1f5a118acaf2/intel-oneapi-toolkit-2026.1.0.192_offline.sh'
      ],
      [
        '2026.0.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/71180075-e4e3-4c6f-bbbb-19017ed0cf7d/intel-oneapi-toolkit-2026.0.0.198_offline.sh'
      ],
      [
        '2025.1.2',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/73863085-58a9-4dbb-ae65-83497edb05fa/intel-deep-learning-essentials-2025.1.2.13_offline.sh'
      ],
      [
        '2025.1.0',
        'https://registrationcenter-download.intel.com/akdlm/IRC_NAS/e04d067d-4bce-4eed-a6fc-80a5df45c78c/intel-deep-learning-essentials-2025.1.0.581_offline.sh'
      ]
    ])
  }

  async getLocalURLFromVersion(version: SemVer): Promise<URL> {
    const link = await super.getLocalURLFromVersion(version)
    const arch: CPUArch = await getArch()
    if (arch === CPUArch.x86_64) {
      return new URL(link.toString())
    } else {
      throw new Error(`Link only available for x86_64: ${arch}`)
    }
  }

  async getNetworkURLFromVersion(version: SemVer): Promise<URL> {
    const link = await super.getNetworkURLFromVersion(version)
    const arch: CPUArch = await getArch()
    if (arch === CPUArch.x86_64) {
      return new URL(link.toString())
    } else {
      throw new Error(`Link only available for x86_64: ${arch}`)
    }
  }

  async getLocalURLFromoneAPIVersion(version: SemVer): Promise<URL> {
    return this.getLocalURLFromVersion(version)
  }

  async getNetworkURLFromoneAPIVersion(version: SemVer): Promise<URL> {
    return this.getNetworkURLFromVersion(version)
  }

  static get Instance(): LinuxLinks {
    return this._instance || (this._instance = new this())
  }
}
