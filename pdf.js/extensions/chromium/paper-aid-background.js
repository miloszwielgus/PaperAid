'use strict';

/**
 * Open a connection to the IndexedDB database.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
 */
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

/**
 * Save definitions to the IndexedDB database.
 * @param {string} url - The URL key for the definitions.
 * @param {Array} definitions - The definitions to save.
 */
const saveDefinitionsToIndexedDB = async (url, definitions) => {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('definitions', 'readwrite');
    const store = transaction.objectStore('definitions');

    const data = {
      url,
      definitions,
      timestamp: Date.now(),
    };

    const request = store.put(data);
    request.onerror = e =>
      console.error('Error saving to IndexedDB:', e.target.error);
    request.onsuccess = () => console.log('Definitions saved to IndexedDB.');
  } catch (error) {
    console.error('Error in saveDefinitionsToIndexedDB:', error);
  }
};

/**
 * Retrieve definitions from the IndexedDB database.
 * @param {string} url - The URL key for the definitions.
 * @returns {Promise<Array|null>} A promise that resolves with the definitions or null if not found.
 */
const getDefinitionsFromIndexedDB = async url => {
  try {
    const db = await openIndexedDB();
    const transaction = db.transaction('definitions', 'readonly');
    const store = transaction.objectStore('definitions');

    return new Promise((resolve, reject) => {
      const request = store.get(url);

      request.onerror = e =>
        reject(`Error fetching from IndexedDB: ${e.target.error}`);
      request.onsuccess = e => {
        const result = e.target.result;
        resolve(result ? result.definitions : null);
      };
    });
  } catch (error) {
    console.error('Error in getDefinitionsFromIndexedDB:', error);
    return null;
  }
};

/**
 * Handle the Chrome extension installation event.
 */
chrome.runtime.onInstalled.addListener(() => {
  openIndexedDB().catch(error =>
    console.error('Failed to initialize IndexedDB on installation:', error)
  );

  chrome.contextMenus.create({
    id: 'processSelectedText',
    title: 'Process selected text',
    contexts: ['selection'], 
  });
});

/**
 * Handle context menu clicks.
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'processSelectedText') {
    const selectedText = info.selectionText;

    if (!selectedText) {
      console.log('No text was selected.');
      return;
    }

    const apiUrl = 'http://localhost:3000/definitions';

    fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: selectedText }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.definitions) {
          saveDefinitionsToIndexedDB(tab.url, data.definitions);
          chrome.runtime.sendMessage({ type: 'NEW_DEFINITIONS', url: tab.url });
        } else {
          console.error('No definitions found in API response.');
        }
      })
      .catch(error => {
        console.error('Error making API request:', error);
        chrome.runtime.sendMessage({ type: 'FAILED_EXTRACTING', url: tab.url });
      });
  }
});
