chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "llm-summarize",
    title: "Summarize with LLM",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "llm-explain",
    title: "Explain with LLM",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "llm-translate",
    title: "Translate to Hindi",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  const mode = info.menuItemId.replace("llm-", ""); // summarize, explain, translate

  const payload = {
    query: selectedText,
    mode: mode
  };

  try {
    const response = await fetch("http://localhost:5501/llm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    // Show result as alert on the page
    chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ["injectCopilotStyleCard.js"]
    }, () => {
    chrome.tabs.sendMessage(tab.id, { type: "LLM_RESULT", content: data.response });
    });
  } catch (err) {
    console.error("LLM Error:", err);
  }
});

let history = [];
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "LLM_FOLLOWUP") {
    const tabId = sender.tab.id;
    const payload = {
      query: message.content,
      mode: "followup",
      conversation: message.conversation || []
    };
    try {
      const response = await fetch("http://localhost:5501/llm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      chrome.scripting.executeScript({
        target: { tabId },
        files: ["injectCopilotStyleCard.js"]
      }, () => {
        chrome.tabs.sendMessage(tabId, { type: "LLM_RESULT", content: data.response });
      });
    } catch (err) {
      console.error("LLM Follow-up Error:", err);
    }
  }
});
