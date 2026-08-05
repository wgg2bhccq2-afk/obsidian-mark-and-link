const { Plugin, Notice } = require('obsidian');

// Regex pre-compilati per massime prestazioni
const REGEX_BRACKETS = /[\[\]]/g;
const REGEX_NEWLINES = /[\r\n]+/g;
const REGEX_MARKDOWN = /[*_~`#^|]/g;
const REGEX_INVALID_OS_CHARS = /[\/\\?%*:|"<>]/g;
const REGEX_MULTIPLE_SPACES = /\s+/g;

module.exports = class MarkAndLinkPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'mark-and-link-selection',
            name: 'Evidenzia e crea Link con Nota',
            editorCallback: (editor, view) => {
                this.processSelectionAndLink(editor, view);
            },
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "e" }]
        });
    }

    processSelectionAndLink(editor, view) {
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

        if (!selectedText || selectedText.trim().length === 0) return;

        // Strip preventivo di parentesi quadre per evitare link corrotti
        const rawText = selectedText.replace(REGEX_BRACKETS, '').trim();
        if (rawText.length === 0) return;

        // 2. Pulizia assoluta del nome file (sicuro per Windows/macOS/Linux)
        const cleanName = rawText
            .replace(REGEX_NEWLINES, ' ')
            .replace(REGEX_MARKDOWN, '')
            .replace(REGEX_INVALID_OS_CHARS, '')
            .replace(REGEX_MULTIPLE_SPACES, ' ')
            .trim();

        if (cleanName.length === 0) return;

        // 3. Generazione dell'Alias intelligente
        const originalTrimmed = selectedText.trim();
        const replacementText = (cleanName === originalTrimmed)
            ? `[[${cleanName}]]`
            : `[[${cleanName}|${originalTrimmed}]]`;

        // 4. Modifica atomica del testo e gestione accurata del cursore
        const targetFrom = rangeToReplace ? rangeToReplace.from : editor.getCursor('from');
        const targetTo = rangeToReplace ? rangeToReplace.to : editor.getCursor('to');

        // Garantisce di avere il punto di inizio corretto, anche se la selezione è inversa
        const startPos = (targetFrom.line < targetTo.line || (targetFrom.line === targetTo.line && targetFrom.ch <= targetTo.ch)) 
            ? targetFrom 
            : targetTo;

        editor.replaceRange(replacementText, targetFrom, targetTo);
        
        // Riposiziona il cursore subito DOPO il nuovo link per continuare a scrivere
        editor.setCursor({
            line: startPos.line,
            ch: startPos.ch + replacementText.length
        });

        // 5. Creazione della nota in background
        this.createNoteInBackground(cleanName, view);
    }

    async createNoteInBackground(cleanName, view) {
        try {
            // Gestisce in sicurezza la vista corrente (anche se non c'è un file attivo)
            const currentFilePath = (view && view.file) ? view.file.path : '';
            const targetFolder = this.app.fileManager.getNewFileParent(currentFilePath);
            
            // Genera il percorso evitando doppi slash nel caso della cartella radice
            const folderPath = targetFolder.path === '/' ? '' : targetFolder.path + '/';
            const fullPath = `${folderPath}${cleanName}.md`;

            // Verifica rigorosa dell'esistenza della nota
            const fileExists = this.app.vault.getAbstractFileByPath(fullPath) || 
                               this.app.metadataCache.getFirstLinkpathDest(cleanName, '');

            if (!fileExists) {
                await this.app.vault.create(fullPath, '');
                new Notice(`Nota "${cleanName}" creata.`);
            }
        } catch (error) {
            console.error("[MarkAndLink] Errore durante la creazione del file:", error);
            new Notice(`Errore nella creazione della nota "${cleanName}"`);
        }
    }
};
