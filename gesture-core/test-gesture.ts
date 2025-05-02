import { GestureDetector } from './detector';

// Example usage for testing gesture detection
async function testGestureDetection() {
  const video = document.createElement('video');
  document.body.appendChild(video);
  const detector = new GestureDetector(video);
  await detector.initialize();
  setInterval(async () => {
    const gesture = await detector.detectGesture();
    console.log('Detected:', gesture);
  }, 1000);
}

// Run the test
testGestureDetection().catch(console.error);