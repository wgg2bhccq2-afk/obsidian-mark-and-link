var { Plugin, Notice } = require('obsidian');

module.exports = class MarkAndLinkPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'mark-and-link-selection',
            name: 'Evidenzia e crea Link con Nota',
            editorCallback: async (editor, view) => {
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

                // 2. Pulizia approfondita: Markdown e caratteri vietati dai filesystem
                let cleanName = selectedText
                    .replace(/[\r\n]+/g, ' ')             // Rimuove newlines
                    .replace(/[*_~`]/g, '')               // Rimuove grassetto/corsivo/code
                    .replace(/[\[\]#^|]/g, '')            // Rimuove sintassi wiki/tag
                    .replace(/[\/\\?%*:|"<>]/g, '')       // Rimuove caratteri vietati nei file OS
                    .trim();

                if (cleanName.length === 0) return;

                // 3. Trasforma il testo nell'editor in [[Nome]]
                if (rangeToReplace) {
                    editor.replaceRange(`[[${cleanName}]]`, rangeToReplace.from, rangeToReplace.to);
                } else {
                    editor.replaceSelection(`[[${cleanName}]]`);
                }

                // 4. Gestione della creazione file rispettando la cartella di default di Obsidian
                try {
                    // Cerca se esiste già un file con quel nome in tutto il Vault
                    const existingFile = this.app.metadataCache.getFirstLinkpathDest(cleanName, '');
                    
                    if (!existingFile) {
                        // Ricava il percorso corretto basato sulle impostazioni di Obsidian (New file location)
                        const currentFilePath = view.file ? view.file.path : '';
                        const targetFolderPath = this.app.fileManager.getNewFileParent(currentFilePath).path;
                        
                        // Genera il percorso completo
                        const fullPath = targetFolderPath === '/' ? `${cleanName}.md` : `${targetFolderPath}/${cleanName}.md`;
                        
                        await this.app.vault.create(fullPath, '');
                        new Notice(`Nota "${cleanName}" creata in background!`);
                    }
                } catch (error) {
                    console.error("Errore durante la creazione del file:", error);
                    new Notice(`Errore nella creazione della nota "${cleanName}"`);
                }
            },
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "e" }]
        });
    }
};
