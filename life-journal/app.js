(() => {
  "use strict";

  const STORE_KEY = "rensheng-shouji.save.v1";
  const REGIONS = {
    chengdu: { name: "成都", country: "中国" },
    lyon: { name: "里昂", country: "法国" }
  };
  const FAMILIES = {
    steady: "收支平稳",
    tight: "手头拮据"
  };
  const ROUTES = { study: "继续求学", work: "开始工作" };
  const main = document.getElementById("main");
  const notice = document.getElementById("notice");
  const saveStatus = document.getElementById("saveStatus");
  const dialog = document.getElementById("dialog");
  const cancel = document.getElementById("dialogCancel");
  const ok = document.getElementById("dialogOk");
  const api = window.Life;
  const clockAPI = window.AnnualClock;
  if (!api || !clockAPI) {
    notice.hidden = false;
    notice.textContent = "人生引擎或时钟未能载入，请检查游戏文件是否完整，然后刷新。";
    return;
  }
  let clock = clockAPI.restore(null);
  let birthMode = "newborn";
  let era = "now";
  let selectedYear = 2026;
  const birthYears = window.LifeWorld?.years || [2026];
  const eras = {now:"现在", past:"过去", future:"未来", random:"随机年代"};
  let moveId = null;
  let lastCommit = 0;
  let dirty = false;
  let scenes = [];
  let feedIndex = -1;
  let barObserver;
  const reflectionAges = [5, 15, 30, 50, 70];
  let state = null;
  let previous = null;
  let jumpedFrom = null;
  let setup = true;
  let lastRaw = null;
  let damaged = false;
  let storageOK = true;
  let onConfirm = null;
  let lastTrigger = null;

  function safe(value) {
    return String(value ?? "").replace(/[&<>"']/g, c => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[c]);
  }
  function number(value) {
    return Number.isFinite(value) ? new Intl.NumberFormat("zh-CN", { maximumFractionDigits: 1 }).format(value) : "—";
  }
  function message(value) {
    notice.textContent = value;
    notice.hidden = !value;
  }
  function status() {
    saveStatus.textContent = !storageOK ? "仅本次会话" : state ? "已在本机存档" : "";
  }
  function seed() {
    return globalThis.crypto?.getRandomValues ? crypto.getRandomValues(new Uint32Array(1))[0] : Math.floor(Math.random() * 4294967296);
  }
  function clone(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }
  const money = (s, n) => window.LifeDesk.money(s,n);
  const narrative = (s, text) => safe(window.LifeDesk.moneyText(s,text));
  function place(id, year = 2026) {
    return window.LifeWorld?.place?.(id, year) || REGIONS[id] || { name: String(id), country: "", label: String(id) };
  }
  function locationName(r) {
    return [...new Set([r.country, r.name].filter(Boolean))].join(" · ");
  }
  function button(action, label, style = "secondary") {
    return '<button type="button" class="' + style + '" data-action="' + action + '">' + safe(label) + '</button>';
  }
  function dataLabel(year) {
    if (year === 2026) return "世界银行 WDI · 2023年数据";
    return "联合国 WPP 2024 · " + year + (year < 2024 ? "年历史估计" : "年中位推算");
  }
  function yearField() {
    if (era === "now") return '<p class="era-note">' + dataLabel(2026) + '</p>';
    if (era === "random") return '<p class="era-note">出生时从 1950—2100 年中等概率抽取一年。</p>';
    const years = birthYears.filter(y => era === "past" ? y < 2026 : y > 2026);
    return '<label class="select-field">出生年份<select id="birthYear">' + years.map(y =>
      '<option value="' + y + '"' + (y === selectedYear ? ' selected' : '') + '>' + y + '年</option>').join("") +
      '</select></label><p class="era-note" id="birthYearSource">' + dataLabel(selectedYear) + '</p>';
  }
  function worldSettings() {
    const label = era === "random" ? eras[era] : eras[era] + " · " + selectedYear + "年";
    return '<details class="world-settings"><summary><strong>出生设置</strong><span id="eraSummary">' + label + '</span></summary>' +
      '<div class="world-fields"><label class="select-field">出生年代<select id="birthEra">' +
      Object.entries(eras).map(([id,name]) => '<option value="' + id + '"' + (id === era ? ' selected' : '') +
        (id !== "now" && birthYears.length < 2 ? ' disabled' : '') + '>' + name + '</option>').join("") +
      '</select></label><div id="birthYearField">' + yearField() + '</div><label class="select-field">出生抽取方式<select id="birthMode">' +
      '<option value="newborn"' + (birthMode === "newborn" ? ' selected' : '') + '>按出生人数</option>' +
      '<option value="population"' + (birthMode === "population" ? ' selected' : '') + '>按在世人口</option></select></label></div></details>';
  }
  function opening() {
    return '<section class="title-screen"><div class="title-frame">' +
      '<img class="station-art" src="./assets/midnight-platform.webp" alt="" fetchpriority="high">' +
      '<div class="station-shade" aria-hidden="true"></div><div class="title-copy">' +
      '<p class="title-kicker"><i aria-hidden="true"></i>互动人生年鉴</p><h1>人生手记</h1>' +
      '<p class="title-description">你将随机出生在九个国家之一。<br>每逢人生岔路，时间都会停下，等你选择。</p>' +
      '<div class="title-controls"><button type="button" class="primary birth-button" data-action="birth"><i class="dice-mark" aria-hidden="true"></i>随机出生</button>' +
      (state ? button("resume", "返回当前人生") : "") + '</div></div></div>' +
      worldSettings() + '<div id="pastLives"></div></section>';
  }
  function field(label, value) {
    return '<div><dt>' + safe(label) + '</dt><dd>' + safe(value) + '</dd></div>';
  }
  function birthFields(s) {
    const r = place(s.region, s.birthYear);
    const setting = window.LifeWorld?.storySetting?.(s);
    const wealth = ["", "最紧张", "较紧张", "居中", "较宽裕", "最宽裕"][s.quintile];
    return field("出生地", [locationName(r),setting?.label].filter(Boolean).join(" · ")) +
      field("出生年月", s.birthYear + "年" + (s.month ? s.month + "月" : "")) +
      (s.sex ? field("性别", s.sex === "female" ? "女性" : "男性") : "") +
      (s.residence ? field("居住环境", s.residence === "urban" ? "城镇" : "乡村") : "") +
      field("出生时的家境", wealth ? wealth + " · 五分位 " + s.quintile + "/5" : FAMILIES[s.family] || "—");
  }
  function sourceNote(key) {
    const ref = window.CountryStories?.references.get(key);
    if (!ref) return "";
    return '<a class="background-source" href="'+safe(ref.url)+'" target="_blank" rel="noopener noreferrer">背景资料 · '+safe(ref.label)+'</a>';
  }
  function homeContext(s) {
    if (!window.CountryStories?.active(s)) return "";
    const facts = window.CountryStories.sampleHome(s);
    if (!facts.length) return "";
    const area = (s.origin?.country || s.origin?.label || "") + (s.residence === "urban" ? "城镇" : "乡村");
    return '<details class="birth-context"><summary>出生时，家里用水用电方便吗？</summary>' +
      facts.map(row => {
        const personal = row.id === "power" ? (row.present ? "家中有电可用。" : "家中还用不上电。") :
          (row.present ? "日常有基本饮水服务。" : "家里还缺基本饮水服务。");
        return '<p><b>'+safe(personal)+'</b> '+safe(row.year+"年，"+area+"约有 "+row.percent+"% 的人口享有这项服务。")+
          ' '+sourceNote(row.sourceKey)+'</p>';
      }).join("")+'<p>家里的情形按当地比例抽取。基本饮水服务指使用改良水源，往返取水连排队不超过半小时。</p></details>';
  }
  function calendar(s, age, fraction) {
    const offset = (s.month || 1) - 1 + Math.min(11, Math.floor(fraction * 12));
    return {year:s.birthYear + age + Math.floor(offset / 12), month:offset % 12 + 1};
  }
  function ageLabel(s) {
    if (!s.ended || !s.ending) return s.age + "岁";
    if (s.ending.years === 0) return s.ending.months ? s.ending.months + "个月" : "未满1个月";
    return s.ending.years + "岁" + (s.ending.months ? s.ending.months + "个月" : "");
  }
  function visibleDate(s, fraction) {
    return s.ended && s.ending ? calendar(s,s.ending.years,s.ending.months / 12) : calendar(s,s.age,fraction);
  }
  function profile(s) {
    return '<section class="profile"><div class="identity-band"><h2>身份档案</h2><span>' + safe(s.birthYear) +
      '</span></div><div class="profile-body"><h3>' + safe(s.name) + '</h3><dl class="stats">' + birthFields(s) +
      field("当前身份", s.career || s.stage || "—") + field("记账货币",window.LifeDesk.currencyLabel(s)) +
      field(s.age<(s.edition==="regional-2"?17:16)?"家庭现金":"可用现金", money(s,s.cash)) +
      '</dl>'+homeContext(s)+'</div></section>';
  }
  function timeline(s) {
    const items = [...window.LifeKeepsakes.visibleLog(s)].reverse();
    return '<details class="journal"><summary>人生历程（' + items.length + '）</summary><ol class="timeline">' +
      items.map(e => '<li><span class="age">' + (e.kind === "ending" ? safe(ageLabel(s)) : safe(e.age) + '岁') + '</span><div><strong>' +
        safe(e.title) + '</strong><p>' + narrative(s,e.text) + '</p>' + sourceNote(e.sourceKey) + '</div></li>').join("") + '</ol></details>';
  }
  function passage(s) {
    if (jumpedFrom === null) return "";
    const items = s.log.filter(e => e.age > jumpedFrom);
    const lastOf = kind => items.filter(e => e.kind === kind).at(-1);
    const personal = items.filter(e => e.threadKey);
    const notes = [...new Set([personal[0],personal.at(-1),lastOf("echo"),lastOf("event")].filter(Boolean))]
      .sort((a,b)=>items.indexOf(a)-items.indexOf(b));
    if (!notes.length) return "";
    return '<section class="passage"><h3>翻过的几页</h3><ul>' +
      notes.map(e => '<li><b>' + safe(e.age) + '岁 · ' + safe(e.title) + '</b><p>' +
        narrative(s,e.text) + '</p></li>').join("") + '</ul></section>';
  }
  function decision(s) {
    const p = s.pending;
    const d = visibleDate(s,clock.fraction);
    return '<section class="decision"><div class="decision-heading"><span class="meta">' +
      (p.type === "reflection" ? "人生反思" : "人生抉择") + ' · 时间已暂停</span><span>' + s.age + '岁 · ' + d.year + '年' + d.month + '月</span></div><h2 id="stepHeading" tabindex="-1">' +
      safe(p.title) + '</h2><p>' + narrative(s,p.text) + '</p><div class="decision-options">' +
      p.options.map(o => '<button type="button" data-action="choose" data-id="' + safe(o.id) +
        '" data-pending="' + safe(p.id) + '"' + (o.disabled ? ' disabled' : '') + '><strong>' + safe(o.label) + '</strong><small>' +
        narrative(s,o.note) + '</small></button>').join("") + '</div>' + sourceNote(p.sourceKey) + passage(s) + '</section>';
  }
  function ledger(s,r) {
    const labels=['收入','实付','助学','年末余额'];
    return '<table class="ledger"><caption>'+safe(window.LifeDesk.currencyLabel(s))+
      '</caption><thead><tr><th scope="col">结算时间</th>'+labels.map(l=>'<th scope="col">'+l+'</th>').join('')+'</tr></thead><tbody>'+
      r.rows.map(row=>'<tr><th scope="row">'+safe(row.age)+'岁'+(Number.isInteger(s.birthYear)?' <small>'+safe(s.birthYear+row.age)+'年'+(s.month?safe(s.month)+'月':'')+'</small>':'')+'</th>'+[row.income,row.cost,row.aid||0,row.balance].map((v,i)=>
        '<td data-col="'+labels[i]+'">'+safe(money(s,v))+'</td>').join('')+'</tr>').join('')+'</tbody></table>'+
      '<p class="report-desc">期初现金 '+safe(money(s,r.startCash))+' · 期末现金 '+safe(money(s,r.endCash))+'</p>'+
      '<p class="opportunity"><b>下一步的机会</b>　'+narrative(s,r.opportunity)+'</p>';
  }
  function report(s) {
    const r = s.report;
    const label = ROUTES[s.route] || "本次选择";
    const earlier = previous?.financialIdentity;
    const differentLife = earlier?.region && ["region","edition","version","birthYear"].some(key=>earlier[key]!==s[key]);
    const compare = previous && (previous.route !== s.route || differentLife) && Array.isArray(previous.report?.rows);
    const detail = '<h3>这次 · ' + safe(label) + '</h3>' + ledger(s,r) +
      (compare ? '<div class="archived"><h3>上次 · ' + safe(ROUTES[previous.route]) + '</h3>' +
        ledger(earlier||{},previous.report) + '</div>' : '') +
      (s.canRewind ? '<div class="story-actions">' + button("rewind", "回到16岁重选") + '</div>' : '');
    if (s.age !== 19 || s.ended || clock.reportRead) {
      return '<details class="journal"><summary>19岁 · 三年收支与机会</summary>' + detail + '</details>';
    }
    return '<section class="report"><p class="eyebrow">16 — 19 岁</p><h2 id="stepHeading" tabindex="-1">三年后的账本</h2>' +
      '<p class="report-desc">' + (compare ? "两条路线的收支和机会并列在下面。" :
      "回看十六岁之后的收入、开支和机会。回到当年的岔路，可以尝试另一种选择。") + '</p>' + detail +
      '<div class="story-actions">' + button("readReport", "读完账本，继续人生", "primary") + '</div></section>';
  }
  function recall(s) {
    const events = Array.isArray(s.memories) ? s.memories : [];
    const pages = window.LifeKeepsakes.pages(s);
    const localChoices = (s.log || []).filter(e => e.kind === "choice" && e.sourceKey);
    const lastLocal = localChoices.at(-1);
    const lastEcho = (s.log || []).filter(e => e.kind === "echo" && e.sourceKey).at(-1);
    const extra = [localChoices[0],lastLocal,lastEcho].filter(Boolean);
    const memories = events.filter((m, i) => !m.threadKey && (i === 0 || i === events.length - 1 || [16, 19, 30, 33, 50, 56, 68, 72].includes(m.age) ||
      extra.some(e => e.age === m.age && e.title === m.title)));
    function moment(m) {
      const age=m === events.at(-1) && !m.threadKey ? ageLabel(s) : m.age===0 ? "出生那年" : m.age+"岁";
      return '<li><b>'+safe(age)+'</b>　<strong>'+safe(m.title)+'</strong><p>'+narrative(s,m.text)+'</p></li>';
    }
    const personal=pages.length?'<section class="keepsake-pages"><h3>留下来的几页</h3>'+
      pages.map((page,i)=>'<details'+(i===0?' open':'')+'><summary>'+safe(page.name)+'</summary><ol class="memories">'+
        page.featured.map(moment).join("")+'</ol></details>').join("")+'</section>':"";
    const milestones='<ul class="memories">'+memories.map(moment).join("")+'</ul>';
    const summary = [
      s.route ? field("十六岁的选择", ROUTES[s.route] || s.route) : "",
      s.education?.years ? field("后续学习", s.education.path + " · " + s.education.years + "年") : "",
      s.job?.title ? field("从事过的职业", s.job.title) : "",
      s.household ? field("家庭生活", s.household) : "",
      s.childCount > 0 ? field("孩子", s.childCount + "人") : ""
    ].join("");
    return '<section class="recall"><p class="eyebrow">一生回顾</p><h2 id="stepHeading" tabindex="-1">' +
      safe(s.name) + '的一生</h2><p>' + safe(s.name) + '于' + visibleDate(s,0).year + '年去世，' +
      (s.ending?.years === 0 ? '离世时' : '终年') + safe(ageLabel(s)) + '。</p>' +
      personal+(summary ? '<dl class="end-facts">' + summary + '</dl>' : "")+
      (pages.length?'<details><summary>回看人生大事</summary>'+milestones+'</details>':milestones)+
      '<div class="story-actions">' + button("restart", "重新开局", "primary") +
      (s.canRewind ? button("rewind", "回到16岁重选") : '') + '</div></section>';
  }
  function durationSelect() {
    return '<label class="select-field">预计时长<select id="duration">' + clockAPI.durations.map(m =>
      '<option value="' + m + '"' + (m === clock.minutes ? ' selected' : '') + '>约 ' + m + ' 分钟</option>').join("") + '</select></label>';
  }
  function registration(s) {
    const r = place(s.region,s.birthYear);
    return '<div class="registration"><section class="story birth-card"><p class="eyebrow">出生登记 · ' +
      safe(s.birthYear) + '年</p><h1 tabindex="-1" id="stepHeading" aria-describedby="birthFacts">' + safe(s.name) +
      '</h1><dl class="birth-facts" id="birthFacts">' + birthFields(s) +
      (Number.isFinite(s.origin?.lifeExp) ? field("地区预期寿命基准", number(s.origin.lifeExp) + "岁") : "") +
      '</dl><p class="birth-story">' + narrative(s,s.log[0]?.text) +
      '</p>' + homeContext(s) + (s.version === 2 ? '<p class="era-note">人口资料依据：' + dataLabel(s.birthYear) + '</p>' : '') +
      '<div class="story-actions">' + durationSelect() + button("start", "开始这一生", "primary") +
      '</div></section><figure class="registration-scene"><canvas id="lifeScene" width="320" height="104" role="img" aria-label="出生时的居住环境"></canvas><figcaption>' +
      safe(locationName(r))+' · '+(s.residence==="urban"?"街区":s.residence==="rural"?"乡间":"居住地")+'夜景</figcaption></figure>' +
      '</div>' + button("restart","重新开局","text-btn");
  }
  function clockReason() {
    if (state.ended) return "人生已结束";
    if (state.pending) return state.pending.type === "reflection" ? "等待你的反思" : "等待抉择";
    if (state.age === 19 && state.report && !clock.reportRead) return "等待读完账本";
    if (needsReflection(state)) return "等你写下反思";
    if (writingNote()) return "书写中 · 计时暂停";
    return clock.paused ? "已暂停" : "时间流动中";
  }
  function writingNote() {
    return document.activeElement?.matches("#reflectionNote, .desk-note textarea");
  }
  function yearSeconds(s) {
    const lifeExp = s.origin?.lifeExp ?? place(s.region,s.birthYear).lifeExp;
    return clock.minutes * 60 / (Number.isFinite(lifeExp) && lifeExp > 0 ? lifeExp : 80);
  }
  function needsReflection(s) {
    return reflectionAges.includes(s.age) && !clock.reflections.includes(s.age) && !s.ended && !s.pending;
  }
  function reflection(s) {
    const last = (s.log || []).filter(e => e.kind === "choice" && e.sourceKey && e.age > s.age - 21).at(-1);
    const question = last ? '你在'+last.age+'岁时选了「'+last.title+'」。当时你想给谁留一点余地？今天再选，会有什么不同？' :
      '回看这些年的经历，哪一件事最想记住？';
    return '<section class="decision reflection"><p class="meta">人生反思 · 时间已暂停</p><h2 id="stepHeading" tabindex="-1">' +
      safe(s.age) + '岁，停笔片刻</h2><label for="reflectionNote">'+safe(question)+'</label>' +
      '<textarea id="reflectionNote" rows="3" maxlength="1200"></textarea><div class="story-actions">' +
      button("note", "写进手记", "primary") + button("skipReflection", "跳过反思") + '</div></section>';
  }
  function clockBar(s) {
    const controls = s.ended ? "" : '<div class="time-controls">' +
      button("pause", clock.paused ? "继续" : "暂停","secondary pause-control") +
      '<div class="speeds" role="group" aria-label="时间倍速">' + clockAPI.speeds.map(n =>
        '<button type="button" data-action="speed" data-rate="' + n + '" aria-pressed="' +
        (clock.speed === n) + '">' + n + '×</button>').join("") + '</div>' + durationSelect() +
      (!s.pending && !needsReflection(s) && !(s.age === 19 && s.report && !clock.reportRead) ?
        button("next","快进到下个抉择","text-btn") : "") + '</div>';
    return '<section class="clock-panel" aria-label="人生时钟"><div class="clock-heading"><div><p class="eyebrow">' +
      safe(place(s.region,s.birthYear).name) + ' · ' + safe(s.stage) + '</p><h1>' +
      (s.ended ? safe(ageLabel(s)) : safe(s.age) + '<small> 岁</small>') + '<span>' +
      safe(s.name) + '</span></h1></div><div class="clock-date"><strong id="clockDate"></strong><small id="clockState">' +
      clockReason() + '</small></div><div class="clock-finance">' + button("finance","财务","secondary finance-launch") +
      '<small>'+safe(window.LifeDesk.currencyLabel(s))+'</small></div></div><div class="year-meter"><progress aria-label="本年进度" id="yearProgress" max="1"></progress>' +
      '<span id="yearPercent"></span></div><p class="clock-pace">1× 时每年约 ' + Math.round(yearSeconds(s)) + ' 秒</p>' + controls + '</section>';
  }
  function vitals(s) {
    const metrics = [["health","健康"],["happiness","幸福"],["knowledge","知识"],["bond","人际关系"]];
    return '<section class="vitals pane"><h2>状态 <small>0–100</small></h2><dl>' +
      metrics.map(([key,label]) => '<div><dt>' + label + '</dt><dd><meter aria-label="' + label +
        '" min="0" max="100" value="' + safe(s[key] ?? 0) + '"></meter><b>' + number(s[key]) +
        '</b></dd></div>').join("") + '</dl></section>';
  }
  function focusBox(s) {
    const options = api.focusOptions?.(s) || [];
    if (!options.length || s.ended) return "";
    const selected = options.find(o => o.id === s.focus) || options[0];
    return '<section class="focus-panel pane"><label for="focusSelect">今年的重心</label><select id="focusSelect">' +
      options.map(o => '<option value="' + safe(o.id) + '"' + (o.id === selected.id ? ' selected' : '') + '>' +
        safe(o.label) + '</option>').join("") + '</select><p>' + narrative(s,selected.note) + '</p></section>';
  }
  function yearFeed(s) {
    const visible = scenes.filter(e => e.at <= clock.fraction);
    feedIndex = visible.length;
    const recent = window.LifeKeepsakes.visibleLog(s).filter(e => e.kind !== "decision").slice(-7).concat(visible.map(e => ({...e,age:s.age}))).reverse().slice(0,7);
    return '<ol class="live-records">' + recent.map(e => '<li><span>' + (e.kind === "ending" ? safe(ageLabel(s)) : safe(e.age) + '岁') +
      (Number.isFinite(e.at) ? ' · ' + calendar(s,e.age,e.at).month + '月' : '') +
      '</span><div><strong>' + safe(e.title) + '</strong><p>' + narrative(s,e.text) + '</p>' + sourceNote(e.sourceKey) + '</div></li>').join("") + '</ol>';
  }
  function life(s) {
    const legacy = s.version === 1 ? '<aside class="legacy-banner"><div><strong>这是一份旧版人生</strong>' +
      '<p>可以继续原来的经历，也可以重新出生，体验新版的年度重心、职业和家庭生活。</p></div>' +
      button("newVersion", "从0岁体验新版", "primary") + '</aside>' : "";
    if (!clock.started && !s.ended) return legacy + registration(s);
    const reportNow = s.age === 19 && s.report && !clock.reportRead;
    const priority = s.ended ? recall(s) : s.pending ? decision(s) : reportNow ? report(s) : needsReflection(s) ? reflection(s) : "";
    const archive = s.report && !reportNow ? report(s) : "";
    const nav = !s.ended ? '<div class="journal-links">' +
      (s.canRewind && !s.report ? button("rewind","回到16岁重选","text-btn") : "") +
      button("restart","重新开局","text-btn") + '</div>' : "";
    return legacy + clockBar(s) + '<nav class="mobile-tabs" aria-label="人生面板">' +
      '<a href="' + (priority ? '#stepHeading' : '#reading') + '">今年的生活</a><a href="#identity">身份档案</a><a href="#lifeDesk">家人与手记</a></nav>' +
      '<div class="dashboard' + (priority ? ' has-decision' : '') + '"><div class="vitals-slot">' + vitals(s) + window.LifeDesk.balanceCard(s) + '</div>' +
      '<div class="identity-slot" id="identity">' + profile(s) + '</div><div class="reading" id="reading">' + priority +
      '<canvas id="lifeScene" width="320" height="104" role="img" aria-label="这一年居住的环境"></canvas>' + focusBox(s) +
      '<section class="pane feed"><h2>人生记录</h2><div id="yearFeed">' + yearFeed(s) + '</div></section>' +
      archive + timeline(s) + nav + '</div><div id="lifeDesk"></div></div>';
  }
  function paint() {
    const progress = document.getElementById("yearProgress");
    if (!progress || !state) return;
    const fraction = state.ended ? 1 : clock.fraction;
    const date = visibleDate(state, state.ended ? 0 : fraction);
    progress.value = fraction;
    document.getElementById("clockDate").textContent = date.year + "年" + date.month + "月";
    const percent = Math.floor(fraction * 100) + "%";
    document.getElementById("yearPercent").textContent = percent;
    const statusText = clockReason();
    document.getElementById("miniClock").textContent = ageLabel(state) + " · " + date.year + "年" + date.month + "月 · " + percent +
      (statusText === "时间流动中" ? "" : " · " + statusText);
    document.getElementById("clockState").textContent = clockReason();
    if (scenes.filter(e => e.at <= clock.fraction).length !== feedIndex)
      document.getElementById("yearFeed").innerHTML = yearFeed(state);
  }
  function render(focus = false) {
    const key = !setup && state ? [state.version,state.seed,state.region,state.family,state.birthYear].join("/") : "";
    const drafts = [];
    if (key && main.dataset.life === key) {
      for (const selector of ["#reflectionNote", "#lifeDesk .desk-note textarea"]) {
        const node = main.querySelector(selector);
        if (node?.value) drafts.push({selector, value:node.value, active:node === document.activeElement,
          start:node.selectionStart, end:node.selectionEnd});
      }
    }
    main.dataset.life = key;
    scenes = state && clock.started && !state.ended ? api.yearScenes?.(state) || [] : [];
    main.innerHTML = setup || !state ? opening() : life(state);
    status();
    const mini = document.getElementById("miniClock");
    mini.hidden = true;
    barObserver?.disconnect();
    const bar = document.querySelector(".clock-panel");
    if (bar && window.IntersectionObserver) {
      barObserver = new IntersectionObserver(entries => {
        const e = entries[0];
        mini.hidden = e.isIntersecting || e.boundingClientRect.bottom > 0;
      });
      barObserver.observe(bar);
    }
    paint();
    const history = document.getElementById("pastLives");
    if (history) window.LifeDesk?.mountHistory?.(history, {restoreLegacy});
    const desk = document.getElementById("lifeDesk");
    if (desk) window.LifeDesk?.mount(desk, state, {buy: id => operate(s => api.buy(s, id)),date:visibleDate(state,clock.fraction)});
    else window.LifeDesk?.closeFinance?.();
    const canvas = document.getElementById("lifeScene");
    if (canvas) window.LifeDesk?.drawMapScene?.(canvas, state,window.LifeKeepsakes.livedYears(state));
    for (const draft of drafts) {
      const node = main.querySelector(draft.selector);
      if (!node) continue;
      node.value = draft.value;
      if (draft.active && !focus) {
        node.focus({preventScroll:true});
        node.setSelectionRange(draft.start, draft.end);
      }
    }
    if (focus) {
      const target = document.getElementById("stepHeading") || main;
      target.focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }
  function alertDialog(title, description, actionLabel, fn) {
    lastTrigger = document.activeElement;
    document.getElementById("dialogTitle").textContent = title;
    document.getElementById("dialogText").textContent = description;
    document.getElementById("dialogSources").hidden = Boolean(fn);
    ok.textContent = actionLabel;
    cancel.hidden = !fn;
    onConfirm = fn || null;
    dialog.showModal();
    (fn ? cancel : ok).focus();
  }
  function recover(raw) {
    jumpedFrom = null;
    dirty = false;
    if (raw === null) {
      state = null;
      previous = null;
      setup = true;
      damaged = false;
      clock = clockAPI.restore(null);
      moveId = null;
      return;
    }
    const envelope = JSON.parse(raw);
    if (envelope.version !== 1 || !api.valid(envelope.state)) throw new Error("Invalid save");
    state = envelope.state;
    moveId = envelope.moveId || null;
    clock = clockAPI.restore(envelope.clock, state);
    const compare = envelope.previous;
    previous = compare && Object.hasOwn(ROUTES, compare.route) && typeof compare.report?.opportunity === "string" &&
      Array.isArray(compare.report.rows) && compare.report.rows.every(row => row && Number.isInteger(row.age) &&
        [row.balance, row.income, row.cost].every(Number.isFinite)) ? compare : null;
    jumpedFrom = Number.isInteger(envelope.jumpedFrom) && envelope.jumpedFrom >= 0 &&
      envelope.jumpedFrom < state.age ? envelope.jumpedFrom : null;
    setup = false;
    damaged = false;
  }
  function syncRaw(raw, otherTab) {
    lastRaw = raw;
    try {
      if (raw && otherTab && moveId) {
        const incoming = JSON.parse(raw);
        if (incoming.moveId === moveId && incoming.clock && state) {
          const next = clockAPI.restore(incoming.clock, state);
          const prefsChanged = ["started","speed","minutes","paused","reportRead"].some(k => next[k] !== clock[k]) ||
            String(clock.reflections) !== String(next.reflections);
          clock = next;
          dirty = false;
          if (prefsChanged) render(); else paint();
          return;
        }
      }
      recover(raw);
      if (otherTab) message("已同步另一窗口中的人生进度。");
    } catch {
      state = null;
      previous = null;
      setup = true;
      damaged = true;
      message("这份存档暂时无法读取。重新开局前，可以导出旧存档留作备份。");
    }
    render();
    if (damaged) {
      const a = document.createElement("button");
      a.type = "button";
      a.className = "text-btn";
      a.dataset.action = "backup";
      a.textContent = "导出旧存档";
      notice.append(" ", a);
    }
  }
  function save(next, comparison, fromAge, nextClock, options = {}) {
    if (!options.clockOnly && !api.valid(next)) throw new Error("Invalid next state");
    const nextMove = options.clockOnly && moveId ? moveId : (globalThis.crypto?.randomUUID?.() || Date.now() + "-" + Math.random());
    let raw = null;
    if (storageOK) {
      try {
        const existing = localStorage.getItem(STORE_KEY);
        if (existing !== lastRaw) {
          syncRaw(existing, true);
          return false;
        }
        raw = JSON.stringify({ version: 1, state: next, previous: comparison, jumpedFrom: fromAge,
          clock: nextClock, moveId: nextMove });
        localStorage.setItem(STORE_KEY, raw);
      } catch {
        storageOK = false;
        message("浏览器暂时无法保存进度。本次仍可继续游玩，关闭页面会丢失未保存的进度。");
      }
    }
    if (storageOK) {
      lastRaw = raw;
      if (!options.tick) message("");
    }
    state = next;
    clock = nextClock;
    moveId = nextMove;
    dirty = false;
    lastCommit = performance.now();
    previous = comparison;
    jumpedFrom = fromAge;
    damaged = false;
    setup = false;
    if (!options.tick) render(options.focus === true);
    return true;
  }
  function operate(fn, comparison = previous, fromAge = null, clockPatch = {}, focus = false) {
    try {
      const draft = clone(state);
      const next = fn(draft);
      const changedYear = state && next && next.age !== state.age;
      const timing = {...clock, ...(changedYear ? {fraction:0} : {}), ...clockPatch};
      return save(next ?? draft, comparison, fromAge, timing, {focus});
    } catch {
      message("此步未完成，当前进度已保留。你可以重试或重新载入页面。");
      return false;
    }
  }
  function setClock(patch, focus = false) {
    if (!state) return;
    save(state, previous, jumpedFrom, {...clock, ...patch}, {clockOnly:true, focus});
  }
  function flush() {
    if (dirty && state && !setup) save(state, previous, jumpedFrom, clock, {clockOnly:true, tick:true});
  }
  function finishReflection() {
    setClock({reflections:[...clock.reflections, state.age]}, true);
  }
  function pulse(dt) {
    if (setup || !state || !clock.started || state.ended || writingNote() || dialog.open || document.querySelector("dialog[open]")) return;
    if (clock.paused || state.pending || needsReflection(state)) return;
    if (state.age === 19 && state.report && !clock.reportRead) return;
    const duration = yearSeconds(state) * 1000;
    const fraction = clock.fraction + dt * clock.speed / duration;
    if (fraction >= 1) {
      if (!operate(s => api.advance(s))) return;
    } else {
      clock.fraction = fraction;
      dirty = true;
      paint();
      if (performance.now() - lastCommit > 850) flush();
    }
  }
  function skipForward(s) {
    do { s = api.advance(s); }
    while (!s.ended && !s.pending && s.age !== 19 && !needsReflection(s));
    return s;
  }
  function begin() {
    const born = () => {
      if (state?.version === 1 && lastRaw) window.LifeDesk?.backupLegacy?.(lastRaw);
      operate(() => {
        const lifeSeed = seed();
        const yearIndex = era === "random" ? Math.floor(window.LifeWorld.hash(lifeSeed, 3107) / 4294967296 * birthYears.length) : 0;
        const birthYear = era === "random" ? birthYears[yearIndex] : selectedYear;
        return api.create({seed:lifeSeed, birthMode, birthYear});
      }, null, null, clockAPI.restore(null), true);
    };
    if (state || damaged) {
      alertDialog("开始另一段人生？", "确认后将随机出生，并替换这个浏览器里的当前存档。", "确认开始", born);
      return;
    }
    born();
  }
  function restoreLegacy(raw) {
    let envelope;
    try {
      envelope = JSON.parse(raw);
      if (envelope.version !== 1 || envelope.state?.version !== 1 || !api.valid(envelope.state)) throw new Error();
    } catch {
      message("这份旧档未通过读取校验，当前进度已保留。");
      return;
    }
    const restore = () => {
      try {
        const existing = localStorage.getItem(STORE_KEY);
        if (existing !== lastRaw) { syncRaw(existing, true); return; }
        localStorage.setItem(STORE_KEY, raw);
        syncRaw(raw, false);
        message("已恢复之前的旧版人生。");
      } catch { message("浏览器暂时无法写入恢复的存档，请保留当前页面。"); }
    };
    if (state || damaged) alertDialog("恢复旧版人生？", "恢复后，之前备份的旧版人生将成为当前存档。", "确认恢复", restore);
    else restore();
  }
  function rewind() {
    if (!state?.canRewind) return;
    alertDialog("回到16岁重选？",
      state.report ? "将当前路线的三年账本留作对照，从十六岁的选择继续。之后的经历将重新展开。" :
      "将回到十六岁作出选择之前，之后的经历将重新展开。",
      "确认重选", () => {
        const comp = state.report ? {route:state.route,report:clone(state.report),financialIdentity:window.LifeDesk.financialIdentity(state)} : previous;
        operate(s => api.rewind(s), comp, null, {fraction:0, reportRead:false, reflections:clock.reflections.filter(age=>age<16)}, true);
      });
  }
  function backup() {
    if (!lastRaw) return;
    const url = URL.createObjectURL(new Blob([lastRaw], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "人生手记-存档备份.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }
  document.addEventListener("focusin", e => {
    if (e.target.matches("#reflectionNote, .desk-note textarea")) { flush(); paint(); }
  });
  document.addEventListener("focusout", e => {
    if (e.target.matches("#reflectionNote, .desk-note textarea")) queueMicrotask(paint);
  });
  document.addEventListener("change", e => {
    if (setup && e.target.id === "birthEra") {
      era = Object.hasOwn(eras,e.target.value) ? e.target.value : "now";
      selectedYear = era === "past" ? 1980 : era === "future" ? 2050 : 2026;
      document.getElementById("birthYearField").innerHTML = yearField();
    }
    if (setup && e.target.id === "birthYear" && birthYears.includes(Number(e.target.value))) {
      selectedYear = Number(e.target.value);
      document.getElementById("birthYearSource").textContent = dataLabel(selectedYear);
    }
    if (setup && ["birthYear","birthEra"].includes(e.target.id)) {
      document.getElementById("eraSummary").textContent = era === "random" ? eras[era] : eras[era] + " · " + selectedYear + "年";
    }
    if (e.target.id === "birthMode") birthMode = e.target.value === "population" ? "population" : "newborn";
    if (!state || setup || state.ended) return;
    if (e.target.id === "duration" && clockAPI.durations.includes(Number(e.target.value))) setClock({minutes:Number(e.target.value)});
    if (e.target.id === "focusSelect" && api.focusOptions?.(state).some(o => o.id === e.target.value)) {
      const id = e.target.value;
      operate(s => api.setFocus(s,id));
    }
  });
  document.addEventListener("click", e => {
    const control = e.target.closest("button[data-action]");
    if (!control) return;
    const action = control.dataset.action;
    if (action === "help") {
      alertDialog("怎样度过这一生", "「按出生人数」让新生儿更多的地区更常出现，「按在世人口」则按地区人口抽取。各地收录的生活故事详略不同。\n\n登记后按「开始这一生」。游戏按出生地的预期寿命和你选的时长计算每年的秒数。可以暂停、改倍速或调整年度重心。离开标签页时不会累积游戏时间。\n\n遇到人生抉择时，时间会停下来等你亲自选择，快进也会在这里停下。遇到反思时，你可以写一笔或跳过。十九岁时，读完三年账本再继续。", "知道了");
    } else if (action === "finance" && state && !setup) {
      window.LifeDesk?.openFinance(state, visibleDate(state,clock.fraction));
    } else if (action === "timeTop") {
      document.querySelector(".clock-panel")?.scrollIntoView();
    } else if (action === "newVersion" && state?.version === 1) {
      era = "now"; selectedYear = 2026; birthMode = "newborn";
      begin();
    } else if (action === "birth" && setup) {
      begin();
    } else if (action === "backup") {
      backup();
    } else if (action === "restart") {
      flush();
      era = "now"; selectedYear = 2026; birthMode = "newborn";
      setup = true;
      render(true);
    } else if (action === "resume") {
      setup = false;
      render(true);
    } else if (action === "rewind") {
      rewind();
    } else if (state && !setup && !state.ended) {
      if (action === "start" && !clock.started) setClock({started:true, paused:false}, true);
      else if (action === "pause") setClock({paused:!clock.paused});
      else if (action === "speed" && clockAPI.speeds.includes(Number(control.dataset.rate))) setClock({speed:Number(control.dataset.rate)});
      else if (action === "readReport" && state.age === 19 && state.report) setClock({reportRead:true}, true);
      else if (action === "skipReflection" && needsReflection(state)) finishReflection();
      else if (action === "note" && needsReflection(state)) {
        const note = document.getElementById("reflectionNote");
        if (!note.value.trim()) { note.focus(); return; }
        if (typeof window.LifeDesk?.writeNote !== "function") { message("手记暂时无法写入，请保留这一页后重试。"); return; }
        const written = window.LifeDesk.writeNote(state, note.value.trim());
        finishReflection();
        if (!written) message("这一条反思已记在当前窗口。浏览器暂时无法把它保存到本机。");
      } else if (action === "choose" && state.pending?.id === control.dataset.pending &&
          state.pending.options.some(o => o.id === control.dataset.id && !o.disabled)) {
        operate(s => api.choose(s, control.dataset.id), previous, null, {}, true);
      } else if (action === "next" && !state.pending && !needsReflection(state) && !(state.age === 19 && !clock.reportRead && state.report)) {
        operate(skipForward, previous, state.age, {}, true);
      }
    }
  });
  document.addEventListener("error", e => {
    if (e.target instanceof HTMLImageElement) e.target.hidden = true;
  }, true);
  dialog.addEventListener("close", () => {
    if (lastTrigger?.isConnected) lastTrigger.focus({ preventScroll: true });
    onConfirm = null;
    lastTrigger = null;
  });
  cancel.addEventListener("click", () => dialog.close());
  ok.addEventListener("click", () => {
    const fn = onConfirm;
    onConfirm = null;
    dialog.close();
    if (fn) fn();
  });
  window.addEventListener("storage", e => {
    if (!storageOK || (e.key !== STORE_KEY && e.key !== null)) return;
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw === lastRaw) return;
      if (dialog.open && (!raw || JSON.parse(raw).moveId !== moveId)) dialog.close();
      syncRaw(raw, true);
    } catch {
      message("暂时无法同步其他窗口，请保留当前页面。");
    }
  });
  try {
    syncRaw(localStorage.getItem(STORE_KEY), false);
  } catch {
    storageOK = false;
    message("本地存储不可用，仅能保留本次会话中的进度。");
    render();
  }
  clockAPI.coordinate(() => Boolean(state && !setup && clock.started && !state.ended), pulse, flush);
})();
