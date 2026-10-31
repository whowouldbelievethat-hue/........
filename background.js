chrome.runtime.onMessage.addListener((message, sender) => {
  if (message.type === "FORWARD_START" || message.type === "FORWARD_STOP") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.id) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: message.type === "FORWARD_START" ? "START" : "STOP" }).catch(() => {});
    });
  }
  if (message.type === "LOG") {
    chrome.storage.local.set({ lastLog: message.message, lastLogAt: Date.now() });
  }
});
