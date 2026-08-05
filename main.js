const { Plugin, Notice } = require('obsidian');

module.exports = class MarkAndLinkPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'mark-and-link-selection',
            name: 'Evidenzia e crea Link con Nota',
            editorCallback: async (editor, view) => {
                let selectedText = editor.getSelection();
                let rangeToReplace = null;

                // 1. Se non c'è selezione, individua la parola sotto il cursore
                if (!selectedText || selectedText.length === 0) {
                    const cursor = editor.getCursor();
                    const wordRange = editor.wordAt(cursor);
                    if (wordRange) {
                        selectedText = editor.getRange(wordRange.from, wordRange.to);
                        rangeToReplace = wordRange;
                    }
                }

                // Guard Clause: Selezione vuota o composta solo da spazi
                if (!selectedText || selectedText.trim().length === 0) return;

                // Guard Clause: Evita doppi link se è già racchiuso in [[...]]
                const trimmedSelection = selectedText.trim();
                if (trimmedSelection.startsWith('[[') && trimmedSelection.endsWith(']]')) {
                    return;
                }

                // 2. Generazione del NOME PULITO per la nota (Safe File Name)
                const cleanName = selectedText
                    .replace(/[\r\n]+/g, ' ')            // Converte le andate a capo in spazi singoli
                    .replace(/[*_~`]/g, '')              // Rimuove sintassi Markdown (grassetto, corsivo, code)
                    .replace(/[\[\]#^|]/g, '')           // Rimuove sintassi Wiki/tag di Obsidian
                    .replace(/[\/\\?%*:|"<>]/g, '')      // Rimuove caratteri vietati nei file OS
                    .replace(/\s+/g, ' ')                // Normalizza spazi multipli
                    .trim();

                // Se il nome pulito è vuoto (es. erano solo caratteri speciali), interrompe
                if (cleanName.length === 0) return;

                // 3. Sostituzione nell'editor (Preserva il testo visivo tramite Alias se necessario)
                const replacementText = (cleanName === selectedText)
                    ? `[[${cleanName}]]`
                    : `[[${cleanName}|${selectedText}]]`;

                if (rangeToReplace) {
                    editor.replaceRange(replacementText, rangeToReplace.from, rangeToReplace.to);
                } else {
                    editor.replaceSelection(replacementText);
                }

                // 4. Creazione sicura della nota nel Vault
                try {
                    // Controlla l'esistenza della nota senza distinzione di percorso
                    const existingFile = this.app.metadataCache.getFirstLinkpathDest(cleanName, '');

                    if (!existingFile) {
                        // Ottiene la cartella di destinazione impostata nelle opzioni di Obsidian
                        const currentFilePath = view.file ? view.file.path : '';
                        const targetFolder = this.app.fileManager.getNewFileParent(currentFilePath);
                        
                        // Genera un percorso normalizzato privo di doppi slash
                        const fullPath = targetFolder.isRoot()
                            ? `${cleanName}.md`
                            : `${targetFolder.path}/${cleanName}.md`;

                        // Crea la nota vuota in background
                        await this.app.vault.create(fullPath, '');
                        new Notice(`Nota "${cleanName}" creata.`);
                    }
                } catch (error) {
                    console.error("[MarkAndLink] Errore durante la creazione del file:", error);
                    new Notice(`Errore nella creazione della nota "${cleanName}"`);
                }
            },
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "e" }]
        });
    }
};
