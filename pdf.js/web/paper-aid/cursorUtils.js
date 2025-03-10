// Function to get word under the cursor
export const getWordWithContext = (event, contextRange = 0) => {
    // First try caretRangeFromPoint (more widely supported)
    const range = document.caretRangeFromPoint(event.clientX, event.clientY);
    if (!range) return null;
  
    const textNode = range.startContainer;
    // Check if we're actually on a text node
    if (textNode.nodeType !== Node.TEXT_NODE) return null;
  
    const text = textNode.textContent;
    const offset = range.startOffset;
  
    // Define word boundaries (including Unicode letters and numbers)
    const wordRegex = /[\p{L}\p{N}]+/gu;
  
    // Find all words in the text
    const words = Array.from(text.matchAll(wordRegex));
  
    // Find the word that contains the cursor position
    for (let i = 0; i < words.length; i++) {
      const match = words[i];
      const start = match.index;
      const end = start + match[0].length;
  
      if (offset >= start && offset <= end) {
        // Determine the range of words to include in the context
        const startIdx = Math.max(0, i - contextRange);
        const endIdx = Math.min(words.length, i + contextRange + 1);
  
        // Get the words within the context range
        const contextWords = words.slice(startIdx, endIdx).map(match => match[0]);
  
        // Join them into a string and return
        return contextWords.join(' ');
      }
    }
  
    return null;
  }