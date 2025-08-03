import { AppData, Category } from '../types';

const APP_PREFIX = 'recordvault-';
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // For AES-GCM, 12 is recommended
const PBKDF2_ITERATIONS = 100000;

// Crypto helpers
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): Uint8Array {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes;
}

async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    textEncoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Data management
export const checkUserExists = (username: string): boolean => {
    const key = `${APP_PREFIX}data-${username.trim().toLowerCase()}`;
    return localStorage.getItem(key) !== null;
};

const getDefaultCategories = (): Category[] => {
    const now = new Date().toISOString();
    const defaultNames = [
        'Personal IDs', 
        'Bank Accounts', 
        'Brokerage Accounts', 
        'Retirement/Pension Accounts', 
        'Loans',
        'Insurance Policies', 
        'Properties', 
        'Valuables'
    ];
    return defaultNames.map((name, index) => ({
        category_id: Date.now() + index,
        created_at: now,
        name,
        is_enabled: true,
    }));
};

export const createUserData = async (username: string, password: string): Promise<AppData> => {
    const newUserData: AppData = {
        categories: getDefaultCategories(),
        records: [],
    };
    await saveEncryptedUserData(username, password, newUserData, true);
    return newUserData;
}

export const saveEncryptedUserData = async (username: string, password: string, data: AppData, isNewUser: boolean = false): Promise<void> => {
    const key = `${APP_PREFIX}data-${username.trim().toLowerCase()}`;
    const salt = isNewUser ? window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH)) : base64ToArrayBuffer((JSON.parse(localStorage.getItem(key)!) as any).salt);
    const derivedKey = await deriveKey(password, salt);
    
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        derivedKey,
        textEncoder.encode(JSON.stringify(data))
    );

    const storedObject = {
        salt: arrayBufferToBase64(salt),
        iv: arrayBufferToBase64(iv),
        data: arrayBufferToBase64(encryptedData),
    };

    localStorage.setItem(key, JSON.stringify(storedObject));
};

export const getDecryptedUserData = async (username: string, password: string): Promise<AppData> => {
    const key = `${APP_PREFIX}data-${username.trim().toLowerCase()}`;
    const storedObjectJSON = localStorage.getItem(key);
    if (!storedObjectJSON) {
        throw new Error("User data not found.");
    }
    const storedObject = JSON.parse(storedObjectJSON);

    try {
        const salt = base64ToArrayBuffer(storedObject.salt);
        const iv = base64ToArrayBuffer(storedObject.iv);
        const encryptedData = base64ToArrayBuffer(storedObject.data);
        const derivedKey = await deriveKey(password, salt);

        const decryptedDataBuffer = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            derivedKey,
            encryptedData
        );

        const jsonString = textDecoder.decode(decryptedDataBuffer);
        const appData: AppData = JSON.parse(jsonString);
        
        // Ensure is_enabled exists on categories for backward compatibility if needed
        appData.categories = appData.categories.map(c => ({
            ...c,
            is_enabled: c.is_enabled !== undefined ? c.is_enabled : true,
        }));
        
        return appData;
    } catch (error) {
        console.error("Decryption failed:", error);
        throw new Error("Invalid password or corrupted data.");
    }
};


// Session management
const ACTIVE_USER_KEY = `${APP_PREFIX}active-user`;

export const getActiveUser = (): string | null => {
    return sessionStorage.getItem(ACTIVE_USER_KEY);
};

export const setActiveUser = (username: string): void => {
    sessionStorage.setItem(ACTIVE_USER_KEY, username.trim());
};

export const clearActiveUser = (): void => {
    sessionStorage.removeItem(ACTIVE_USER_KEY);
};