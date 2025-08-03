import { vi, afterEach } from 'vitest';
import '@testing-library/jest-dom';

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
let lastBlobContent: any = undefined;
vi.stubGlobal('Blob', vi.fn((content, _options) => {
  lastBlobContent = content;
  globalThis.lastBlobContent = content;
  return new (class MockBlob {
    content = content;
    async text() {
      if (Array.isArray(this.content)) {
        return this.content.join('');
      }
      return String(this.content);
    }
  })();
}));


// Clean up all mocks after each test run
afterEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  vi.clearAllMocks();
});