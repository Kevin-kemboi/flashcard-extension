// extension/background.ts
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'addFlashcard',
    title: 'Add to Flashcards',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener((info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) => {
  if (info.menuItemId === 'addFlashcard' && info.selectionText) {
    chrome.storage.local.get(['flashcards'], (data: { flashcards?: any[] }) => {
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