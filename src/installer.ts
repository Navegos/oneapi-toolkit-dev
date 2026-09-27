import {DefaultArtifactClient} from '@actions/artifact'
import * as core from '@actions/core'
import {filterReadable} from './fs-utils.js'
import {OSType, getOs, getRelease} from './platform.js'
import {CPUArch, getArch} from './arch.js'
import {SemVer} from 'semver'
import {exec} from '@actions/exec'
import path from 'node:path'
import * as os from 'node:os'
import fs from 'node:fs'
import {WindowsLinks} from './links/windows-links.js'
import {LinuxLinks} from './links/linux-links.js'
import {aptSetup, aptInstall} from './apt-installer.js'

export async function install(
  executablePath: string,
  version: SemVer,
  subPackagesArray: string[] = [],
  linuxLocalArgsArray: string[] = [],
  method: string = 'local',
  logFileSuffix: string = '',
  product: string = 'toolkit'
): Promise<void> {
  const archType = await getArch()
  if (archType !== CPUArch.x86_64) {
    throw new Error(
      `Unsupported architecture: ${archType}. Only x86_64 is supported.`
    )
  }

  const osType = await getOs()
  if (osType !== OSType.windows && osType !== OSType.linux) {
    throw new Error(
      `Unsupported OS: ${osType}. Only Windows and Linux are supported.`
    )
  }

  // Linux using APT installer
  if (osType === OSType.linux && (method === 'network' || method === 'apt')) {
    core.debug(`Installing oneAPI ${version} using apt-installer`)
    await aptSetup(version)
    await aptInstall(version, subPackagesArray, [], product)
    return
  }

  // Offline / local installer execution
  const logDir = os.tmpdir()
  const logPath = path.join(logDir, 'installer_log.txt')

  const execOptions = {
    listeners: {
      stdout: (data: Buffer) => {
        core.debug(data.toString())
      },
      stderr: (data: Buffer) => {
        core.debug(`Error: ${data.toString()}`)
      }
    }
  }

  if (osType === OSType.windows) {
    const winLinks = WindowsLinks.Instance
    const availableVersions = winLinks.getAvailableLocalVersions()
    if (!availableVersions.some(v => v.compare(version) === 0)) {
      core.warning(
        `Version ${version} not explicitly in windows-links map, attempting install`
      )
    }

    const installerArgs = [
      '-s',
      '-a',
      '--silent',
      '--eula',
      'accept',
      '--action',
      'install'
    ]
    if (subPackagesArray.length > 0) {
      installerArgs.push('--components', subPackagesArray.join(':'))
    }
    installerArgs.push('--log-dir', logDir)

    const argsListFormatted = installerArgs.map(arg => `"${arg}"`).join(',')
    const powershellCommand = [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `$process = Start-Process -FilePath "${executablePath}" -ArgumentList ${argsListFormatted} -NoNewWindow -Wait -PassThru; exit $process.ExitCode`
    ]

    try {
      core.debug(`Running Windows installer: ${executablePath}`)
      const exitCode = await exec('powershell', powershellCommand, execOptions)
      core.debug(`Installer exit code: ${exitCode}`)
    } catch (error) {
      core.warning(`Error during installation: ${error}`)
      throw error
    }
  } else if (osType === OSType.linux) {
    const linuxLinks = LinuxLinks.Instance
    const availableVersions = linuxLinks.getAvailableLocalVersions()
    if (!availableVersions.some(v => v.compare(version) === 0)) {
      core.warning(
        `Version ${version} not explicitly in linux-links map, attempting install`
      )
    }

    const installerArgs = [
      executablePath,
      '-s',
      '-a',
      '--silent',
      '--eula',
      'accept',
      '--action',
      'install'
    ]
    if (subPackagesArray.length > 0) {
      installerArgs.push('--components', subPackagesArray.join(':'))
    }
    if (linuxLocalArgsArray.length > 0) {
      installerArgs.push(...linuxLocalArgsArray)
    }

    try {
      core.debug(`Running Linux installer script: ${executablePath}`)
      await exec('chmod', ['+x', executablePath])
      const exitCode = await exec('sudo', ['sh', ...installerArgs], execOptions)
      core.debug(`Installer exit code: ${exitCode}`)
    } catch (error) {
      core.warning(`Error during installation: ${error}`)
      throw error
    }
  }

  // Always upload installation log regardless of error
  try {
    const osRelease = await getRelease()
    const artifactClient = new DefaultArtifactClient()
    const artifactName = `oneapi-install-${osType}-${osRelease}-${method}-${logFileSuffix || 'log'}`

    if (osType === OSType.windows) {
      if (fs.existsSync(logPath)) {
        await artifactClient.uploadArtifact(artifactName, [logPath], logDir)
      }
    } else if (osType === OSType.linux) {
      const candidates = ['/var/log/intel_installer.log', logPath]
      const files = await filterReadable(candidates)
      if (files.length > 0) {
        await artifactClient.uploadArtifact(
          artifactName,
          files,
          path.dirname(files[0])
        )
      }
    }
  } catch (error) {
    core.debug(`Upload artifact error: ${error}`)
  }
}
