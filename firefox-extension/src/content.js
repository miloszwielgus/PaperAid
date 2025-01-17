




  
// Tooltip styling
const tooltipStyle = `
  position: absolute;
  background: #333;
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 14px;
  z-index: 1000;
  display: none;
`;

// Create tooltip element
const tooltip = document.createElement("div");
tooltip.id = "definition-tooltip";
tooltip.style.cssText = tooltipStyle;
document.body.appendChild(tooltip);

let currentWord = null;

// Function to get word under the cursor
function getWordUnderCursor(event) {
  // First try caretRangeFromPoint (more widely supported)
  

  const range = document.caretRangeFromPoint(event.clientX, event.clientY);
  if (!range) return null;

  const textNode = range.startContainer;
  // Check if we're actually on a text node
  if (textNode.nodeType !== Node.TEXT_NODE) return null;

  const text = textNode.textContent;
  const offset = range.startOffset;

  // Define word boundaries (including unicode letters and numbers)
  const wordRegex = /[\p{L}\p{N}]+/gu;
  
  // Find all words in the text
  const words = Array.from(text.matchAll(wordRegex));
  
  // Find the word that contains the cursor position
  for (const match of words) {
      const start = match.index;
      const end = start + match[0].length;
      
      if (offset >= start && offset <= end) {
          return match[0];
      }
  }

  return null;
}

// Event listener for mouse movement
document.addEventListener("mousemove", (event) => {
  currentWord = getWordUnderCursor(event);
  console.log("currentWord:", currentWord);
  // Position tooltip near the cursor
  tooltip.style.left = `${event.pageX + 10}px`;
  tooltip.style.top = `${event.pageY + 10}px`;
});


// Event listener for keydown (Ctrl key)

document.addEventListener("keydown", async (event) => {
  if (event.key === "Control" && currentWord) {
    const url = window.location.href;

    try {
      console.log("Control detected, sending message to background script.");
      const { definitions } = await chrome.runtime.sendMessage({
        type: "getDefinitions",
        url,
      });

      console.log("Definitions received:", definitions);

      if (definitions) {
        tooltip.innerText = definitions;
        tooltip.style.display = "block";
      }
    } catch (error) {
      console.error("Error retrieving definitions:", error);
    }
  }
});




// Event listener for keyup (to hide tooltip)
document.addEventListener("keyup", (event) => {
  console.log("keyup");
  if (event.key === "Control") {
    tooltip.style.display = "none";
  }
});

// Event listener for mouseout (to hide tooltip)
document.addEventListener("mouseout", () => {
    console.log("mouseout");
  tooltip.style.display = "none";
});

