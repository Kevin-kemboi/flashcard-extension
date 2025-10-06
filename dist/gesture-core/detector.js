// AF: Detects hand gestures using TensorFlow.js and maps them to flashcard actions.
// RI: Webcam is accessible; TensorFlow.js model is loaded.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { gestureToDifficulty } from './gestures';
export class GestureDetector {
    constructor(video) {
        this.model = null;
        this.video = video;
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // Try WebGL first, fallback to CPU if unavailable (prevents silent failure in some environments like headless / embedded viewers)
            try {
                yield tf.setBackend('webgl');
            }
            catch (e) {
                console.warn('[GestureDetector] WebGL backend failed, falling back to CPU:', e);
                yield tf.setBackend('cpu');
            }
            yield tf.ready();
            console.log('[GestureDetector] Using backend:', tf.getBackend());
            this.model = yield handpose.load();
            console.log('[GestureDetector] Handpose model loaded');
            yield this.setupWebcam();
            console.log('[GestureDetector] Webcam initialized');
        });
    }
    setupWebcam() {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = yield navigator.mediaDevices.getUserMedia({ video: true });
            this.video.srcObject = stream;
            yield new Promise((resolve) => {
                this.video.onloadedmetadata = () => resolve();
            });
            this.video.play();
        });
    }
    detectGesture() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.model)
                return null;
            const predictions = yield this.model.estimateHands(this.video).catch(err => {
                console.error('[GestureDetector] estimateHands error', err);
                return [];
            });
            if (predictions.length === 0)
                return null;
            const landmarks = predictions[0].landmarks;
            const [thumbTip, indexTip, middleTip, ringTip, pinkyTip] = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
            const wrist = landmarks[0];
            const y = (p) => p[1];
            const x = (p) => p[0];
            const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
            // Basic vertical relation for thumbs up / down
            if (y(thumbTip) + 15 < y(indexTip))
                return 'thumbs_up';
            if (y(thumbTip) - 15 > y(indexTip))
                return 'thumbs_down';
            // Fist: all finger tips close to wrist
            const avgFingerDist = [thumbTip, indexTip, middleTip, ringTip, pinkyTip].reduce((s, f) => s + dist(f, wrist), 0) / 5;
            if (avgFingerDist < 60)
                return 'fist';
            // Peace: index and middle extended (higher than ring & pinky), ring & pinky curled
            if (y(indexTip) + 10 < y(ringTip) && y(middleTip) + 10 < y(ringTip)) {
                if (y(ringTip) > y(indexTip) && y(pinkyTip) > y(indexTip))
                    return 'peace';
            }
            // Pinch: thumb and index very close
            if (dist(thumbTip, indexTip) < 30 && dist(indexTip, middleTip) > 40)
                return 'pinch';
            // OK sign: thumb and index close AND middle further AND circle formed heuristic
            if (dist(thumbTip, indexTip) < 25 && dist(middleTip, indexTip) > 45)
                return 'ok_sign';
            // Point: index far extended relative to middle & ring & pinky (index much higher)
            if (y(indexTip) + 20 < y(middleTip) && y(indexTip) + 20 < y(ringTip) && y(indexTip) + 20 < y(pinkyTip))
                return 'point';
            // Flat palm: spread fingers (large horizontal spread) and vertical alignment similar
            const xs = [thumbTip, indexTip, middleTip, ringTip, pinkyTip].map(p => x(p));
            const spread = Math.max(...xs) - Math.min(...xs);
            if (spread > 180)
                return 'flat_palm';
            return null;
        });
    }
    updateFlashcardDifficulty(flashcardId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gesture = yield this.detectGesture();
            if (!gesture)
                return;
            const difficulty = gestureToDifficulty[gesture];
            chrome.storage.local.get(['flashcards'], (data) => {
                const flashcards = data.flashcards || [];
                const card = flashcards.find((c) => c.id === flashcardId);
                if (card) {
                    card.difficulty = difficulty;
                    chrome.storage.local.set({ flashcards });
                }
            });
        });
    }
}
//# sourceMappingURL=detector.js.map