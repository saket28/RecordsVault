import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom/dist/extend-expect';

// Mock Web Crypto API using Node's crypto library
const webcrypto = require('crypto');
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto.webcrypto,
});


// Mock LocalStorage and SessionStorage to ensure a clean slate for each test
const createStorageMock = () => {
    let store: Record<string, string> = {};
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key:string, value: string) => {
            store[key] = value.toString();
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
        key: (index: number) => Object.keys(store)[index] || null,
        get length() {
            return Object.keys(store).length;
        }
    };
};

vi.stubGlobal('localStorage', createStorageMock());
vi.stubGlobal('sessionStorage', createStorageMock());

// Mock for URL.createObjectURL and revokeObjectURL, which are used for file downloads
vi.stubGlobal('URL', {
  ...globalThis.URL,
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn(),
});

// Mock Blob to inspect report content
vi.stubGlobal('Blob', vi.fn((content, _options) => {
  return new (class MockBlob {
    content = content;
    // A simple text() implementation for inspection
    async text() {
      return this.content.join('');
    }
  })();
}));


// Clean up all mocks after each test run
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});