"use strict";
// Compiled enhanced popup logic
// Utility functions (lightweight reproduction of TS logic)
const difficultyList = ['easy', 'hard', 'unknown', 'review', 'medium', 'focus', 'mastered', 'active'];
let cachedCards = [];
let searchTerm = '';
function renderFlashcards(listEl, emptyEl, cards) {
    listEl.innerHTML = '';
    const filtered = cards.filter(c => {
        if (!searchTerm)
            return true;
        const st = searchTerm.toLowerCase();
        return (c.front || '').toLowerCase().includes(st) || (c.back || '').toLowerCase().includes(st) || (c.difficulty || '').toLowerCase().includes(st);
    });
    if (filtered.length === 0) {
        emptyEl.style.display = 'block';
        return;
    }
    emptyEl.style.display = 'none';
    filtered.forEach(card => {
        const li = document.createElement('li');
        li.dataset.id = card.id;
        li.innerHTML = `\n      <div class="front">${card.front}</div>\n      <div class="back" contenteditable="true" data-role="back">${card.back}</div>\n      <div class="meta">\n        <span class="badge ${card.difficulty || 'unknown'}">${card.difficulty || 'unknown'}</span>\n        <span style="font-size:10px; color:#555;">${card.nextReview ? new Date(card.nextReview).toLocaleDateString() : ''}</span>\n      </div>\n      <div class="difficulty-buttons"></div>\n      <div style="display:flex; gap:4px;">\n        <button data-role="delete" style="background:#ffe5e5;">Delete</button>\n      </div>\n    `;
        const btnRow = li.querySelector('.difficulty-buttons');
        difficultyList.forEach(diff => {
            const b = document.createElement('button');
            b.textContent = diff;
            b.addEventListener('click', () => updateDifficulty(card.id, diff));
            btnRow.appendChild(b);
        });
        const backEl = li.querySelector('[data-role="back"]');
        backEl.addEventListener('blur', () => saveBack(card.id, backEl.textContent || card.back));
        const delBtn = li.querySelector('[data-role="delete"]');
        delBtn.addEventListener('click', () => deleteCard(card.id));
        listEl.appendChild(li);
    });
}
function loadFlashcards(listEl, emptyEl, analyticsEl) {
    chrome.storage.local.get(['flashcards'], (data) => {
        cachedCards = data.flashcards || [];
        renderFlashcards(listEl, emptyEl, cachedCards);
        updateAnalytics(analyticsEl);
    });
}
// Minimal schedule function (mirrors unknown immediate revisit)
function scheduleCard(card, difficulty) {
    const now = Date.now();
    if (!card.repetitions)
        card.repetitions = 0;
    if (!card.easeFactor)
        card.easeFactor = 2.5;
    if (!card.interval)
        card.interval = 0;
    switch (difficulty) {
        case 'unknown':
            card.repetitions = 0;
            card.easeFactor = Math.max(1.3, (card.easeFactor || 2.5) - 0.4);
            card.interval = 0;
            card.nextReview = new Date(now + 5 * 60 * 1000).toISOString();
            break;
        case 'easy':
            card.repetitions += 1;
            card.easeFactor += 0.15;
            if (card.repetitions === 1)
                card.interval = 1;
            else if (card.repetitions === 2)
                card.interval = 3;
            else
                card.interval = Math.round(card.interval * card.easeFactor);
            card.nextReview = new Date(now + card.interval * 24 * 60 * 60 * 1000).toISOString();
            break;
        case 'hard':
            card.easeFactor -= 0.3;
            card.repetitions = 0;
            card.interval = 1;
            card.nextReview = new Date(now + 24 * 60 * 60 * 1000).toISOString();
            break;
        default:
            card.repetitions += 1;
            card.interval = Math.max(1, card.interval || 1);
            card.nextReview = new Date(now + card.interval * 24 * 60 * 60 * 1000).toISOString();
    }
    return card;
}
function updateDifficulty(id, difficulty) {
    chrome.storage.local.get(['flashcards'], (data) => {
        const cards = data.flashcards || [];
        const card = cards.find(c => c.id === id);
        if (card) {
            card.difficulty = difficulty;
            scheduleCard(card, difficulty);
            chrome.storage.local.set({ flashcards: cards }, () => {
                cachedCards = cards;
                const listEl = document.getElementById('flashcard-list');
                const emptyEl = document.getElementById('empty');
                renderFlashcards(listEl, emptyEl, cards);
                updateAnalytics(document.getElementById('analytics'));
            });
        }
    });
}
function saveBack(id, newBack) {
    chrome.storage.local.get(['flashcards'], (data) => {
        const cards = data.flashcards || [];
        const card = cards.find(c => c.id === id);
        if (card) {
            card.back = newBack;
            chrome.storage.local.set({ flashcards: cards });
        }
    });
}
function deleteCard(id) {
    chrome.storage.local.get(['flashcards'], (data) => {
        const cards = (data.flashcards || []).filter(c => c.id !== id);
        chrome.storage.local.set({ flashcards: cards }, () => {
            cachedCards = cards;
            const listEl = document.getElementById('flashcard-list');
            const emptyEl = document.getElementById('empty');
            renderFlashcards(listEl, emptyEl, cards);
            updateAnalytics(document.getElementById('analytics'));
        });
    });
}
function addHighlighted(listEl, emptyEl) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => window.getSelection()?.toString(),
        }, (results) => {
            var _a;
            const selectedText = (_a = results[0]) === null || _a === void 0 ? void 0 : _a.result;
            if (selectedText) {
                const newCard = {
                    id: Date.now().toString(),
                    front: selectedText,
                    back: 'Define this',
                    difficulty: 'unknown',
                    repetitions: 0,
                    easeFactor: 2.5,
                    interval: 0,
                    nextReview: new Date().toISOString()
                };
                chrome.storage.local.get(['flashcards'], (data) => {
                    const flashcards = data.flashcards || [];
                    flashcards.push(newCard);
                    chrome.storage.local.set({ flashcards }, () => {
                        cachedCards = flashcards;
                        renderFlashcards(listEl, emptyEl, flashcards);
                        updateAnalytics(document.getElementById('analytics'));
                    });
                });
            }
        });
    });
}
function updateAnalytics(analyticsEl) {
    if (!analyticsEl)
        return;
    if (cachedCards.length === 0) {
        analyticsEl.style.display = 'none';
        return;
    }
    analyticsEl.style.display = 'block';
    const counts = {};
    let due = 0;
    const now = Date.now();
    cachedCards.forEach(c => {
        const d = c.difficulty || 'unknown';
        counts[d] = (counts[d] || 0) + 1;
        if (!c.nextReview || new Date(c.nextReview).getTime() <= now)
            due += 1;
    });
    const total = cachedCards.length || 1;
    const masteredPercent = ((counts['mastered'] || 0) / total) * 100;
    document.getElementById('counts').textContent = Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join(' · ');
    document.getElementById('due').textContent = `Due now: ${due}`;
    const progressFill = document.getElementById('progress-fill');
    progressFill.style.width = `${Math.min(100, masteredPercent).toFixed(1)}%`;
}
function exportJSON() {
    const blob = new Blob([JSON.stringify(cachedCards, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'flashcards-export.json'; a.click();
    URL.revokeObjectURL(url);
}
function importJSON(file, listEl, emptyEl) {
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            if (Array.isArray(parsed)) {
                const map = {};
                [...cachedCards, ...parsed].forEach(c => { map[c.id] = c; });
                const merged = Object.values(map);
                chrome.storage.local.set({ flashcards: merged }, () => {
                    cachedCards = merged;
                    renderFlashcards(listEl, emptyEl, cachedCards);
                    updateAnalytics(document.getElementById('analytics'));
                });
            }
        }
        catch (e) {
            console.error('Import failed', e);
        }
    };
    reader.readAsText(file);
}
document.addEventListener('DOMContentLoaded', () => {
    const listEl = document.getElementById('flashcard-list');
    const addBtn = document.getElementById('add-flashcard');
    const refreshBtn = document.getElementById('refresh');
    const emptyEl = document.getElementById('empty');
    const gestureBtn = document.getElementById('start-gesture');
    const gestureStatus = document.getElementById('gesture-status');
    const searchInput = document.getElementById('search');
    const analyticsEl = document.getElementById('analytics');
    const exportBtn = document.getElementById('export');
    const importInput = document.getElementById('import');
    loadFlashcards(listEl, emptyEl, analyticsEl);
    addBtn.addEventListener('click', () => addHighlighted(listEl, emptyEl));
    refreshBtn.addEventListener('click', () => loadFlashcards(listEl, emptyEl, analyticsEl));
    gestureBtn.addEventListener('click', () => {
        const url = chrome.runtime.getURL('gesture-page.html');
        chrome.tabs.create({ url });
        gestureStatus.textContent = 'Opened gesture mode in new tab.';
    });
    searchInput.addEventListener('input', () => {
        searchTerm = searchInput.value.trim().toLowerCase();
        renderFlashcards(listEl, emptyEl, cachedCards);
    });
    exportBtn.addEventListener('click', exportJSON);
    importInput.addEventListener('change', () => {
        var _a;
        if (((_a = importInput.files) === null || _a === void 0 ? void 0 : _a[0])) {
            importJSON(importInput.files[0], listEl, emptyEl);
            importInput.value = '';
        }
    });
});