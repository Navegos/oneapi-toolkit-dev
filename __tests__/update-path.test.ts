import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test
} from '@jest/globals'
import os from 'os'
import {SemVer} from 'semver'

const exportVariableSpy = jest.fn()
const addPathSpy = jest.fn()
const debugSpy = jest.fn()

jest.unstable_mockModule('@actions/core', () => ({
  exportVariable: exportVariableSpy,
  addPath: addPathSpy,
  debug: debugSpy
}))

const {updatePath} = await import('../src/update-path.js')

describe('updatePath', () => {
  beforeEach(() => {
    exportVariableSpy.mockClear()
    addPathSpy.mockClear()
    debugSpy.mockClear()
    jest.spyOn(os, 'arch').mockReturnValue('x64')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('Linux exports ONEAPI_ROOT, explicit component roots, bin paths, and LD_LIBRARY_PATH', async () => {
    jest.spyOn(os, 'platform').mockReturnValue('linux')
    const version = new SemVer('2026.1.1')

    const oneapiPath = await updatePath(version)

    expect(oneapiPath).toBe('/opt/intel/oneapi')
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_ROOT',
      '/opt/intel/oneapi'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_PATH',
      '/opt/intel/oneapi'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith('ONEAPI_VERSION', '2026.1.1')
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_ROOT_2026_1',
      '/opt/intel/oneapi'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_ROOT_2026_1_1',
      '/opt/intel/oneapi'
    )

    // Component environment variables
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'CMPLR_ROOT',
      '/opt/intel/oneapi/compiler/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'DNNLROOT',
      '/opt/intel/oneapi/dnnl/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'DPL_ROOT',
      '/opt/intel/oneapi/dpl/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'IPPROOT',
      '/opt/intel/oneapi/ipp/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'IPPCPROOT',
      '/opt/intel/oneapi/ippcp/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'MKLROOT',
      '/opt/intel/oneapi/mkl/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'I_MPI_ROOT',
      '/opt/intel/oneapi/mpi/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'TBBROOT',
      '/opt/intel/oneapi/tbb/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'TCM_ROOT',
      '/opt/intel/oneapi/tcm/latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'UMF_ROOT',
      '/opt/intel/oneapi/umf/latest'
    )

    // Bin paths added to PATH
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/bin')
    expect(addPathSpy).toHaveBeenCalledWith(
      '/opt/intel/oneapi/compiler/latest/bin'
    )
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/dnnl/latest/bin')
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/ipp/latest/bin')
    expect(addPathSpy).toHaveBeenCalledWith(
      '/opt/intel/oneapi/ippcp/latest/bin'
    )
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/mkl/latest/bin')
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/mpi/latest/bin')
    expect(addPathSpy).toHaveBeenCalledWith(
      '/opt/intel/oneapi/ocloc/latest/bin'
    )
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/tbb/latest/bin')
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/tcm/latest/bin')
    expect(addPathSpy).toHaveBeenCalledWith('/opt/intel/oneapi/umf/latest/bin')

    // LD_LIBRARY_PATH
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'LD_LIBRARY_PATH',
      expect.stringContaining('/opt/intel/oneapi/compiler/latest/lib')
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'LD_LIBRARY_PATH',
      expect.stringContaining('/opt/intel/oneapi/mkl/latest/lib')
    )
  })

  test('Windows exports ONEAPI_ROOT, explicit component roots, and bin paths', async () => {
    jest.spyOn(os, 'platform').mockReturnValue('win32')
    const version = new SemVer('2026.1.1')

    const oneapiPath = await updatePath(version)

    expect(oneapiPath).toBe('C:\\Program Files (x86)\\Intel\\oneAPI')
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_ROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_PATH',
      'C:\\Program Files (x86)\\Intel\\oneAPI'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith('ONEAPI_VERSION', '2026.1.1')
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_ROOT_2026_1',
      'C:\\Program Files (x86)\\Intel\\oneAPI'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'ONEAPI_ROOT_2026_1_1',
      'C:\\Program Files (x86)\\Intel\\oneAPI'
    )

    // Component environment variables
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'CMPLR_ROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\compiler\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'DNNLROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\dnnl\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'DPL_ROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\dpl\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'IPPROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\ipp\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'IPPCPROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\ippcp\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'MKLROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\mkl\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'I_MPI_ROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\mpi\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'TBBROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\tbb\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'TCM_ROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\tcm\\latest'
    )
    expect(exportVariableSpy).toHaveBeenCalledWith(
      'UMF_ROOT',
      'C:\\Program Files (x86)\\Intel\\oneAPI\\umf\\latest'
    )

    // Bin paths added to PATH
    expect(addPathSpy).toHaveBeenCalledWith(
      'C:\\Program Files (x86)\\Intel\\oneAPI\\bin'
    )
    expect(addPathSpy).toHaveBeenCalledWith(
      'C:\\Program Files (x86)\\Intel\\oneAPI\\compiler\\latest\\bin'
    )
    expect(addPathSpy).toHaveBeenCalledWith(
      'C:\\Program Files (x86)\\Intel\\oneAPI\\mkl\\latest\\bin'
    )
    expect(addPathSpy).toHaveBeenCalledWith(
      'C:\\Program Files (x86)\\Intel\\oneAPI\\ocloc\\latest\\bin'
    )
  })
})
