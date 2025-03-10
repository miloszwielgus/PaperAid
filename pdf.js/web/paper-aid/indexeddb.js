import { findLongestTerm } from './stringUtils.mjs';
import { state } from './state.js';

const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('DefinitionsDB', 1);

    request.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('definitions')) {
        db.createObjectStore('definitions', { keyPath: 'url' });
      }
    };

    request.onerror = e => reject(`Error opening IndexedDB: ${e.target.error}`);
    request.onsuccess = e => resolve(e.target.result);
  });
};
export const getDefinitionsFromIndexedDB = async url => {
  const db = await openIndexedDB();
  const transaction = db.transaction('definitions', 'readonly');
  const store = transaction.objectStore('definitions');
  const request = store.get(url);
  console.log('request:', request);
  return new Promise((resolve, reject) => {
    request.onerror = e =>
      reject('Error fetching from IndexedDB: ' + e.target.error);
    request.onsuccess = e =>
      resolve(e.target.result ? e.target.result.definitions : null);
  });
};

export const loadDefinitionsForTab = async () => {
  const url = window.location.href;

  console.log('Loading definitions for URL:', url);

  try {
    const definitions = await getDefinitionsFromIndexedDB(url);
    console.log('definitions:', definitions);
    if (!definitions || definitions.length === 0) {
      throw new Error('No definitions found for this URL.');
    }

    state.currentUrl = url;
    state.definitions = definitions;
    state.context = findLongestTerm(state.definitions) - 1;
    console.log('Definitions successfully loaded:', definitions);
    chrome.notifications.create({
        type: 'basic',
        title: 'PaperAid',
        iconUrl: './images/loading.svg',
        message: 'Definitions loaded successfully.',
    })
  } catch (error) {
    console.log(
      `Failed to load definitions for URL "${url}": ${error.message || error}`
    );
    
  }
};
