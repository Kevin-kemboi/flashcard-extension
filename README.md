# Flashcard Builder Chrome Extension

A Chrome extension for creating flashcards from selected text and updating their difficulty using hand gestures detected via TensorFlow.js and Handpose.

## Features
- Create flashcards from selected text via a context menu or popup interface.
- Store flashcards persistently in `chrome.storage.local`.
- Update flashcard difficulty using hand gestures:
  - **Thumbs up**: Sets difficulty to `easy`
  - **Thumbs down**: Sets difficulty to `hard`
  - **Flat palm**: Sets difficulty to `unknown`
  - **Fist**: Sets difficulty to `review`
  - **Peace sign**: Sets difficulty to `medium`
  - **Pinch**: Sets difficulty to `focus`
  - **OK sign**: Sets difficulty to `mastered`
  - **Point**: Sets difficulty to `active`
- Jest tests to verify flashcard storage and gesture mapping logic.
- Standalone gesture detection test page (`gesture-core/test.html`).
- Hosted demo available on Netlify.

## Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Kevin-kemboi/flashcard-extension.git
   cd flashcard-extension
   ```

## Hosting on Netlify

This project includes a demo website that can be hosted on Netlify to showcase the gesture recognition functionality.

### Deploy to Netlify

1. **Sign up for Netlify**:
   Create an account at [netlify.com](https://www.netlify.com/)

2. **Connect to GitHub**:
   - From your Netlify dashboard, click "New site from Git"
   - Connect to GitHub and select your fork of this repository
   - Configure build settings:
     - Build command: `npm run build`
     - Publish directory: `.`

3. **Deploy**:
   Click "Deploy site" and wait for the build to complete.

4. **Manual Deployment Using Netlify CLI**:
   ```bash
   # Install Netlify CLI globally
   npm install -g netlify-cli

   # Login to Netlify
   netlify login

   # Deploy to Netlify
   npm run netlify:deploy
   ```

5. **Access the Demo**:
   Once deployed, access the gesture test page at:
   `https://your-netlify-site.netlify.app/gesture-core/test.html`

