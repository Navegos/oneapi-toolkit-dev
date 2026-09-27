import * as core from '@actions/core'
import * as path from 'node:path'
import {OSType, getOs} from './platform.js'
import {SemVer} from 'semver'

interface ComponentConfig {
  name: string
  envVar?: string
  subDirSegments: string[]
  addBinToPath: boolean
  addLibToLdLibraryPath: boolean
}

const COMPONENTS: ComponentConfig[] = [
  {
    name: 'compiler',
    envVar: 'CMPLR_ROOT',
    subDirSegments: ['compiler', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  },
  {
    name: 'dnnl',
    envVar: 'DNNLROOT',
    subDirSegments: ['dnnl', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  },
  {
    name: 'dpl',
    envVar: 'DPL_ROOT',
    subDirSegments: ['dpl', 'latest'],
    addBinToPath: false,
    addLibToLdLibraryPath: false
  },
  {
    name: 'ipp',
    envVar: 'IPPROOT',
    subDirSegments: ['ipp', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  },
  {
    name: 'ippcp',
    envVar: 'IPPCPROOT',
    subDirSegments: ['ippcp', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  },
  {
    name: 'mkl',
    envVar: 'MKLROOT',
    subDirSegments: ['mkl', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  },
  {
    name: 'mpi',
    envVar: 'I_MPI_ROOT',
    subDirSegments: ['mpi', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  },
  {
    name: 'ocloc',
    subDirSegments: ['ocloc', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: false
  },
  {
    name: 'tbb',
    envVar: 'TBBROOT',
    subDirSegments: ['tbb', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  },
  {
    name: 'tcm',
    envVar: 'TCM_ROOT',
    subDirSegments: ['tcm', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: false
  },
  {
    name: 'umf',
    envVar: 'UMF_ROOT',
    subDirSegments: ['umf', 'latest'],
    addBinToPath: true,
    addLibToLdLibraryPath: true
  }
]

export async function updatePath(version: SemVer): Promise<string> {
  const osType = await getOs()
  const pathHelper = osType === OSType.linux ? path.posix : path.win32
  let oneapiPath: string

  switch (osType) {
    case OSType.linux:
      oneapiPath = '/opt/intel/oneapi'
      break
    case OSType.windows:
      oneapiPath = 'C:\\Program Files (x86)\\Intel\\oneAPI'
      break
    default:
      throw new Error('Unsupported operating system detected for oneAPI setup')
  }

  core.debug(`oneAPI root resolved to: ${oneapiPath}`)

  const versionMajorMinor = `${version.major}_${version.minor}`
  const versionFull = `${version.major}_${version.minor}_${version.patch}`

  core.exportVariable('ONEAPI_ROOT', oneapiPath)
  core.exportVariable('ONEAPI_PATH', oneapiPath)
  core.exportVariable('ONEAPI_VERSION', version.toString())
  core.exportVariable(`ONEAPI_ROOT_${versionMajorMinor}`, oneapiPath)
  core.exportVariable(`ONEAPI_ROOT_${versionFull}`, oneapiPath)

  // Add root bin to PATH
  const rootBinPath = pathHelper.join(oneapiPath, 'bin')
  core.debug(`Adding root binaries folder to PATH: ${rootBinPath}`)
  core.addPath(rootBinPath)

  // Export component root environment variables and add bin to PATH
  const libPathsToExport: string[] = []
  if (osType === OSType.linux) {
    libPathsToExport.push(pathHelper.join(oneapiPath, 'lib'))
  }

  for (const component of COMPONENTS) {
    const componentRoot = pathHelper.join(
      oneapiPath,
      ...component.subDirSegments
    )

    if (component.envVar) {
      core.debug(`Exporting ${component.envVar}=${componentRoot}`)
      core.exportVariable(component.envVar, componentRoot)
    }

    if (component.addBinToPath) {
      const componentBin = pathHelper.join(componentRoot, 'bin')
      core.debug(`Adding component bin to PATH: ${componentBin}`)
      core.addPath(componentBin)
    }

    if (component.addLibToLdLibraryPath && osType === OSType.linux) {
      libPathsToExport.push(pathHelper.join(componentRoot, 'lib'))
    }
  }

  // Manage Linux dynamic runtime linker setup
  if (osType === OSType.linux) {
    const environment = (
      globalThis as typeof globalThis & {
        process?: {env?: Record<string, string | undefined>}
      }
    ).process
    const libPath = environment?.env?.LD_LIBRARY_PATH ?? ''
    const currentLibs = libPath.split(':').filter(Boolean)
    const newLibs = libPathsToExport.filter(p => !currentLibs.includes(p))

    if (newLibs.length > 0) {
      const combined = libPath
        ? `${newLibs.join(':')}:${libPath}`
        : newLibs.join(':')
      core.debug(`Appending libraries to LD_LIBRARY_PATH: ${newLibs.join(':')}`)
      core.exportVariable('LD_LIBRARY_PATH', combined)
    }
  }

  return oneapiPath
}
