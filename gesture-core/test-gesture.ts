import { GestureDetector } from './detector';
import { gestureToDifficulty } from './gestures';

function createUI() {
  const container = document.createElement('div');
  container.style.cssText = 'font-family: system-ui, sans-serif; padding:12px; max-width:680px;';
  container.innerHTML = `
    <h1>Gesture Detection Test</h1>
    <p id="env"></p>
    <button id="startBtn" style="padding:8px 14px; font-size:14px; cursor:pointer;">Start / Restart Camera</button>
    <p id="status" style="margin-top:10px; color:#555;">Idle.</p>
    <div style="display:flex; gap:28px; flex-wrap:wrap; margin:8px 0 4px;">
      <div><strong>Last Gesture:</strong> <span id="gesture">(none)</span></div>
      <div><strong>Mapped Difficulty:</strong> <span id="difficulty">(n/a)</span></div>
      <div><strong>FPS:</strong> <span id="fps">0</span></div>
    </div>
    <details style="margin-top:4px;">
      <summary style="cursor:pointer;">Gesture Legend</summary>
      <ul style="line-height:1.4; margin:6px 0 0 18px;">
        <li>Thumb Up → easy</li>
        <li>Thumb Down → hard</li>
        <li>Flat Palm → unknown</li>
        <li>Fist → review</li>
        <li>Peace ✌️ → medium</li>
        <li>Pinch → focus</li>
        <li>OK Sign → mastered</li>
        <li>Point → active</li>
      </ul>
    </details>
    <video id="gestureVideo" width="640" height="480" style="background:#000; display:block; margin-top:12px; border-radius:4px;" playsinline muted></video>
    <p style="font-size:12px; color:#777; margin-top:6px;">Tips: Good lighting improves recognition. Move hand ~40–70cm from camera. Keep background contrast high.</p>
  `;
  document.body.prepend(container);
  return {
    startBtn: container.querySelector('#startBtn') as HTMLButtonElement,
    status: container.querySelector('#status') as HTMLParagraphElement,
  gestureEl: container.querySelector('#gesture') as HTMLSpanElement,
  difficultyEl: container.querySelector('#difficulty') as HTMLSpanElement,
  fpsEl: container.querySelector('#fps') as HTMLSpanElement,
    env: container.querySelector('#env') as HTMLParagraphElement,
    video: container.querySelector('#gestureVideo') as HTMLVideoElement,
  };
}

async function main() {
  const ui = createUI();
  ui.env.textContent = `UserAgent: ${navigator.userAgent}`;
  let detector: GestureDetector | null = null;
  let loopHandle: number | null = null;
  let lastFrameTime = performance.now();
  let frameCounter = 0;
  let fpsTimer = performance.now();

  const start = async (restart=false) => {
    if (detector && !restart) {
      ui.status.textContent = 'Already running';
      return;
    }
    if (loopHandle) {
      window.clearTimeout(loopHandle);
      loopHandle = null;
    }
    ui.status.textContent = 'Loading model...';
    try {
      detector = new GestureDetector(ui.video);
      await detector.initialize();
      ui.status.textContent = 'Detecting (wave your hand)…';
      const runLoop = async () => {
        if (!detector) return;
        const gesture = await detector.detectGesture();
        frameCounter++;
        const now = performance.now();
        if (now - fpsTimer >= 1000) {
          ui.fpsEl.textContent = String(frameCounter);
          frameCounter = 0;
          fpsTimer = now;
        }
        if (gesture) {
          ui.gestureEl.textContent = gesture;
          const diff = gestureToDifficulty[gesture];
          if (diff) ui.difficultyEl.textContent = diff;
        }
        requestAnimationFrame(runLoop);
      };
      requestAnimationFrame(runLoop);
    } catch (err) {
      console.error(err);
      ui.status.textContent = 'Error: ' + (err as Error).message;
    }
  };

  ui.startBtn.onclick = () => start(true);

  // Auto-start after short delay for convenience
  setTimeout(() => start(false), 400);

  window.addEventListener('beforeunload', () => {
    if (loopHandle) window.clearTimeout(loopHandle);
    if (ui.video.srcObject) {
      (ui.video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  });
}

main().catch(e => console.error('[Gesture Test] Fatal', e));