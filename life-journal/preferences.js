(() => {
  "use strict";
  const panel = document.getElementById("preferences");
  const theme = document.getElementById("darkMode");
  const music = document.getElementById("musicOn");
  const volume = document.getElementById("musicVolume");
  const output = document.getElementById("volumeText");
  const notice = document.getElementById("audioNotice");
  const key = "rensheng-shouji.reading.v1";
  const Audio = window.AudioContext || window.webkitAudioContext;
  let context, master, timer, generation = 0, step = 0;

  function updatePreferences(remember) {
    document.documentElement.dataset.theme = theme.checked ? "dark" : "light";
    document.querySelector('meta[name="theme-color"]').content = theme.checked ? "#101021" : "#252539";
    output.value = volume.value + "%";
    if (master && context) master.gain.setTargetAtTime(Number(volume.value) / 100, context.currentTime, .04);
    if (remember) {
      try { localStorage.setItem(key, JSON.stringify({dark:theme.checked, volume:Number(volume.value)})); } catch { /* Session only. */ }
    }
  }
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved) {
      theme.checked = saved.dark === true;
      if (Number.isFinite(saved.volume)) volume.value = saved.volume;
    }
  } catch { /* Use the default appearance and gain. */ }
  music.checked = false;
  updatePreferences(false);
  theme.addEventListener("change", () => updatePreferences(true));
  volume.addEventListener("input", () => updatePreferences(false));
  volume.addEventListener("change", () => updatePreferences(true));

  // An original 16-bar instrumental phrase. Each row is a bass and four melody pulses.
  const score = [
    [50,66,69,0,73],[45,71,69,0,64],[47,66,62,0,66],[43,67,0,64,0],
    [50,69,73,74,0],[42,69,66,0,64],[43,62,67,0,69],[45,64,0,0,0],
    [47,71,74,0,69],[43,67,71,0,66],[50,69,0,66,62],[45,64,0,69,0],
    [43,71,67,0,62],[47,66,69,0,71],[45,69,64,0,61],[50,62,0,0,0]
  ];
  function tone(midi, start, length, gain) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(gain, start + .08);
    envelope.gain.exponentialRampToValueAtTime(.0001, start + length);
    oscillator.connect(envelope).connect(master);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
    oscillator.start(start);
    oscillator.stop(start + length + .03);
  }
  function silence() {
    clearInterval(timer);
    if (!context) return;
    const previous = context;
    master?.disconnect();
    context = null;
    master = null;
    previous.close().catch(() => {});
  }
  async function applySound() {
    const request = ++generation;
    silence();
    if (!music.checked || document.hidden) return;
    try {
      context = new Audio();
      master = context.createGain();
      master.gain.value = Number(volume.value) / 100;
      master.connect(context.destination);
      await context.resume();
      if (request !== generation) return;
      let next = context.currentTime + .08;
      const schedule = () => {
        if (document.hidden || !music.checked || !context) return;
        const now = context.currentTime;
        if (next < now) next = now + .06;
        while (next < now + .3) {
          const row = score[Math.floor(step / 4) % score.length];
          const pulse = step % 4;
          if (!pulse) tone(row[0],next,2.7,.105);
          if (row[pulse + 1]) tone(row[pulse + 1],next,1.25,.18);
          step++;
          next += .84;
        }
      };
      notice.textContent = "";
      schedule();
      timer = setInterval(schedule, 120);
    } catch {
      if (request !== generation) return;
      silence();
      music.checked = false;
      notice.textContent = "此设备暂时无法播放音乐。";
    }
  }
  if (!Audio) {
    music.disabled = true;
    notice.textContent = "此浏览器不支持音乐播放。";
  }
  music.addEventListener("change", applySound);
  document.addEventListener("visibilitychange", applySound);
  window.addEventListener("pagehide", () => { generation++; silence(); });
  window.addEventListener("pageshow", e => { if (e.persisted) applySound(); });
  document.addEventListener("pointerdown", e => { if (panel.open && !panel.contains(e.target)) panel.open = false; });
  panel.addEventListener("keydown", e => {
    if (e.key === "Escape") { panel.open = false; panel.querySelector("summary").focus(); }
  });
})();
