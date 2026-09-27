import * as core from '@actions/core'
import {OSType, getOs} from './platform.js'
import {Method} from './method.js'
import {SemVer} from 'semver'
import {exec} from '@actions/exec'
import {CPUArch, getArch} from './arch.js'

export async function useApt(method: Method): Promise<boolean> {
  return (
    (method === 'network' || (method as string) === 'apt') &&
    (await getOs()) === OSType.linux
  )
}

export async function aptSetup(version?: SemVer): Promise<void> {
  const osType = await getOs()
  const archType = await getArch()
  if (osType !== OSType.linux) {
    throw new Error(
      `apt setup can only be run on linux runners! Current os type: ${osType}`
    )
  }
  if (archType !== CPUArch.x86_64) {
    throw new Error(
      `apt setup can only be run on x86_64 runners! Current arch type: ${archType}`
    )
  }

  core.debug(
    `Setup APT repository for Intel oneAPI ${version ? version.toString() : ''}`
  )

  const gpgKeyUrl =
    'https://apt.repos.intel.com/intel-gpg-keys/GPG-PUB-KEY-INTEL-SW-PRODUCTS.PUB'
  const keyringPath = '/usr/share/keyrings/oneapi-archive-keyring.gpg'
  const listPath = '/etc/apt/sources.list.d/oneAPI.list'
  const repoEntry = `deb [signed-by=${keyringPath}] https://apt.repos.intel.com/oneapi all main`

  core.debug(`GPG key URL: ${gpgKeyUrl}`)
  core.debug(`Keyring path: ${keyringPath}`)
  core.debug(`Sources list path: ${listPath}`)
  core.debug(`Repository entry: ${repoEntry}`)

  core.debug('Adding Intel oneAPI GPG key')
  await exec('sudo mkdir --parents --mode=0755 /usr/share/keyrings')
  await exec('bash', [
    '-c',
    `wget -qO - ${gpgKeyUrl} | gpg --yes --dearmor | sudo tee ${keyringPath} > /dev/null`
  ])

  core.debug('Configuring Intel oneAPI APT repository')
  await exec('bash', [
    '-c',
    `echo "${repoEntry}" | sudo tee ${listPath} > /dev/null`
  ])

  core.debug('Updating apt repository index')
  await exec('sudo apt-get update')
}

export async function aptInstall(
  version: SemVer,
  subPackages: string[] = [],
  nonOneapiSubPackages: string[] = [],
  product: string = 'toolkit'
): Promise<number> {
  const osType = await getOs()
  const archType = await getArch()
  if (osType !== OSType.linux) {
    throw new Error(
      `apt install can only be run on linux runners! Current os type: ${osType}`
    )
  }
  if (archType !== CPUArch.x86_64) {
    throw new Error(
      `apt install can only be run on x86_64 runners! Current arch type: ${archType}`
    )
  }

  if (subPackages.length === 0 && nonOneapiSubPackages.length === 0) {
    const isDLE = product === 'deep-learning-essentials' || product === 'dle'
    const baseName = isDLE
      ? 'intel-deep-learning-essentials'
      : 'intel-oneapi-toolkit'
    // Install versioned package if available or base package
    const packageName = `${baseName}-${version.major}.${version.minor}.${version.patch}`
    core.debug(`Attempting to install package: ${packageName}`)
    try {
      return await exec('sudo apt-get -y install', [packageName])
    } catch {
      core.debug(
        `Specific version package ${packageName} not found, installing base package ${baseName}`
      )
      return await exec('sudo apt-get -y install', [baseName])
    }
  } else {
    // Only install specified packages
    const prefixedSubPackages = subPackages.map(subPackage =>
      subPackage.startsWith('intel-')
        ? subPackage
        : `intel-oneapi-${subPackage}`
    )
    const allPackages = prefixedSubPackages.concat(nonOneapiSubPackages)
    core.debug(`Installing specified subpackages: ${allPackages.join(' ')}`)
    return await exec('sudo apt-get -y install', allPackages)
  }
}
