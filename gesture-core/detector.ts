// AF: Detects hand gestures using TensorFlow.js and maps them to flashcard actions.
// RI: Webcam is accessible; TensorFlow.js model is loaded.

import * as tf from '@tensorflow/tfjs';
import * as handpose from '@tensorflow-models/handpose';
import { Gesture, gestureToDifficulty } from './gestures';

export class GestureDetector {
  private model: handpose.HandPose | null = null;
  private video: HTMLVideoElement;

  constructor(video: HTMLVideoElement) {
    this.video = video;
  }

  async initialize(): Promise<void> {
    await tf.setBackend('webgl');
    this.model = await handpose.load();
    await this.setupWebcam();
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
    const predictions = await this.model.estimateHands(this.video);
    if (predictions.length === 0) return null;

    // Simplified gesture detection (pseudo-logic)
    const landmarks = predictions[0].landmarks;
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    if (thumbTip[1] < indexTip[1]) return 'thumbs_up';
    if (thumbTip[1] > indexTip[1]) return 'thumbs_down';
    return 'flat_palm';
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