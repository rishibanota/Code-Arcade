# Contributing to Code Arcade 🎮

First off, thank you for considering contributing to **Code Arcade**! Contributions are what make the open-source community such an amazing place to learn, inspire, and create.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Adding New Coding Questions](#adding-new-coding-questions)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
- [Local Development Setup](#local-development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Project Architecture](#project-architecture)

---

## Code of Conduct

This project and everyone participating in it is governed by the [Code Arcade Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

---

## How Can I Contribute?

### Adding New Coding Questions

One of the easiest and most impactful ways to contribute is by adding new coding snippets, puzzles, or trivia to our question bank!

All question data resides in **[`public/js/data/bank.js`](public/js/data/bank.js)**. No build step or compilation is required—simply add your entry to the array and refresh the browser.

#### Example Question Formats

1. **🐞 Bug Hunter** (`bank.bugHunter`)
   `bug` is the 0-based index of the line containing the bug.

   ```javascript
   {
     lang: 'py', // 'py' | 'js' | 'c' | 'java' | 'uni'
     diff: 2,    // 1 (Easy), 2 (Medium), 3 (Hard)
     lines: [
       'def total(nums):',
       '    s = 0',
       '    for n in nums:',
       '        s = n',     // <- 0-indexed line 3 is broken
       '    return s'
     ],
     bug: 3,
     why: 'Should be <b>s += n</b>, otherwise it only keeps the last value.'
   }
   ```

2. **🔮 Output Oracle** (`bank.outputOracle`)
   `a` must be the exact correct string answer matching one of the options in `opts`.

   ```javascript
   {
     lang: 'js',
     diff: 1,
     code: ['console.log(typeof null);'],
     a: '"object"',
     opts: ['"null"', '"object"', '"undefined"', '"number"'],
     why: 'A famous JavaScript quirk maintained for backwards compatibility.'
   }
   ```

3. **🧩 Stack Rebuild** (`bank.stackRebuild`)
   Provide scrambled lines that need reordering into correct execution/indentation structure.

4. **🔢 Binary Blaster / 🎯 Regex Ranger / ⌨️ Terminal Typer**
   Follow existing patterns in [`public/js/data/bank.js`](public/js/data/bank.js).

---

### Reporting Bugs

Before creating a bug report, please check existing issues to ensure it hasn't already been reported. When creating a bug report using our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.yml), please include:

* A clear and descriptive title
* Exact steps to reproduce the issue
* Your browser, OS (e.g. Android/Termux, Windows, macOS, Linux), and screen size
* Screenshots or error logs if available

---

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement request, please describe:

* The motivation behind the proposed feature
* How it should work and look (UI/UX details)
* Any alternative solutions considered

---

## Local Development Setup

Code Arcade is designed to run with **zero external dependencies** (no `npm`, `pip`, or build steps required).

1. **Clone the Repository**
   ```bash
   git clone https://github.com/rishibanota/Code-Arcade.git
   cd Code-Arcade
   ```

2. **Start Local Python Server**
   ```bash
   python server.py
   ```
   *(Or specify a custom port: `python server.py 8081`)*

3. **Termux / Mobile Launcher**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

4. **Open in Browser**
   Navigate to `http://localhost:8080` in your web browser.

---

## Pull Request Guidelines

1. **Fork & Branch**: Create a feature branch off `main` (`git checkout -b feature/my-new-feature` or `fix/bug-hunter-snippet`).
2. **Test Locally**: Verify that the game runs without browser console errors.
3. **Commit Cleanly**: Write clear, descriptive commit messages.
4. **Submit PR**: Open a PR against the `main` branch using the provided [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).

---

## Project Architecture

```
Code-Arcade/
├── server.py        # Python standard-library web server
├── run.sh           # Termux launcher script
├── public/
│   ├── index.html   # Main application structure & screens
│   ├── sw.js        # Offline PWA service worker
│   ├── css/style.css# Main stylesheet & themes
│   └── js/
│       ├── core.js  # State management, XP, badges, sound, particles
│       ├── ui.js    # Navigation, router, HUD, shop
│       ├── main.js  # Initialization & Daily Gauntlet
│       ├── data/bank.js # Question bank content
│       └── games/   # Game-specific modules
```

Thank you for helping make Code Arcade awesome! 🚀
