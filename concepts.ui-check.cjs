"use strict";
const assert = require("node:assert/strict");
const path = require("node:path");
const fs = require("node:fs");
const argument = (name) => process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : undefined;
const { chromium } = require(argument("--playwright") || "playwright");
const model = require("./concept-state.js");
const engine = require("./app.js");
const knowledge = require("./wiki-knowledge.js");
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
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 950 });
      for (const ghost of engine.GHOSTS) {
        await field("searchTerm").fill(ghost.english);
        await page.locator(`.candidate-rail [data-ghost="${ghost.id}"]`).click();
        assert.equal(await page.locator(".case-record .record-summary").innerText(), ghost.summary);
        assert.equal(await page.locator(".case-record .record-foot a").getAttribute("href"), ghost.source);
        assert.equal(await page.locator(".case-record .wiki-focus .wiki-links a").getAttribute("href"), knowledge.source(ghost.id));
        assert.equal((await page.locator(".case-record .wiki-focus > .record-notes li").allTextContents()).join(""), knowledge.focusFor(ghost, 2));
        assert.equal(await page.locator(".case-record .wiki-pitfall").count(), 1);
        assert.deepEqual(await page.locator('.case-record .record-section > .record-notes > li').allTextContents(), model.noteItems(ghost.tell));
        const facts = page.locator(`.case-record [data-ghost-facts="${ghost.id}"]`);
        await facts.locator("summary").click();
        assert.equal(await facts.locator(".ghost-fact-group").count(), 3);
        for (const section of knowledge.DETAIL_SECTIONS) {
          assert.deepEqual(await facts.locator(`[data-fact-section="${section.id}"] li`).allTextContents(), knowledge.DETAILS[ghost.id][section.id], `${ghost.id} ${section.id} ${width}`);
        }
        assert.equal(await facts.locator(".wiki-links a").getAttribute("href"), knowledge.source(ghost.id));
        await assertLayout(`${ghost.id} bullet lists ${width}`);
        await page.reload();
        assert.equal(await page.locator(`.case-record [data-ghost-facts="${ghost.id}"]`).count(), 1);
      }
      await action("reset").click();
    }
    console.log("All 30 ghost profiles and 90 detailed sections render on desktop and mobile.");
    await evidence("emf", "confirmed").click();
    await page.locator('[data-focus="open-advice"]').click();
    assert.equal(await page.locator("#case-advice").getAttribute("aria-selected"), "true");
    assert.equal(await page.locator("#case-advice").evaluate((element) => element === document.activeElement), true);
    assert.equal(await page.locator(".investigation-advice").getAttribute("data-advice-stage"), "evidence");
    assert.ok((await page.locator('[data-advice-evidence="orb"]').innerText()).includes("13 → 2種類"));
    await field("searchTerm").fill("名前なし");
    await field("showExcluded").check();
    assert.ok((await page.locator(".advice-heading").innerText()).includes("候補 13種類"));
    await field("searchTerm").fill("");
    await field("showExcluded").uncheck();
    await page.locator('[data-disclosure="advice-behaviors"] summary').click();
    await page.locator('[data-action="reviewBehavior"][data-behavior="goryoDots"]').click();
    assert.equal(await page.locator('[data-behavior="goryoDots"]').isChecked(), false);
    assert.equal(await page.locator('[data-disclosure="goryoDots"]').evaluate((element) => element.open), true);
    assert.equal(await field("behaviorTerm").inputValue(), "D.O.T.S.の姿がカメラ越しでのみ見える");
    await page.locator('[data-behavior="goryoDots"]').check();
    await count(1);
    await page.locator("#case-advice").click();
    assert.equal(await page.locator(".investigation-advice").getAttribute("data-advice-stage"), "confirm");
    await page.reload();
    assert.equal(await page.locator("#case-advice").getAttribute("aria-selected"), "true");
    await action("reset").click();
    await evidence("emf", "confirmed").click();
    await evidence("writing", "confirmed").click();
    await page.locator("#case-advice").click();
    assert.equal(await page.locator(".investigation-advice").getAttribute("data-advice-stage"), "behavior");
    assert.equal(await page.locator("[data-advice-evidence]").count(), 0);
    assert.equal(await page.locator(".advice-comparison > details").count(), 4);
    assert.ok((await page.locator('[data-advice-behavior="spiritSmudge"]').innerText()).includes("参考・除外なし"));
    await page.locator("#case-advice").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#case-settings").getAttribute("aria-selected"), "true");
    await page.keyboard.press("ArrowLeft");
    assert.equal(await page.locator("#case-advice").getAttribute("aria-selected"), "true");
    await action("reset").click();
    await page.locator("#case-behaviors").click();
    await page.locator('[data-behavior="maleName"]').check();
    await page.locator('[data-behavior="bansheeScream"]').check();
    await page.locator("#case-advice").click();
    assert.equal(await page.locator(".investigation-advice").getAttribute("data-advice-stage"), "review");
    assert.equal(await page.locator("[data-advice-evidence], [data-advice-behavior]").count(), 0);
    console.log("Adaptive advice, review links, keyboard, persistence, search independence and contradictory inputs passed.");
    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 950 });
      await action("reset").click();
      await assertLayout(`adopted dossier ${width}`);
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `dossier-final-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
      await evidence("emf", "confirmed").click();
      await page.locator("#case-advice").click();
      await assertLayout(`adopted dossier advice ${width}`);
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `advice-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
      await page.locator('[data-disclosure="advice-hunt"] summary').click();
      await page.locator('[data-disclosure="advice-behaviors"] summary').click();
      await assertLayout(`adopted dossier expanded advice ${width}`);
      await action("reset").click();
      await page.locator("#case-settings").click();
      await field("difficulty").selectOption("custom");
      await field("customEvidenceCount").fill("0");
      await page.locator("#case-behaviors").click();
      await page.locator('[data-behavior="obakePrint"]').check();
      await count(2);
      await assertLayout(`adopted dossier behavior ${width}`);
      await page.locator("#case-advice").click();
      assert.equal(await page.locator("[data-advice-evidence]").count(), 1);
      assert.equal(await page.locator("[data-advice-evidence]").getAttribute("data-advice-evidence"), "orb");
      await assertLayout(`adopted dossier zero evidence advice ${width}`);
      await action("reset").click();
      await page.locator('[data-disclosure="all-evidence"] summary').click();
      assert.equal(await page.locator(".reference-table tbody tr").count(), 30);
      const referenceLists = page.locator(".reference-table tbody .record-notes");
      assert.equal(await referenceLists.count(), 30);
      for (const [index, ghost] of engine.GHOSTS.entries()) {
        assert.deepEqual(await referenceLists.nth(index).locator("li").allTextContents(), model.noteItems(ghost.hunt), `reference ${ghost.id} ${width}`);
      }
      await page.locator("#gameUpdates summary").click();
      await assertLayout(`adopted dossier references ${width}`);
      await page.locator("#gameUpdates summary").click();
      await page.locator('[data-disclosure="all-evidence"] summary').click();
    }
    await action("reset").click();
    await page.locator("#view-record").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#view-compare").getAttribute("aria-selected"), "true");
    assert.equal(await page.locator("[data-foot-ghost]").count(), 30);
    assert.equal(await page.locator(".foot-workspace").getAttribute("data-playing"), "false");
    assert.equal(await action("stopFootsteps").isDisabled(), true);
    await field("footA").selectOption("thaye");
    assert.equal(await field("footAccelerateA").isDisabled(), true);
    await field("footA").selectOption("jinn");
    await field("footAccelerateA").check();
    assert.ok((await page.locator('[data-listen-lane="A"] .listen-metrics').innerText()).includes("1.7 → 2.81"));
    await field("footScenarioA").selectOption("rush");
    assert.equal(await field("footAccelerateA").isDisabled(), true);
    assert.equal(await field("footAccelerateA").isChecked(), false);
    await field("footB").selectOption("reference");
    await field("footSpeed").selectOption("150");
    await field("footMoon").check();
    assert.ok((await page.locator('[data-listen-lane="A"] .listen-metrics').innerText()).includes("4.31"));
    assert.ok((await page.locator('[data-listen-lane="B"] .listen-metrics').innerText()).includes("2.93"));
    await page.reload();
    assert.equal(await field("footA").inputValue(), "jinn");
    assert.equal(await field("footMoon").isChecked(), true);
    assert.equal(await page.locator(".foot-workspace").getAttribute("data-playing"), "false", "reload never autoplays");
    await field("footSpeed").selectOption("100");
    await field("footMoon").uncheck();
    await field("footLos").selectOption("no");
    assert.equal(await page.locator("[data-foot-ghost]").count(), 5);
    await field("footLos").selectOption("conditional");
    assert.equal(await page.locator("[data-foot-ghost]").count(), 4);
    await field("footLos").selectOption("all");
    await field("searchTerm").fill("myling");
    assert.equal(await page.locator("[data-foot-ghost]").count(), 1);
    assert.ok((await page.locator('[data-foot-ghost="myling"]').innerText()).includes("12m"));
    await field("searchTerm").fill("");
    await page.locator("#view-record").click();
    await evidence("emf", "confirmed").click();
    await page.locator("#view-compare").click();
    assert.equal(await page.locator("[data-foot-ghost]").count(), 13);
    await page.locator('[data-action="footScope"][data-scope="all"]').click();
    assert.equal(await page.locator("[data-foot-ghost]").count(), 30);
    await count(13);
    await action("reset").click();
    await page.locator('[data-action="openFootsteps"]').click();
    assert.equal(await field("footA").inputValue(), "aswang");
    await field("footSeconds").selectOption("6");
    await action("playFootsteps").filter({ hasText: "A → B" }).click();
    await page.waitForFunction(() => document.getElementById("footPlayback").textContent.startsWith("A 再生中"));
    await field("footVolume").focus();
    await page.keyboard.press("ArrowDown");
    assert.equal(await page.locator(".foot-workspace").getAttribute("data-playing"), "true", "volume can change during playback");
    await page.keyboard.press("ArrowUp");
    await page.waitForFunction(() => document.getElementById("footPlayback").textContent.startsWith("B 再生中"), null, { timeout: 10000 });
    await page.waitForFunction(() => document.getElementById("footPlayback").textContent === "停止中", null, { timeout: 10000 });
    assert.equal(await action("stopFootsteps").isDisabled(), true);
    await page.locator('[data-foot-ghost="deogen"] [data-lane="B"]').click();
    await page.waitForFunction(() => document.getElementById("footPlayback").textContent.startsWith("B 再生中"));
    assert.equal(await field("footB").inputValue(), "deogen");
    await action("stopFootsteps").click();
    assert.equal(await page.locator(".foot-workspace").getAttribute("data-playing"), "false");
    await page.locator('[data-action="playFootsteps"][data-lane="A"]').click();
    await field("footA").selectOption("moroi");
    assert.equal(await page.locator(".foot-workspace").getAttribute("data-playing"), "false", "changing a listening condition stops playback");
    await page.locator('[data-action="playFootsteps"][data-lane="A"]').click();
    await page.locator("#view-record").click();
    await page.locator("#view-compare").click();
    assert.equal(await page.locator(".foot-workspace").getAttribute("data-playing"), "false", "leaving comparison stops playback");
    await field("footVolume").focus();
    await page.keyboard.press("ArrowRight");
    assert.equal(await page.locator("#footVolumeValue").innerText(), "40%");
    const waveform = await page.evaluate(async () => {
      const context = new OfflineAudioContext(1, 44100 * 6, 44100);
      const buffer = window.PhasmoFootstepAudio.makeBuffer(context);
      const gain = context.createGain();
      gain.gain.value = 0.35;
      gain.connect(context.destination);
      const times = window.PhasmoFootsteps.steps(window.PhasmoFootsteps.scenario("reference"), { seconds: 6 });
      for (const time of times) {
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(gain);
        source.start(time);
      }
      const samples = (await context.startRendering()).getChannelData(0);
      return { peak: samples.reduce((peak, sample) => Math.max(peak, Math.abs(sample)), 0), rms: Math.sqrt(samples.reduce((sum, sample) => sum + sample * sample, 0) / samples.length), steps: times.length };
    });
    assert.ok(waveform.peak > 0.05 && waveform.peak < 1);
    assert.ok(waveform.rms > 0.005);
    console.log(`Synthetic audio render passed: ${JSON.stringify(waveform)}`);
    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 950 });
      await field("footA").selectOption("aswang");
      await field("footAccelerateA").check();
      await field("footSeconds").selectOption("15");
      await field("footB").selectOption("reference");
      await field("footAccelerateB").check();
      await assertLayout(`footstep comparison ${width}`);
      await page.locator("#view-compare").scrollIntoViewIfNeeded();
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `footsteps-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
      await field("footA").selectOption("mimic");
      await field("footB").selectOption("deildegast");
      await field("footScenarioB").selectOption("objects-26");
      await assertLayout(`footstep edge states ${width}`);
    }
    await page.locator("#view-record").click();
    await page.locator("#case-behaviors").click();
    await page.locator('[data-behavior="maleName"]').check();
    await page.locator('[data-behavior="bansheeScream"]').check();
    await page.locator("#view-compare").click();
    assert.equal(await page.locator("[data-foot-ghost]").count(), 0);
    assert.ok((await page.locator(".foot-table").innerText()).includes("比較対象がありません"));
    console.log("Footstep comparison, conditional LOS, A/B playback, persistence, keyboard and five viewport sizes passed.");
    await action("reset").click();
    await page.locator("#view-record").click();
    await page.locator("#case-behaviors").click();
    const observation = (id) => page.locator(`[data-observation="${id}"]`);
    const scope = (id) => page.locator(`[data-action="behaviorScope"][data-scope="${id}"]`);
    assert.equal(await page.locator("[data-observation]").count(), 28);
    assert.equal(await page.locator(".behavior-group").count(), 7);
    await field("behaviorTerm").fill("ＵＶ 化け狐");
    assert.equal(await page.locator("[data-observation]").count(), 1);
    assert.ok((await observation("obakeUv").innerText()).includes("30 → 2候補"));
    await page.locator('[data-behavior="obakeUv"]').check();
    await count(2);
    await field("behaviorTerm").fill("存在しない観測");
    assert.equal(await page.locator("[data-observation]").count(), 0);
    assert.equal(await page.locator('[data-action="removeBehavior"][data-remove-behavior="obakeUv"]').count(), 1);
    await page.locator('[data-action="removeBehavior"][data-remove-behavior="obakeUv"]').click();
    await count(30);
    assert.equal(await field("behaviorTerm").evaluate((element) => element === document.activeElement), true);
    await page.locator('[data-focus="clear-behavior-display"]').click();
    await field("behaviorTerm").fill("ばんしー");
    assert.equal(await observation("bansheeScream").count(), 1);
    await action("clearBehaviorSearch").click();
    await page.locator('[data-behavior="maleName"]').check();
    await count(28);
    await field("behaviorCategory").selectOption("sound");
    assert.equal(await page.locator("[data-observation]").count(), 3);
    assert.ok((await observation("bansheeScream").innerText()).includes("28 → 0候補"));
    assert.ok((await observation("bansheeScream").innerText()).includes("両立しません"));
    await field("behaviorMode").selectOption("hint");
    assert.equal(await page.locator("[data-observation]").count(), 2);
    await page.locator('[data-behavior="mylingQuiet"]').check();
    await count(28);
    await scope("selected").click();
    assert.equal(await page.locator("[data-observation]").count(), 1);
    await page.reload();
    assert.equal(await field("behaviorCategory").inputValue(), "sound");
    assert.equal(await field("behaviorMode").inputValue(), "hint");
    assert.equal(await scope("selected").getAttribute("aria-pressed"), "true");
    await page.locator('[data-focus="clear-behavior-display"]').click();
    assert.equal(await page.locator("[data-observation]").count(), 28);
    assert.equal(await page.locator('.behavior-selected li').count(), 2);
    await count(28);
    await page.locator('[data-behavior="bansheeScream"]').check();
    await count(0);
    assert.ok((await page.locator(".behavior-conflict").innerText()).includes("両立していません"));
    assert.ok((await observation("maleName").innerText()).includes("解除すると 2候補"));
    assert.ok((await observation("bansheeScream").innerText()).includes("解除すると 28候補"));
    await page.locator('[data-action="removeBehavior"][data-remove-behavior="bansheeScream"]').click();
    await count(28);
    await action("clearBehaviors").click();
    await count(30);
    await scope("selected").click();
    assert.ok((await page.locator(".behavior-empty").innerText()).includes("選択中の行動はありません"));
    await page.locator('[data-focus="empty-behavior-display"]').click();
    await page.locator("#case-settings").click();
    await field("difficulty").selectOption("zero");
    await page.locator("#case-behaviors").click();
    assert.ok((await observation("goryoDots").innerText()).includes("証拠0では観測できません"));
    assert.equal(await observation("mimicOrb").locator(".observation-warning").count(), 0);
    await scope("relevant").click();
    assert.equal(await observation("goryoDots").count(), 0);
    assert.equal(await observation("mimicOrb").count(), 1);
    await action("reset").click();
    await page.locator("#case-behaviors").click();
    await field("behaviorTerm").evaluate((element) => {
      element.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
      element.value = "しお";
      element.dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
    });
    assert.equal(await page.locator("[data-observation]").count(), 28);
    await field("behaviorTerm").evaluate((element) => {
      element.value = "塩";
      element.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true }));
    });
    assert.equal(await observation("wraithSalt").count(), 1);
    await action("clearBehaviorSearch").click();
    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 950 });
      await action("reset").click();
      await page.locator("#case-behaviors").click();
      await page.locator('[data-behavior="maleName"]').check();
      await field("behaviorCategory").selectOption("sound");
      await page.locator('[data-disclosure="bansheeScream"] summary').click();
      await assertLayout(`refined behavior filters ${width}`);
      await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
      if ([390, 1440].includes(width)) await page.screenshot({ path: path.join(output, `behaviors-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
      await page.locator('[data-behavior="bansheeScream"]').check();
      await assertLayout(`behavior conflicts ${width}`);
      await field("behaviorTerm").fill("no matching behavior");
      await assertLayout(`empty behavior search ${width}`);
    }
    console.log("Behavior categories, normalized search, combined display filters, selection removal, conflicts, zero evidence and five widths passed.");
    await action("reset").click();
    await page.locator("#case-behaviors").click();
    await field("behaviorCategory").selectOption("power");
    assert.equal(await page.locator("[data-observation]").count(), 3);
    await page.reload();
    assert.equal(await field("behaviorCategory").inputValue(), "power");
    await action("clearBehaviorDisplay").click();
    for (const [id, excluded] of Object.entries({ breakerOn: "hantu", breakerOff: "jinn", lightOn: "mare", saltStepped: "wraith", incenseBefore180: "spirit" })) {
      await page.locator(`[data-behavior="${id}"]`).check();
      await count(29);
      assert.equal(await page.locator(`.candidate-rail [data-ghost="${excluded}"]`).count(), 0);
      assert.equal(await page.locator('.candidate-rail [data-ghost="mimic"]').count(), 1);
      await observation(id).locator("details > summary").click();
      assert.ok((await observation(id).locator(".wiki-links a").getAttribute("href")).startsWith(knowledge.REVIEW.home));
      await page.locator(`[data-behavior="${id}"]`).uncheck();
      await count(30);
    }
    await field("behaviorCategory").selectOption("protection");
    await page.locator('[data-disclosure="wraithSalt"] > summary').click();
    assert.equal(await observation("wraithSalt").locator('[data-wiki-report="salt-sync"]').count(), 1);
    await action("reset").click();
    await page.locator('.candidate-rail [data-ghost="gallu"]').click();
    await page.locator('.case-record [data-disclosure="reports-ghost-gallu"] > summary').click();
    await page.locator("#case-behaviors").click();
    await field("behaviorCategory").selectOption("power");
    await page.locator('[data-disclosure="breakerOff"] > summary').click();
    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 1100 });
      await assertLayout(`wiki reports and exclusions ${width}`);
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); });
        await page.screenshot({ path: path.join(output, `wiki-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: width === 390 });
      }
    }
    await page.locator("#case-settings").click();
    await field("difficulty").selectOption("zero");
    await page.locator('.candidate-rail [data-ghost="goryo"]').click();
    assert.ok((await page.locator(".case-record .wiki-focus").innerText()).includes("証拠0では"));
    await page.locator('.candidate-rail [data-ghost="mimic"]').click();
    assert.ok((await page.locator(".case-record .wiki-focus").innerText()).includes("通常証拠0でも追加オーブ"));
    console.log("Japanese wiki coverage, five exclusions, report disclosure, persistence and evidence-aware guidance passed.");
    await action("reset").click();
    await page.locator('.candidate-rail [data-ghost="obake"]').click();
    await page.locator('.case-record [data-ghost-facts="obake"] > summary').focus();
    await page.keyboard.press("Enter");
    const detailedRecord = page.locator('.case-record [data-ghost-facts="obake"]');
    assert.equal(await detailedRecord.evaluate((element) => element.open), true);
    await evidence("ultraviolet", "confirmed").click();
    assert.equal(await detailedRecord.evaluate((element) => element.open), true);
    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 1100 });
      await detailedRecord.scrollIntoViewIfNeeded();
      await assertLayout(`expanded ghost details ${width}`);
      if ([390, 1440].includes(width)) {
        await page.evaluate(() => document.activeElement?.blur());
        await page.screenshot({ path: path.join(output, `details-${width === 390 ? "mobile" : "desktop"}.png`), fullPage: true });
      }
    }
    await evidence("orb", "confirmed").click();
    await page.locator("#case-advice").click();
    await page.locator('[data-disclosure="advice-ghost-obake"] > summary').click();
    await page.locator('[data-disclosure="conditions-advice-obake"] > summary').click();
    assert.equal(await page.locator('.advice-comparison [data-ghost-facts="obake"] .ghost-fact-group').count(), 3);
    await page.locator('[data-disclosure="advice-ghost-mimic"] > summary').click();
    await page.locator('[data-disclosure="conditions-advice-mimic"] > summary').click();
    for (const width of [320, 390, 768, 1080, 1440]) {
      await page.setViewportSize({ width, height: width < 540 ? 844 : 1100 });
      await assertLayout(`expanded advice ghost details ${width}`);
    }
    console.log("Detailed profiles, keyboard disclosure, input stability and advice comparison passed at five widths.");
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
