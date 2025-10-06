// AF: Detects hand gestures using TensorFlow.js and maps them to flashcard actions.
// RI: Webcam is accessible; TensorFlow.js model is loaded.

// Use modular TensorFlow packages (avoid loading meta @tensorflow/tfjs multiple times)
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-converter';
import { setBackend, ready, getBackend } from '@tensorflow/tfjs-core';
import * as handpose from '@tensorflow-models/handpose';
import { Gesture, gestureToDifficulty } from './gestures';

export class GestureDetector {
  private model: handpose.HandPose | null = null;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  async initialize(): Promise<void> {
    // Try WebGL first, fallback to CPU if unavailable (prevents silent failure in some environments like headless / embedded viewers)
    try {
      await setBackend('webgl');
    } catch (e) {
      console.warn('[GestureDetector] WebGL backend failed, falling back to CPU:', e);
      await setBackend('cpu');
    }
    await ready();
    console.log('[GestureDetector] Using backend:', getBackend());
    this.model = await handpose.load();
    console.log('[GestureDetector] Handpose model loaded');
    await this.setupWebcam();
    console.log('[GestureDetector] Webcam initialized');
  }

  private async setupWebcam(): Promise<void> {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    this.video.srcObject = stream;
    await new Promise<void>((resolve) => {
      this.video.onloadedmetadata = () => resolve();
    });
    this.video.play();
  }

  async detectGesture(): Promise<Gesture | null> {
    if (!this.model) return null;
    const predictions = await this.model.estimateHands(this.video).catch(err => {
      console.error('[GestureDetector] estimateHands error', err);
      return [] as any[];
    });
    if (predictions.length === 0) return null;

    const landmarks = predictions[0].landmarks as number[][];
    const [thumbTip, indexTip, middleTip, ringTip, pinkyTip] = [landmarks[4], landmarks[8], landmarks[12], landmarks[16], landmarks[20]];
    const wrist = landmarks[0];

    const y = (p: number[]) => p[1];
    const x = (p: number[]) => p[0];
    const dist = (a: number[], b: number[]) => Math.hypot(a[0]-b[0], a[1]-b[1]);

    // Basic vertical relation for thumbs up / down
    if (y(thumbTip) + 15 < y(indexTip)) return 'thumbs_up';
    if (y(thumbTip) - 15 > y(indexTip)) return 'thumbs_down';

    // Fist: all finger tips close to wrist
    const avgFingerDist = [thumbTip, indexTip, middleTip, ringTip, pinkyTip].reduce((s,f)=>s+dist(f,wrist),0)/5;
    if (avgFingerDist < 60) return 'fist';

    // Peace: index and middle extended (higher than ring & pinky), ring & pinky curled
    if (y(indexTip) + 10 < y(ringTip) && y(middleTip) + 10 < y(ringTip)) {
      if (y(ringTip) > y(indexTip) && y(pinkyTip) > y(indexTip)) return 'peace';
    }

    // Pinch: thumb and index very close
    if (dist(thumbTip, indexTip) < 30 && dist(indexTip, middleTip) > 40) return 'pinch';

    // OK sign: thumb and index close AND middle further AND circle formed heuristic
    if (dist(thumbTip, indexTip) < 25 && dist(middleTip, indexTip) > 45) return 'ok_sign';

    // Point: index far extended relative to middle & ring & pinky (index much higher)
    if (y(indexTip) + 20 < y(middleTip) && y(indexTip) + 20 < y(ringTip) && y(indexTip) + 20 < y(pinkyTip)) return 'point';

    // Flat palm: spread fingers (large horizontal spread) and vertical alignment similar
    const xs = [thumbTip, indexTip, middleTip, ringTip, pinkyTip].map(p=>x(p));
    const spread = Math.max(...xs) - Math.min(...xs);
    if (spread > 180) return 'flat_palm';

    return null;
  }

  async updateFlashcardDifficulty(flashcardId: string): Promise<void> {
    const gesture = await this.detectGesture();
    if (!gesture) return;

    const difficulty = gestureToDifficulty[gesture];
    chrome.storage.local.get(['flashcards'], (data: { flashcards?: any[] }) => {
      const flashcards = data.flashcards || [];
      const card = flashcards.find((c: any) => c.id === flashcardId);
      if (card) {
        card.difficulty = difficulty;
        chrome.storage.local.set({ flashcards });
      }
    });
  }
}