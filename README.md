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

Install Dependencies:
bash

npm install --legacy-peer-deps

Compile TypeScript:
bash

npx tsc

Generate Gesture Detection Bundle:
bash

npx esbuild gesture-core/test-gesture.ts --bundle --outfile=gesture-core/bundle.js --format=iife --platform=browser
npx esbuild gesture-core/detector.ts gesture-core/gestures.ts --bundle --outdir=extension --format=iife --platform=browser

Load the Extension in Chrome:
Open Chrome and navigate to chrome://extensions/.

Enable Developer mode (top right).

Click Load unpacked and select the extension/ folder.

The extension should appear as "Flashcard Builder".

Test Gesture Detection (Standalone):
bash

cd gesture-core
npx http-server

Open http://localhost:8080/test.html in a browser.

Grant webcam access and check the console for gesture logs (e.g., Detected: thumbs_up).

Usage
Create Flashcards:
Highlight text on any webpage, right-click, and select Add to Flashcards.

Alternatively, open the extension popup (click the extension icon) and click Add Flashcard with text selected.

Flashcards appear in the popup with format: <front> -> <back> (<difficulty>).

Update Difficulty with Gestures:
Open the extension popup.

Hover over a flashcard in the list.

Click Update Difficulty with Gesture.

Grant webcam access and perform a gesture (thumbs up, thumbs down, or flat palm).

The flashcard’s difficulty updates in the list and chrome.storage.local.

View Storage:
In Chrome DevTools (F12), go to **Application > Storage > Local Storage > chrome-extension://<extension-id>` to see stored flashcards.

Testing
Run Jest tests to verify functionality:
bash

npx jest

Expected Output:

PASS  tests/extension.test.ts
PASS  tests/gesture.test.ts
Test Suites: 2 passed, 2 total
Tests:       2 passed, 2 total

Project Structure
extension/: Chrome extension files (background script, popup, content script, manifest).

gesture-core/: Gesture detection logic using TensorFlow.js and Handpose.

tests/: Jest tests for flashcard storage and gesture mapping.

package.json: Project dependencies and configuration.

jest.config.js: Jest configuration for TypeScript and ES modules.

tsconfig.json: TypeScript configuration.

Dependencies
TensorFlow.js: @tensorflow/tfjs, @tensorflow-models/handpose for gesture detection.

TypeScript: For type-safe code.

Jest: For unit testing.

esbuild: For bundling gesture detection code.

Chrome APIs: For storage, tabs, scripting, and context menus.

License
MIT

---

### How to Use
1. **Copy the Content**:
   - Copy the entire markdown content above.

2. **Create or Update `README.md`**:
   - Open a text editor (e.g., Notepad) or your IDE.
   - Paste the content into a file named `README.md`.
   - Save it to `C:\Users\KEVIN\Desktop\FLASH-EXTENSION\README.md`.


