// injectFloatingCard.js

function createFloatingCard(content) {
  // Remove existing card if any
  const oldCard = document.getElementById("llm-floating-card");
  if (oldCard) oldCard.remove();

  const card = document.createElement("div");
  card.id = "llm-floating-card";
  card.innerHTML = `
    <div style="
      background: #1e1e2f;
      color: #fff;
      font-family: Arial, sans-serif;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 0 10px rgba(0,0,0,0.3);
      max-width: 400px;
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      transition: all 0.3s ease;
    ">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <strong>LLM Response</strong>
        <button id="llm-close-btn" style="
          background: transparent;
          border: none;
          color: #fff;
          font-size: 16px;
          cursor: pointer;
        ">&times;</button>
      </div>
      <div style="margin-top: 10px; white-space: pre-wrap; font-size: 14px;">${content}</div>
    </div>
  `;
  document.body.appendChild(card);

  // Close button
  document.getElementById("llm-close-btn").onclick = () => card.remove();

  // Auto-close after 30 seconds (optional)
  setTimeout(() => card.remove(), 30000);
}

// Listener for message from background.js
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "LLM_RESULT") {
    createFloatingCard(message.content);
  }
});
