if (!document.getElementById("llm-sidebar")) {
  const sidebar = document.createElement("div");
  sidebar.id = "llm-sidebar";
  sidebar.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 360px;
    height: 100%;
    background: #121212;
    color: #e0e0e0;
    font-family: 'Segoe UI', sans-serif;
    box-shadow: -4px 0 12px rgba(0,0,0,0.5);
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease-in-out;
    border-left: 1px solid #2a2a2a;
  `;

  const header = document.createElement("div");
  header.style.cssText = `
    padding: 16px;
    font-size: 18px;
    font-weight: bold;
    border-bottom: 1px solid #2a2a2a;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #1e1e1e;
  `;
  header.innerText = "LLM Assistant";

  const closeBtn = document.createElement("button");
  closeBtn.innerText = "✕";
  closeBtn.style.cssText = `
    background: transparent;
    border: none;
    color: #aaa;
    font-size: 18px;
    cursor: pointer;
  `;
  closeBtn.onclick = () => sidebar.remove();
  header.appendChild(closeBtn);

  const contentWrapper = document.createElement("div");
  contentWrapper.style.cssText = `
    padding: 16px;
    flex-grow: 1;
    overflow-y: auto;
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
  `;

  const content = document.createElement("div");
  content.id = "llm-content";
  content.innerText = "Processing...";
  contentWrapper.appendChild(content);

  const footer = document.createElement("div");
  footer.style.cssText = `
    padding: 12px 16px;
    border-top: 1px solid #2a2a2a;
    background: #1e1e1e;
    display: flex;
    justify-content: flex-end;
  `;

  const copyBtn = document.createElement("button");
  copyBtn.innerText = "Copy";
  copyBtn.style.cssText = `
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
  `;
  copyBtn.onclick = () => {
    navigator.clipboard.writeText(content.innerText).then(() => {
      copyBtn.innerText = "Copied!";
      setTimeout(() => (copyBtn.innerText = "Copy"), 1500);
    });
  };

  footer.appendChild(copyBtn);

  sidebar.appendChild(header);
  sidebar.appendChild(contentWrapper);
  sidebar.appendChild(footer);
  document.body.appendChild(sidebar);
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "LLM_RESULT") {
    const content = document.getElementById("llm-content");
    if (content) content.innerText = msg.content;
  }
});
