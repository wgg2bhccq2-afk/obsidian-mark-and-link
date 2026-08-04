var { Plugin, Notice } = require('obsidian');

module.exports = class MarkAndLinkPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'mark-and-link-selection',
            name: 'Evidenzia e crea Link con Nota',
            editorCallback: async (editor) => {
                let selectedText = editor.getSelection();
                let rangeToReplace = null;

                // 1. Se non c'è testo evidenziato, prende la parola sotto il cursore
                if (!selectedText || selectedText.length === 0) {
                    const cursor = editor.getCursor();
                    const wordRange = editor.wordAt(cursor);
                    if (wordRange) {
                        selectedText = editor.getRange(wordRange.from, wordRange.to);
                        rangeToReplace = wordRange;
                    }
                }

                if (!selectedText || selectedText.trim().length === 0) return;

                // Evita di doppi-avvolgere se è già un link [[...]]
                if (selectedText.startsWith('[[') && selectedText.endsWith(']]')) {
                    return;
                }

                // Pulizia caratteri non validi per i file e i link di Obsidian
                const cleanName = selectedText.replace(/[\[\]#^|]/g, '').trim();
                if (cleanName.length === 0) return;

                // 2. Trasforma il testo nell'editor in [[Nome]]
                if (rangeToReplace) {
                    editor.replaceRange(`[[${cleanName}]]`, rangeToReplace.from, rangeToReplace.to);
                } else {
                    editor.replaceSelection(`[[${cleanName}]]`);
                }

                // 3. Crea il file .md fisicamente nel Vault
                const filePath = `${cleanName}.md`;
                try {
                    const fileExists = this.app.vault.getAbstractFileByPath(filePath);
                    if (!fileExists) {
                        await this.app.vault.create(filePath, '');
                        new Notice(`Nota "${cleanName}" creata in background!`);
                    }
                } catch (error) {
                    console.error("Errore durante la creazione del file:", error);
                }
            },
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "e" }]
        });
    }
};
