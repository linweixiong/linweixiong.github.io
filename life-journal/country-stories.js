/* 国情资料与虚构人物分别存放。国家资料只在对应出生地与年代进入叙事。 */
(function (root) {
  "use strict";
  const packs = new Map();
  const currentPacks = new Map();
  const references = new Map();
  function register(iso, pack) {
    packs.set(iso, pack);
    currentPacks.set(iso, pack);
    for (const source of pack.sources) references.set(iso + "/" + source.id, source);
  }
  function revise(iso, update) {
    const base = currentPacks.get(iso) || {scenes:[], choices:[], sources:[]};
    function merge(rows, changes, field, removed = []) {
      const byId = new Map(rows.filter(row=>!removed.includes(row[field])).map(row=>[row[field],row]));
      for (const row of changes || []) byId.set(row[field],row);
      return [...byId.values()];
    }
    currentPacks.set(iso,{scenes:merge(base.scenes,update.scenes,"title",update.removeScenes),
      choices:merge(base.choices,update.choices,"id",update.removeChoices),sources:merge(base.sources,update.sources,"id")});
    for (const source of update.sources || []) references.set(iso+"/"+source.id,source);
  }
  function packFor(s) {
    if (s.countrySetVersion !== 2 && ["JPN","DEU","MEX"].includes(s.region)) return;
    return (s.edition === "regional-2" ? currentPacks : packs).get(isoOf(s));
  }
  const definitions = [
    {id:"power", label:"用电", column:0, indicator:"EG.ELC.ACCS."},
    {id:"water", label:"基本饮水服务", column:2, indicator:"SH.H2O.BASW."}
  ];
  for (const d of definitions) for (const urban of [true,false]) {
    const id = d.indicator + (urban ? "UR" : "RU") + ".ZS";
    references.set(id, {id, label:"世界银行 · " + (urban ? "城镇" : "乡村") + d.label, url:"https://data.worldbank.org/indicator/" + id});
  }
  function isoOf(s) {
    return s.region === "chengdu" ? "CHN" : s.region === "lyon" ? "FRA" : s.region;
  }
  function active(s) {
    return Number.isInteger(s.localStoriesFrom) && s.age >= s.localStoriesFrom;
  }
  function eligible(s, item, matches) {
    if (item.indiaLife && !root.IndiaLife?.active(s)) return false;
    // 「现在」模式将当代背景延续一生；其他模式按经历当年检查资料。
    const year = s.birthYear === 2026 ? 2026 : s.birthYear + s.age;
    if (year > 2026 && (item.fromYear != null || item.toYear != null)) return false;
    return (!item.setting || item.setting === root.LifeWorld.storySetting(s)?.id) && (!item.available || item.available(s)) &&
      year >= (item.fromYear ?? -Infinity) && year <= (item.toYear ?? Infinity) && matches(s, item);
  }
  function sampleHome(s) {
    const series = root.LivingIndicators?.[isoOf(s)];
    if (!series || s.birthYear > 2026) return [];
    const urban = s.residence === "urban", target = Math.min(2023,s.birthYear);
    return definitions.flatMap((d,i) => {
      const column = d.column + (urban ? 1 : 0);
      for (let year = target; year >= Math.max(1990,target-3); year--) {
        const perThousand = series[year-1990]?.[column];
        if (!Number.isFinite(perThousand)) continue;
        const present = root.LifeWorld.hash(s.seed, 4901+i)/4294967296 < perThousand/1000;
        return [{id:d.id, label:d.label, year, percent:perThousand/10, present,
          sourceKey:d.indicator + (urban ? "UR" : "RU") + ".ZS"}];
      }
      return [];
    });
  }
  function householdScene(s) {
    if (![3,7].includes(s.age)) return null;
    const id = s.age === 3 ? "power" : "water";
    const obs = sampleHome(s).find(row => row.id === id);
    if (!obs) return null;
    let title, text;
    if (id === "power") {
      [title,text] = obs.present ? ["墙上的手影","晚饭后，有人在灯前屈起手指，让一只歪歪扭扭的小鸟停在墙上。你伸手去抓，小鸟就躲进了你的影子里。"] :
        ["趁窗边还亮","家里用不上电。天色暗下来前，你把凳子往窗边拖了一点。大人正在补一件衣服，你有个很要紧的差事，帮忙看住那粒滚来滚去的纽扣。"];
    } else {
      [title,text] = obs.present ? ["谁倒的那杯水","你已经可以在家或附近取到日常饮水。那天有人回来得晚，你第一次记得给对方也倒一杯。对方喝到一半才问，是谁还记着我？"] :
        ["留给谁的水","家里这时还用不上基本饮水服务，大人要另外张罗喝的水。你听见他们商量明早谁先去，就把两只空容器并排放好。其中一只的把手朝着左边，那是左撇子的家人惯用的方向。"];
    }
    return {title,text,sourceKey:obs.sourceKey};
  }
  function localScene(s,seen,matches,draw) {
    if (!active(s)) return null;
    const iso = isoOf(s), pool = (packFor(s)?.scenes || []).filter(x =>
      x.minAge <= s.age && s.age <= x.maxAge && !seen.has(x.title) && eligible(s,x,matches));
    if (!pool.length) return householdScene(s);
    // 先照顾窗口将关闭的经历；同一窗口内仍可过出不同的人生。
    const last = Math.min(...pool.map(x=>x.maxAge));
    const candidates = pool.filter(x=>x.maxAge===last);
    const row = candidates.find(x=>x.storyBeat) || candidates[draw(s.seed,4721,s.age) % candidates.length];
    return {title:row.title,text:row.text,sourceKey:iso+"/"+row.source,...(row.storyBeat?{id:row.storyBeat}:{})};
  }
  function localChoice(s,matches,draw) {
    if (!active(s)) return null;
    const iso = isoOf(s);
    const pool = (packFor(s)?.choices || []).filter(x=>x.age===s.age &&
      (!x.cityArc || (Number.isInteger(s.cityArcFrom) && s.age >= s.cityArcFrom)) && eligible(s,x,matches));
    if (!pool.length) return householdChoice(s);
    const row = pool.find(x=>x.storyBeat) || pool[draw(s.seed,4722,s.age)%pool.length];
    const detail = row.resolve ? row.resolve(s) : null;
    return {...row,...detail,id:"local-"+iso+"-"+row.id,sourceKey:iso+"/"+row.source,type:"choice",category:row.category||"personal"};
  }
  function householdChoice(s) {
    if (s.age !== 10) return null;
    const water = sampleHome(s).find(row => row.id === "water");
    if (!water) return null;
    if (water.present && root.LifeWorld.hash(s.seed,4920)%3 !== 0) return null;
    const pair = (id,label,note,effects,title,text) => ({id,label,note,effects,follow:{after:3,title,text}});
    if (water.present) return {id:"local-water-table",sourceKey:water.sourceKey,type:"choice",category:"family",
      title:"那只带盖的水壶",text:"你家取饮水很方便。邻居带着孩子来坐，一壶水喝完了。大人托你再装一壶，那个比你小的孩子一路跟着，很想自己试试。",
      options:[pair("together","让孩子扶着壶，你来托底","也许要多跑一趟，你们都想让这件事成功。",{bond:3,knowledge:1},"还记得怎么托底","三年后，你从桌边伸手想帮忙，那个孩子已经把装满水的壶稳稳放下，还提醒你别把手指压在壶底。"),
        pair("seat","你去装水，请孩子先给大人摆杯子","壶满了有点沉，摆杯子也有人等着用。",{bond:2,happiness:2},"总会多摆一只杯子","又一次有人来做客，桌上比人数多摆了一只杯子。那个孩子说，怕你和上回一样干完活才来，没轮上喝。")]};
    return {id:"local-water-turn",sourceKey:water.sourceKey,type:"choice",category:"family",
      title:"明早跟谁换半天",text:"为了张罗喝的水，家里这周有两个早晨得空出人手。你想和大人一起去认路，又跟朋友约好在同一个早晨见面。大人说，这回由你开口安排。",
      options:[pair("go","陪大人走一趟，请朋友改到下午","你想知道这件家务究竟占去多少时间。",{knowledge:3,bond:1},"走得慢的人","几年后你才知道，那天大人特意走慢了些。你记得的路程，和对方每天赶着回来做事走的，其实是同一条路。"),
        pair("trade","照约见朋友，主动接下晚上的活","你说清楚什么时候回来，也让家里有人能歇一会儿。",{happiness:2,bond:2},"写在门边的轮值表","后来家里把轮值写在门边。你认出最早的那行字是自己的，那时还把「晚」写歪了。")]};
  }
  root.CountryStories = Object.freeze({register, revise, packs:currentPacks, references, isoOf, active, sampleHome, localScene, localChoice});
})(globalThis);
