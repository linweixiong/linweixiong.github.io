(() => {
  "use strict";
  const names={friend:"一路遇见的人",home:"家里那些日子",chance:"意料之外的一天"};
  const livedYears=s=>s.ending?.years??s.age;
  function visibleLog(s) {
    if(!s.ending || s.ending.years!==0)return s.log;
    return s.log.filter(e=>!Number.isFinite(e.at)||Math.floor(e.at*12)<=s.ending.months);
  }
  function pages(s) {
    const groups=new Map();
    for(const memory of s.memories||[]) {
      const match=/^(?:thread-)?(friend|home|chance)-/.exec(memory.threadKey||"");
      if(!match)continue;
      const key=match[1];
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(memory);
    }
    return Array.from(groups,([key,entries])=>{
      const first=entries.find(m=>m.threadKey.startsWith("friend-met-"))||entries[0];
      const familyLoss=entries.find(m=>m.threadKey.startsWith("home-loss-"));
      const carriedOn=familyLoss&&entries.find(m=>m.threadKey===familyLoss.threadKey.replace("home-loss-","home-echo-"));
      const last=carriedOn||entries.find(m=>m.threadKey==="friend-remember")||entries.at(-1);
      const between=entries.slice(entries.indexOf(first)+1,entries.indexOf(last));
      const turn=between.find(m=>m.threadKey==="friend-death"||m.threadKey.startsWith("home-loss-")||m.threadKey==="chance-order-fraud") ||
        between.find(m=>m.tone==="loss"||m.tone==="regret");
      const choices=between.filter(m=>m.threadKey.startsWith("thread-")&&!m.threadKey.endsWith("-echo"));
      // When the last page recalls a bereavement, keep a choice the player
      // made while that person was still present.
      const choice=turn ? choices.filter(m=>m.age<=turn.age).at(-1)||choices[0] : choices.at(-1);
      const shared=familyLoss&&between.find(m=>m.threadKey===familyLoss.threadKey.replace("home-loss-","home-game-"));
      const marked=new Set([first,shared||choice,turn,last]);
      return {key,name:names[key],entries,featured:entries.filter(m=>marked.has(m))};
    }).sort((a,b)=>b.featured.length-a.featured.length || b.entries.at(-1).age-a.entries.at(-1).age);
  }
  function cardEntries(s) {
    const scenes=pages(s);
    if(!scenes.length)return [];
    // Give the postcard room for an early encounter, another part of life, and
    // a later consequence. Only moments the player actually lived are eligible.
    const thread=scenes[0].featured;
    const side=scenes.slice(1).flatMap(scene=>scene.featured);
    const companion=side.find(m=>m.tone==="joy") || side.at(-1) || thread[1];
    return [...new Set([thread[0],companion,thread.at(-1)])].filter(Boolean).sort((a,b)=>a.age-b.age);
  }
  globalThis.LifeKeepsakes=Object.freeze({pages,cardEntries,livedYears,visibleLog});
})();
