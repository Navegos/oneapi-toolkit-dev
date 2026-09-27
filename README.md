# oneapi-toolkit-dev

[![CI](https://github.com/Navegos/oneapi-toolkit-dev/actions/workflows/CI.yml/badge.svg)](https://github.com/Navegos/oneapi-toolkit-dev/actions/workflows/CI.yml)
[![GitHub Marketplace](https://img.shields.io/badge/Marketplace-oneapi--toolkit--dev-blue?logo=github)](https://github.com/marketplace/actions/oneapi-toolkit-dev)
[![Coverage](badges/coverage.svg)](badges/coverage.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A GitHub Action to install, configure, and cache the **Intel® oneAPI Toolkit** and **Intel® Deep Learning Essentials** on GitHub Actions runners (Linux and Windows).

The action automatically resolves component installation directories, sets all necessary structural environment variables (`ONEAPI_ROOT`, `CMPLR_ROOT`, `MKLROOT`, etc.), and adds the compiler and tool `bin` directories to `GITHUB_PATH` and libraries to `LD_LIBRARY_PATH` so developer tools like `icx`, `icpx`, `dpcpp`, `sycl-ls`, and `ocloc` are immediately available in subsequent workflow steps.

---

## Supported Platforms & Architectures

| Operating System | Supported Runner Images                               | Architecture          |
| :--------------- | :---------------------------------------------------- | :-------------------- |
| **Linux**        | `ubuntu-26.04`, `ubuntu-24.04`, `ubuntu-22.04`        | `x86_64` (`x64`) only |
| **Windows**      | `windows-2025-vs2026`, `windows-2025`, `windows-2022` | `x86_64` (`x64`) only |

> [!NOTE]
> ARM64 runners are not currently supported by Intel oneAPI installers. Only `x86_64` (`x64`) runner architectures are supported.

---

## Supported Versions

### Intel® oneAPI Toolkit

- `2026.1.1` _(Default)_
- `2026.1.0`
- `2026.0.1`
- `2026.0.0`

### Intel® Deep Learning Essentials

- `2026.1.4`, `2026.1.3`, `2026.1.2`, `2026.1.1`, `2026.1.0`, `2026.0.0`
- `2025.3.3`, `2025.3.2`, `2025.3.1`, `2025.3.0`
- `2025.2.1`, `2025.2.0`
- `2025.1.3`, `2025.1.2`, `2025.1.1`, `2025.1.0`
- `2025.0.2`, `2025.0.1`

---

## Action Inputs

| Input                     | Type    | Required | Default      | Description                                                                                                                                                   |
| :------------------------ | :------ | :------- | :----------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `product`                 | String  | No       | `'toolkit'`  | Target product to install: `'toolkit'` (Intel oneAPI Toolkit) or `'deep-learning-essentials'` (Intel Deep Learning Essentials).                               |
| `oneapi`                  | String  | No       | `'2026.1.1'` | Target version of oneAPI Toolkit or Deep Learning Essentials.                                                                                                 |
| `sub-packages`            | JSON    | No       | `'[]'`       | JSON array of specific subpackages to install (e.g. `'["compiler-dpcpp-cpp", "mkl"]'`). Packages automatically receive the `intel-oneapi-` prefix if omitted. |
| `non-oneapi-sub-packages` | JSON    | No       | `'[]'`       | JSON array of package names without `intel-oneapi-` prefix.                                                                                                   |
| `method`                  | String  | No       | `'local'`    | Installation method: `'local'` (offline standalone installer), `'network'` (online installer on Windows, official APT repo on Linux), or `'apt'`.             |
| `linux-local-args`        | JSON    | No       | `'[]'`       | Additional custom arguments passed to the offline Linux `.sh` installer script in JSON array format.                                                          |
| `use-github-cache`        | Boolean | No       | `'true'`     | Cache the downloaded installer in GitHub Actions cache to speed up subsequent workflow runs.                                                                  |
| `use-local-cache`         | Boolean | No       | `'true'`     | Cache the downloaded installer on the runner's local disk via tool-cache.                                                                                     |
| `log-file-suffix`         | String  | No       | `'log.txt'`  | Suffix added to the uploaded installation log artifact.                                                                                                       |

---

## Action Outputs

| Output        | Description                                                             |
| :------------ | :---------------------------------------------------------------------- |
| `ONEAPI_ROOT` | Absolute path to the Intel oneAPI root directory on the runner machine. |
| `ONEAPI_PATH` | Alias for `ONEAPI_ROOT`.                                                |
| `oneapi`      | Exact version of the toolkit or DLE suite installed.                    |

---

## Environment Variables & Components Matrix

The action exports root environment variables and configures paths for all core Intel oneAPI components:

### Root Variables

- **Linux**: `ONEAPI_ROOT` = `/opt/intel/oneapi`, `ONEAPI_PATH` = `/opt/intel/oneapi`
- **Windows**: `ONEAPI_ROOT` = `C:\Program Files (x86)\Intel\oneAPI`, `ONEAPI_PATH` = `C:\Program Files (x86)\Intel\oneAPI`
- `ONEAPI_VERSION`: Target installed version (e.g. `2026.1.1`)
- `ONEAPI_ROOT_<major>_<minor>` (e.g. `ONEAPI_ROOT_2026_1`)
- `ONEAPI_ROOT_<major>_<minor>_<patch>` (e.g. `ONEAPI_ROOT_2026_1_1`)

### Component Roots Matrix

| Component Name               | Environment Variable | Subdirectory Path             | Added to `PATH` | Added to `LD_LIBRARY_PATH` (Linux) |
| :--------------------------- | :------------------- | :---------------------------- | :-------------: | :--------------------------------: |
| **Root oneAPI**              | `ONEAPI_ROOT`        | `.../oneapi`                  |    `.../bin`    |             `.../lib`              |
| **compiler (DPC++/C++)**     | `CMPLR_ROOT`         | `.../oneapi/compiler/latest`  |    `.../bin`    |             `.../lib`              |
| **dnnl (oneDNN)**            | `DNNLROOT`           | `.../oneapi/dnnl/latest`      |    `.../bin`    |             `.../lib`              |
| **dpl (oneDPL)**             | `DPL_ROOT`           | `.../oneapi/dpl/latest`       |        —        |                 —                  |
| **ipp (Integrated Perf)**    | `IPPROOT`            | `.../oneapi/ipp/latest`       |    `.../bin`    |             `.../lib`              |
| **ippcp (Cryptography)**     | `IPPCPROOT`          | `.../oneapi/ippcp/latest`     |    `.../bin`    |             `.../lib`              |
| **mkl (oneMKL)**             | `MKLROOT`            | `.../oneapi/mkl/latest`       |    `.../bin`    |             `.../lib`              |
| **mpi (oneMPI)**             | `I_MPI_ROOT`         | `.../oneapi/mpi/latest`       |    `.../bin`    |             `.../lib`              |
| **ocloc (OpenCL offline)**   | _Managed via PATH_   | `.../oneapi/ocloc/latest/bin` |    `.../bin`    |                 —                  |
| **tbb (oneTBB)**             | `TBBROOT`            | `.../oneapi/tbb/latest`       |    `.../bin`    |             `.../lib`              |
| **tcm (Task Compute)**       | `TCM_ROOT`           | `.../oneapi/tcm/latest`       |    `.../bin`    |                 —                  |
| **umf (Unified Mem Finder)** | `UMF_ROOT`           | `.../oneapi/umf/latest`       |    `.../bin`    |             `.../lib`              |

---

## Workflow Examples

### 1. Basic Example (Intel oneAPI Toolkit)

```yaml
name: Build with Intel oneAPI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Intel oneAPI Toolkit
        uses: Navegos/oneapi-toolkit-dev@v0
        with:
          oneapi: '2026.1.1'
          method: 'local'

      - name: Check Compiler Versions
        run: |
          icx --version
          icpx --version
          sycl-ls
```

### 2. Intel Deep Learning Essentials (APT on Linux)

```yaml
name: PyTorch XPU Build
on: [push]

jobs:
  dl-build:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4

      - name: Install Intel Deep Learning Essentials
        uses: Navegos/oneapi-toolkit-dev@v0
        with:
          product: 'deep-learning-essentials'
          oneapi: '2025.1.0'
          method: 'network'

      - name: Verify Environment
        run: |
          echo "CMPLR_ROOT: $CMPLR_ROOT"
          echo "MKLROOT: $MKLROOT"
          icpx --version
```

### 3. Installing Specific Subpackages

```yaml
name: Minimal oneMKL and Compiler Setup
on: [push]

jobs:
  minimal:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Compiler and oneMKL Subpackages
        uses: Navegos/oneapi-toolkit-dev@v0
        with:
          method: 'network'
          sub-packages: '["compiler-dpcpp-cpp", "mkl"]'
```

### 4. Cross-Platform Matrix Workflow (Linux & Windows)

```yaml
name: CI Matrix
on: [push, pull_request]

jobs:
  test:
    strategy:
      fail-fast: false
      matrix:
        os: [ubuntu-latest, windows-latest]
        method: [local, network]
    runs-on: ${{ matrix.os }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Intel oneAPI
        id: setup-oneapi
        uses: Navegos/oneapi-toolkit-dev@v0
        with:
          oneapi: '2026.1.1'
          method: ${{ matrix.method }}
          log-file-suffix: '${{ matrix.os }}-${{ matrix.method }}'

      - name: Check Paths (Linux)
        if: runner.os == 'Linux'
        run: |
          echo "ONEAPI_ROOT: $ONEAPI_ROOT"
          echo "MKLROOT: $MKLROOT"
          icx --version || true

      - name: Check Paths (Windows)
        if: runner.os == 'Windows'
        shell: powershell
        run: |
          echo "ONEAPI_ROOT: $env:ONEAPI_ROOT"
          echo "MKLROOT: $env:MKLROOT"
          ls $env:ONEAPI_ROOT\bin -ErrorAction SilentlyContinue
```

---

## Package & Dependencies

- **Runtime Engine**: Node 24 (`runs.using: 'node24'`).
- **Distribution Bundle**: The action is pre-bundled into a single, standalone distribution file (`dist/index.js`) using Rollup. No runtime package installations or build steps are required on the runner machine.
- **Dependencies**:
  - `@actions/core`: Action inputs, outputs, logging, and environment variable exports.
  - `@actions/exec`: Process execution for APT package manager and standalone installers.
  - `@actions/cache`: GitHub Actions server cache for downloaded installer files.
  - `@actions/tool-cache`: Local runner caching for installer executables.
  - `@actions/artifact`: Automatic installation log artifact uploads.
  - `semver`: Strict semantic version comparison and validation.

---

## Official Documentation References

- [Intel® oneAPI Toolkit Installation Guide for Linux*](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-linux/latest/overview.html)
- [Linux oneAPI Toolkit Install with APT](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-linux/latest/install-oneapi-toolkit-with-apt.html)
- [Linux oneAPI Toolkit Install with Offline/Online Installer](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-linux/latest/install-oneapi-toolkit-with-installer.html)
- [Linux oneAPI Toolkit Command Line Options](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-linux/latest/command-line-options.html)
- [Linux Deep Learning Essentials Install with APT](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-linux/latest/install-deep-learning-essentials-with-apt.html)
- [Linux Deep Learning Essentials Install with Installer](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-linux/latest/install-deep-learning-essentials-with-installer.html)
- [Windows oneAPI Toolkit Install with Installer](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-windows/latest/install-oneapi-toolkit-with-installer.html)
- [Windows oneAPI Toolkit Command Line Options](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-windows/latest/command-line-options.html)
- [Windows Deep Learning Essentials Install with Installer](https://www.intel.com/content/www/us/en/docs/oneapi-toolkit/installation-guide-windows/latest/install-deep-learning-essentials-with-installer.html)

---

## License

This project is licensed under the [MIT License](LICENSE).
