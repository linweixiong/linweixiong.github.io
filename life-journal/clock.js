(() => {
  "use strict";
  const speeds = [1, 2, 4, 8, 12, 16];
  const durations = [30, 60, 90];
  const leaseKey = "rensheng-shouji.clock-owner";
  const tab = globalThis.crypto?.randomUUID?.() || String(Date.now()) + String(Math.random());

  function restore(saved, state) {
    const c = saved || {};
    return {
      started: typeof c.started === "boolean" ? c.started : Boolean(state && state.age > 0),
      fraction: Number.isFinite(c.fraction) ? Math.max(0, Math.min(.999999, c.fraction)) : 0,
      speed: speeds.includes(c.speed) ? c.speed : 1,
      minutes: durations.includes(c.minutes) ? c.minutes : 60,
      paused: c.paused === true,
      reflections: Array.isArray(c.reflections) ? [...new Set(c.reflections.filter(Number.isInteger))] : [],
      reportRead: typeof c.reportRead === "boolean" ? c.reportRead : Boolean(state && state.age > 19)
    };
  }
  function coordinate(wants, pulse, flush) {
    let owned = false, waiting = false, unlock = null, useWebLock = Boolean(navigator.locks);
    let last = performance.now(), lastAttempt = -Infinity, lastLease = 0;
    function relinquish() {
      if (owned && !useWebLock) {
        try {
          if (JSON.parse(localStorage.getItem(leaseKey))?.tab === tab) localStorage.removeItem(leaseKey);
        } catch { /* Local-only session. */ }
      }
      owned = false;
      if (unlock) { const release = unlock; unlock = null; release(); }
      last = performance.now();
      lastAttempt = -Infinity;
    }
    function lease() {
      try {
        const existing = JSON.parse(localStorage.getItem(leaseKey));
        if (existing && existing.tab !== tab && existing.until > Date.now()) return false;
        localStorage.setItem(leaseKey, JSON.stringify({tab, until:Date.now() + 2800}));
        return JSON.parse(localStorage.getItem(leaseKey))?.tab === tab;
      } catch { return true; }
    }
    function work() {
      const now = performance.now();
      const dt = Math.min(500, Math.max(0, now - last));
      last = now;
      if (document.hidden || !wants()) { if (owned) relinquish(); return; }
      if (!owned) {
        if (waiting || now - lastAttempt < 550) return;
        lastAttempt = now;
        if (useWebLock) {
          waiting = true;
          navigator.locks.request(leaseKey, {ifAvailable:true}, async lock => {
            if (!lock || document.hidden || !wants()) return;
            owned = true;
            last = performance.now();
            await new Promise(resolve => { unlock = resolve; });
          }).catch(() => { useWebLock = false; }).finally(() => { waiting = false; });
        } else {
          owned = lease();
          lastLease = now;
        }
        return;
      }
      if (!useWebLock && now - lastLease > 700) {
        lastLease = now;
        if (!lease()) { relinquish(); return; }
      }
      pulse(dt);
    }
    function suspend() {
      if (owned) flush();
      relinquish();
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden) suspend(); else last = performance.now(); });
    window.addEventListener("pagehide", suspend);
    setInterval(work, 125);
  }
  window.AnnualClock = Object.freeze({ speeds, durations, restore, coordinate });
})();
