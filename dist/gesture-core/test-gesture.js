var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        startBtn: container.querySelector('#startBtn'),
        status: container.querySelector('#status'),
        gestureEl: container.querySelector('#gesture'),
        difficultyEl: container.querySelector('#difficulty'),
        fpsEl: container.querySelector('#fps'),
        env: container.querySelector('#env'),
        video: container.querySelector('#gestureVideo'),
    };
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const ui = createUI();
        ui.env.textContent = `UserAgent: ${navigator.userAgent}`;
        let detector = null;
        let loopHandle = null;
        let lastFrameTime = performance.now();
        let frameCounter = 0;
        let fpsTimer = performance.now();
        const start = (restart = false) => __awaiter(this, void 0, void 0, function* () {
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
                yield detector.initialize();
                ui.status.textContent = 'Detecting (wave your hand)…';
                const runLoop = () => __awaiter(this, void 0, void 0, function* () {
                    if (!detector)
                        return;
                    const gesture = yield detector.detectGesture();
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
                        if (diff)
                            ui.difficultyEl.textContent = diff;
                    }
                    requestAnimationFrame(runLoop);
                });
                requestAnimationFrame(runLoop);
            }
            catch (err) {
                console.error(err);
                ui.status.textContent = 'Error: ' + err.message;
            }
        });
        ui.startBtn.onclick = () => start(true);
        // Auto-start after short delay for convenience
        setTimeout(() => start(false), 400);
        window.addEventListener('beforeunload', () => {
            if (loopHandle)
                window.clearTimeout(loopHandle);
            if (ui.video.srcObject) {
                ui.video.srcObject.getTracks().forEach(t => t.stop());
            }
        });
    });
}
main().catch(e => console.error('[Gesture Test] Fatal', e));
//# sourceMappingURL=test-gesture.js.map