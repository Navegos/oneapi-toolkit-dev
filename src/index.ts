import * as core from '@actions/core'
import {Method, parseMethod} from './method.js'
import {OSType, getOs} from './platform.js'
import {aptInstall, aptSetup, useApt} from './apt-installer.js'
import {download} from './downloader.js'
import {getVersion} from './version.js'
import {install} from './installer.js'
import {updatePath} from './update-path.js'
import {parsePackages} from './parser.js'

async function run(): Promise<void> {
  try {
    // Only Windows and Linux on x86_64 are supported
    const osType = await getOs()

    const oneapi: string =
      core.getInput('oneapi') || core.getInput('oneapi') || '2026.1.1'
    core.debug(`Desired oneAPI version: ${oneapi}`)
    const product: string = core.getInput('product') || 'toolkit'
    core.debug(`Desired product: ${product}`)
    const subPackagesArgName = 'sub-packages'
    const subPackages: string = core.getInput(subPackagesArgName)
    core.debug(`Desired subPackages: ${subPackages}`)
    const nonOneapiSubPackagesArgName = 'non-oneapi-sub-packages'
    const nonOneapiSubPackages: string =
      core.getInput(nonOneapiSubPackagesArgName) ||
      core.getInput('non-oneapi-sub-packages')
    core.debug(`Desired nonOneapiSubPackages: ${nonOneapiSubPackages}`)
    const methodString: string = core.getInput('method') || 'local'
    core.debug(`Desired method: ${methodString}`)
    const linuxLocalArgs: string = core.getInput('linux-local-args')
    core.debug(`Desired local linux args: ${linuxLocalArgs}`)
    const useGitHubCache: boolean = core.getBooleanInput('use-github-cache')
    core.debug(`Desired GitHub cache usage: ${useGitHubCache}`)
    const useLocalCache: boolean = core.getBooleanInput('use-local-cache')
    core.debug(`Desired local cache usage: ${useLocalCache}`)
    const logFileSuffix: string = core.getInput('log-file-suffix')
    core.debug(`Desired log file suffix: ${logFileSuffix}`)

    // Parse subPackages array
    const subPackagesArray: string[] = await parsePackages(
      subPackages,
      subPackagesArgName
    )

    // Parse nonOneapiSubPackages array
    const nonOneapiSubPackagesArray: string[] = await parsePackages(
      nonOneapiSubPackages,
      nonOneapiSubPackagesArgName
    )

    // Parse method
    const methodParsed: Method = parseMethod(methodString)
    core.debug(`Parsed method: ${methodParsed}`)

    // Parse version string
    const version = await getVersion(oneapi, methodParsed)

    // Parse linuxLocalArgs array
    let linuxLocalArgsArray: string[] = []
    if (linuxLocalArgs && linuxLocalArgs.trim() !== '') {
      try {
        linuxLocalArgsArray = JSON.parse(linuxLocalArgs)
      } catch (error) {
        core.debug(`Json parsing error: ${error}`)
        const errString = `Error parsing input 'linux-local-args' to a JSON string array: ${linuxLocalArgs}`
        core.debug(errString)
        throw new Error(errString)
      }
    }

    // Check if APT installer should be used on Linux
    const useAptInstall = await useApt(methodParsed)
    if (useAptInstall) {
      await aptSetup(version)
      const installResult = await aptInstall(
        version,
        subPackagesArray,
        nonOneapiSubPackagesArray,
        product
      )
      core.debug(`Install result: ${installResult}`)
    } else if (osType === OSType.windows || osType === OSType.linux) {
      const executablePath: string = await download(
        version,
        methodParsed,
        useLocalCache,
        useGitHubCache
      )
      await install(
        executablePath,
        version,
        subPackagesArray,
        linuxLocalArgsArray,
        methodString,
        logFileSuffix,
        product
      )
    } else {
      throw new Error(
        `Install packages only supported on Windows or Linux, current os: '${osType}'`
      )
    }

    // Add oneAPI environment variables to GitHub environment variables
    const oneapiPath: string = await updatePath(version)

    // Set output variables
    core.setOutput('oneapi', version.toString())
    core.setOutput('ONEAPI_ROOT', oneapiPath)
    core.setOutput('ONEAPI_PATH', oneapiPath)
    // Backward compatibility outputs
    core.setOutput('oneapi', version.toString())
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error)
    } else {
      core.setFailed('Unknown error')
    }
  }
}

await run()
