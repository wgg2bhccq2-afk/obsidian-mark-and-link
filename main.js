const { Plugin, Notice } = require('obsidian');

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

        if (!selectedText || selectedText.length === 0) {
            const cursor = editor.getCursor();
            const wordRange = editor.wordAt(cursor);
            if (wordRange) {
                selectedText = editor.getRange(wordRange.from, wordRange.to);
                rangeToReplace = wordRange;
            }
        }

        if (!selectedText || selectedText.trim().length === 0) return;

        const rawText = selectedText.replace(REGEX_BRACKETS, '').trim();
        if (rawText.length === 0) return;

        const cleanName = rawText
            .replace(REGEX_NEWLINES, ' ')
            .replace(REGEX_MARKDOWN, '')
            .replace(REGEX_INVALID_OS_CHARS, '')
            .replace(REGEX_MULTIPLE_SPACES, ' ')
            .trim();

        if (cleanName.length === 0) return;

        const originalTrimmed = selectedText.trim();
        const replacementText = (cleanName === originalTrimmed)
            ? `[[${cleanName}]]`
            : `[[${cleanName}|${originalTrimmed}]]`;

        const targetFrom = rangeToReplace ? rangeToReplace.from : editor.getCursor('from');
        const targetTo = rangeToReplace ? rangeToReplace.to : editor.getCursor('to');

        editor.replaceRange(replacementText, targetFrom, targetTo);
        
        editor.setCursor({
            line: targetFrom.line,
            ch: targetFrom.ch + replacementText.length
        });

        this.createNoteInBackground(cleanName, view);
    }

    async createNoteInBackground(cleanName, view) {
        try {
            const currentFilePath = view.file ? view.file.path : '';
            const targetFolder = this.app.fileManager.getNewFileParent(currentFilePath);
            
            const fullPath = targetFolder.isRoot()
                ? `${cleanName}.md`
                : `${targetFolder.path}/${cleanName}.md`;

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
