# Flashcard Extension Setup Instructions

## ✅ What's Already Running

1. **Tests Passed**: All Jest tests are passing ✓
2. **Gesture Test Page**: Available at http://localhost:63883/test.html ✓
3. **TypeScript Compiled**: All .js files are generated ✓
4. **Dependencies Installed**: All npm packages are ready ✓

## 🚀 How to Load the Chrome Extension

### Step 1: Open Chrome Extension Management
1. Open Google Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)

### Step 2: Load the Extension
1. Click "Load unpacked"
2. Select the folder: `c:\Users\KEVIN\Desktop\flashcard-extension\extension`
3. The "Flashcard Builder" extension should now appear in your extensions list

### Step 3: Test the Extension
1. Navigate to any webpage
2. Highlight some text
3. Right-click and select "Add to Flashcards"
4. Click the extension icon in the toolbar to view your flashcards
5. Or use the "Add Highlighted Text" button in the popup

## 🎯 Test Gesture Detection
1. Open http://localhost:63883/test.html in your browser
2. Allow camera access when prompted
3. Make hand gestures in front of your camera:
   - **Thumbs up** → "easy" difficulty
   - **Thumbs down** → "hard" difficulty  
   - **Flat palm** → "unknown" difficulty

## 📊 Backend Server (Optional)
The PostgreSQL backend server requires:
1. PostgreSQL installed and running on port 5432
2. Database named "flashcards" 
3. Update credentials in `backend/src/server.ts`

To run the backend:
```bash
cd backend
node src/server.js
```

## 🧪 Run Tests
```bash
npx jest
```

## 🔧 Rebuild if Needed
```bash
# Compile TypeScript
npx tsc

# Bundle gesture detection
npx esbuild gesture-core/test-gesture.ts --bundle --outfile=gesture-core/bundle.js --format=iife
```

## 📁 File Structure
- `extension/` - Chrome extension files
- `gesture-core/` - Hand gesture detection using TensorFlow.js
- `backend/` - Express.js API server (optional)
- `tests/` - Jest test files