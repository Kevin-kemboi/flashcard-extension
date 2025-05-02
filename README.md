# Flashcard Builder Chrome Extension

A Chrome extension for creating flashcards from selected text and updating their difficulty using hand gestures detected via TensorFlow.js and Handpose.

## Features
- Create flashcards from selected text via a context menu or popup interface.
- Store flashcards persistently in `chrome.storage.local`.
- Update flashcard difficulty using hand gestures:
  - **Thumbs up**: Sets difficulty to `easy`.
  - **Thumbs down**: Sets difficulty to `hard`.
  - **Flat palm**: Sets difficulty to `unknown`.
- Jest tests to verify flashcard storage and gesture mapping logic.
- Standalone gesture detection test page (`gesture-core/test.html`).

## Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Kevin-kemboi/flashcard-extension.git
   cd flashcard-extension

