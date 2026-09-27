import {LinuxLinks} from '../../src/links/linux-links'
import {WindowsLinks} from '../../src/links/windows-links'
import {getLinks} from '../../src/links/get-links'

test.concurrent('getLinks gives a valid ILinks class', async () => {
  try {
    const links = await getLinks()
    expect(
      links instanceof LinuxLinks || links instanceof WindowsLinks
    ).toBeTruthy()
  } catch {
    // Other OS
  }
})

test.concurrent(
  'getLinks returns available versions for platforms',
  async () => {
    const linuxLinks = LinuxLinks.Instance.getAvailableLocalVersions()
    const windowsLinks = WindowsLinks.Instance.getAvailableLocalVersions()
    const windowsNetworkLinks =
      WindowsLinks.Instance.getAvailableNetworkVersions()

    expect(linuxLinks.length).toBeGreaterThanOrEqual(1)
    expect(windowsLinks.length).toBeGreaterThanOrEqual(1)
    expect(windowsLinks.length).toBe(windowsNetworkLinks.length)
    expect(windowsLinks).toEqual(windowsNetworkLinks)
  }
)
