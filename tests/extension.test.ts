// tests/extension.test.ts
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Minimal Chrome mock interface with required properties
interface ChromeMock {
  storage: {
    local: {
      get: jest.Mock;
      set: jest.Mock;
      clear: jest.Mock;
      remove: jest.Mock;
      getBytesInUse: jest.Mock;
    };
  };
  tabs: {
    query: jest.Mock;
  };
  scripting: {
    executeScript: jest.Mock;
  };
  runtime: {
    getManifest: jest.Mock;
    getURL: jest.Mock;
    onInstalled: {
      addListener: jest.Mock;
      removeListener: jest.Mock;
      hasListener: jest.Mock;
    };
  };
}

describe('Extension Popup', () => {
  let originalChrome: typeof chrome;

  beforeAll(() => {
    // Store original chrome object
    originalChrome = global.chrome;
  });

  afterAll(() => {
    // Restore original chrome object
    global.chrome = originalChrome;
  });

  test('should add flashcard to storage', async () => {
    const mockStorage: { flashcards: any[] } = { flashcards: [] };

    // Create the mock implementation
    const chromeMock: ChromeMock = {
      storage: {
        local: {
          get: jest.fn(
            (
              keys: string | string[] | { [key: string]: any } | null,
              callback: (items: { [key: string]: any }) => void
            ) => callback(mockStorage)
          ),
          set: jest.fn(
            (
              items: { [key: string]: any },
              callback?: () => void
            ) => {
              mockStorage.flashcards = items.flashcards;
              callback?.();
            }
          ),
          clear: jest.fn(),
          remove: jest.fn(),
          getBytesInUse: jest.fn(),
        },
      },
      tabs: {
        query: jest.fn((options: any, callback: (tabs: any[]) => void) => callback([])),
      },
      scripting: {
        executeScript: jest.fn(),
      },
      runtime: {
        getManifest: jest.fn(() => ({})),
        getURL: jest.fn((path: string) => `chrome-extension://mock-id/${path}`),
        onInstalled: {
          addListener: jest.fn(),
          removeListener: jest.fn(),
          hasListener: jest.fn(),
        },
      },
    };

    // Assign with type assertion
    global.chrome = chromeMock as unknown as typeof chrome;

    const newCard = { id: '1', front: 'test', back: 'test', difficulty: 'unknown' };
    
    await new Promise<void>((resolve) => {
      chrome.storage.local.get(['flashcards'], (data: { flashcards?: any[] }) => {
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
  });
});