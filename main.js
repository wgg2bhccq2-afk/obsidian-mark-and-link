var { Plugin } = require('obsidian');

module.exports = class MarkAndLinkPlugin extends Plugin {
    async onload() {
        this.addCommand({
            id: 'mark-and-link-selection',
            name: 'Evidenzia e crea Link',
            editorCallback: (editor) => {
                const selectedText = editor.getSelection();
                if (selectedText.length > 0) {
                    editor.replaceSelection(`[[${selectedText}]]`);
                } else {
                    const cursor = editor.getCursor();
                    const wordRange = editor.wordAt(cursor);
                    if (wordRange) {
                        const word = editor.getRange(wordRange.from, wordRange.to);
                        editor.replaceRange(`[[${word}]]`, wordRange.from, wordRange.to);
                    }
                }
            },
            hotkeys: [{ modifiers: ["Mod", "Shift"], key: "e" }]
        });
    }
};