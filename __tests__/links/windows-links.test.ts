import {AbstractLinks} from '../../src/links/links'
import {SemVer} from 'semver'
import {WindowsLinks} from '../../src/links/windows-links'

test.concurrent('Windows oneAPI versions in descending order', async () => {
  const wLinks: AbstractLinks = WindowsLinks.Instance
  const versions = wLinks.getAvailableLocaloneAPIVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA: SemVer = versions[i]
    const versionB: SemVer = versions[i + 1]
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test.concurrent(
  'Windows oneAPI version to URL map contains valid URLs',
  async () => {
    for (const version of WindowsLinks.Instance.getAvailableLocaloneAPIVersions()) {
      const url =
        await WindowsLinks.Instance.getLocalURLFromoneAPIVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent('There is at least windows 1 version url pair', async () => {
  expect(
    WindowsLinks.Instance.getAvailableLocaloneAPIVersions().length
  ).toBeGreaterThanOrEqual(1)
})

test.concurrent(
  'Windows oneAPI network versions in descending order',
  async () => {
    const wLinks = WindowsLinks.Instance
    const versions = wLinks.getAvailableNetworkoneAPIVersions()
    for (let i = 0; i < versions.length - 1; i++) {
      const versionA: SemVer = versions[i]
      const versionB: SemVer = versions[i + 1]
      expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
    }
  }
)

test.concurrent(
  'Windows network oneAPI version to URL map contains valid URLs',
  async () => {
    for (const version of WindowsLinks.Instance.getAvailableNetworkoneAPIVersions()) {
      const url: URL =
        await WindowsLinks.Instance.getNetworkURLFromoneAPIVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent(
  'There is at least windows network 1 version url pair',
  async () => {
    expect(
      WindowsLinks.Instance.getAvailableNetworkoneAPIVersions().length
    ).toBeGreaterThanOrEqual(1)
  }
)
