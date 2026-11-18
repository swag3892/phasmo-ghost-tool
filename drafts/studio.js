(() => {
  "use strict";
  const E = window.PhasmoTool, S = window.PhasmoConceptState, W = window.PhasmoKnowledge;
  const F = window.PhasmoFootsteps, pairs = window.DraftPairNotes;
  window.removeEventListener("DOMContentLoaded", E.init);
  const main = document.querySelector("main"), status = document.querySelector("#status");
  const published = document.body.dataset.app === "field";
  const key = published ? S.DOSSIER_KEY : "phasmo-design-drafts-v1";
  let storage;
  try { storage = window.localStorage; } catch { /* Storage is optional for file previews. */ }
  const restore = () => S.readStorage(storage, key, published ? [S.LEGACY_KEY, S.STORAGE_KEY] : []);
  let s = restore();
  let selected = published ? s.selectedGhost : "revenant", other = published ? "" : "deogen", query = "", inputTab = "evidence";
  let filtersOpen = false, scenarios = {}, playing = false;
  const audio = window.PhasmoFootstepAudio.createPlayer({
    createContext: () => new AudioContext(),
    onStatus: (p) => { if (!p && playing) setPlaying(false); },
  });
  const esc = v => String(v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const ghost = id => E.GHOSTS.find(g => g.id === id);
  const ev = id => E.EVIDENCE.find(e => e.id === id);
  const fileNo = g => String(E.GHOSTS.indexOf(g) + 1).padStart(2, "0");
  const icon = (id) => `<img class="icon" src="./assets/${id}.svg" alt="">`;
  const view = () => (published ? ["board","compare"] : ["board","compare","atlas"]).includes(location.hash.slice(1)) ? location.hash.slice(1) : "board";
  const titles = { board:["A","FIELD BOARD","現場ボード"],compare:["B","COMPARISON LAB","候補比較台"],atlas:["C","FIELD ATLAS","ゴースト調査図鑑"] };
  const options = (list, val) => list.map(([id, label]) => `<option value="${esc(id)}"${id === val ? " selected" : ""}>${esc(label)}</option>`).join("");
  const activeCount = () => Object.values(s.evidenceStates).filter(v => v !== "unknown").length + s.activeBehaviors.length;
  const modes = [["nightmare","ナイトメア · 証拠2"],["professional","証拠3種類"],["insanity","インサニティ · 証拠1"],["zero","証拠なし"],["custom","カスタム"]];
  const names = {unknown:"未確認",confirmed:"確認",denied:"否定"};
  const difficulty = () => `<label class="mode">難易度<select id="difficulty">${options(modes,s.difficulty)}</select></label>${s.difficulty==="custom" ? `<label class="mode">通常証拠数<select id="custom-count">${options([0,1,2,3].map(n=>[String(n),n+"種類"]),String(s.customEvidenceCount))}</select></label>` : ""}`;
  const chips = g => `<div class="chips">${g.evidence.map(id=>`<span>${ev(id).short}${id === g.forced ? "＊" : ""}</span>`).join("")}${g.extraEvidence ? '<span class="extra">＋追加オーブ</span>' : ""}</div>${g.forced ? '<small>＊通常証拠が1種類以上なら必ず出現</small>' : ""}`;
  const summary = (id, label) => `<div class="section-title">${icon(id)}<h2>${label}</h2></div>`;
  const empty = msg => `<p class="empty">${msg}</p>`;
  const bullets = arr => `<ul>${arr.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`;
  function fieldFilters() {
    const items = inputTab === "evidence" ? E.EVIDENCE.map(e => `<div class="ev-row"><b>${e.label}</b><div class="states" role="group" aria-label="${e.label}">${Object.entries(names).map(([v,label])=>`<button data-e="${e.id}" data-v="${v}" aria-label="${e.label}：${label}" aria-pressed="${s.evidenceStates[e.id]===v}">${label}</button>`).join("")}</div></div>`).join("") : E.BEHAVIOR_FILTERS.map(b=>`<div class="behavior"><label><input type="checkbox" data-behavior="${b.id}" ${s.activeBehaviors.includes(b.id)?"checked":""}>${b.label}</label><details data-fold="b-${b.id}"><summary>判定条件</summary><p>${b.help}</p></details></div>`).join("");
    return `<div class="filters"><div class="tabs">${[["evidence","証拠"],["behavior","行動"]].map(([v,t])=>`<button data-tab="${v}" aria-pressed="${inputTab===v}">${t}</button>`).join("")}</div>${inputTab==="evidence"?'<p class="input-hint">まだ見つからない証拠は「未確認」のまま。</p>':""}<div class="observations">${items}</div><button class="quiet" id="clear" ${activeCount()?"":"disabled"}>${icon("rotate-ccw")}観測をクリア</button></div>`;
  }
  function lead(kind, remaining) {
    const [letter,en,title] = titles[kind];
    return `<div class="lead"><div><div class="eyebrow">${published?"":`<b>${letter}</b> `}${en}</div><h1>${title}</h1></div><div class="lead-side">${kind === "atlas" ? '<div class="count"><strong>30</strong><span>収録種</span></div>' : `<div class="count"><strong>${remaining}</strong><span>/ 30 候補</span></div>${difficulty()}`}</div></div>`;
  }
  function stats(g) {
    const f = F.profile(g.id), [lo,hi] = F.range(g.id);
    const val = g.id === "mimic" ? "模倣次第" : [Number(lo.toFixed(3)),Number(hi.toFixed(3))].filter((v,i,a)=>!i || v!==a[0]).join("–");
    return `<dl class="stats"><div><dt>基礎速度の目安</dt><dd>${val} ${g.id !== "mimic" ? "<small>m/s</small>":""}</dd></div><div><dt>継続視認による加速</dt><dd>${F.LOS_LABELS[f.los]}</dd></div></dl>`;
  }
  function pair(g) {
    const [id, cue, check] = pairs[g.id], peer = ghost(id);
    const canCompare = [g.id,id].every(wanted=>current.gs.some(x=>x.id===wanted));
    return `<section class="pair-note"><div class="eyebrow">${icon("arrow-left-right")} 見分け方</div><h3>${g.name}と${peer.name}</h3><p><strong>${esc(cue)}</strong></p><p>${esc(check)}</p><div class="pair-actions">${canCompare?`<button class="command" data-pair="${g.id}">${icon("columns-3")}2体を比較する</button>`:""}<a href="${W.source(id)}" target="_blank" rel="noopener">比較相手のWiki：${peer.name} ↗</a></div></section>`;
  }
  function article(g, atlas) {
    if (!g) return empty("候補がありません。観測条件を見直してください。");
    const w = W.GHOSTS[g.id], d = W.DETAILS[g.id];
    return `<article class="record" id="record" tabindex="-1"><header class="record-head"><div class="eyebrow">GHOST FILE <b>${fileNo(g)} / 30</b></div><h2>${g.name}</h2><div class="en">${g.english}</div><p class="dek">${esc(g.summary)}。</p>${chips(g)}</header>${stats(g)}
    <section class="focus-note"><h3>${icon("scan-line")}まず確かめること</h3><p>${esc(W.focusFor(g,E.getEvidenceCount(s)))}</p></section>${pair(g)}
    <div class="entries">${W.DETAIL_SECTIONS.map(sec=>atlas ? `<section><h3>${sec.label}</h3>${bullets(d[sec.id])}</section>` : `<details data-fold="rec-${g.id}-${sec.id}"><summary>${sec.label}</summary>${bullets(d[sec.id])}</details>`).join("")}<section><h3>足音と誤認しやすい点</h3>${bullets([F.profile(g.id).trait,w.caution])}</section></div><a class="source" href="${W.source(g.id)}" target="_blank" rel="noopener">日本語Wiki：${g.name} ↗</a></article>`;
  }
  function searchBox() { return `<label class="search">${icon("search")}<input id="query" type="search" placeholder="和名・英名で検索" aria-label="ゴーストを検索" value="${esc(query)}"></label>`; }
  function list(gs,id) {
    const q = query.trim().toLowerCase();
    const rows = gs.filter(g=>[g.name,g.english].some(n=>n.toLowerCase().includes(q)));
    return rows.length ? rows.map(g=>`<button class="list-item" data-ghost="${g.id}" aria-pressed="${g.id===id}"><span>${fileNo(g)}</span><b>${g.name}</b>${icon("chevron-right")}</button>`).join("") : empty("該当する名前がありません。");
  }
  function recommendation() {
    const a = window.PhasmoAdvice.buildAdvice(s), next = a.stage==="evidence" ? a.evidenceChecks[0] : a.behaviorChecks[0];
    const hint = next ? `${next.label}（確認できた場合：${next.count}候補）` : a.steps[0]?.text || a.message;
    return `<aside class="advice"><div class="eyebrow">${icon("radar")} 次の調査</div><strong>${a.heading}</strong><p>${hint}</p></aside>`;
  }
  function board(gs, g) {
    return `${lead("board",gs.length)}<div class="shortcuts"><button class="command" data-jump="roster">${icon("list-ordered")}候補一覧へ</button>${g?`<button class="command" data-jump="record">${icon("book-open")}${g.name}の詳細へ</button>`:""}</div><div class="board-grid"><section class="inputs">${summary("notebook-pen","観測ログ")}${fieldFilters()}${recommendation()}</section><section class="roster" id="roster" tabindex="-1">${summary("list-ordered","残りの候補")}${searchBox()}<div class="list" id="list">${list(gs,g?.id)}</div></section><div class="reading">${article(g,false)}</div></div>`;
  }
  function atlas() {
    const g = ghost(selected);
    return `${lead("atlas")}<div class="atlas-grid"><aside class="atlas-index">${summary("book-open","収録ゴースト")}${searchBox()}<div class="list" id="list">${list(E.GHOSTS,g.id)}</div></aside>${article(g,true)}</div>`;
  }
  const row = (label, cells) => `<tr><th scope="row">${label}</th>${cells.map(c=>`<td>${c}</td>`).join("")}</tr>`;
  function cadence(g) {
    const f = F.profile(g.id), scene = F.scenario(g.id,scenarios[g.id]);
    const marks = F.steps(scene,{seconds:6}).map(t=>`<line x1="${(t*50).toFixed(2)}" x2="${(t*50).toFixed(2)}" y1="3" y2="20"/>`).join("");
    return `<label class="scene">速度条件<select data-scene="${g.id}">${options(f.scenarios.map(i=>[i.id,i.label]),scene.id)}</select></label><svg class="cadence" viewBox="0 0 300 24" preserveAspectRatio="none" role="img" aria-label="6秒間の足音間隔の目安">${marks}</svg><small>${scene.base.toFixed(2)} m/s · 視認加速なしの試聴例</small>`;
  }
  function compare(gs, a, b) {
    const toggle = `<button id="toggle-filters" class="command" aria-expanded="${filtersOpen}">${icon("notebook-pen")}観測条件（${activeCount()}）</button>`;
    const drawer = `<div class="compare-tools">${toggle}<span>速度設定100% ／ イベント補正なし</span></div>${filtersOpen ? fieldFilters() : ""}`;
    if (!gs.length) return lead("compare",0)+drawer+recommendation();
    const group = [a,b].filter(Boolean);
    const chooser = (g,i) => `<div><label><span class="eyebrow">候補 ${i?"B":"A"}</span><select id="pick-${i}" aria-label="比較する候補${i?"B":"A"}">${options(gs.filter(x=>i===0 || x.id!==a.id).map(x=>[x.id,x.name]),g.id)}</select></label><div class="en">${g.english}</div></div>`;
    const content = [
      row("主な特徴",group.map(g=>`<strong>${g.summary}</strong>`)),
      row("証拠構成",group.map(chips)),row("足音・視認加速",group.map(g=>stats(g)+`<p>${F.profile(g.id).trait}</p>`)),
      row("足音の試聴",group.map(cadence)),
      row("最初に見る点",group.map(g=>esc(W.focusFor(g,E.getEvidenceCount(s))))),
      ...W.DETAIL_SECTIONS.map(sec=>row(sec.label,group.map(g=>bullets(W.DETAILS[g.id][sec.id])))),
      row("誤認に注意",group.map(g=>W.GHOSTS[g.id].caution)),
      row("個別資料",group.map(g=>`<a href="${W.source(g.id)}" target="_blank" rel="noopener">${g.name}のWiki ↗</a>`)),
    ].join("");
    const pairText = b && (pairs[a.id][0]===b.id ? pairs[a.id][2] : pairs[b.id][0]===a.id ? pairs[b.id][2] : "");
    return lead("compare",gs.length)+drawer+`<div class="picks">${group.map(chooser).join("")}</div><div class="listen"><div><b>${icon("headphones")} 足音の聴き比べ</b><small>合成音・各6秒</small></div><button class="command" id="play">${icon("play")}${b?"A → B で試聴":"A を試聴"}</button></div>${b?"":empty("残り1候補のため、単独で表示しています。")}${pairText ? `<p class="pair-strip"><b>見分け方</b> ${pairText}</p>` : ""}<table><thead><tr><th scope="col">比較項目</th>${group.map(g=>`<th scope="col">${g.name}</th>`).join("")}</tr></thead><tbody>${content}</tbody></table>`;
  }
  function setPlaying(on) {
    playing = on;
    const btn = document.querySelector("#play");
    if (btn) btn.innerHTML = on ? icon("square")+"停止" : icon("play")+(current.b?"A → B で試聴":"A を試聴");
  }
  let current = {};
  function render() {
    audio.stop();
    const focus = document.activeElement;
    const fold = new Set([...main.querySelectorAll("details[open]")].map(el=>el.dataset.fold));
    const oldScroll = main.querySelector("#list")?.scrollTop || 0;
    const obsScroll = main.querySelector(".observations")?.scrollTop || 0;
    const k = view(), gs = E.analyze(s).filter(r=>r.ok).map(r=>r.ghost);
    const a = gs.find(g=>g.id===selected) || gs[0];
    const b = gs.find(g=>g.id===other && g!==a) || gs.find(g=>g.id===pairs[a?.id]?.[0]) || gs.find(g=>g!==a);
    current = {gs,a,b};
    document.body.dataset.view = k;
    document.title = titles[k][2]+" | Phasmophobia 調査室";
    document.querySelectorAll("nav a").forEach(link=>{ if(link.hash==="#"+k) link.setAttribute("aria-current","page"); else link.removeAttribute("aria-current"); });
    main.innerHTML = k==="board" ? board(gs,a) : k==="compare" ? compare(gs,a,b) : atlas();
    main.querySelectorAll("details").forEach(el=>{ if(fold.has(el.dataset.fold)) el.open=true; });
    const roster = main.querySelector("#list"); if(roster) roster.scrollTop=oldScroll;
    const obs=main.querySelector(".observations"); if(obs) obs.scrollTop=obsScroll;
    if(focus && focus!==document.body && !focus.isConnected){
      const match = [...main.querySelectorAll("button,input,select")].find(el=>focus.id ? el.id===focus.id : Object.keys(focus.dataset).length && Object.keys(focus.dataset).every(key=>el.dataset[key]===focus.dataset[key]));
      match?.focus({preventScroll:true});
    }
  }
  function save() { S.writeStorage(storage,s,key); render(); status.textContent=`残り${current.gs.length}候補`; }
  function select(id) {
    selected=id;
    if(published){s.selectedGhost=id;S.writeStorage(storage,s,key);}
  }
  main.addEventListener("input", e=>{
    if(e.target.id!=="query")return;
    query=e.target.value;
    const atlasView=view()==="atlas";
    main.querySelector("#list").innerHTML=list(atlasView?E.GHOSTS:current.gs,atlasView?selected:current.a?.id);
  });
  main.addEventListener("change",e=>{
    const el=e.target;
    if(el.id==="difficulty"){s.difficulty=el.value;save();}
    else if(el.id==="custom-count"){s.customEvidenceCount=Number(el.value);save();}
    else if(el.dataset.behavior){s.activeBehaviors=el.checked?[...s.activeBehaviors,el.dataset.behavior]:s.activeBehaviors.filter(v=>v!==el.dataset.behavior);save();}
    else if(el.id==="pick-0"){if(el.value===current.b?.id)other=current.a.id;select(el.value);render();}
    else if(el.id==="pick-1"){other=el.value;render();}
    else if(el.dataset.scene){scenarios[el.dataset.scene]=el.value;render();}
  });
  main.addEventListener("click",async e=>{
    const el=e.target.closest("button");if(!el)return;
    if(el.dataset.e){S.setEvidence(s,el.dataset.e,el.dataset.v);save();}
    else if(el.dataset.tab){inputTab=el.dataset.tab;render();}
    else if(el.dataset.ghost){select(el.dataset.ghost);render();if(matchMedia("(max-width: 850px)").matches){const record=document.querySelector("#record");record?.focus({preventScroll:true});record?.scrollIntoView({block:"start"});}}
    else if(el.dataset.pair){select(el.dataset.pair);other=pairs[selected][0];location.hash="compare";}
    else if(el.dataset.jump){const target=document.getElementById(el.dataset.jump);target.focus({preventScroll:true});target.scrollIntoView({block:"start"});}
    else if(el.id==="toggle-filters"){filtersOpen=!filtersOpen;render();}
    else if(el.id==="clear"){s.evidenceStates=S.createState().evidenceStates;s.activeBehaviors=[];save();}
    else if(el.id==="play"){
      if(playing){audio.stop();return;}
      try{const ok=await audio.play([current.a,current.b].filter(Boolean).map((g,i)=>({lane:i?"B":"A",scenario:F.scenario(g.id,scenarios[g.id]),seconds:6,scale:1,accelerate:false})));if(ok)setPlaying(true);}
      catch{status.textContent="音声を再生できません。速度条件と足音の間隔図で比較できます。";el.textContent="再生できません：再試行";}
    }
  });
  window.addEventListener("hashchange",()=>{query="";render();window.scrollTo(0,0);});
  document.querySelector(".skip").addEventListener("click",e=>{e.preventDefault();main.focus();});
  function syncSaved() { s=restore(); if(published)selected=s.selectedGhost; render(); }
  window.addEventListener("pageshow",e=>{if(e.persisted)syncSaved();});
  window.addEventListener("storage",e=>{if(e.key===key || e.key===null)syncSaved();});
  window.addEventListener("pagehide",()=>audio.stop());
  render();
})();
