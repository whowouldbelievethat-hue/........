(() => {
  let running = false;
  let timer = null;
  const log = (message) => chrome.runtime.sendMessage({ type: "LOG", message }).catch(() => {});
  const visible = (element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
  };
  const text = () => document.body?.innerText || "";
  const completed = () => /(مكتمل|مكتملة|تم الإنجاز|تهانينا|أحسنت|completed|congratulations|finished)/i.test(text());
  const clickNext = () => {
    const candidates = [...document.querySelectorAll("button, a, [role=button], input[type=submit]")].filter(visible);
    const next = candidates.find((el) => /(التالي|التالى|next|continue|استمرار|متابعة|ابدأ|start|إكمال|complete)/i.test((el.innerText || el.value || el.getAttribute("aria-label") || "").trim()));
    if (next) { next.click(); return "تم الضغط على التالي"; }
    return "";
  };
  const chooseFirst = () => {
    const inputs = [...document.querySelectorAll('input[type="radio"]:not(:checked), input[type="checkbox"]:not(:checked)')].filter(visible);
    if (inputs[0]) { inputs[0].click(); return "تم اختيار أول إجابة ظاهرة"; }
    const options = [...document.querySelectorAll('[role="radio"], [role="option"], .option, .answer, button')].filter(visible).filter((el) => !/(التالي|التالي|next|menu|إغلاق|close)/i.test(el.innerText || ""));
    if (options[0]) { options[0].click(); return "تم اختيار أول خيار قابل للنقر"; }
    return "";
  };
  const tick = () => {
    if (!running) return;
    if (completed()) { running = false; clearInterval(timer); log("FINISHED: تم اكتشاف اكتمال المحتوى"); return; }
    const action = chooseFirst() || clickNext();
    if (action) log(action); else log("لم أجد عنصرًا واضحًا؛ أوقف التشغيل للمراجعة");
  };
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === "START") { running = true; clearInterval(timer); timer = setInterval(tick, 1300); log("بدأ التشغيل داخل التبويب الحالي"); sendResponse({ ok: true }); }
    if (message.type === "STOP") { running = false; clearInterval(timer); log("تم الإيقاف يدويًا"); sendResponse({ ok: true }); }
    if (message.type === "STATUS") sendResponse({ running, url: location.href, title: document.title });
    return true;
  });
  window.addEventListener("message", (event) => {
    if (event.source !== window || event.data?.source !== "financial-ai-agent") return;
    if (event.data.type === "START") chrome.runtime.sendMessage({ type: "FORWARD_START" });
    if (event.data.type === "STOP") chrome.runtime.sendMessage({ type: "FORWARD_STOP" });
  });
})();
