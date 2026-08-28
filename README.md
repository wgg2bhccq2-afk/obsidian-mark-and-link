# Mark & Link

A lightweight **Obsidian** plugin designed to speed up your note-linking workflow. With a single keyboard shortcut, it converts selected text (or the word under the cursor) into an internal link and **physically creates the new `.md` file in the background** without interrupting your writing flow.

---

## 🌟 Key Features

* **Instant Linking:** Converts the current selection or the word under your cursor into a `[[note]]` link.
* **Background Note Creation:** Automatically generates the empty `.md` file in your vault (`app.vault.create`) without requiring you to click the link or open a new tab.
* **Smart Alias Handling:** If the highlighted text contains special characters, Markdown formatting, or line breaks, the plugin cleans up the string for the OS file system and generates an alias link: `[[CleanedName|Original Text]]`.
* **File Name Sanitization:** Automatically removes illegal operating system characters (`/ \ ? % * : | " < >`) to ensure valid file names across Windows, macOS, and Linux.
* **Zero Distractions:** Automatically repositions your cursor immediately after the newly created link so you can keep typing without breaking focus.
* **Visual Confirmation:** Displays a subtle notification (`Notice`) confirming when the note has been successfully created.

---

## 🚀 How It Works

1. Place your cursor on a word or highlight a phrase in the editor.
2. Press the keyboard shortcut (`Cmd + Shift + E` / `Ctrl + Shift + E`).
3. The plugin will:
   * Replace the text with `[[NoteName]]` (or `[[CleanName|Original Text]]`).
   * Check if the file already exists in your Vault.
   * If it does not exist, create the physical `.md` file in your default new note location.
   * Move the cursor directly after the trailing `]]` brackets.

---

## ⌨️ Default Keyboard Shortcuts

| Operating System | Hotkey |
| --- | --- |
| **macOS** | `Cmd` + `Shift` + `E` |
| **Windows / Linux** | `Ctrl` + `Shift` + `E` |

*(You can customize this keybinding anytime under **Settings > Hotkeys** by searching for "Mark and Link").*

---

## 🛠️ Manual Installation

1. Download the release files (`main.js`, `manifest.json`).
2. Create a folder named `mark-and-link` inside your Vault directory at:
   `.obsidian/plugins/mark-and-link/`
3. Copy the downloaded files into that folder.
4. Reload Obsidian or restart the app.
5. Navigate to **Settings > Community plugins** and toggle on **Mark & Link**.

---

## 📄 License

Distributed under the **MIT License**.
