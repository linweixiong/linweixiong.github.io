/* A playable excerpt from a recorded life. Only the choice in this chapter is interactive. */
(() => {
  "use strict";
  const cardId = "local-BGD-bd-dhaka-door-panel";
  const sourceKey = "BGD/bd-dhaka-panel";
  const main = document.getElementById("main");
  const style = document.createElement("link");
  style.rel = "stylesheet";
  style.href = "./dhaka-preview.css?v=20261128-dhaka";
  document.head.append(style);
  document.title = "画反了的门闩 · 忽然而已";
  document.querySelector('[data-action="help"]').hidden = true;
  main.innerHTML = '<section class="chapter-reader" aria-labelledby="chapter-title">' +
    '<p class="chapter-place">孟加拉国 · 达卡</p><h1 id="chapter-title">画反了的门闩</h1>' +
    '<p id="chapter-age" aria-live="polite">正在打开片段…</p>' +
    '<div id="chapter-scene"></div><div class="chapter-steps"></div>' +
    '<nav class="chapter-tools" aria-label="片段设置"><button type="button" class="text-btn" id="chapter-subtitles" aria-pressed="false">隐藏字幕</button>' +
    '<a href="./">返回《忽然而已》</a></nav></section>';

  const reader = main.querySelector(".chapter-reader");
  const host = document.getElementById("chapter-scene");
  const steps = main.querySelector(".chapter-steps");
  const age = document.getElementById("chapter-age");
  const toggle = document.getElementById("chapter-subtitles");
  toggle.onclick = () => {
    const hidden = reader.classList.toggle("without-subtitles");
    toggle.setAttribute("aria-pressed", String(hidden));
    toggle.textContent = hidden ? "显示字幕" : "隐藏字幕";
  };
  function step(label, action, primary = false) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = primary ? "primary" : "secondary";
    button.textContent = label;
    button.onclick = action;
    steps.append(button);
  }

  async function open() {
    const response = await fetch("./assets/dhaka-chapter.json?v=20261128-dhaka");
    if (!response.ok) throw Error("chapter");
    const sample = await response.json();
    const start = sample.atChoice;
    if (!Life.valid(start) || start.pending?.id !== cardId) throw Error("sample");
    const intro = start.log.find(event => event.sourceKey === sourceKey && event.kind === "event");
    if (!intro) throw Error("intro");
    let mounted, after, selected;
    function show(phase) {
      mounted?.destroy();
      steps.replaceChildren();
      const choice = phase === "choice";
      let state, event;
      if (phase === "intro") {
        event = intro;
        state = {...start, age:event.age, pending:null};
      } else if (choice) {
        state = start;
      } else if (phase === "result") {
        state = after;
        event = after.log.findLast(e => e.sourceKey === sourceKey && e.kind === "choice");
      } else {
        event = phase==="echo" ? sample.echoes[selected] : sample.laterScenes[selected];
        state = {...after, age:event.age, log:[...after.log,event]};
      }
      const model = LifeStageView.describe(state, event ? {event} : {});
      if (!choice) {
        model.items = [];
      }
      age.textContent = (event?.age ?? state.age) + "岁 · " +
        ({intro:"回家",choice:"搬家前",result:"画车尾板",echo:"两年后",adult:"长大以后"})[phase];
      host.innerHTML = LifeStageView.frame();
      const frame = host.firstElementChild;
      if (choice) {
        start.pending.options.forEach((option, i) => {
          const note = document.createElement("span");
          note.id = "option-note-" + i;
          note.hidden = true;
          note.textContent = option.note;
          host.append(note);
        });
      }
      mounted = LifeStageView.mount(frame,{state,model,paused:false,
        onChoice(id) {
          if (!choice || !start.pending.options.some(o=>o.id===id && !o.disabled)) return;
          selected = id;
          after = Life.choose(start, id);
          show("result");
        },
        onReview() {}, onAction() {return false;}
      });
      if (phase === "intro") step("到搬家那天", () => show("choice"), true);
      if (phase === "result") step("去两年后", () => show("echo"), true);
      if (phase === "echo") step("去十八岁", () => show("adult"), true);
      if (["result","echo","adult"].includes(phase)) step("再选一次", () => show("choice"), phase === "adult");
      if (phase === "adult") step("从八岁重看", () => show("intro"));
      if (phase !== "intro") frame.focus({preventScroll:true});
    }
    show("intro");
    window.addEventListener("pagehide", e => { if (!e.persisted) mounted?.destroy(); }, {once:true});
  }
  open().catch(() => {
    age.textContent = "片段未能载入。";
    step("重新打开", () => location.reload(), true);
    toggle.hidden = true;
  });
})();
