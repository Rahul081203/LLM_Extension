let conversation = [];

chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "LLM_RESULT") {
        // Add LLM response to conversation
        conversation.push({ role: "assistant", content: message.content });

        const existing = document.getElementById("llm-float-box");
        if (existing) existing.remove();

        // Get selection and its bounding rect
        const selection = window.getSelection();
        let rect = null;
        if (selection && selection.rangeCount > 0) {
            rect = selection.getRangeAt(0).getBoundingClientRect();
        }

        // Fallback to center if no selection
        const defaultLeft = window.innerWidth / 2 - 200;
        const defaultTop = window.innerHeight / 2 - 50;

        const container = document.createElement("div");
        container.id = "llm-float-box";
        container.style.position = "absolute";
        container.style.left = "0";
        container.style.width = "100vw";
        container.style.pointerEvents = "none"; // allow clicks to pass through except for card

        // Calculate top position
        let top;
        if (rect) {
            const cardHeight = 120; // Increased for input field
            const gap = 12;
            top = rect.top + window.scrollY - cardHeight - gap;
            if (top < 0) top = 0;
        } else {
            top = window.scrollY + window.innerHeight / 2 - 60;
        }
        container.style.top = `${top}px`;
        container.style.zIndex = "9999";
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.pointerEvents = "none"; // only card is interactive

        // Card element
        const card = document.createElement("div");
        card.style.background = "#f5f5f5";
        card.style.opacity = "0.97";
        card.style.border = "1px solid #ccc";
        card.style.boxShadow = "0 2px 12px rgba(0, 0, 0, 0.13)";
        card.style.fontFamily = "Segoe UI, sans-serif";
        card.style.display = "flex";
        card.style.flexDirection = "column";
        card.style.alignItems = "center";
        card.style.padding = "16px 24px";
        card.style.borderRadius = "8px";
        // Set maxWidth to a little less than the tab width dynamically
        const tabWidth = Math.min(window.innerWidth, 720);
        card.style.maxWidth = (tabWidth - 48) + "px";
        card.style.width = "calc(100vw - 48px)";
        card.style.pointerEvents = "auto"; // card is interactive

        const text = document.createElement("div");
        text.innerText = message.content;
        text.style.fontSize = "14px";
        text.style.color = "#333";
        text.style.overflowY = "auto";
        text.style.maxHeight = "150px";
        text.style.paddingBottom = "10px";
        text.style.whiteSpace = "pre-wrap";
        text.style.tabSize = "4";

        // Input area (like Copilot)
        const inputRow = document.createElement("div");
        inputRow.style.display = "flex";
        inputRow.style.alignItems = "center";
        inputRow.style.width = "100%";
        inputRow.style.marginTop = "10px";
        inputRow.style.gap = "6px";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "Ask a follow-up...";
        input.style.flex = "1";
        input.style.padding = "7px 12px";
        input.style.border = "1px solid #bbb";
        input.style.borderRadius = "6px";
        input.style.fontSize = "14px";
        input.style.outline = "none";
        input.style.background = "#fff";
        input.style.marginRight = "2px";

        const sendBtn = document.createElement("button");
        sendBtn.title = "Send";
        sendBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" style="display:block" xmlns="http://www.w3.org/2000/svg"><path d="M3 17L17 10L3 3V8L13 10L3 12V17Z" fill="currentColor"/></svg>`;
        styleButton(sendBtn);
        sendBtn.style.padding = "6px 10px";
        sendBtn.style.display = "flex";
        sendBtn.style.alignItems = "center";
        sendBtn.style.justifyContent = "center";
        sendBtn.style.minWidth = "32px";
        sendBtn.style.height = "32px";

        // Send on click or Enter
        function sendInput() {
            const value = input.value.trim();
            if (!value) return;
            conversation.push({ role: "user", content: value });
            chrome.runtime.sendMessage({ 
                type: "LLM_FOLLOWUP", 
                content: value, 
                conversation // send the whole conversation
            });
            input.value = "";
        }
        sendBtn.onclick = sendInput;
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") sendInput();
        });

        inputRow.appendChild(input);
        inputRow.appendChild(sendBtn);

        const buttons = document.createElement("div");
        buttons.style.display = "flex";
        buttons.style.gap = "8px";
        buttons.style.justifyContent = "flex-end";
        buttons.style.marginTop = "10px";

        const copyBtn = document.createElement("button");
        copyBtn.innerText = "Copy";
        styleButton(copyBtn);
        copyBtn.onclick = () => {
            navigator.clipboard.writeText(message.content);
            copyBtn.innerText = "Copied!";
            setTimeout(() => (copyBtn.innerText = "Copy"), 1500);
        };

        const closeBtn = document.createElement("button");
        closeBtn.innerText = "Close";
        styleButton(closeBtn);
        closeBtn.onclick = () => container.remove();

        buttons.appendChild(copyBtn);
        buttons.appendChild(closeBtn);

        card.appendChild(text);
        card.appendChild(inputRow);
        card.appendChild(buttons);
        container.appendChild(card);
        document.body.appendChild(container);

        // Focus input for quick typing
        setTimeout(() => input.focus(), 100);
    }
});

function styleButton(btn) {
    btn.style.backgroundColor = "#2c64f6";
    btn.style.color = "#fff";
    btn.style.border = "none";
    btn.style.borderRadius = "6px";
    btn.style.padding = "6px 12px";
    btn.style.cursor = "pointer";
    btn.style.fontSize = "13px";
    btn.style.fontWeight = "500";
    btn.style.transition = "background 0.2s ease-in-out";
    btn.onmouseover = () => (btn.style.backgroundColor = "#174fe3");
    btn.onmouseout = () => (btn.style.backgroundColor = "#2c64f6");
}
