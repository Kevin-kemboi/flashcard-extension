"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const flashcardList = document.getElementById('flashcard-list');
    const addButton = document.getElementById('add-flashcard');
    chrome.storage.local.get(['flashcards'], (data) => {
        const flashcards = data.flashcards || [];
        flashcards.forEach((card) => {
            const li = document.createElement('li');
            li.textContent = `${card.front} -> ${card.back} (${card.difficulty || 'none'})`;
            flashcardList.appendChild(li);
        });
    });
    addButton.addEventListener('click', () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => { var _a; return (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.toString(); },
            }, (results) => {
                const selectedText = results[0].result;
                if (selectedText) {
                    const newCard = {
                        id: Date.now().toString(),
                        front: selectedText,
                        back: 'Define this',
                        difficulty: 'unknown',
                    };
                    chrome.storage.local.get(['flashcards'], (data) => {
                        const flashcards = data.flashcards || [];
                        flashcards.push(newCard);
                        chrome.storage.local.set({ flashcards }, () => {
                            const li = document.createElement('li');
                            li.textContent = `${newCard.front} -> ${newCard.back} (${newCard.difficulty})`;
                            flashcardList.appendChild(li);
                        });
                    });
                }
            });
        });
    });
});
//# sourceMappingURL=popup.js.map