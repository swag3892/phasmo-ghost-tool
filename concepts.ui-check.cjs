"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const argument = (name) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
const { chromium } = require(argument("--playwright") || "playwright");
const model = require("./concept-state.js");
const base = (argument("--url") || "http://127.0.0.1:4173").replace(/\/$/, "");
const executablePath = argument("--browser");
const output = path.join(__dirname, "concept-previews");

async function main() {
  fs.mkdirSync(output, { recursive: true });
  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 950 } });
  await context.route("**/*", (route) => {
    if (new URL(route.request().url()).origin === new URL(base).origin) return route.continue();
    return route.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { async writeText(text) { window.copiedSummary = text; } } });
  });
  const action = (name) => page.locator(`#conceptApp ${name === "reset" ? ".utility-actions " : ""}[data-action="${name}"]`);
  const evidence = (id, status) => page.locator(`[data-evidence="${id}"][data-state="${status}"]`);
  const field = (name) => page.locator(`[data-field="${name}"]`);
  async function count(expected) {
    await page.waitForFunction((number) => document.getElementById("liveStatus").textContent === `候補 ${number}種類`, expected);
  }
  async function open(concept) {
    await page.goto(`${base}/concepts.html?concept=${concept}`);
    await page.locator("#conceptApp h1").waitFor();
    await action("reset").click();
    await count(30);
  }
  async function assertLayout(label) {
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((item) => item.complete));
    const result = await page.evaluate(() => {
      const width = document.documentElement.clientWidth;
      const broken = [...document.images].filter((item) => !item.complete || item.naturalWidth === 0).map((item) => item.src);
      const narrowButtons = [...document.querySelectorAll("button")].filter((item) => {
        const rect = item.getBoundingClientRect();
        return rect.width > 0 && item.scrollWidth > item.clientWidth + 2;
      }).map((item) => item.getAttribute("aria-label") || item.textContent.trim());
      return { width, scroll: document.documentElement.scrollWidth, broken, narrowButtons };
    });
    assert.ok(result.scroll <= result.width + 1, `${label}: page overflow ${JSON.stringify(result)}`);
    assert.deepEqual(result.broken, [], `${label}: broken assets`);
    assert.deepEqual(result.narrowButtons, [], `${label}: clipped controls`);
  }

  try {
    if (!process.argv.includes("--production-only")) {
    const palette = () => page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return [style.backgroundColor, style.color, style.colorScheme, ...["--muted", "--line", "--accent"].map((name) => style.getPropertyValue(name))];
    });
    await open("flow");
    const darkPalette = await palette();
    await open("file");
    assert.deepEqual(await palette(), darkPalette, "dossier and staged layouts share the dark palette");
    assert.equal(await page.locator(".case-spread").evaluate((element) => getComputedStyle(element).display), "grid");
    await open("matrix");
    assert.equal(await page.locator("[data-ghost-row]").count(), 30);
    await evidence("emf", "confirmed").click();
    await count(13);
    assert.equal(await page.locator("[data-ghost-row]").count(), 13);
    await field("showExcluded").check();
    assert.equal(await page.locator("[data-ghost-row]").count(), 30);
    await page.locator('[data-ghost="mimic"]').click();
    assert.equal(await page.locator("#ghostDialog").evaluate((dialog) => dialog.open), true);
    assert.ok((await page.locator("#ghostDialog").innerText()).includes("追加"));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#ghostDialog").evaluate((dialog) => dialog.open), false);
    await page.locator("#fileTab").click();
    assert.equal(await evidence("emf", "confirmed").getAttribute("aria-checked"), "true");
    await action("reset").click();
    await action("nextGhost").click();
    const selected = await page.locator("#conceptApp [data-ghost-detail]").getAttribute("data-ghost-detail");
    assert.equal(selected, model.visibleResults(model.createState())[1].ghost.id);
    await field("searchTerm").pressSequentially("mimic");
    assert.equal(await field("searchTerm").inputValue(), "mimic");
    assert.equal(await field("searchTerm").evaluate((element) => element === document.activeElement), true);
    assert.equal(await page.locator("#conceptApp [data-ghost-detail]").getAttribute("data-ghost-detail"), "mimic");
    await field("searchTerm").fill("");
    await page.locator("#case-behaviors").click();
    await page.locator('[data-disclosure="maleName"] summary').click();
    await page.locator('[data-behavior="maleName"]').check();
    await count(28);
    assert.equal(await page.locator('[data-disclosure="maleName"]').evaluate((element) => element.open), true);
    await page.locator("#case-settings").click();
    await field("difficulty").selectOption("custom");
    await field("customEvidenceCount").fill("3");
    assert.equal(await field("customEvidenceCount").inputValue(), "3");
    await page.locator("#flowTab").click();
    assert.equal(await field("difficulty").inputValue(), "custom");
    await action("reset").click();
    await evidence("emf", "unknown").focus();
    await page.keyboard.press("ArrowDown");
    await count(13);
    assert.equal(await evidence("emf", "confirmed").evaluate((element) => element === document.activeElement), true);
    await action("clearEvidence").click();
    await page.locator('[data-focus="dock-next"]').click();
    await page.locator('[data-behavior="maleName"]').check();
    await page.locator('[data-behavior="bansheeScream"]').check();
    await count(0);
    await page.locator('[data-focus="dock-next"]').click();
    assert.ok((await page.locator(".flow-record").innerText()).includes("条件に合うゴーストがいません"));
    await action("reset").click();
    await evidence("orb", "confirmed").click();
    await action("copy").click();
    assert.ok((await page.evaluate(() => window.copiedSummary)).includes("ゴーストオーブ"));
    await page.reload();
    assert.equal(await evidence("orb", "confirmed").getAttribute("aria-checked"), "true");
    assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [model.STORAGE_KEY]);
    console.log("Evidence, filters, dossier navigation, steps, keyboard, copy and persistence passed.");

    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 950 });
      for (const concept of ["matrix", "file", "flow"]) {
        await open(concept);
        await assertLayout(`${concept} ${width}`);
        if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `${concept}-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
        if (concept === "matrix") {
          await page.locator(".matrix-scroll").evaluate((element) => { element.scrollLeft = 500; });
          await evidence("writing", "confirmed").scrollIntoViewIfNeeded();
          const before = await page.locator(".matrix-scroll").evaluate((element) => element.scrollLeft);
          await evidence("writing", "confirmed").click();
          assert.equal(await page.locator(".matrix-scroll").evaluate((element) => element.scrollLeft), before);
          await action("toggleMatrixFilters").click();
          await assertLayout(`${concept} observations ${width}`);
        }
        if (concept === "file") {
          await page.locator(".candidate-rail").evaluate((element) => { element.scrollLeft = 1200; });
          const before = await page.locator(".candidate-rail").evaluate((element) => element.scrollLeft);
          await evidence("emf", "confirmed").click();
          assert.ok(await page.locator(".candidate-rail").evaluate((element) => element.scrollLeft) <= before);
          await page.locator("#case-behaviors").click();
          await assertLayout(`${concept} behaviors ${width}`);
          await page.locator("#case-settings").click();
          await field("difficulty").selectOption("custom");
          await assertLayout(`${concept} custom ${width}`);
        }
        if (concept === "flow") {
          await field("difficulty").selectOption("custom");
          await assertLayout(`${concept} custom ${width}`);
          await page.locator('[data-focus="step-1"]').click();
          await assertLayout(`${concept} observations ${width}`);
          await page.locator('[data-focus="step-2"]').click();
          await assertLayout(`${concept} results ${width}`);
          if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `flow-results-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          const covered = await page.locator(".flow-record").evaluate((element) => element.getBoundingClientRect().bottom > document.querySelector(".flow-dock").getBoundingClientRect().top);
          assert.equal(covered, false, `flow ${width}: footer covers content`);
        }
      }
      console.log(`All layouts passed at ${width}px.`);
    }
    }
    await page.goto(`${base}/index.html?concept=flow`);
    await page.locator("#appTitle").waitFor();
    assert.equal(await page.locator("body").getAttribute("data-app"), "dossier");
    assert.equal(await page.locator(".concept-picker").count(), 0);
    assert.equal(await page.locator(".case-spread").count(), 1);
    const previous = { ...model.createState(), evidenceStates: { ...model.createState().evidenceStates, emf: "confirmed" } };
    await page.evaluate(({ previous, oldKey, newKey }) => {
      localStorage.removeItem(newKey);
      localStorage.setItem(oldKey, JSON.stringify(previous));
    }, { previous, oldKey: model.LEGACY_KEY, newKey: model.DOSSIER_KEY });
    await page.reload();
    await count(13);
    assert.equal(await evidence("emf", "confirmed").getAttribute("aria-checked"), "true");
    await action("reset").click();
    assert.equal(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).evidenceStates.emf, model.LEGACY_KEY), "confirmed");
    const compositionStayedConnected = await field("searchTerm").evaluate((element) => {
      element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      element.value = "ミミ";
      element.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
      const connected = element.isConnected;
      element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
      return connected;
    });
    assert.equal(compositionStayedConnected, true, "Japanese composition is not interrupted by rendering");
    assert.equal(await page.locator("#conceptApp [data-ghost-detail]").getAttribute("data-ghost-detail"), "mimic");
    await field("searchTerm").fill("名前なし");
    await action("clearSearch").click();
    assert.equal(await field("searchTerm").inputValue(), "");
    await page.locator("#case-behaviors").click();
    await page.locator('[data-behavior="maleName"]').check();
    await page.locator('[data-behavior="bansheeScream"]').check();
    await count(0);
    assert.equal(await page.locator(".case-record .empty-action").innerText(), "条件をリセット");
    await page.locator(".case-record .empty-action").click();
    await count(30);
    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 950 });
      await action("reset").click();
      await assertLayout(`adopted dossier ${width}`);
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `dossier-final-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
      await page.locator("#case-settings").click();
      await field("difficulty").selectOption("custom");
      await field("customEvidenceCount").fill("0");
      await page.locator("#case-behaviors").click();
      await page.locator('[data-behavior="obakePrint"]').check();
      await count(2);
      await assertLayout(`adopted dossier behavior ${width}`);
      await action("reset").click();
      await page.locator('[data-disclosure="all-evidence"] summary').click();
      assert.equal(await page.locator(".reference-table tbody tr").count(), 30);
      await page.locator("#gameUpdates summary").click();
      await assertLayout(`adopted dossier references ${width}`);
      await page.locator("#gameUpdates summary").click();
      await page.locator('[data-disclosure="all-evidence"] summary').click();
    }
    await page.goto(`${base}/legacy.html`);
    assert.equal(await page.locator("#candidateCount").innerText(), "13");
    console.log("Adopted dossier, migration, empty states, references and legacy compatibility passed.");
    assert.deepEqual(errors, [], "browser runtime or asset errors");
    console.log(`Screenshots saved: ${output}`);
  } finally {
    await browser.close();
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
