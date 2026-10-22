(function registerFootstepView(factory) {
  if (typeof module !== "undefined" && module.exports) module.exports = factory(require("./app.js"), require("./footsteps.js"));
  else window.PhasmoFootstepView = factory(window.PhasmoTool, window.PhasmoFootsteps);
})(function viewFactory(engine, model) {
  "use strict";
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const icon = (name) => `<img src="./assets/${name}.svg" width="18" height="18" alt="" />`;
  const number = (value) => String(Math.round(value * 100) / 100);
  const range = (values) => values[0] === values[1] ? number(values[0]) : `${number(values[0])}～${number(values[1])}`;
  const badge = (profile) => `<span class="los-badge los-${profile.los}">視認加速 ${model.LOS_LABELS[profile.los]}</span>`;
  const name = (id) => id === "reference" ? "標準速度（基準音）" : engine.GHOSTS.find((ghost) => ghost.id === id).name;
  const select = (state, field, label, options) => `<label class="foot-field"><span>${label}</span><select data-field="${field}" data-focus="${field}" aria-label="${label}">${options.map(([id, text]) => `<option value="${escape(id)}" ${String(state[field]) === String(id) ? "selected" : ""}>${escape(text)}</option>`).join("")}</select></label>`;
  function mini(ghost, canCompare) {
    const profile = model.profile(ghost.id);
    return `<section class="record-footsteps" aria-label="足音と視認加速"><div class="foot-mini-heading"><h3>${icon("footprints")}足音と視認加速</h3>${badge(profile)}</div><p><strong>${ghost.id === "mimic" ? "速度は模倣先に依存" : `加速前 約${range(model.range(ghost.id))} m/s（速度100%・補正なし）`}</strong></p><p>${escape(profile.trait)}</p>${canCompare ? `<button type="button" class="advice-link" data-action="openFootsteps" data-ghost="${ghost.id}" data-focus="compare-${ghost.id}">${icon("headphones")}足音を比較${icon("arrow-right")}</button>` : ""}</section>`;
  }
  function lane(state, key, candidates) {
    const id = state[`foot${key}`];
    const profile = model.profile(id);
    const item = model.scenario(id, state[`footScenario${key}`]);
    const scale = model.multiplier(state.footSpeed, state.footMoon);
    const accelerate = item.bonus > 0 && state[`footAccelerate${key}`];
    const start = model.speedAt(item, 0, accelerate, scale);
    const end = model.speedAt(item, state.footSeconds, accelerate, scale);
    const laneState = { ...state, [`footScenario${key}`]: item.id };
    const choices = [["reference", name("reference")], ...engine.GHOSTS.map((ghost) => [ghost.id, `${ghost.name}${candidates.has(ghost.id) ? "" : "（候補外）"}`])];
    return `<section class="listen-lane" data-listen-lane="${key}" aria-labelledby="listen-${key}">
      <header><h3 id="listen-${key}"><span class="lane-key">${key}</span>${escape(name(id))}</h3><button type="button" class="foot-button" data-action="playFootsteps" data-lane="${key}" data-focus="play-${key}" aria-label="${key}の足音を再生" title="${key}の足音を再生">${icon("play")}再生</button></header>
      ${select(state, `foot${key}`, `${key}のゴースト`, choices)}
      ${select(laneState, `footScenario${key}`, `${key}の状態`, profile.scenarios.map((scenario) => [scenario.id, scenario.label]))}
      <label class="foot-check ${item.bonus ? "" : "is-disabled"}"><input type="checkbox" data-field="footAccelerate${key}" data-focus="footAccelerate${key}" ${accelerate ? "checked" : ""} ${item.bonus ? "" : "disabled"} />継続視認による加速${item.bonus ? "" : "（この状態ではなし）"}</label>
      <div class="listen-metrics"><div><span>${accelerate ? "開始 → 試聴終了時" : "試聴速度"}</span><strong>${number(start)}${accelerate ? ` → ${number(end)}` : ""}<small>m/s</small></strong></div><div><span>足音の回数 / 分（概算）</span><strong>${Math.round(60 / model.interval(start))}${accelerate ? ` → ${Math.round(60 / model.interval(end))}` : ""}</strong></div></div>
      <div class="speed-track" aria-hidden="true"><span style="width:${Math.min(100, end / (3.7125 * scale) * 100)}%"></span><i style="left:${Math.min(100, start / (3.7125 * scale) * 100)}%"></i></div>
      <p class="listen-note">${escape(profile.note || profile.trait)}</p>
    </section>`;
  }
  function render(state) {
    const candidates = new Set(engine.analyze(state).filter((result) => result.ok).map((result) => result.ghost.id));
    const scale = model.multiplier(state.footSpeed, state.footMoon);
    const term = state.searchTerm.trim().toLocaleLowerCase("ja");
    const ghosts = engine.GHOSTS.filter((ghost) => (state.footScope === "all" || candidates.has(ghost.id)) && (state.footLos === "all" || model.profile(ghost.id).los === state.footLos) && (!term || [ghost.name, ghost.english, ghost.id].some((text) => text.toLocaleLowerCase("ja").includes(term))));
    return `<section class="foot-workspace" aria-labelledby="footTitle" data-playing="false">
      <header class="foot-heading"><div><p class="file-number">HUNT / FOOTSTEPS</p><h2 id="footTitle">足音・視認加速の比較</h2></div><span class="foot-synthetic">${icon("audio-lines")}合成リズム音</span></header>
      <p class="foot-intro">視認加速は、ゴーストがプレイヤーを見続けることで徐々に速くなることです。発見時の急加速や、温度・電子機器による速度変化とは区別しています。</p>
      <div class="foot-settings">
        ${select(state, "footSpeed", "ゴースト速度", [50, 75, 100, 125, 150].map((speed) => [speed, `${speed}%`]))}
        ${select(state, "footSeconds", "1回の試聴", [[6, "6秒"], [15, "15秒"]])}
        <label class="foot-check"><input type="checkbox" data-field="footMoon" data-focus="footMoon" ${state.footMoon ? "checked" : ""} />Blood Moon（速度+15%）</label>
        <label class="foot-volume">${icon("volume-2")}<span>音量 <output id="footVolumeValue">${state.footVolume}%</output></span><input type="range" min="0" max="100" step="5" value="${state.footVolume}" aria-label="試聴音量" data-field="footVolume" data-focus="footVolume" /></label>
      </div>
      <div class="listen-pair">${lane(state, "A", candidates)}${lane(state, "B", candidates)}</div>
      <div class="listen-transport"><button type="button" class="foot-button foot-primary" data-action="playFootsteps" data-lane="both" data-focus="play-both">${icon("arrow-left-right")}A → B を聴き比べ</button><button type="button" class="icon-control" data-action="stopFootsteps" data-focus="stop-footsteps" title="試聴を停止" aria-label="試聴を停止" disabled>${icon("square")}</button><p id="footPlayback" aria-label="再生状態">停止中</p></div>
      <p class="foot-disclaimer">ゲーム音声ではありません。音色・音量・距離による聞こえ方は再現せず、足音の間隔だけを比較します。固定した状態での近似例です。温度・距離などの途中変化や、視認が途切れた後の減速は含みません。</p>
      <div class="foot-table-tools"><h3>ゴースト別の比較 <span>${ghosts.length}種類</span></h3><div role="group" class="foot-scope" aria-label="比較対象">${[["candidates", "候補のみ"], ["all", "全30種類"]].map(([scope, label]) => `<button type="button" data-action="footScope" data-scope="${scope}" data-focus="scope-${scope}" aria-pressed="${state.footScope === scope}">${label}</button>`).join("")}</div>${select(state, "footLos", "視認加速で表示", [["all", "すべて"], ...Object.entries(model.LOS_LABELS)])}</div>
      <div class="foot-table-scroll" data-scroll="foot-table" tabindex="0" role="region" aria-label="足音の比較一覧"><table class="foot-table"><caption class="sr-only">加速前の速度・視認加速・足音の特徴。速度${state.footSpeed}%${state.footMoon ? "、Blood Moon補正あり" : "、イベント補正なし"}。</caption><thead><tr><th scope="col">ゴースト</th><th scope="col">加速前の速度 / 継続視認時</th><th scope="col">視認加速</th><th scope="col">足音の特徴・比較する条件</th><th scope="col">試聴</th></tr></thead><tbody>${ghosts.map((ghost) => {
        const profile = model.profile(ghost.id);
        const top = Math.max(...profile.scenarios.map((item) => model.speedAt(item, 15, true, scale)));
        return `<tr data-foot-ghost="${ghost.id}"><th scope="row">${escape(ghost.name)}<small>${ghost.english}${candidates.has(ghost.id) ? "" : " / 候補外"}</small></th><td class="foot-speed-cell">${ghost.id === "mimic" ? "模倣先に依存" : `約${range(model.range(ghost.id, scale))} <small>m/s</small>`}${["yes", "conditional"].includes(profile.los) ? `<small>継続視認 上限 約${number(top)} m/s${profile.los === "conditional" ? "（条件あり）" : ""}</small>` : ""}</td><td>${badge(profile)}</td><td class="foot-trait">${escape(profile.trait)}<a href="${escape(ghost.source)}" target="_blank" rel="noopener" aria-label="${escape(ghost.name)}の仕様資料">仕様資料</a></td><td><div class="foot-row-actions">${["A", "B"].map((key) => `<button type="button" class="foot-button" data-action="listenGhost" data-ghost="${ghost.id}" data-lane="${key}" data-focus="listen-${ghost.id}-${key}" title="${escape(ghost.name)}を${key}に選んで再生" aria-label="${escape(ghost.name)}を${key}に選んで再生">${icon("play")}${key}</button>`).join("")}</div></td></tr>`;
      }).join("") || '<tr><td colspan="5" class="empty-note">比較対象がありません。候補条件または表示対象を確認してください。</td></tr>'}</tbody></table></div>
      <p class="foot-caution">標準速度の15種類はリズムだけでは区別できません。視認が途切れた後の減速、状態の切り替わり、経路の曲がり角などでも聞こえ方は変わります。ミミックによる模倣を含め、足音だけで候補を確定・除外しないでください。確認のために近づいたり、ハントを起こしたりする必要はありません。</p>
      <footer class="foot-sources"><span>足音比較の資料確認: ${model.REVIEW_DATE} / 数値は概算</span><a href="https://github.com/swag3892/phasmo-ghost-tool/blob/main/GHOST_AUDIT.md#足音と視認加速の比較" target="_blank" rel="noopener">計算方法と出典</a></footer>
    </section>`;
  }
  return { render, mini, number };
});
