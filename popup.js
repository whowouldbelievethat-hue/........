const status = document.getElementById("status");
const log = document.getElementById("log");
async function activeTab() { const tabs = await chrome.tabs.query({ active: true, currentWindow: true }); return tabs[0]; }
async function send(type) { const tab = await activeTab(); if (!tab?.id) return; try { const result = await chrome.tabs.sendMessage(tab.id, { type }); status.textContent = type === "START" ? "يعمل داخل التبويب" : "تم الإيقاف"; if (result?.ok) log.textContent = "تم إرسال الأمر للمنصة."; } catch { status.textContent = "افتح صفحة المنصة أولاً"; log.textContent = "الإضافة تعمل فقط على نطاق المنصة المحدد."; } }
document.getElementById("start").onclick = () => send("START");
document.getElementById("stop").onclick = () => send("STOP");
chrome.storage.local.get(["lastLog"], (value) => { if (value.lastLog) log.textContent = value.lastLog; });
