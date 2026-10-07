(() => {
  "use strict";
  const themes = { signal: "作戦室", ledger: "調査ノート", compact: "コンパクト" };
  const frame = document.getElementById("designFrame");
  const status = document.getElementById("studioStatus");
  const tabs = [...document.querySelectorAll("[data-theme]")];
  const requested = new URLSearchParams(location.search).get("design");
  let selected = Object.hasOwn(themes, requested) ? requested : "signal";
  let preview;

  function selectTheme(theme, updateUrl = true) {
    if (!Object.hasOwn(themes, theme)) return;
    selected = theme;
    document.body.dataset.design = theme;
    frame.title = `${themes[theme]}のプレビュー`;
    tabs.forEach((tab) => {
      const active = tab.dataset.theme === theme;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    if (updateUrl) {
      const url = new URL(location.href);
      url.searchParams.set("design", theme);
      history.replaceState(null, "", url);
    }
    if (!preview) return;
    const { doc, filters, controls, dialog, trigger } = preview;
    if (dialog.open) dialog.close();
    doc.documentElement.dataset.design = theme;
    if (theme === "compact") dialog.append(filters);
    else controls.append(filters);
    trigger.hidden = theme !== "compact";
    frame.contentWindow.scrollTo(0, 0);
  }

  function preparePreview() {
    if (preview) return;
    try {
      const doc = frame.contentDocument;
      if (!doc?.querySelector(".workspace")) return;
      const controls = doc.querySelector(".control-panel");
      const [difficulty, filters] = controls.querySelectorAll(":scope > .panel-section");
      difficulty.classList.add("difficulty-section");
      filters.classList.add("behavior-section");
      for (const [mode, name, count] of [["nightmare", "Nightmare", 2], ["insanity", "Insanity", 1]]) {
        const button = difficulty.querySelector(`[data-difficulty="${mode}"]`);
        button.setAttribute("aria-label", button.textContent);
        button.innerHTML = `<span class="mode-name">${name} </span>${count}証拠`;
      }
      filters.id = "designBehaviors";
      const behaviorLink = doc.querySelector('.mobile-nav a[href="#conditions"]');
      behaviorLink.href = "#designBehaviors";
      behaviorLink.textContent = "行動";

      const dialog = doc.createElement("dialog");
      dialog.className = "design-filter-dialog";
      dialog.setAttribute("aria-label", "行動フィルター");
      const closeButton = doc.createElement("button");
      closeButton.type = "button";
      closeButton.className = "drawer-close text-button";
      closeButton.textContent = "閉じる";
      closeButton.addEventListener("click", () => dialog.close());
      dialog.append(closeButton);
      doc.body.append(dialog);

      const trigger = doc.createElement("button");
      trigger.type = "button";
      trigger.className = "filter-trigger";
      trigger.title = "行動フィルターを開く";
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.innerHTML = '<img src="./assets/audio-lines.svg" width="18" height="18" alt="" /><span>行動フィルター</span><b>0</b>';
      trigger.addEventListener("click", () => dialog.showModal());
      doc.querySelector(".evidence-heading").append(trigger);
      dialog.addEventListener("click", (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
      });
      const observer = new frame.contentWindow.MutationObserver(() => {
        const count = filters.querySelectorAll("input:checked").length;
        trigger.querySelector("b").textContent = count;
        trigger.setAttribute("aria-label", `行動フィルターを開く: ${count}項目選択中`);
      });
      observer.observe(doc.getElementById("behaviorFilters"), { childList: true });
      const initialCount = filters.querySelectorAll("input:checked").length;
      trigger.querySelector("b").textContent = initialCount;
      trigger.setAttribute("aria-label", `行動フィルターを開く: ${initialCount}項目選択中`);

      preview = { doc, filters, controls, dialog, trigger, observer };
      const styles = doc.createElement("link");
      styles.rel = "stylesheet";
      styles.href = new URL("./designs.css", location.href).href;
      styles.addEventListener("load", () => {
        frame.classList.add("ready");
        status.hidden = true;
      });
      styles.addEventListener("error", () => {
        status.textContent = "デザインの読み込みに失敗しました。ページを再読み込みしてください。";
      });
      doc.head.append(styles);
      selectTheme(selected, false);
    } catch {
      status.textContent = "ローカルサーバーからdesigns.htmlを開いてください。";
    }
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectTheme(tab.dataset.theme));
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index + tabs.length - 1) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === undefined) return;
      event.preventDefault();
      tabs[next].focus();
      selectTheme(tabs[next].dataset.theme);
    });
  });
  frame.addEventListener("load", preparePreview);
  selectTheme(selected, false);
  if (frame.contentDocument?.readyState === "complete") preparePreview();
})();
