const tooltipStyle = `
      position: absolute;
      background: rgba(50, 50, 50, 0.9); /* Slightly transparent dark background */
      color: #f9f9f9; /* Softer white for better contrast */
      padding: 8px 12px; /* Slightly more padding for better readability */
      border-radius: 8px; /* More rounded corners */
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
      font-size: 13px; /* Slightly smaller text for minimalism */
      font-family: Arial, sans-serif; /* Clean, readable font */
      line-height: 1.4; /* Improved text spacing */
      z-index: 1000;
      display: none;
      pointer-events: none; /* Prevents interfering with mouse events */
    `;

export const createTooltip = () => {
  const tooltip = document.createElement('div');
  tooltip.id = 'definition-tooltip';
  tooltip.style.cssText = tooltipStyle;
  document.body.appendChild(tooltip);
  return tooltip;
};
