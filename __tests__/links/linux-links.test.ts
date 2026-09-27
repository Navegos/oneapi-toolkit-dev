import {AbstractLinks} from '../../src/links/links'
import {LinuxLinks} from '../../src/links/linux-links'
import {SemVer} from 'semver'

test.concurrent('Linux oneAPI versions in descending order', async () => {
  const wLinks: AbstractLinks = LinuxLinks.Instance
  const versions = wLinks.getAvailableLocaloneAPIVersions()
  for (let i = 0; i < versions.length - 1; i++) {
    const versionA: SemVer = versions[i]
    const versionB: SemVer = versions[i + 1]
    expect(versionA.compare(versionB)).toBe(1) // A should be greater than B
  }
})

test.concurrent(
  'Linux oneAPI version to URL map contains valid URLs',
  async () => {
    for (const version of LinuxLinks.Instance.getAvailableLocaloneAPIVersions()) {
      const url =
        await LinuxLinks.Instance.getLocalURLFromoneAPIVersion(version)
      expect(url).toBeInstanceOf(URL)
    }
  }
)

test.concurrent('There is at least linux 1 version url pair', async () => {
  expect(
    LinuxLinks.Instance.getAvailableLocaloneAPIVersions().length
  ).toBeGreaterThanOrEqual(1)
})
