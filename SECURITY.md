# Security Policy

## Supported Versions

The following table indicates the security support status for versions of **Code Arcade**:

| Version / Branch | Supported          | Notes                                     |
| ---------------- | ------------------ | ----------------------------------------- |
| `main`           | :white_check_mark: | Latest stable development and web release |
| Pre-release      | :x:                | Historical or experimental commits        |

---

## Reporting a Vulnerability

We take the security of **Code Arcade** seriously. If you discover a security vulnerability or security flaw, please report it responsibly rather than opening a public issue.

### How to Report

Please report security issues by contacting the project maintainer via:

* **GitHub Security Advisory**: Submit a private advisory via [Code Arcade Security Advisories](https://github.com/rishibanota/Code-Arcade/security/advisories/new)
* **Direct Contact / Issue**: If private advisory is unavailable, reach out to maintainer [`@rishibanota`](https://github.com/rishibanota).

### What to Include in Your Report

To help us investigate and respond quickly, please include as much information as possible:

1. **Description**: A clear summary of the issue or vulnerability.
2. **Steps to Reproduce**: Proof of concept (PoC) code, steps, or screenshots demonstrating the vulnerability.
3. **Impact**: An evaluation of the potential risk or exploitability.
4. **Environment**: Operating System, browser, or server environment details where applicable.

---

## Response & Disclosure Process

1. **Acknowledgement**: We aim to acknowledge receipt of security reports within **48 hours**.
2. **Assessment**: The maintainers will investigate and determine the severity and scope of the issue.
3. **Fix Development**: A patch will be developed and verified in a private environment.
4. **Public Disclosure**: Once a fix is applied to the `main` branch, an update will be published and credit will be given to the reporter (unless anonymity is requested).

---

## Scope & Security Philosophy

Code Arcade is a client-side Progressive Web Application (PWA) served locally via Python standard library `http.server`. 
* All game state and user progress are stored locally within the browser's `localStorage`.
* No sensitive personal data, user credentials, or server-side databases are processed by this project.
