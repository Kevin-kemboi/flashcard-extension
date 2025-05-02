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
            yield tf.setBackend('webgl');
            this.model = yield handpose.load();
            yield this.setupWebcam();
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
            const predictions = yield this.model.estimateHands(this.video);
            if (predictions.length === 0)
                return null;
            // Simplified gesture detection (pseudo-logic)
            const landmarks = predictions[0].landmarks;
            const thumbTip = landmarks[4];
            const indexTip = landmarks[8];
            if (thumbTip[1] < indexTip[1])
                return 'thumbs_up';
            if (thumbTip[1] > indexTip[1])
                return 'thumbs_down';
            return 'flat_palm';
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