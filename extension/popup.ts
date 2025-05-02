// extension/popup.ts
interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: 'easy' | 'hard' | 'unknown';
}

document.addEventListener('DOMContentLoaded', () => {
  const flashcardList = document.getElementById('flashcard-list') as HTMLUListElement;
  const addButton = document.getElementById('add-flashcard') as HTMLButtonElement;

  chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
    const flashcards = data.flashcards || [];
    flashcards.forEach((card) => {
      const li = document.createElement('li');
      li.textContent = `${card.front} -> ${card.back} (${card.difficulty || 'none'})`;
      flashcardList.appendChild(li);
    });
  });

  addButton.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id! },
          func: () => window.getSelection()?.toString(),
        },
        (results: chrome.scripting.InjectionResult<string | undefined>[]) => {
          const selectedText = results[0].result;
          if (selectedText) {
            const newCard: Flashcard = {
              id: Date.now().toString(),
              front: selectedText,
              back: 'Define this',
              difficulty: 'unknown',
            };
            chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
              const flashcards = data.flashcards || [];
              flashcards.push(newCard);
              chrome.storage.local.set({ flashcards }, () => {
                const li = document.createElement('li');
                li.textContent = `${newCard.front} -> ${newCard.back} (${newCard.difficulty})`;
                flashcardList.appendChild(li);
              });
            });
          }
        }
      );
    });
  });
});