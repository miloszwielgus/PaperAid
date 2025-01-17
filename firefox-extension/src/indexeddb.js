// indexedDB.js

// Open IndexedDB (one-time setup)
export const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("DefinitionsDB", 1);
  
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains("definitions")) {
          db.createObjectStore("definitions", { keyPath: "url" });
        }
      };
  
      request.onerror = (e) => reject("Error opening IndexedDB: " + e.target.error);
      request.onsuccess = (e) => resolve(e.target.result);
    });
  };
  
  // Save definitions to IndexedDB
  export const saveDefinitionsToIndexedDB = async (url, definitions) => {
    const db = await openIndexedDB();
    const transaction = db.transaction("definitions", "readwrite");
    const store = transaction.objectStore("definitions");
  
    const data = {
      url,
      definitions,
      timestamp: new Date().getTime(),
    };
  
    const request = store.put(data);
    request.onerror = (e) => console.error("Error saving to IndexedDB:", e.target.error);
    request.onsuccess = () => console.log("Definitions saved to IndexedDB.");
  };
  
  // Retrieve definitions from IndexedDB
  export const getDefinitionsFromIndexedDB = async (url) => {
    const db = await openIndexedDB();
    const transaction = db.transaction("definitions", "readonly");
    const store = transaction.objectStore("definitions");
    const request = store.get(url);
    console.log("request:", request);
    return new Promise((resolve, reject) => {
      request.onerror = (e) => reject("Error fetching from IndexedDB: " + e.target.error);
      request.onsuccess = (e) => resolve(e.target.result ? e.target.result.definitions : null);
    });
  };
  