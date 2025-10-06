import { GestureDetector } from '../gesture-core/detector';
import { gestureToDifficulty } from '../gesture-core/gestures';

interface Flashcard { id: string; front: string; back: string; difficulty?: string; }

const video = document.getElementById('video') as HTMLVideoElement;
const statusEl = document.getElementById('status') as HTMLSpanElement;
const currentCardEl = document.getElementById('currentCard') as HTMLDivElement;
const gestureBadge = document.getElementById('gestureBadge') as HTMLSpanElement;
const difficultyBadge = document.getElementById('difficultyBadge') as HTMLSpanElement;
const fpsEl = document.getElementById('fps') as HTMLSpanElement;
const logEl = document.getElementById('log') as HTMLDivElement;
const lastGestureRow = document.getElementById('lastGestureRow') as HTMLDivElement;

const backBtn = document.getElementById('back') as HTMLButtonElement;
const cycleBtn = document.getElementById('cycle') as HTMLButtonElement;
const toggleBtn = document.getElementById('toggle') as HTMLButtonElement;

let detector: GestureDetector | null = null;
let running = true;
let activeIndex = 0;
let cards: Flashcard[] = [];
let frameCounter = 0;
let fpsTimer = performance.now();
let lastGesture: string | null = null;

function log(msg: string) {
  const time = new Date().toLocaleTimeString();
  logEl.innerHTML = `<div>[${time}] ${msg}</div>` + logEl.innerHTML;
  const entries = logEl.querySelectorAll('div');
  if (entries.length > 100) entries[entries.length - 1].remove();
}

function loadCards() {
  chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
    cards = data.flashcards || [];
    if (cards.length === 0) {
      currentCardEl.textContent = '(No flashcards)';
    } else {
      activeIndex = Math.min(activeIndex, cards.length - 1);
      displayActive();
    }
  });
}

function displayActive() {
  if (cards.length === 0) return;
  const c = cards[activeIndex];
  currentCardEl.textContent = `${activeIndex + 1}/${cards.length}: ${c.front} → ${c.back} [${c.difficulty || 'unknown'}]`;
}

async function init() {
  statusEl.textContent = 'Initializing…';
  detector = new GestureDetector(video);
  try {
    await detector.initialize();
    statusEl.textContent = 'Running';
    lastGestureRow.style.display = 'flex';
    loop();
  } catch (e) {
    statusEl.textContent = 'Error initializing';
    log('Init error ' + (e as Error).message);
  }
}

function updateDifficulty(cardId: string, difficulty: string) {
  chrome.storage.local.get(['flashcards'], (data: { flashcards?: Flashcard[] }) => {
    const stored = data.flashcards || [];
    const target = stored.find(c => c.id === cardId);
    if (target) {
      target.difficulty = difficulty;
      chrome.storage.local.set({ flashcards: stored }, () => {
        log(`Difficulty updated → ${difficulty}`);
        cards = stored;
        displayActive();
      });
    }
  });
}

async function loop() {
  if (!detector || !running) {
    requestAnimationFrame(loop);
    return;
  }
  const g = await detector.detectGesture();
  frameCounter++;
  const now = performance.now();
  if (now - fpsTimer >= 1000) {
    fpsEl.textContent = String(frameCounter);
    frameCounter = 0; fpsTimer = now;
  }
  if (g && g !== lastGesture) {
    lastGesture = g;
    gestureBadge.textContent = g;
    gestureBadge.className = 'badge ' + (g.replace(/[^a-z_]/g,'') || 'unknown');
    const diff = gestureToDifficulty[g as keyof typeof gestureToDifficulty];
    if (diff) {
      difficultyBadge.textContent = diff;
      difficultyBadge.className = 'badge ' + diff;
      if (cards.length) updateDifficulty(cards[activeIndex].id, diff);
    }
  }
  requestAnimationFrame(loop);
}

backBtn.onclick = () => {
  window.close();
};

cycleBtn.onclick = () => {
  if (cards.length === 0) return;
  activeIndex = (activeIndex + 1) % cards.length;
  displayActive();
};

toggleBtn.onclick = () => {
  running = !running;
  toggleBtn.textContent = running ? 'Pause' : 'Resume';
  statusEl.textContent = running ? 'Running' : 'Paused';
};

loadCards();
init();
