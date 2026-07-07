# 🛠️ git-commit-craft

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-blue.svg)](https://nodejs.org)
[![Engine](https://img.shields.io/badge/AI-Gemini%20Flash-orange.svg)](https://aistudio.google.com)
[![Platform](https://img.shields.io/badge/Platform-Cross--Platform-lightgrey.svg)]()

An elegant, production-ready Command Line Interface (CLI) tool that leverages the power of Gemini's advanced language models to automate the generation of structured, **Conventional Commit** messages and industry-standard **README.md** files.

Designed for developers who value clean Git histories and precise project documentation but want to eliminate the manual overhead.

---

## 🚀 Key Features

* **AI-Generated Conventional Commits**: Analyzes your staged (or unstaged) `git diff` and generates a fully compliant Conventional Commit message (Header, Body, and Footer).
* **Interactive CLI Workflows**: Review, edit, regenerate, or apply the AI-suggested commit message directly from your terminal.
* **Smart README Generation**: Scans your local directory structure, main programming language, and `package.json` configurations to output a professional, comprehensive `README.md` file.
* **Safe Configuration Management**: Securely caches your Gemini API key locally in your home directory or seamlessly reads from environment variables.
* **Beautiful UX/UI**: Styled with a highly polished console UI featuring clear terminal status frames, success/warning indicators, and visual loading spinners.

---

## 📂 Project Structure

```text
git-commit-craft/
├── package.json
└── src/
    ├── cli.js         # CLI commands and user input coordination
    ├── config.js      # Secure credential storage and environment helper
    ├── ai.js          # AI system prompts and LLM pipeline orchestration
    ├── git.js         # Native Git operational hooks
    ├── scanner.js     # Codebase directory structural analysis
    └── ui.js          # Advanced terminal rendering and box structures
```

---

## ⚙️ Installation

To install `git-commit-craft` globally on your system, execute the following commands in your terminal:

```bash
# Clone the repository
git clone https://github.com/pegasusdev18/git-commit-craft.git

# Navigate into the project directory
cd git-commit-craft

# Install production dependencies
npm install

# Link the CLI tool globally to your system path
npm link
```

---

## 🔑 Configuration

Before running the tool, you will need a free **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikey).

You can configure the key in two ways:

1. **Interactive Prompt**: Run any command below, and the tool will securely prompt you to enter the API key. It will be saved locally inside `~/.git-commit-craft/config.json`.
2. **Environment Variable**: Export the key in your terminal session:
   ```bash
   export GEMINI_API_KEY="your_actual_api_key_here"
   ```

---

## 💻 Usage & Commands

Once linked, you can execute the tool from **any** Git repository on your machine using the following commands:

| Command | Description |
| :--- | :--- |
| `git-commit-craft craft-commit` | Analyzes staged changes and guides you through an interactive commit process. |
| `git-commit-craft craft-readme`| Scans your project directory and generates a comprehensive `README.md` file. |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
