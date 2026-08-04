var { Plugin } = require('obsidian');

module.exports = class MarkAndLinkPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'mark-and-link-selection',
            name: 'Evidenzia e crea Link',
            editorCallback: (editor) => {
                let selectedText = editor.getSelection();

                // 1. Se c'è testo selezionato
                if (selectedText.length > 0) {
                    // Evita di doppi-avvolgere se è già un link
                    if (selectedText.startsWith('[[') && selectedText.endsWith(']]')) {
                        return;
                    }
                    // Rimuove caratteri problematici per i titoli delle note
                    const cleanText = selectedText.replace(/[\[\]#^|]/g, '').trim();
                    if (cleanText.length > 0) {
                        editor.replaceSelection(`[[${cleanText}]]`);
                    }
                } else {
                    // 2. Se non c'è selezione, prende la parola sotto il cursore
                    const cursor = editor.getCursor();
                    const wordRange = editor.wordAt(cursor);
                    if (wordRange) {
                        const word = editor.getRange(wordRange.from, wordRange.to);
                        const cleanWord = word.replace(/[\[\]#^|]/g, '').trim();
                        if (cleanWord.length > 0) {
                            editor.replaceRange(`[[${cleanWord}]]`, wordRange.from, wordRange.to);
                        }
                    }
                }
            },
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "e" }]
        });
    }
};
