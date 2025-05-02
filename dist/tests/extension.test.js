var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// tests/extension.test.ts
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
describe('Extension Popup', () => {
    let originalChrome;
    beforeAll(() => {
        // Store original chrome object
        originalChrome = global.chrome;
    });
    afterAll(() => {
        // Restore original chrome object
        global.chrome = originalChrome;
    });
    test('should add flashcard to storage', () => __awaiter(void 0, void 0, void 0, function* () {
        const mockStorage = { flashcards: [] };
        // Create the mock implementation
        const chromeMock = {
            storage: {
                local: {
                    get: jest.fn((keys, callback) => callback(mockStorage)),
                    set: jest.fn((items, callback) => {
                        mockStorage.flashcards = items.flashcards;
                        callback === null || callback === void 0 ? void 0 : callback();
                    }),
                    clear: jest.fn(),
                    remove: jest.fn(),
                    getBytesInUse: jest.fn(),
                },
            },
            tabs: {
                query: jest.fn((options, callback) => callback([])),
            },
            scripting: {
                executeScript: jest.fn(),
            },
            runtime: {
                getManifest: jest.fn(() => ({})),
                getURL: jest.fn((path) => `chrome-extension://mock-id/${path}`),
                onInstalled: {
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    hasListener: jest.fn(),
                },
            },
        };
        // Assign with type assertion
        global.chrome = chromeMock;
        const newCard = { id: '1', front: 'test', back: 'test', difficulty: 'unknown' };
        yield new Promise((resolve) => {
            chrome.storage.local.get(['flashcards'], (data) => {
                const flashcards = data.flashcards || [];
                flashcards.push(newCard);
                chrome.storage.local.set({ flashcards }, () => resolve());
            });
        });
        // Verify the flashcard was added
        expect(mockStorage.flashcards).toContainEqual(newCard);
        // Verify the mock functions were called
        expect(chromeMock.storage.local.get).toHaveBeenCalled();
        expect(chromeMock.storage.local.set).toHaveBeenCalled();
    }));
});
//# sourceMappingURL=extension.test.js.map