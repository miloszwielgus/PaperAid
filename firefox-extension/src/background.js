import {getDefinitionsFromIndexedDB, saveDefinitionsToIndexedDB, openIndexedDB} from  './indexeddb.js';

// Register a context menu item when the extension is installed
chrome.runtime.onInstalled.addListener(() => {
  openIndexedDB();
  chrome.contextMenus.create({
    id: "processSelectedText",
    title: "Process selected text",
    contexts: ["selection"] // Only show the option when text is selected
  });
});

// Listen for the context menu click event
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "processSelectedText") {
    const selectedText = info.selectionText;

    if (selectedText) {
      // Log the selected text (optional)
      console.log("Selected text:", selectedText);

      // Define the API endpoint
      const apiUrl = "http://localhost:3000/definitions";

      // Make the API request
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: selectedText
        }),
      })
      .then(response => response.json())
      .then(data => {
        if (data.definitions) {
          // Log the definitions received from the API
          //console.log("Definitions:", data.definitions);
          saveDefinitionsToIndexedDB(tab.url, data.definitions);
          const test = getDefinitionsFromIndexedDB(tab.url);
          console.log("test:", test);
        } else {
          console.error("No definitions found in API response.");
        }
      })
      .catch(error => {
        console.error("Error making API request:", error);
      });
    } else {
      console.log("No text was selected.");
    }
  }
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getDefinitions") {
    getDefinitionsFromIndexedDB(message.url)
      .then((definitions) => {
        console.log("Definitions from IndexedDB:", definitions);
        sendResponse({ definitions });
      })
      .catch((error) => {
        console.error("Error fetching definitions:", error);
        sendResponse({ definitions: null });
      });

    // Return true to indicate an asynchronous response
    return true;
  }
});

const browsingPDF = false


chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    // Check if the response has Content-Type indicating a PDF
    const isPDF = details.responseHeaders.some(
      (header) =>
        header.name.toLowerCase() === "content-type" &&
        header.value.toLowerCase().includes("application/pdf")
    );

    if (isPDF) {
      browsingPDF = true;
      console.log("PDF detected:", details.url);

      // Notify the user or take action
      
    }
  },
  { urls: ["<all_urls>"] }, // Match all URLs
  ["responseHeaders"]
);

// Additional listener for URLs ending in `.pdf`
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url || changeInfo.status === "complete") {
    if (tab.url?.endsWith(".pdf")) {
      browsingPDF = true;
      console.log("PDF detected via URL check:", tab.url);

      // Notify the user or take action
      
    }
  }
});


