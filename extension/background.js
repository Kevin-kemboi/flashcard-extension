"use strict";
// extension/background.ts
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'addFlashcard',
        title: 'Add to Flashcards',
        contexts: ['selection'],
    });
});
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'addFlashcard' && info.selectionText) {
        chrome.storage.local.get(['flashcards'], (data) => {
            const flashcards = data.flashcards || [];
            flashcards.push({
                id: Date.now().toString(),
                front: info.selectionText,
                back: 'Define this',
                difficulty: 'unknown',
            });
            chrome.storage.local.set({ flashcards });
        });
    }
});
//# sourceMappingURL=background.js.map