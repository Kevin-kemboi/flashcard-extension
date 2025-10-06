// Enhanced popup with SRS, analytics, search, edit, delete, import/export
import { schedule, aggregate, initSRS } from './srs';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty?: string;
  interval?: number;
  easeFactor?: number;
  repetitions?: number;
  nextReview?: string;
}

type DifficultyKey = string;

const difficultyClasses: Record<DifficultyKey, string> = {
  easy: 'easy',
  hard: 'hard',
  unknown: 'unknown',
  review: 'review',
  medium: 'medium',
  focus: 'focus',
  mastered: 'mastered',
  active: 'active'
};

let cachedCards: Flashcard[] = [];
let searchTerm = '';

function renderFlashcards(listEl: HTMLUListElement, emptyEl: HTMLElement, cards: Flashcard[]) {
  listEl.innerHTML = '';
  const filtered = cards.filter(c => {
    if (!searchTerm) return true;
    return (
      c.front.toLowerCase().includes(searchTerm) ||
      c.back.toLowerCase().includes(searchTerm) ||
      (c.difficulty || '').toLowerCase().includes(searchTerm)
    );
  });
  if (filtered.length === 0) {
    emptyEl.style.display = 'block';
    return;
  }
  emptyEl.style.display = 'none';
  filtered.forEach(card => {
    const li = document.createElement('li');
    li.dataset.id = card.id;
    li.innerHTML = `
      <div class="front">${card.front}</div>
      <div class="back" contenteditable="true" data-role="back">${card.back}</div>
      <div class="meta">
        <span class="badge ${difficultyClasses[card.difficulty || 'unknown'] || 'unknown'}">${card.difficulty || 'unknown'}</span>
        <span style="font-size:10px; color:#555;">${card.nextReview ? new Date(card.nextReview).toLocaleDateString() : ''}</span>
      </div>
      <div class="difficulty-buttons"></div>
      <div style="display:flex; gap:4px;">
        <button data-role="delete" style="background:#ffe5e5;">Delete</button>
      </div>
    `;
    const btnRow = li.querySelector('.difficulty-buttons') as HTMLDivElement;
    ['easy','hard','unknown','review','medium','focus','mastered','active'].forEach(diff => {
      const b = document.createElement('button');
      b.textContent = diff;
      b.onclick = () => updateDifficulty(card.id, diff);
      btnRow.appendChild(b);
    });
    const backEl = li.querySelector('[data-role="back"]') as HTMLDivElement;
    backEl.onblur = () => saveBack(card.id, backEl.textContent || card.back);
    const delBtn = li.querySelector('[data-role="delete"]') as HTMLButtonElement;
    delBtn.onclick = () => deleteCard(card.id);
    listEl.appendChild(li);
  });
}

function loadFlashcards(listEl: HTMLUListElement, emptyEl: HTMLElement, analyticsEl?: HTMLElement) {
  chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
    cachedCards = data.flashcards || [];
    renderFlashcards(listEl, emptyEl, cachedCards);
    updateAnalytics(analyticsEl);
  });
}

function updateDifficulty(id: string, difficulty: string) {
  chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
    const cards = data.flashcards || [];
    const card = cards.find(c => c.id === id);
    if (card) {
      card.difficulty = difficulty;
      const next = schedule(card, difficulty);
      Object.assign(card, next);
      chrome.storage.local.set({ flashcards: cards }, () => {
        cachedCards = cards;
        const listEl = document.getElementById('flashcard-list') as HTMLUListElement;
        const emptyEl = document.getElementById('empty') as HTMLElement;
        renderFlashcards(listEl, emptyEl, cards);
        updateAnalytics(document.getElementById('analytics'));
      });
    }
  });
}

function saveBack(id: string, newBack: string) {
  chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
    const cards = data.flashcards || [];
    const card = cards.find(c => c.id === id);
    if (card) {
      card.back = newBack;
      chrome.storage.local.set({ flashcards: cards });
    }
  });
}

function deleteCard(id: string) {
  chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
    const cards = (data.flashcards || []).filter(c => c.id !== id);
    chrome.storage.local.set({ flashcards: cards }, () => {
      cachedCards = cards;
      const listEl = document.getElementById('flashcard-list') as HTMLUListElement;
      const emptyEl = document.getElementById('empty') as HTMLElement;
      renderFlashcards(listEl, emptyEl, cards);
      updateAnalytics(document.getElementById('analytics'));
    });
  });
}

function addHighlighted(listEl: HTMLUListElement, emptyEl: HTMLElement) {
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
            ...initSRS()
          };
          chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
            const flashcards = data.flashcards || [];
            flashcards.push(newCard);
            chrome.storage.local.set({ flashcards }, () => {
              cachedCards = flashcards;
              renderFlashcards(listEl, emptyEl, flashcards);
              updateAnalytics(document.getElementById('analytics'));
            });
          });
        }
      }
    );
  });
}

function updateAnalytics(analyticsEl?: HTMLElement | null) {
  if (!analyticsEl) return;
  const data = aggregate(cachedCards);
  if (cachedCards.length === 0) {
    analyticsEl.style.display = 'none';
    return;
  }
  analyticsEl.style.display = 'block';
  const countsDiv = document.getElementById('counts')!;
  const dueDiv = document.getElementById('due')!;
  const progressFill = document.getElementById('progress-fill') as HTMLDivElement;
  const parts = Object.entries(data.counts).map(([k, v]) => `${k}: ${v}`).join(' · ');
  countsDiv.textContent = parts;
  dueDiv.textContent = `Due now: ${data.due}`;
  progressFill.style.width = `${Math.min(100, data.masteredPercent).toFixed(1)}%`;
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(cachedCards, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'flashcards-export.json'; a.click();
  URL.revokeObjectURL(url);
}

function importJSON(file: File, listEl: HTMLUListElement, emptyEl: HTMLElement) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string);
      if (Array.isArray(parsed)) {
        const byId: Record<string, Flashcard> = {};
        [...cachedCards, ...parsed].forEach(c => { byId[c.id] = c; });
        const merged = Object.values(byId);
        chrome.storage.local.set({ flashcards: merged }, () => {
          cachedCards = merged;
          renderFlashcards(listEl, emptyEl, cachedCards);
          updateAnalytics(document.getElementById('analytics'));
        });
      }
    } catch (e) {
      console.error('Import failed', e);
    }
  };
  reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', () => {
  const listEl = document.getElementById('flashcard-list') as HTMLUListElement;
  const addBtn = document.getElementById('add-flashcard') as HTMLButtonElement;
  const refreshBtn = document.getElementById('refresh') as HTMLButtonElement;
  const emptyEl = document.getElementById('empty') as HTMLElement;
  const gestureBtn = document.getElementById('start-gesture') as HTMLButtonElement;
  const gestureStatus = document.getElementById('gesture-status') as HTMLDivElement;
  const searchInput = document.getElementById('search') as HTMLInputElement;
  const analyticsEl = document.getElementById('analytics') as HTMLDivElement;
  const exportBtn = document.getElementById('export') as HTMLButtonElement;
  const importInput = document.getElementById('import') as HTMLInputElement;

  loadFlashcards(listEl, emptyEl, analyticsEl);

  addBtn.onclick = () => addHighlighted(listEl, emptyEl);
  refreshBtn.onclick = () => loadFlashcards(listEl, emptyEl, analyticsEl);

  gestureBtn.onclick = () => {
    const url = chrome.runtime.getURL('gesture-page.html');
    chrome.tabs.create({ url });
    gestureStatus.textContent = 'Opened gesture mode in new tab.';
  };

  searchInput.oninput = () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    renderFlashcards(listEl, emptyEl, cachedCards);
  };

  exportBtn.onclick = exportJSON;
  importInput.onchange = () => {
    if (importInput.files && importInput.files[0]) {
      importJSON(importInput.files[0], listEl, emptyEl);
      importInput.value = '';
    }
  };
});