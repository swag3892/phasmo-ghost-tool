// node field.ui-check.cjs <playwright module> <browser executable> [--live]
const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require(process.argv[2] || "playwright");
const model = require("./concept-state.js");
const live = process.argv.includes("--live");
const base = live ? "https://swag3892.github.io/phasmo-ghost-tool/" : "https://preview.test/phasmo-ghost-tool/";

(async () => {
  const browser = await chromium.launch({ executablePath: process.argv[3], headless: true });
  try {
    const page = await browser.newPage(), errors = [];
    if (!live) await page.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (!url.href.startsWith(base)) return route.abort();
      const name = url.pathname.slice(new URL(base).pathname.length) || "index.html";
      if (!/^(?:[a-z0-9-]+\/)?[a-z0-9-]+\.(?:html|js|css|svg)$/.test(name)) return route.abort();
      await route.fulfill({ path: path.resolve(__dirname,name) });
    });
    page.on("pageerror", e=>errors.push(String(e)));
    page.on("response", r=>{if(r.status()>=400)errors.push(r.status()+" "+r.url());});
    await page.goto(base);
    assert.equal(await page.locator("h1").innerText(),"現場ボード");
    assert.equal(await page.locator(".count strong").innerText(),"30");
    const prev = model.createState();
    prev.selectedGhost = "revenant";
    prev.footVolume = 73;
    prev.difficulty = "custom";
    prev.customEvidenceCount = 2;
    await page.evaluate(({key,prev})=>{
      localStorage.setItem(key,JSON.stringify(prev));
      localStorage.setItem("phasmo-design-drafts-v1",JSON.stringify({...prev, difficulty:"zero"}));
    },{key:model.DOSSIER_KEY,prev});
    await page.reload();
    assert.equal(await page.locator("#difficulty").inputValue(),"custom");
    assert.equal(await page.locator("#custom-count").inputValue(),"2");
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      for(const hash of ["board","compare"]){
        await page.locator('nav a[href="#'+hash+'"]').click();
        await page.waitForSelector('body[data-view="'+hash+'"]');
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),hash+" overflows at "+width);
      }
    }
    await page.locator("nav a[href='#board']").click();
    await page.locator('[data-e="writing"][data-v="confirmed"]').click();
    const reduced=await page.locator(".count strong").innerText();
    await page.locator('[data-pair="revenant"]').click();
    assert.equal(await page.locator("#pick-0").inputValue(),"revenant");
    assert.equal(await page.locator("#pick-1").inputValue(),"deogen");
    assert.equal(await page.locator(".count strong").innerText(),reduced);
    await page.locator("nav a[href='./dossier.html']").click();
    const dossierNav=page.getByRole("navigation",{name:"調査画面"});
    await dossierNav.waitFor({state:"visible"});
    assert.deepEqual(await dossierNav.getByRole("link").allTextContents(),["現場ボード","候補比較台","調査ファイル"]);
    assert.equal(await dossierNav.locator('[aria-current="page"]').textContent(),"調査ファイル");
    for(const width of [320,390,768,1024,1440]){
      await page.setViewportSize({width,height:900});
      const nav=await dossierNav.boundingBox();
      const actions=await page.locator(".file-header .utility-actions").boundingBox();
      assert.ok(nav && actions && nav.y>=0 && nav.y<200 && nav.x>=0 && nav.x+nav.width<=width+1);
      assert.ok(nav.x>=actions.x+actions.width-1 || nav.y>=actions.y+actions.height-1,"nav overlaps utilities at "+width);
    }
    await dossierNav.getByRole("link",{name:"候補比較台"}).click();
    assert.equal(await page.locator("h1").innerText(),"候補比較台");
    assert.equal(await page.locator(".count strong").innerText(),reduced);
    await page.getByRole("navigation",{name:"調査画面"}).getByRole("link",{name:"調査ファイル"}).click();
    assert.equal(await page.locator('[data-evidence="writing"][data-state="confirmed"]').getAttribute("aria-checked"),"true");
    await page.locator('[data-evidence="writing"][data-state="unknown"]').click();
    await dossierNav.getByRole("link",{name:"現場ボード"}).click();
    assert.equal(await page.locator(".count strong").innerText(),"30");
    await page.locator("#custom-count").selectOption("0");
    await page.locator('[data-e="orb"][data-v="confirmed"]').click();
    assert.equal(await page.locator(".count strong").innerText(),"1");
    assert.match(await page.locator(".focus-note").innerText(),/通常証拠0/);
    await page.reload();
    assert.equal(await page.locator("#record h2").innerText(),"ミミック");
    const saved=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)),model.DOSSIER_KEY);
    assert.equal(saved.footVolume,73);
    assert.equal(saved.customEvidenceCount,0);
    await page.locator("nav a[href='#compare']").click();
    assert.equal(await page.locator("#pick-1").count(),0);
    assert.deepEqual(errors,[]);
    console.log("PASS: "+base+" | board, comparison, custom evidence, shared dossier state, draft isolation, 5 widths");
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
