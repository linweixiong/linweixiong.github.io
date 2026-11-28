/* 人生手记 · 独立逐年模拟。所有金额均为游戏记账单位。 */
(function installLifeEngine(root) {
  "use strict";

  const VERSION = 1;
  const ROUTE_AGE = 16;
  const FAMILY_CASH = { steady: 6000, tight: 1500 };
  const ECONOMY = {
    chengdu: { tuition: 1200, wage: 3000 },
    lyon: { tuition: 1500, wage: 3600 }
  };
  const FALLBACK = {
    chengdu: { label: "成都", names: ["林川", "何雨", "周宁"] },
    lyon: { label: "里昂", names: ["Camille", "Alex", "Lou"] }
  };
  const STAGES = [
    [0, "童年"], [6, "在校时光"], [16, "少年选择"], [20, "初入社会"],
    [30, "安家立业"], [50, "中年岁月"], [65, "晚年"]
  ];
  const OWN = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
  const bounded = value => Math.max(0, Math.min(100, value));
  const startingCash = state => FAMILY_CASH[state.family];

  function city(state) {
    const catalog = root.LifeText && root.LifeText.cities;
    return catalog && catalog[state.region] || FALLBACK[state.region];
  }

  // 按用途和年龄取样。增加一条文案不会改变出生姓名、寿命或其他年份。
  function draw(seed, channel, age) {
    let value = (seed ^ Math.imul(channel, 0x9e3779b1) ^ Math.imul(age, 0x85ebca77)) >>> 0;
    value = Math.imul(value ^ (value >>> 16), 0x7feb352d);
    value = Math.imul(value ^ (value >>> 15), 0x846ca68b);
    return (value ^ (value >>> 16)) >>> 0;
  }

  function record(state, title, text, kind, memorable) {
    const entry = { age: state.age, title, text, kind };
    state.log.push(entry);
    if (memorable) state.memories.push({ age: state.age, title, text });
  }

  function option(id, label, note) { return { id, label, note }; }

  function decisionAt(state) {
    const age = state.age;
    const economy = ECONOMY[state.region];
    if (age === 8) {
      const chengdu = state.region === "chengdu";
      return {
        id: "childhood", title: "星期六的下午",
        text: chengdu ? "刚下过雨。家人提着菜篮站在楼下，你也看见了小区花坛里长出的几株新芽。" :
          "沿河的露天市场摆开了摊。家人要去挑当季的菜，河边步道上有你一直想认的几种水鸟。",
        options: [
          option("family", "陪家人去买菜", "帮忙挑菜、听家人聊天，牵绊 +4。"),
          option("explore", chengdu ? "去花坛观察新芽" : "沿河寻找水鸟", "用这个下午散步观察，健康 +2。")
        ]
      };
    }
    if (age === ROUTE_AGE) {
      return {
        id: "route", title: "离开校门的那年",
        text: "家里把账本放在桌上。接下来三年，你可以继续学习，也可以先去工作。",
        options: [
          option("study", "继续升学", "每年学习支出 " + economy.tuition + "。家里先付，余下由助学补足。"),
          option("work", "先去工作", "每年工资 " + economy.wage + "，家庭开销 " + economy.tuition + "。")
        ]
      };
    }
    if (age === 20) {
      const school = state.route === "study";
      return {
        id: "opportunity", title: school ? "报名表递到手里" : "带班的空缺",
        text: state.report.opportunity,
        options: school ? [
          option("specialist", "继续进修", "再读一年。下一年进入技术岗位，积蓄最多支出 600。"),
          option("office", "先做项目助理", "立刻有一份较稳定的工作，晚上的时间留给家人。")
        ] : [
          option("lead", "争取带班", "接下轮班和协调工作。收入提高，初期会辛苦些。"),
          option("craft", "跟师傅精进手艺", "留在一线工作，明年可以独立完成一单。")
        ]
      };
    }
    if (age === 30) {
      return {
        id: "home", title: "那间需要帮忙的小屋",
        text: "家中亲人换了住处。对方问你，这几个月能不能常来一起吃晚饭、收拾东西。",
        options: [
          option("visit", "每周回来帮忙", "少接一些班次，最多用 900 积蓄周转。亲人会记得这段陪伴。"),
          option("call", "约好每周打电话", "保住现有班次，打电话分担采购、预约和记账。")
        ]
      };
    }
    if (age === 50) {
      return {
        id: "mentor", title: "新人递来的笔记本",
        text: "有人刚来做你的这行。对方的笔记本第一页只写了一句话：第一天该从哪里开始？",
        options: [
          option("teach", "亲自带一段时间", "让出一些加班时间。晚年重逢时，这份师徒联系仍在。"),
          option("handbook", "把经验写成手册", "保留原来的工作安排，晚些年还能继续修订这本手册。")
        ]
      };
    }
    if (age === 68) {
      return {
        id: "retirement", title: "空出来的星期三",
        text: state.decisions.mentor === "teach" ? "当年的新人如今能独当一面了。他邀你在社区活动室碰面。" :
          "社区活动室来信，希望把你写的工作笔记放到资料架上。",
        options: [
          option("community", "固定去社区活动室", "添置材料，最多用 300 积蓄。每周会多一群熟面孔。"),
          option("walk", "把下午留给散步", "把时间留给自己，体力和睡眠逐渐改善。")
        ]
      };
    }
    return null;
  }

  function create(input) {
    const spec = input || {};
    const seed = Number.isFinite(spec.seed) ? Math.trunc(spec.seed) >>> 0 : 0;
    // 原型的两座城市、两种家境均等权。各用单独的通道，回放显式传入存档中的出生设定。
    const region = OWN(ECONOMY, spec.region) ? spec.region : ["chengdu", "lyon"][draw(seed, 6, 0) % 2];
    const family = OWN(FAMILY_CASH, spec.family) ? spec.family : ["tight", "steady"][draw(seed, 7, 0) % 2];
    const local = city({ region });
    const names = Array.isArray(local.names) && local.names.length ? local.names : FALLBACK[region].names;
    const state = {
      version: VERSION, region, family, seed,
      name: names[draw(seed, 1, 0) % names.length],
      birthYear: 2000, age: 0, stage: "童年", cash: FAMILY_CASH[family],
      health: 75 + draw(seed, 2, 0) % 11, bond: 55 + draw(seed, 3, 0) % 11,
      career: "尚未就业", ended: false, log: [], pending: null,
      decisionAge: ROUTE_AGE, route: null, report: null, memories: [], canRewind: false,
      ledger: [], decisions: {}
    };
    record(state, "来到" + local.label, local.birth || "家人在窗边为新生的你写下名字。", "birth", true);
    return state;
  }

  function transition(state, choice) {
    const local = city(state);
    const id = state.pending.id;
    const chosen = state.pending.options.find(item => item.id === choice);
    state.pending = null;
    state.decisions[id] = choice;
    let text;
    switch (id) {
      case "childhood":
        if (choice === "family") {
          state.bond = bounded(state.bond + 4);
          text = state.region === "chengdu" ? "你学着掐一掐豌豆尖。家人教你，嫩的那一段一下就能掐断。" :
            "家人递给你两个洋梨。你们一个个轻轻捏过，挑了几个带回家慢慢放熟。";
        } else {
          state.health = bounded(state.health + 2);
          text = state.region === "chengdu" ? "你蹲在花坛边数新芽，把三种不同的叶子画进了小本子。" :
            "你沿着步道找了很久，记下一只灰色大鸟展开翅膀的样子。";
        }
        break;
      case "route":
        state.route = choice;
        state.canRewind = true;
        state.career = choice === "study" ? "在校学生" : "初入职场";
        text = choice === "study" ? local.education || "你带上书包，再次走进教室。" :
          local.job || "你提早到了半个钟头，等着第一班开工。";
        break;
      case "opportunity":
        if (choice === "specialist") {
          const fee = Math.min(600, state.cash);
          state.cash -= fee;
          state.career = "进修学员";
          text = "你在登记表上签了字，积蓄支出 " + fee + "。一年后的技术岗见习已经约好。";
        } else if (choice === "office") {
          state.career = "项目助理";
          state.bond = bounded(state.bond + 3);
          text = "你接过项目组的钥匙，把晚饭时间空了出来。";
        } else if (choice === "lead") {
          state.career = "班组协调员";
          state.health = bounded(state.health - 3);
          text = "你第一次排出了全组的轮班表。轮到有人请假时，你得先补上。";
        } else {
          state.career = "手艺学徒";
          state.health = bounded(state.health + 2);
          text = "你跟师傅约定，从这周起把每一单的做法记在本子上。";
        }
        break;
      case "home":
        if (choice === "visit") {
          const expense = Math.min(state.cash, 900);
          state.cash -= expense;
          state.bond = bounded(state.bond + 8);
          text = "你腾出几个星期的空档，从积蓄支出 " + expense + "。新家的餐桌上又多摆了一双筷子。";
        } else {
          state.bond = bounded(state.bond + 3);
          text = "你把周末的电话写进日历，对方把这一周的难处一件一件告诉你。";
        }
        break;
      case "mentor":
        state.bond = bounded(state.bond + (choice === "teach" ? 5 : 2));
        text = choice === "teach" ? "你亲自示范最容易做错的一步，把当天的加班机会让给同事。" :
          "你整理出一本入门手册，给容易漏掉的地方画了记号。";
        break;
      case "retirement":
        if (choice === "community") {
          const expense = Math.min(state.cash, 300);
          state.cash -= expense;
          state.bond = bounded(state.bond + 5);
          text = "你带去纸笔和材料，支出 " + expense + "。从那以后，每周三都有人为你留把椅子。";
        } else {
          state.health = bounded(state.health + 4);
          text = "你沿着最舒服的步速出门，回到家时记下身体和睡眠的变化。";
        }
        break;
      default:
        throw new Error("无法处理待选事件");
    }
    record(state, chosen.label, text, "choice", true);
  }

  function settleSchoolYears(state) {
    const economy = ECONOMY[state.region];
    const study = state.route === "study";
    const income = study ? 0 : economy.wage;
    const cost = study ? Math.min(economy.tuition, state.cash) : economy.tuition;
    const aid = study ? economy.tuition - cost : 0;
    state.cash += income - cost;
    const row = { age: state.age, income, cost, aid, balance: state.cash };
    state.ledger.push(row);
    const text = study ? "本年学习费用 " + economy.tuition + "，家庭支出 " + cost +
      (aid ? "，助学补足 " + aid : "") + "。" : "本年工资 " + income + "，家庭开销 " + cost + "。";
    record(state, study ? "这一年的学费" : "这一年的工钱", text + "年末结余 " + state.cash + "。", "ledger", false);
    if (state.age !== 19) return;
    const local = city(state);
    state.report = {
      startCash: startingCash(state), endCash: state.cash,
      rows: state.ledger.map(item => ({ ...item })),
      opportunity: study ? local.graduate || "三年学习结束，你可以报名进修，也可以先找项目助理工作。" :
        local.qualified || "三年的经验带来了带班或学手艺的机会。"
    };
    state.career = study ? "完成学业" : "熟练职工";
    record(state, "三年后的机会", state.report.opportunity, "report", true);
  }

  function applyAdultYear(state) {
    const age = state.age;
    const selected = state.decisions.opportunity;
    const economy = ECONOMY[state.region];
    if (age >= 21 && age < 65) {
      const pay = { specialist: 1.35, office: 1.08, lead: 1.25, craft: 1.16 }[selected];
      const lessOvertime = (state.decisions.home === "visit" && age === 31 ? 300 : 0) +
        (state.decisions.mentor === "teach" && age === 51 ? 300 : 0);
      state.cash += Math.round(economy.wage * pay) - economy.tuition - lessOvertime;
    }
    if (age === 21) {
      if (selected === "specialist") state.career = "技术员";
      if (selected === "craft") state.career = "熟练技工";
      const scenes = {
        specialist: "在进修课上练习过的步骤，今天第一次用在真正的工单上。",
        office: "项目资料第一次经你的手准时送达。晚饭桌上，你终于能从头讲完这一天。",
        lead: "同事临时要照顾家人，你把几份轮班表挪到一起，大家顺利交了班。",
        craft: "师傅让你独自交出第一单。你把做法写在当初那本笔记里。"
      };
      record(state, "第一份独立的差事", scenes[selected], "echo", true);
    }
    if (age === 33) {
      const visit = state.decisions.home === "visit";
      record(state, "门上留着一把钥匙", visit ? "当年搬家时你常来搭手，如今亲人把备用钥匙交给你。周五的饭桌总有你的位置。" :
        "这些年的电话没有断。亲人提前打来，和你一起商量下次全家吃饭的日子。", "echo", true);
    }
    if (age === 56) {
      record(state, "熟悉的笔迹", state.decisions.mentor === "teach" ?
        "当年跟着你学的年轻人，如今也在带新人。他还照着你当年的顺序演示。" :
        "工作手册传了几轮又回到手里，空白页上添满了后来人的小窍门。", "echo", true);
    }
    if (age === 65) {
      state.career = "退休";
      record(state, "交还工作证", "你把工作证放进了抽屉。过去上班的那个时间，今天可以从容吃完一顿早饭。", "milestone", true);
    }
    if (age === 72) {
      record(state, "留给自己的那个下午", state.decisions.retirement === "community" ?
        "这周你晚到了些。推开活动室的门，有人笑着朝空椅子拍了拍。" :
        "沿路的树又长出新叶。你走得慢了些，对每个可休息的路口却更熟悉。", "echo", true);
    }
  }

  const ORDINARY = [
    ["晚饭前的几分钟", "熟悉的脚步声到了门口。你放下手里的事，听家人讲了讲今天。"],
    ["天放晴了", "你在住处附近多留了一会，看着街角慢慢热闹起来。"],
    ["寻常的一页", "回想这一年，最先想起的还是那顿一起吃完的晚饭。"],
    ["窗边的光", "傍晚的光线照进窗里，你记住了这段安静的时光。"],
    ["一张小纸条", "有人把该记住的小事写进纸条，压在桌角。你经过时又看了一眼。"],
    ["熟悉的街道", "沿着平日的路慢慢经过，你发现街角那扇门换了新的颜色。"]
  ];

  function tick(state, skipOldChildhood = false) {
    state.age++;
    const age = state.age;
    for (const [from, stage] of STAGES) if (age >= from) state.stage = stage;
    const openingLength = state.log.length;
    if (age >= 17 && age <= 19) settleSchoolYears(state);
    if (age >= 20) applyAdultYear(state);
    if (age === 6) state.career = "在校学生";
    if (age === 14 && state.decisions.childhood) {
      const family = state.decisions.childhood === "family";
      const reply = state.region === "chengdu" ?
        (family ? "家人炒豌豆尖时要你帮忙挑菜。你一掐，手指还记得八岁那年学过的分寸。" :
          "整理旧书包时翻出八岁画的叶子。你认出了其中两种，把它们的名字补在了旁边。") :
        (family ? "你买了几只还硬的洋梨。过了几天，全家分着吃，熟得刚好。" :
          "你又看到了八岁时画过的那种水鸟。这回对照图鉴，在旧画旁写下了苍鹭。");
      record(state, "那个下午留下的本领", reply, "echo", true);
    }
    if (age % 3 === 0 && age >= 45) state.health = bounded(state.health - (age >= 72 ? 2 : 1));

    const localEvents = city(state).events || [];
    const scene = localEvents.find(event => event.age === age);
    if (scene) record(state, scene.title, scene.text, "event", false);

    const endAge = 75 + draw(state.seed, 4, 0) % 14 + (state.decisions.retirement === "walk" ? 2 : 0);
    if (age >= endAge) {
      state.stage = "告别";
      state.ended = true;
      const echo = state.decisions.mentor === "teach" ? "那些从你手里学会本领的人，也记得你教过的第一步。" :
        "工作笔记里写下来的经验，还留在后来人的书架上。";
      record(state, "把这一生合上", state.name + "在" + city(state).label + "度过了 " + age +
        " 年。家人整理好纪念物，一起讲起和你相处的往事。" + echo, "ending", true);
      return;
    }
    state.pending = skipOldChildhood && age === 8 ? null : decisionAt(state);
    if (state.pending) record(state, state.pending.title, state.pending.text, "decision", false);
    if (state.log.length === openingLength) {
      const idle = age <= 3 ? ["慢慢长大", "家里人记着你吃饭睡觉的时辰，也记着你一点点长大的样子。"] :
        ORDINARY[(draw(state.seed, 5, 0) % ORDINARY.length + age) % ORDINARY.length];
      record(state, idle[0], idle[1], "year", false);
    }
  }

  function clone(state) { return JSON.parse(JSON.stringify(state)); }

  function advance(state) {
    if (!state || state.ended || state.pending) return state;
    const result = clone(state);
    tick(result);
    return result;
  }

  function next(state) {
    if (!state || state.ended || state.pending) return state;
    const result = clone(state);
    do { tick(result); }
    while (!result.ended && !result.pending && result.age !== 19);
    return result;
  }

  function choose(state, optionId) {
    if (!state || !state.pending || !state.pending.options.some(item => item.id === optionId)) return state;
    const result = clone(state);
    transition(result, optionId);
    return result;
  }

  function rewind(state) {
    if (!state || !state.canRewind) return state;
    const result = create(state);
    const childhood = state.decisions.childhood;
    while (result.age < ROUTE_AGE) {
      tick(result, !childhood);
      if (result.pending && result.pending.id === "childhood") transition(result, childhood);
    }
    return result;
  }

  function sameData(left, right) {
    if (left === right) return true;
    if (left === null || right === null || typeof left !== "object" || typeof right !== "object") return false;
    if (Array.isArray(left) !== Array.isArray(right)) return false;
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length &&
      keys.every(key => OWN(right, key) && sameData(left[key], right[key]));
  }

  // 从种子与已选决策复算，检查家庭余额、待办选择、年龄和记录能否同时成立。
  function valid(state) {
    if (!state || state.version !== VERSION || !OWN(ECONOMY, state.region) ||
        !OWN(FAMILY_CASH, state.family) || !Number.isInteger(state.seed) ||
        state.seed < 0 || state.seed > 0xffffffff || !Number.isInteger(state.age) ||
        state.age < 0 || state.age > 90 || !state.decisions || typeof state.decisions !== "object") return false;
    try {
      const rebuilt = create(state);
      // 早期原型的童年会自动推进。旧档继续沿原来的人生，不追补已过的选择。
      const legacy = state.age >= 8 && !OWN(state.decisions, "childhood") &&
        !(state.pending && state.pending.id === "childhood");
      while (true) {
        if (rebuilt.pending && OWN(state.decisions, rebuilt.pending.id)) {
          const pick = state.decisions[rebuilt.pending.id];
          if (!rebuilt.pending.options.some(item => item.id === pick)) return false;
          transition(rebuilt, pick);
        }
        if (rebuilt.age === state.age) {
          if (legacy && Array.isArray(state.log)) {
            const oldDinner = "这些年的电话没有断。亲人提前打来，和你一起商量春节相聚的日子。";
            if (state.log.some(item => item.age === 33 && item.text === oldDinner)) {
              for (const item of [...rebuilt.log, ...rebuilt.memories]) {
                if (item.age === 33 && item.title === "门上留着一把钥匙" && state.decisions.home === "call") item.text = oldDinner;
              }
            }
          }
          return Object.keys(rebuilt).every(key => sameData(rebuilt[key], state[key]));
        }
        if (rebuilt.ended || rebuilt.pending) return false;
        tick(rebuilt, legacy);
      }
    } catch { return false; }
  }

  root.Life = Object.freeze({ create, advance, next, choose, rewind, valid });
})(globalThis);

/* 第二版入口。上段为冻结的第一版运行时，旧存档继续由原来的规则读写。 */
(function installYearlyLife(root) {
  "use strict";
  const legacy = root.Life;
  const owns = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
  const limit = n => Math.max(0, Math.min(100, n));
  const clone = item => JSON.parse(JSON.stringify(item));
  const stats = ["health", "happiness", "knowledge", "bond"];
  const localCities = ["chengdu", "lyon"];
  const local = state => localCities.includes(state.region) && root.LifeText?.cities?.[state.region] || {};
  const chapter = () => root.LifeContentV2 || root.LifeChapters || {};
  const regional = s => root.LifeFinance?.current(s) || false;
  const moneyText = (s,text) => root.LifeFinance?.moneyText(s,text) ?? text;
  const money = (s,n) => root.LifeFinance?.money(s,n) ?? (n+" 记账单位");
  const hasLocalHouseholdBudget = s => s.edition === "regional-2" && s.countrySetVersion === 2 &&
    (s.region === "JPN" || s.region === "MEX");

  function draw(seed, channel, age = 0) {
    let h = (seed ^ Math.imul(channel, 0x9e3779b1) ^ Math.imul(age, 0x85ebca77)) >>> 0;
    h = Math.imul(h ^ (h >>> 16), 0x7feb352d);
    h = Math.imul(h ^ (h >>> 15), 0x846ca68b);
    return (h ^ (h >>> 16)) >>> 0;
  }
  function log(s, title, text, kind, memorable = false, sourceKey, thread) {
    if (regional(s)) text = moneyText(s,text);
    const event = {age:s.age, title, text, ...(sourceKey ? {sourceKey} : {}), ...thread};
    s.log.push({...event, kind});
    if (memorable) s.memories.push(event);
  }
  function fact(s, category, title, text) {
    if (regional(s)) text = moneyText(s,text);
    s.facts.push({age:s.age, category, title, text});
  }
  function apply(s, effects) {
    for (const stat of stats) if (effects[stat]) s[stat] = limit(s[stat] + effects[stat]);
    if (effects.cash) s.cash = Math.max(0, s.cash + effects.cash);
  }
  function storyModules(s) {
    if (s.ended || !Number.isInteger(s.storyFrom) || s.age < s.storyFrom) return [];
    return [root.LifeFriendStory, root.LifeHomeStory, root.LifeChanceStory].filter(Boolean);
  }
  function storyCard(s) {
    if (s.age === 19) return null;
    for (const mod of storyModules(s)) {
      const card = mod.card?.(s);
      if (card && !owns(s.decisions,card.id)) return card;
    }
    return null;
  }
  function storyEffects(s,effects,title,key) {
    const before = s.cash;
    apply(s,effects || {});
    const delta = s.cash - before;
    if (!effects?.cash) return "";
    const formatted = root.LifeFinance?.displayMoney?.(s,Math.abs(delta)) ?? money(s,Math.abs(delta));
    if (delta) {
      // 本年结算已完成。实际变动记入本年账行和交易明细，次年的学校账只汇入尚未入账的交易。
      (s.transactions ??= []).push({age:s.age,label:title,kind:delta < 0 ? "expense" : "income",
        cashDelta:delta,threadKey:key,bookedAge:s.age});
      const expense = Math.max(0,-delta), income = Math.max(0,delta);
      const school = s.ledger.at(-1);
      let row = school?.age === s.age ? school : s.annualAccounts.at(-1);
      if (!row || row.age !== s.age) {
        row = {age:s.age,income:0,cost:0,balance:before,drawFromSavings:0,shortfall:0};
        s.annualAccounts.push(row);
      }
      row.cost += expense;
      row.income += income;
      row.balance += delta;
      if (Number.isFinite(row.other)) row.other += expense;
      if (row === school) {
        row.threadExpense = (row.threadExpense || 0) + expense;
        if (s.report) {
          s.report.endCash = row.balance;
          s.report.rows = clone(s.ledger);
        }
      }
    }
    return (effects.cash < 0 ? " 钱包实际支出" : " 钱包实际到账") + formatted + "。";
  }
  function storyEvents(s) {
    for (const mod of storyModules(s)) {
      for (const item of mod.events?.(s) || []) {
        if (s.log.some(row => row.threadKey === item.key)) continue;
        const receipt = storyEffects(s,item.effects,item.title,item.key);
        log(s,item.title,item.text + receipt,"event",true,undefined,{threadKey:item.key,...(item.tone ? {tone:item.tone} : {})});
      }
    }
  }
  function economy(s) {
    return regional(s) ? root.LifeFinance.economy(s) : legacyEconomy(s);
  }
  function legacyEconomy(s) {
    if (s.region === "chengdu") return {cost:1200,wage:3000};
    if (s.region === "lyon") return {cost:1500,wage:3600};
    const group = s.origin ? s.origin.incomeGroup : root.LifeWorld?.place(s.region,s.birthYear)?.incomeGroup;
    const [cost,wage] = ({low:[650,1450],lowerMiddle:[900,2100],upperMiddle:[1200,3000],
      high:[1500,3600]})[group] || [1000,2400];
    return {cost,wage};
  }
  function schoolGrant(s,cost) {
    if (s.familyPreset || s.quintile > 2) return 0;
    return Math.floor(cost * (s.quintile === 1 ? .5 : .25));
  }
  function stage(age) {
    if (age < 6) return "童年";
    if (age < 16) return "在校时光";
    if (age < 20) return "少年选择";
    if (age < 30) return "初入社会";
    if (age < 50) return "成年生活";
    return age < 65 ? "中年岁月" : "晚年";
  }
  const focusCatalog = {
    balance:["照常生活","四种状态按这一年的日常变化。",{}],
    play:["玩耍和探索","心情 +2，学识 +1。",{happiness:2,knowledge:1}],
    family:["陪伴亲近的人","牵绊 +2，心情 +1。",{bond:2,happiness:1}],
    study:["专心学习","学识 +3，心情 −1。",{knowledge:3,happiness:-1}],
    move:["规律运动","健康 +2，心情 +1。",{health:2,happiness:1}],
    work:["磨炼工作本领","学识 +2，健康 −1。",{knowledge:2,health:-1}],
    rest:["休息和调养","健康 +3。",{health:3}],
    share:["分享经验","牵绊 +2，学识 +1。",{bond:2,knowledge:1}]
  };
  function focusIds(age) {
    if (age < 6) return ["balance","play","family","rest"];
    if (age < 16) return ["balance","study","move","family"];
    if (age < 62) return ["balance","study","work","move","family","rest"];
    return ["balance","share","move","family","rest"];
  }
  function focusOptions(s) {
    if (!s || s.ended || s.version !== 2) return [];
    return focusIds(s.age).map(id => ({id,label:focusCatalog[id][0],note:focusCatalog[id][1]}));
  }
  const shop = [
    ["supplies",5,110,60,"书和文具","留一册给自己的练习本。",{knowledge:3}],
    ["outing",3,110,100,"一次家庭活动","给一起出门留一点预算。",{bond:3,happiness:2}],
    ["sport",7,110,150,"运动用品","挑一件适合常用的用品。",{health:3,happiness:1}],
    ["culture",10,110,120,"一场文化活动","听一段新故事，认一张新面孔。",{knowledge:1,happiness:3}],
    ["course",18,75,550,"职业课程","学一个可以用在工作里的方法。",{knowledge:5}],
    ["checkup",18,110,350,"健康检查","了解近况，给自己安排休息。",{health:4}]
  ];
  // 系数是游戏内的相对薪资和维护成本。没有把岗位资格、利息或价格当作真实当地数据。
  const fields = {
    land:"农业与食品",craft:"手艺与制造",service:"商业服务",care:"健康与照护",
    teaching:"教育文化",tech:"技术与信息",office:"行政与财务",transport:"运输与物流"
  };
  const jobs = [
    ["grower","蔬菜种植员","land",0,86],["orchard","果园管理员","land",1,102],
    ["food","食品检验助理","land",2,112],["irrigation","灌溉设备技术员","land",2,122],
    ["nursery","育苗员","land",0,91],["coop","农产品采购员","land",1,105],
    ["maker","制作学徒","craft",0,88],["tailor","裁缝","craft",1,105],
    ["carpenter","木工","craft",1,113],["machine","机器维护员","craft",2,125],
    ["quality","工序质检员","craft",2,119],["baker","烘焙工","craft",1,103],
    ["server","餐饮服务员","service",0,88],["clerk","商店店员","service",0,93],
    ["sales","客户联络员","service",1,104],["buyer","门店采购员","service",2,117],
    ["cook","后厨备料员","service",0,91],["shopkeeper","门店运营员","service",2,116],
    ["caregiver","生活照护员","care",0,92],["register","诊所登记员","care",1,99],
    ["healthvisit","社区健康联络员","care",2,108],["ward","医院物资协调员","care",2,115],
    ["records","病案整理员","care",2,109],["medsupply","医疗器械维护助理","care",3,132],
    ["library","图书整理员","teaching",0,92],["classaid","课堂助理","teaching",1,101],
    ["museum","展馆讲解员","teaching",2,112],["trainer","职业培训讲师","teaching",3,134],
    ["materials","学习资料编辑","teaching",2,118],["arts","社区活动组织员","teaching",1,107],
    ["helpdesk","技术客服","tech",1,105],["repairer","设备维修员","tech",1,110],
    ["software","软件测试员","tech",2,129],["network","网络运维员","tech",2,132],
    ["draft","技术制图员","tech",2,123],["analyst","数据分析员","tech",3,139],
    ["archive","档案管理员","office",0,93],["admin","行政助理","office",1,104],
    ["payroll","工资核算员","office",2,120],["accounts","财务记账员","office",2,119],
    ["contracts","合同事务员","office",2,115],["planner","项目计划员","office",3,135],
    ["packing","货物分拣员","transport",0,90],["store","仓储管理员","transport",1,102],
    ["dispatch","配送调度员","transport",2,115],["routeplan","运输线路规划员","transport",3,130],
    ["stock","库存盘点员","transport",1,107],["freight","货运联络员","transport",1,109]
  ].map(([id,title,field,level,pay]) => ({id,title,field,level,pay}));
  const rankTitle = ["初任","熟练","资深","带教"];
  function jobPay(s,job,rank = 0) {
    return Math.round(economy(s).wage * (job.pay + rank * 8) / 100);
  }
  function jobBoard(s) {
    const own = s.education.field;
    const years = s.education.years;
    const eligible = jobs.filter(j => {
      if (j.level === 0) return true;
      if (j.level === 1) return s.knowledge >= 23 || own === j.field;
      if (j.level === 2) return (own === j.field && years >= 1 && s.knowledge >= 27) || (s.route === "study" && s.knowledge >= 46);
      return own === j.field && years >= 2 && s.knowledge >= 40;
    });
    // 首先给出本方向的机会，再从各行业抽取其余空缺。初级岗位始终有机会出现。
    const score = j => draw(s.seed,110 + jobs.indexOf(j),s.age);
    eligible.sort((a,b) => score(a)-score(b));
    const aligned = eligible.filter(j => j.field === own).slice(0,2);
    const others = eligible.filter(j => j.field !== own).slice(0,3);
    return aligned.concat(others).map(j => opt(j.id,j.title,
      fields[j.field] + "。游戏年薪 " + jobPay(s,j) + "，随着工龄和能力可升档。",
      j.field === "care" || j.field === "teaching" || j.field === "service" ? {bond:2} : {knowledge:2}));
  }
  function jobCard(s,id,title,text) {
    return {id,title,text,category:"career",type:"choice",options:jobBoard(s)};
  }
  function assumeJob(s,id) {
    const role = jobs.find(j => j.id === id);
    if (!role) return;
    s.job = {id,title:role.title,field:role.field,sector:fields[role.field],rank:0,years:0,
      started:s.age,annualPay:jobPay(s,role),lastIncome:null,status:"employed"};
    s.career = role.title;
  }
  function assetPrice(s,age = s.age) {
    // 相邻年份共用上一年价格噪声的一部分，价格可以上行也可以下行。
    const base = Math.round(economy(s).wage * .33);
    const swing = (draw(s.seed,135,age) % 55) + (draw(s.seed,135,age-1) % 28) - 41;
    return Math.round(base * (100+swing)/100);
  }
  function homePrice(s) {
    const scale = 74 + draw(s.seed,136,Math.floor(s.age / 3)) % 53;
    if (regional(s)) return Math.round(root.LifeFinance.home(s)*scale/100);
    return Math.round(economy(s).cost * 12 * scale / 100);
  }
  function market(s) {
    if (s.age < 20 || s.ended) return [];
    const price = assetPrice(s);
    const house = homePrice(s);
    const canBuy = s.housing !== "自有住房";
    const rows = [
      ["deposit","转入储蓄",500,0,true,"将500从钱包转入储蓄，随时可在之后的年份支取。"],
      ["withdraw","支取储蓄",0,Math.min(500,s.savings),s.savings>0,"从储蓄转回钱包，本次最多500。"],
      ["buyfund","购入一份投资资产",price,0,true,"这一份的价格逐年波动，出售时另扣4%的费用。"],
      ["sellfund","出售一份投资资产",0,Math.floor(price*.96),s.assets.fundUnits>0,"按今年市场价格卖出一份，到手金额已经扣除费用。"]
    ];
    if (s.age >= 26) rows.push(canBuy ?
      ["buyhome","全款购置住房",house,0,true,"使用钱包全款买入，以后减少租住支出，每年承担维修费用。"] :
      ["sellhome","出售自有住房",0,Math.floor(house*.93),true,"到手金额已扣7%交易费用，以后重新承担租住支出。"]);
    if (regional(s)) {
      rows.push(["shared","改为公共或合乘通勤",0,0,s.commute!=="shared","以后交通预算比常规低33%，与人约车需要留出等候时间。"]);
      rows.push(["flexible","改为弹性通勤",0,0,s.commute!=="flexible","以后交通预算比常规高19%，可以自由安排出行时刻。"]);
    }
    return rows.map(([id,label,cost,credit,allowed,note]) => {
      const pair = id === "buyhome" || id === "sellhome";
      const travel = id === "shared" || id === "flexible";
      const used = s.actions.some(a => a.age === s.age && a.type === "buy" &&
        (a.id === id || pair && (a.id === "buyhome" || a.id === "sellhome") ||
         travel && (a.id === "shared" || a.id === "flexible")));
      return {id,label,cost,credit,enabled:!used && allowed && s.cash >= cost,
        note:used ? "今年已经办理过。" : !allowed ? (travel ? "目前采用这种安排。" : "当前持有量不足。") : s.cash < cost ? "钱包余额不足。" : note};
    });
  }
  function shopOptions(s) {
    if (!s || s.version !== 2 || s.ended) return [];
    return shop.filter(row => s.age >= row[1] && s.age <= row[2]).map(row => {
      const [id,,,oldCost,label,desc,effects] = row;
      const cost = regional(s) ? root.LifeFinance.goods(s,id) : oldCost;
      const bought = s.actions.some(a => a.age === s.age && a.type === "buy" && a.id === id);
      const allowance = s.age >= 18 || oldCost <= (s.family === "tight" ? 100 : 200);
      const enabled = !bought && allowance && s.cash >= cost;
      const delta = stats.filter(k => effects[k]).map(k =>
        ({health:"健康",happiness:"心情",knowledge:"学识",bond:"牵绊"})[k] + " +" + effects[k]).join("，");
      const note = bought ? "今年已经买过。" : !allowance ? "超出家里给未成年人的单项预算。" :
        s.cash < cost ? "当前积蓄不足。" : desc + delta + "。";
      return {id,label,note,cost,enabled};
    }).concat(market(s)).map(item => {
      if (!regional(s)) return item;
      return s.pending ? {...item,enabled:false,note:"先完成当前人生选择，再办理这项安排。"} :
        {...item,note:moneyText(s,item.note)};
    });
  }

  // 描述、分支与后续写在同一张卡中。每项都立即改动人物状态。
  function opt(id,label,note,effects,follow) { return {id,label,note,effects,follow}; }
  function card(id,title,text,a,b,category = "personal",type = "choice") {
    return {id,title,text,options:[a,b],category,type};
  }
  function after(years,title,text) { return {after:years,title,text}; }
  function partnershipCrisis(s) {
    if (s.age !== 34 || s.partnerStatus !== "together") return false;
    const chance = s.bond < 60 ? 32 : s.childCount ? 19 : 12;
    return draw(s.seed,162,s.age) % 100 < chance;
  }
  function partnerEndAge(s) {
    const hash = n => root.LifeWorld?.hash ? root.LifeWorld.hash(s.seed,n) : draw(s.seed,n);
    const offset = hash(305)%7-3;
    const end = Math.round((s.origin.lifeExp || 76) + hash(951)%25-12);
    return Math.max(25+offset+3,end)-offset;
  }
  function cardAt(s) {
    const d = s.decisions;
    const c = economy(s);
    switch (s.age) {
      case 2: return card("temper","门外的陌生面孔","有人弯下腰，朝你慢慢伸出手。你会怎样靠近？",
        opt("wave","先挥挥手","想知道对方会不会也挥手。",{happiness:3,bond:1}),
        opt("watch","靠在熟悉的人身边看看","等对方蹲下来，再试着打个招呼。",{bond:3,knowledge:1}),"personal","reflection");
      case 5: return card("make","掉落的轮子","心爱的玩具掉了一只轮子。有人愿意过来帮忙。",
        opt("repair","一起把轮子装回去","学着看两件东西怎样拼合。",{knowledge:3},after(2,"那只轮子","另一个小孩的玩具松了，你记得从哪一面把它卡进去。")),
        opt("story","把它改成一艘船","用掉了轮子的车身编一个新故事。",{happiness:3},after(2,"玩具船的新航线","有个比你小的孩子听了玩具船的故事，让你再讲一个。")) );
      case 7: return card("interest","放学后的一块空地","几个孩子围起一场游戏，旁边有人坐下画他们的样子。",
        opt("team","加入跑动的队伍","跟上别人的步子。",{health:3,bond:1}),
        opt("sketch","坐下学画身影","静静观察人的样子。",{knowledge:2,happiness:2}));
      case 8: return card("childhood","星期六的下午","家人要出门办些小事。你也有一个自己想去看看的角落。",
        opt("family","陪家人一起去","帮忙挑东西，听家人谈起近况。",{bond:4},after(6,"你还记得怎么挑","家人把手里的袋子递给你。你还记得八岁那个下午学到的窍门。")),
        opt("explore","去附近观察","注意到路上一个以前没发现的细节。",{health:2,knowledge:2},after(6,"观察簿的第一页","你重新看起那本旧册子，把第一次出门观察的日期补在第一页。")));
      case 10: return card("friend","有人落了单","一场游戏刚结束，有个孩子还站在原地。",
        opt("invite","邀请对方一起走","你们交换了名字。",{bond:4}),
        opt("listen","留下听听发生了什么","先给对方讲完的时间。",{bond:2,knowledge:2}));
      case 12: return card("club",d.interest === "team" ? "下一场活动谁来安排" : "画本被借走了","同伴想一起做点什么。大家等着你拿主意。",
        opt("organise","召集几个人分工","你负责让每个人找到位置。",{bond:3,knowledge:1}),
        opt("design","先做个小样","你用一件能摸到的东西说明想法。",{knowledge:3,happiness:1}));
      case 14: return card("self","一次不如意的结果","你准备了很久，这次的结果还是让你失望。你想怎么过今晚？",
        opt("talk","向信任的人说出来","多一个能听你讲的人。",{bond:3,happiness:1}),
        opt("retry","把没弄懂的地方圈起来","找到下次可以练习的地方。",{knowledge:3,happiness:1}),"personal","reflection");
      case 15: return card("training","一次短短的旁听","有人能带你到工作的地方看半天，也有人愿意借给你一册学习资料。",
        opt("workshop","去工作现场","看看别人怎样从原料做到成品。",{knowledge:2,bond:2}),
        opt("reading","借学习资料来读","试着独立弄懂一个陌生概念。",{knowledge:4}),"education");
      case 16: return card("route","离开校门的那年","家里把账本放在桌上。接下来三年，你可以继续学习，也可以先去工作。",
        opt("study","继续升学","每年学习支出 "+ c.cost +"。" +
          (schoolGrant(s,c.cost) ? "你的游戏助学额度每年至少 " + schoolGrant(s,c.cost) + "，" : "") +
          "家庭无法支付的部分也由助学补足。",{knowledge:3}),
        opt("work","先去工作","每年工资 "+ c.wage +"，家庭开销 "+ (c.homeShare ?? c.cost) +"。",{bond:2}),"education");
      case 20: return s.route === "study" ? card("opportunity","报名表递到手里",s.report.opportunity,
        opt("specialist","继续进修","投入最多600积蓄，明年走上技术岗位。",{cash:-600,knowledge:5},after(1,"独立完成的工单","你把进修课里练过的步骤第一次用在了真的工单上。")),
        opt("office","先做项目助理","立即就业，开始熟悉协作流程。",{bond:3,knowledge:1}),"career") :
        card("opportunity","带班的空缺",s.report.opportunity,
        opt("lead","争取带班","轮班和协调归你负责，获得更高报酬。",{bond:2,health:-1},after(1,"排好的轮班","两位同事临时有事，你调开班次，大家如期交了班。")),
        opt("craft","跟师傅精进手艺","准备独立做完一件工作。",{knowledge:4}),"career");
      case 21: return {id:"field",type:"choice",category:"education",
        title:s.route === "study" ? "选一个专修方向" : "选一项在岗训练",
        text:"挑一门你想深学的本领。接下来求职时，这个方向会有对口空缺，高阶职位还要看学习时间和能力。",
        options:Object.entries(fields).map(([id,label]) => opt(id,label,"积累这个方向的资历，增加可申请的岗位。",{knowledge:2}))};
      case 22: return card("specialty",s.route === "study" ? "第一项长期任务" : "有两组人在招手","你接下来的工作可以多和人打交道，也可以钻研较细的技术。",
        opt("people","去联络协调的一组","收入渐稳，也会多认识几个人。",{bond:4}),
        opt("tools","去技术和制作的一组","把精力放进一项专门本领。",{knowledge:4}),"career");
      case 24: return jobCard(s,"profession","这次应聘哪一个岗位？","招工栏上有几份你能胜任的工作。你学过的方向、当前学识和本地这年出现的空缺，决定了手里这份名单。");
      case 25: return card("relationship","关系往哪里走","你和一个认识了很久的人谈到以后。你更想怎样安排彼此的生活？",
        opt("partner","试着建立伴侣关系","把共同生活提上日程。",{bond:5,happiness:2}),
        opt("single","保持独立生活","说出自己的想法，也留住各自的空间。",{happiness:4}),"family");
      case 28: return s.partnerStatus === "together" ? card("household","两个人的下一步","你和伴侣认真谈起，两人愿不愿意共同承担养育的责任。",
        opt("parent","一起迎接一个孩子","生活开销提高，家庭多一位成员。",{bond:5,health:-2},after(3,"那个认真听你说话的人","孩子学着用自己的话复述你讲的故事，还给结尾加了一句。")),
        opt("together","继续过两个人的生活","给彼此的兴趣和相处留下空间。",{happiness:4}),"family") :
        card("household","你想要怎样的住处","手上有了些选择。有人想跟你合住，你也找得到适合一个人住的地方。",
        opt("share","找朋友合住","分担生活支出，也一起照应。",{bond:4}),
        opt("alone","自己安排住处","付出一些搬家费用，换来自己的安排。",{cash:-250,happiness:4}),"family");
      case 30: return card("home","需要帮忙的那段日子","一位亲近的人要搬住处，问你这些日子怎样联系方便。",
        opt("visit","每周去搭把手","最多花900积蓄安排交通与时间。",{cash:-900,bond:5},after(3,"一把备用钥匙","搬家那阵你常来的那扇门，如今也给你留了一把钥匙。")),
        opt("call","约好固定联系","定期帮忙核对账单、安排日常。",{bond:3,knowledge:1},after(3,"熟悉的声音","从搬家那阵子开始，两个人一直记得同一个通话时间。")),"family");
      case 33: return card("mobility","一份新岗位","认识的人带来一份新的工作机会。收入多一些，通勤却更久。",
        opt("move","换一份工作","今后工作收入提高，适应期有些累。",{health:-2,knowledge:2}),
        opt("remain","留在熟悉的团队","少些通勤，把时间留给自己的生活。",{health:2,bond:2}),"career");
      case 34:
        if (!partnershipCrisis(s)) return null;
        return card("partnercrisis","两副钥匙要不要留在同一个地方",
          "你们为家务和各自的时间争执了很久。这天晚上，两个人都把原本要做的事放下，商量接下来怎么过。",
          opt("renegotiate","继续同住，重新分担日常","未来两年每年多安排90记账单位，换出一起梳理家务的时间。",{bond:2,happiness:-1}),
          opt("separate","另找住处，分开生活",s.childCount ?
            "搬动花费最多260，未来三年每年多支出320。两边继续共同照料孩子。" :
            "搬动花费最多260，未来三年每年多支出220，之后独立安排生活。",{cash:-260,bond:-3,happiness:-1}),"family");
      case 36: {
        if (draw(s.seed,140,s.age) % 3 === 0) return card("jobrisk","这份工作有了变数","单位这年的订单减少。愿意留下减工时的人可以继续工作，还有人开始投下一份简历。",
          opt("reduced","留任并减少工时","未来三年工作报酬减少两成，工龄继续累计。",{health:2}),
          opt("search","结束合约，重新求职","领取一次结清工资，下一岁没有固定收入，之后接到新的职位名单。",{cash:300,knowledge:1}),"career");
        return null;
      }
      case 38:
        if (s.job?.status === "searching") return jobCard(s,"rehire","求职回音","经过一段没有固定工资的日子，几家单位回了消息。你打算先向哪一家报到？");
        return card("check","持续的疲倦","这阵子的疲惫反复出现。你决定怎样为身体留出时间？",
        opt("clinic","预约一次就诊","支付最多180，安排检查。",{cash:-180,health:4},after(2,"记着的预约日期","你按上次约好的时间复查，把这段时间记下的变化带了去。")),
        opt("rest","调整班次，安排休息","短期少些收入，也能腾出时间休息。",{cash:-100,health:2,happiness:2}),"health");
      case 40: return card("housing","下一段日子住在哪里","你拿这几年的积蓄和住处开销算了一遍，开始认真商量未来的安排。",
        opt("settle",s.housing === "自有住房" ? "整修现在的住处" : "攒一笔安家储蓄",
          s.housing === "自有住房" ? "最多用400整修，接下来三年减少维护支出。" : "把钱包内最多1200转入安家储蓄，之后可支取用来购房。",{happiness:2}),
        opt("flex","保留搬迁的灵活","保持现在的安排。每年可在生活面板按当年价格交易住房。",{bond:2}),"family");
      case 42: return card("midstudy",d.specialty === "tools" ? "同行遇到的难题" : "跨组工作邀请","一项新任务要学新的方法，团队也需要有人帮大家理清分工。",
        opt("learn","去学新的方法","为学习腾出时间和材料费用。",{cash:-300,knowledge:5}),
        opt("coordinate","把大家组织起来","团队开始信任你做协调的判断。",{bond:4,happiness:1}),"career");
      case 44: {
        const chance = s.health < 70 ? 34 : s.focus === "work" ? 23 : 13;
        if (s.job?.status !== "employed" || draw(s.seed,163,s.age)%100 >= chance) return null;
        return card("illness","工作日历上的几处空白",
          "一次患病打乱了日常。复诊和休息要挤进原本排满的工作日，你跟同事商量怎样把手里的活交接出去。",
          opt("leave","暂时减少工时","接下来两年工资减少约24%，每年照护支出140，安排较多休养时间。",{health:-4,happiness:-2}),
          opt("adjust","调整轮班，分段安排照护","接下来三年工资减少约8%，每年照护支出230，生活按新的班表安排。",{health:-4,happiness:-1}),"health");
      }
      case 45: return card("care","照料怎样安排","你常联系的一位亲友需要一段时间的照应。对方想好好商量安排。",
        opt("hands","亲自分担日常","暂时少接工作，固定留出几天。",{cash:-280,bond:5,health:-1}),
        opt("network","一起组织互助排班","找几个人分担接送和餐食。",{bond:3,knowledge:2}),"family");
      case 50: return card("mentor","新人递来的笔记本","有人刚来做你的这行，问你第一天该从哪里开始。",
        opt("teach","亲自带一段时间","空出时间，陪一个人从头练起。",{bond:4,knowledge:1},after(6,"教会另一个人的第一步","当年跟着你学的新人现在也会教别人了，开头还是你的那句提醒。")),
        opt("handbook","把经验写成手册","整理方法，供后来的人翻阅。",{knowledge:4},after(6,"熟悉的笔迹","那本手册辗转回来，空白处写着好几个人补上的办法。")),"career");
      case 54: return card("savings","预算多出了一点空间","忙惯了的日子里，有一笔钱终于不用马上花掉。",
        opt("keep","增加应急积蓄","接下额外一单，把报酬存下。",{cash:450,health:-1}),
        opt("memory","实现一次小心愿","花最多260，去见挂念的人。",{cash:-260,happiness:4,bond:2}));
      case 58: return card("pace","工作要怎样继续","你越来越清楚自己的长处，也看得到连续忙几天的代价。",
        opt("lighter","减少工作时数","以后报酬略减，给生活腾出空间。",{health:4}),
        opt("expert","接受顾问任务","今后收入略增，把经验用到新的地方。",{knowledge:3,bond:2}),"career");
      case 63: return card("retireplan","下一阶段的工时","逐步退出工作和再留几年，都在你的考虑之中。",
        opt("retire","现在退休","从明年起领取游戏内基本养老收入。",{health:3,happiness:1}),
        opt("part","转作部分工时","再做几年较轻的工作，70岁正式退休。",{bond:2,knowledge:2}),"career");
      case 68: return card("retirement","空出来的星期三",d.mentor === "teach" ? "当年的新人发来消息，邀你到附近的活动室看看。" : "有人读过你留下的资料，希望你去附近的活动室坐坐。",
        opt("community","常去活动室","添置资料，参与身边的事情。",{cash:-120,bond:4}),
        opt("walk","把下午留给散步","给自己找到一个舒服的步调。",{health:4,happiness:1}));
      case 72: return card("story","最想留下的是什么","有人请你谈谈以前的生活。你愿意从哪里讲起？",
        opt("voices","讲一个亲近的人的故事","让另一个人也认识记忆里的面孔。",{bond:4,happiness:1}),
        opt("craftbook","记下一项本领","把学习这件事的诀窍留给后来者。",{knowledge:3,happiness:2}),"personal","reflection");
      case 78: return card("support","往后的日常","你在想，怎样让以后的生活舒服一些，也让别人知道怎样帮忙。",
        opt("near","住得离能相互照应的人近一些","搬动几件东西，增加日常陪伴。",{cash:-300,bond:4}),
        opt("adapt","改一改熟悉的住处","花些积蓄，把常用物品放得更顺手。",{cash:-220,health:4}),"family");
      case 84: return card("keepsake","一只旧盒子","翻出收了多年的东西，你想用什么办法让它们再见见光？",
        opt("give","挑给愿意收下它的人","把旧物和它的来历一起送出。",{bond:3,happiness:2}),
        opt("sort","整理成一册小小的回忆","为每件东西记下一句话。",{knowledge:3,happiness:2}));
      default: return null;
    }
  }

  // 内容条目的条件在进入该岁时匹配。空条件代表通用，一个字段的数组表示任选其一。
  function matches(s,item) {
    if (item.region && item.region !== s.region) return false;
    if (!item.requires) return true;
    const context = {
      route:s.route, educationPath:s.route, field:s.education.field, jobSector:s.job?.field || null, jobId:s.job?.id || null,
      jobStatus:s.job?.status || "none", household:["separated","widowed"].includes(s.partnerStatus) ?
        (s.childCount ? "oneParent" : "alone") : s.decisions.household || s.decisions.relationship || "childhood",
      children:s.childCount > 0, partner:s.partnerStatus === "together", retired:s.retired,
      lowHealth:s.health <= 64, lowBond:s.bond <= 59, aid:s.ledger.some(row => row.aid > 0),
      family:s.family, residence:s.residence, sex:s.sex, quintile:s.quintile,
      focus:s.focus, housing:s.housing === "自有住房" ? "owned" : "rented",
      hasSavings:s.savings > 0
    };
    return Object.entries(item.requires).every(([key,value]) => owns(context,key) &&
      (Array.isArray(value) ? value.includes(context[key]) : value === context[key]));
  }
  function decision(s) {
    const base = cardAt(s);
    if (base?.id === "route" && root.CountryStories?.active(s)) {
      const plan = s.decisions["local-EGY-secondary-path"];
      base.title = "接下来三年，把时间放在哪里";
      base.text = plan === "exam-prep" ? "十四岁时，你把时间留给了复习。现在家里又坐下来算了一次账：再读几年，还是先跟师傅领报酬、学手艺？之前的准备让你有了选择，也让这个选择更难。" :
        plan === "technical-visit" ? "十四岁那次探校，你记住了实训时动手的感觉，也记住了往返要花多久。今天桌上摆着两种打算：留在学校继续学，或者接下眼前这份带薪学徒工作。" :
        "家里摊开账本，和你算接下来三年的日子。一条路能让你把更多时间留给学业；另一条路有带薪学徒的位置，可以边做边学，也能早些分担开销。";
      base.options[1].label = "做带薪学徒";
      const region = root.LifeWorld?.storySetting(s)?.id;
      if (region === "nrw") {
        const year = s.birthYear===2026 ? 2026 : s.birthYear+s.age;
        base.text=year>=1969 && year<=2026 ? "你和家人看着两份材料。一份是继续在学校读书的安排，另一份是本地企业的培训合同：有人带你做事，另外还得去职业学校上课。你想先走哪条路？" :
          "有位师傅愿意带你学习，还会付你报酬。你把来回要花的时间写在纸上，和继续读书的安排摆到了一起。";
        base.options[1].label="接受带薪职业培训";
      } else if (region === "saitama" || region === "puebla") {
        base.text=region==="saitama" ? "课程安排已经写下来了。街坊店里也在找一个放学后能来帮忙的人。家里想听你自己说，是把这几年留给学习，还是匀出几个白天的班次分担开支？" :
          "家里把上课和赶车的时间写在一张纸上。附近有人愿意让你在白天课余做些理货的轻活。你可以专心念书，也可以一边念书一边带些工钱回家。";
        base.options[1].label="边读书边做日间兼职";
      }
    }
    if (base?.id === "retireplan" && s.countrySetVersion===2 && ["JPN","DEU","MEX"].includes(s.region)) {
      base.options[0].note="退出全职工作，从明年起按这户人家预计的退休生活收入安排开销。公共养老金的领取条件另计。";
    }
    if (!base || base.id === "friend" || base.id === "self") {
      const regional = root.CountryStories?.localChoice(s,matches,draw);
      if (regional) return regional;
    }
    if (base) return base;
    const pool = (chapter().choiceStories || []).filter(x => x.minAge === s.age &&
      x.maxAge === s.age && matches(s,x));
    if (!pool.length) return storyCard(s);
    const onlyEligible = pool.filter(x => x.requires);
    const candidates = onlyEligible.length && draw(s.seed,65,s.age) % 3 !== 0 ? onlyEligible : pool;
    const story = candidates[draw(s.seed, 66, s.age) % candidates.length];
    return {...story, id:"story-" + story.id, type:story.type || "choice", category:story.category || "personal"};
  }
  function publicCard(c,s) {
    if (!c) return null;
    if (root.IndiaLife?.active(s)) c=root.IndiaLife.adapt(s,c);
    return {id:c.id,title:c.title,text:c.text,type:c.type,category:c.category,...(c.sourceKey ? {sourceKey:c.sourceKey} : {}),
      ...(c.id.startsWith("thread-") && c.tone ? {tone:c.tone} : {}),
      options:c.options.map(({id,label,note,effects,follow,outcome}) =>
        ({id,label,note:regional(s)?moneyText(s,note):note,effects:effects || {},...(follow ? {follow} : {}),...(outcome ? {outcome} : {})}))};
  }
  function originFor(region,birthYear) {
    const world = root.LifeWorld;
    const place = world && world.place(region,birthYear);
    if (place && (place.region === region || place.iso === region)) return place;
    if (!localCities.includes(region)) return null;
    const chinese = region === "chengdu";
    const data = root.LifeText?.cities?.[region];
    return {region, label:data?.label || (chinese ? "成都" : "里昂"),
      name:chinese ? "中国" : "法国",country:chinese ? "中国" : "法国",
      names:data?.names || (chinese ? ["林川","周宁"] : ["Camille","Alex"]),
      lifeExp:null, infantMortality:null, incomeGroup:chinese ? "upperMiddle" : "high"};
  }
  function create(input = {}) {
    input = input || {};
    const seed = Number.isFinite(input.seed) ? Math.trunc(input.seed) >>> 0 : 0;
    const expanded = input.countrySetVersion === 2 || (input.version !== 2 && input.countrySetVersion !== 1);
    const birthMode = input.birthMode === "population" ? "population" : "newborn";
    const admittedYears = root.LifeWorld?.years;
    const birthYear = Number.isInteger(input.birthYear) && (input.birthYear === 2026 ||
      Array.isArray(admittedYears) && admittedYears.includes(input.birthYear)) ? input.birthYear : 2026;
    const sampled = typeof input.region === "string" && originFor(input.region,birthYear) ? input.region :
      root.LifeWorld?.sample(seed,birthMode,birthYear,expanded ? 2 : 1) || localCities[draw(seed,6) % 2];
    const place = originFor(sampled,birthYear) || originFor(localCities[draw(seed,6) % 2],birthYear);
    const region = place.region;
    // 显式家境用于两版账本的可比样本。正常出生按五个家庭收入档分别生成起始预算。
    const familyPreset = input.version === 2 ? input.familyPreset === true : ["steady","tight"].includes(input.family);
    const quintile = familyPreset ? input.family === "tight" ? 1 + draw(seed,155)%2 : 3 + draw(seed,155)%3 :
      1 + draw(seed,154)%5;
    const family = familyPreset ? input.family : quintile <= 2 ? "tight" : "steady";
    const cash = familyPreset ? family === "steady" ? 6000 : 1500 : [0,900,1500,3200,6000,9500][quintile];
    const regionSex = Number.isFinite(place.sexRatio) && place.sexRatio > 0;
    const regionUrban = Number.isFinite(place.urbanPct) && place.urbanPct >= 0 && place.urbanPct <= 100;
    const maleRatio = regionSex ? place.sexRatio : 1;
    const month = 1 + draw(seed,151)%12;
    const sex = draw(seed,152)/4294967296 < maleRatio/(1+maleRatio) ? "male" : "female";
    const residence = draw(seed,153)/4294967296 < (regionUrban ? place.urbanPct/100 : .5) ? "urban" : "rural";
    const birthBasis = {month:"game",quintile:"game",sex:regionSex ? "regional" : "game",residence:regionUrban ? "regional" : "game"};
    const origin = {region,label:place.label,name:place.name || place.label,country:place.country || place.label,
      lifeExp:place.lifeExp ?? null,infantMortality:place.infantMortality ?? null,under5:place.under5 ?? null,
      survive65m:place.survive65m ?? null,survive65f:place.survive65f ?? null,survive60:place.survive60 ?? null,
      sexRatio:place.sexRatio ?? null,
      dataYear:place.dataYear ?? root.LifeWorld?.dataYear ?? null,incomeGroup:place.incomeGroup || null};
    const names = place.names?.length ? place.names : ["小禾","小星","小安"];
    const s = {
      version:2, region, family, seed, name:names[draw(seed,1) % names.length], origin, birthMode,
      birthYear, month,sex,residence,quintile,birthBasis,familyPreset,age:0, stage:stage(0), cash,
      health:72 + draw(seed,2) % 13, happiness:52 + draw(seed,8) % 17,
      knowledge:5 + draw(seed,9) % 6, bond:54 + draw(seed,3) % 14, career:"尚未就业",
      ended:false, log:[], pending:null, decisionAge:16, route:null, report:null, memories:[],
      canRewind:false, ledger:[], decisions:{}, actions:[], focus:"balance", facts:[], promises:[],
      routeCash:null, household:"与家人生活", childCount:0, retired:false,
      partnerStatus:"none",partnerEndAge:null,healthEpisode:null,
      education:{path:"尚未分流",field:null,label:null,years:0},job:null,savings:0,assets:{fundUnits:0},
      housing:"租住或与家人同住",repairsUntil:0,annualAccounts:[],scenes:[],ending:null
    };
    if (expanded) s.countrySetVersion = 2;
    if (input.edition === "regional-2" || (input.version !== 2 && root.LifeFinance)) {
      s.edition = "regional-2";
      s.name = root.LifeWorld?.personalName?.(region,sex,seed,expanded ? 2 : 1) || s.name;
      if (regional(s)) {
        s.cash = root.LifeFinance.cashAtBirth(s);
        s.commute = "standard";
        s.transactions = [];
        s.assets.fundBasis = 0;
        s.assets.homeBasis = 0;
      }
    }
    if (root.CountryStories && input.version !== 2) s.localStoriesFrom = 0;
    else if (Number.isInteger(input.localStoriesFrom)) s.localStoriesFrom = input.localStoriesFrom;
    if (hasLocalHouseholdBudget(s)) {
      if (input.version !== 2) s.householdBudgetFrom = 0;
      else if (Number.isInteger(input.householdBudgetFrom)) s.householdBudgetFrom = input.householdBudgetFrom;
    }
    if (s.edition === "regional-2" && localCities.includes(s.region)) {
      if (input.version !== 2) s.cityArcFrom = 0;
      else if (Number.isInteger(input.cityArcFrom)) s.cityArcFrom = input.cityArcFrom;
    }
    if (input.version !== 2) s.storyFrom = 0;
    else if (Number.isInteger(input.storyFrom)) s.storyFrom = input.storyFrom;
    const setting = root.LifeWorld?.storySetting(s);
    const newBirths = {
      saitama:"你在埼玉县出生。家人练习了几次怎样托住你的头，又把写着你名字的纸翻出来，看着你轻轻念了一遍。",
      nrw:"你在北莱茵-威斯特法伦州出生。窗外雨下了一阵，等在门口的人把湿外套脱下来，空出两只手，才敢接过你。",
      puebla:"你在普埃布拉州出生。家人抱着你挪到窗边，让等了许久的人也看清你的脸。有人笑说，你倒睡得一点都不着急。"
    };
    if (root.IndiaLife && s.region === "IND" && setting) {
      if (input.version !== 2) s.indiaLifeFrom = 0;
      else if (Number.isInteger(input.indiaLifeFrom)) s.indiaLifeFrom = input.indiaLifeFrom;
    }
    const text = (root.IndiaLife?.active(s) && root.IndiaLife.birth(s)) || newBirths[setting?.id] || local(s).birth || "你在" + origin.label + "出生。有人第一次把你抱进怀里，轻轻叫着你的小名。";
    log(s,"来到" + origin.label,text,"birth",true);
    const descriptions = ["","家里预算很紧，需要逐项安排日常开销。","家里常得比较价格，留下一点应急钱。",
      "家里的日常开销有一定余地。","家里有一笔能应付变故的积蓄。","家里有比较充裕的积蓄。"];
    fact(s,"family","出生家庭",descriptions[quintile]);
    storyEvents(s);
    s.scenes = makeScenes(s);
    return s;
  }

  // 先用同岁原创场景，再取地区或跨岁素材。已经写入此前年份的标题不会再次抽到。
  function makeScenes(s) {
    const seen = new Set(s.log.filter(row => row.at != null).map(row => row.title));
    const inAge = item => s.age >= item.minAge && s.age <= item.maxAge;
    const crisis = partnershipCrisis(s);
    const rows = (chapter().yearScenes || []).filter(item => inAge(item) && matches(s,item) && !seen.has(item.title) &&
      !(crisis && (item.requires?.partner === true || item.requires?.household === "together")));
    const cityScene = (local(s).events || []).find(item => item.age === s.age && !seen.has(item.title));
    const selected = [];
    const regional = root.CountryStories?.localScene(s,seen,matches,draw);
    if (cityScene) selected.push(cityScene);
    if (regional) selected.push(regional);
    const localRows = rows.filter(item => item.region);
    if (!selected.length && localRows.length) selected.push(localRows[draw(s.seed,39,s.age) % localRows.length]);
    const eligibleRows = rows.filter(item => item.requires && !selected.some(used => used.title === item.title));
    if (selected.length < 2 && eligibleRows.length) selected.push(eligibleRows[draw(s.seed,38,s.age) % eligibleRows.length]);
    let candidates = rows.filter(item => !selected.some(used => used.title === item.title));
    while (selected.length < 2 && candidates.length) {
      const index = draw(s.seed,40 + selected.length,s.age) % candidates.length;
      const chosen = candidates[index];
      selected.push(chosen);
      candidates = candidates.filter(item => item.title !== chosen.title);
    }
    if (!selected.length) {
      const fallbacks = [
        ["认出你的声音","照顾你的人开口轻唤，你顺着声音转头。"],
        ["第一次站稳","一双手松开了一瞬，你还靠自己的力气站着。"],
        ["摇摇晃晃的脚印","你试着绕过一个小障碍，最后笑得坐在了地上。"],
        ["学会说谢谢","你把刚学会的词小声说出口，对方听见了。"],
        ["自己的小发现","你跑回去讲刚才看到的事，讲到一半又得意地笑了。"]
      ];
      const pair = fallbacks[s.age] || [s.age + "岁的一页","在" + s.origin.label + "，你记下了这一年里一个平常的日子。"];
      selected.push({title:pair[0],text:pair[1]});
    }
    const personal=selected.map((row,i) => ({at:(i ? 65 + draw(s.seed,54,s.age) % 21 : 20 + draw(s.seed,53,s.age) % 21) / 100,
      title:row.title,text:row.text,kind:row.kind || "event",...(row.sourceKey ? {sourceKey:row.sourceKey} : {})}));
    return personal.concat(globalThis.LifeWorld?.worldScenes?.(s)||[]).sort((a,b)=>a.at-b.at);
  }
  function yearScenes(s) {
    return s && !s.ended && s.version === 2 ? s.scenes.map(row => ({...row})) : [];
  }
  function lifespan(s) {
    const p = s.origin;
    const survive65 = s.sex === "male" ? p.survive65m : p.survive65f;
    const adultAnchor = Number.isFinite(survive65) ? [65,survive65,100] : [60,p.survive60,100];
    const limits = [[1,p.infantMortality,1000],[5,p.under5,1000],adultAnchor];
    const ticket = draw(s.seed,89)/4294967296;
    let lastAge = 0, lastP = 0, populationP = 0, totalYears = 0;
    // 缺失的锚点直接跨过。WDI 用分性别65岁存活率，WPP 用当年合计60岁存活率。
    // 1岁和5岁前用线性插值，5岁至成年锚点之间的游戏风险向较大年龄倾斜。
    for (const [endAge,value,unit] of limits) {
      if (!Number.isFinite(value) || value < 0 || value > unit) continue;
      const endP = Math.max(lastP,endAge >= 60 ? 1-value/unit : value/unit);
      const power = endAge >= 60 ? 1/3 : 1;
      if (ticket < endP) {
        const q = (ticket-lastP)/(endP-lastP);
        return lastAge + (endAge-lastAge)*Math.pow(q,power);
      }
      // 来源给出全人口期望寿命。尾段均值用男女混合队列校准，让两性的65岁存活率各自保留。
      let nextPopulationP = endP;
      if (endAge === 65 && Number.isFinite(p.survive65m) && Number.isFinite(p.survive65f)) {
        const ratio = p.sexRatio > 0 ? p.sexRatio : 1;
        nextPopulationP = Math.max(populationP,1-(p.survive65m*ratio+p.survive65f)/(1+ratio)/100);
      }
      totalYears += (nextPopulationP-populationP) * (lastAge + (endAge-lastAge)/(1+power));
      populationP = nextPopulationP;
      lastP = endP;
      lastAge = endAge;
    }
    // 用前面各年龄段已占的寿命期望反推末段均值。无寿命资料时采用游戏均值。
    // 末段用对称三角分布；健康只在该段内小幅调整，保持已知年龄段之间的样本占比。
    const expected = Number.isFinite(p.lifeExp) ? p.lifeExp : 81;
    const mean = Math.max(lastAge+.5,Math.min(100,(expected-totalYears)/(1-populationP)));
    const q = (ticket-lastP)/(1-lastP);
    const centred = q < .5 ? Math.sqrt(2*q)-1 : 1-Math.sqrt(2*(1-q));
    const radius = Math.min(24,mean-lastAge,105-mean);
    const adjustment = s.age >= 45 ? Math.max(-3,Math.min(3,Math.round((s.health-65)/12))) : 0;
    return Math.max(lastAge+.01,Math.min(104.99,mean+centred*radius+adjustment));
  }
  function applyFocus(s) {
    const effects = focusCatalog[s.focus][2];
    apply(s,effects);
    // 童年渐长学识；成年状态随生活起伏。晚年的体力下降也受当年重心影响。
    if (s.age < 16) s.knowledge = limit(s.knowledge + (s.age < 6 ? 1 : 2));
    if (s.age >= 45 && s.age % (s.age < 68 ? 3 : 2) === 0) s.health = limit(s.health - 2);
    if (s.age > 10 && s.age % 3 === 0) {
      const stat = ["happiness","bond","health"][draw(s.seed,60,s.age) % 3];
      s[stat] = limit(s[stat] + (draw(s.seed,61,s.age) % 3 - 1));
    }
  }
  function settleSchool(s) {
    const {cost,wage} = economy(s);
    const work = s.route === "work";
    const income = work ? wage : 0;
    const grant = work ? 0 : schoolGrant(s,cost);
    const paid = Math.min(s.cash+income,cost-grant);
    const aid = cost-paid;
    const previousBalance = s.ledger.length ? s.ledger[s.ledger.length-1].balance : s.routeCash;
    let shopping = previousBalance - s.cash;
    let extraIncome = 0;
    if (regional(s)) {
      const since = s.ledger.at(-1)?.transactionIndex ?? s.routeTransactionIndex;
      const changes = s.transactions.slice(since).filter(t => t.bookedAge == null);
      shopping = changes.reduce((sum,t)=>sum+Math.max(0,-t.cashDelta),0);
      extraIncome = changes.reduce((sum,t)=>sum+Math.max(0,t.cashDelta),0);
    }
    s.cash += income-paid;
    s.ledger.push({age:s.age,income:income+extraIncome,cost:paid + shopping,aid,balance:s.cash,shopping,schoolOrLiving:paid,grant,
      ...(regional(s) ? {extraIncome,transactionIndex:s.transactions.length} : {})});
    const text = (work ? "工资 " + income + "，生活支出 " : "学习支出 ") + paid +
      (aid ? "，助学补足 " + aid : "") + (shopping ? "，期间自选消费 " + shopping : "") +
      (extraIncome ? "，期间另有收入 " + money(s,extraIncome) : "") + "，积蓄剩下 " + s.cash + "。";
    log(s,work ? "这一年的工资与生活" : "这一年的学习费用",text,"finance");
    if (s.age === 19) {
      const city = local(s);
      let opportunity = work ? city.qualified || "同事愿意推荐你带班。你也可以留在一线，跟师傅把手艺练深。" :
        city.graduate || "三年的学习结束，你可以申请技术进修，也可以去应聘项目助理。";
      if (work && s.countrySetVersion===2 && ["JPN","MEX"].includes(s.region)) {
        opportunity="三年的课余白班攒下了一份工作经历。店里愿意让你带新人，也有人愿意介绍你去学一门手艺。";
      }
      s.report = {startCash:s.routeCash,endCash:s.cash,rows:clone(s.ledger),opportunity};
      log(s,"三年以后",opportunity,"report",true);
    }
  }
  function adultFinances(s) {
    const {wage,cost} = economy(s);
    const d = s.decisions;
    let income = wage;
    if (s.retired) income = Math.round(wage * .49);
    else if (s.job?.status === "searching") income = 0;
    else {
      if (s.job) {
        const role = jobs.find(j => j.id === s.job.id);
        s.job.years++;
        const nextRank = Math.min(3,Math.floor(s.job.years/5));
        if (nextRank > s.job.rank && (s.knowledge >= 24 + nextRank*9 || s.job.years >= nextRank*6)) {
          s.job.rank = nextRank;
          const title = s.job.title + " · " + rankTitle[nextRank];
          const text = "凭着这些年做过的事，你升到了新的岗位等级，薪资也随之调整。";
          log(s,title,text,"milestone",true); fact(s,"career",title,text);
        }
        s.job.annualPay = jobPay(s,role,s.job.rank);
        income = s.job.annualPay;
      }
      if (d.opportunity === "lead") income += 520;
      if (d.opportunity === "specialist" && s.age > 20) income += 430;
      if (d.opportunity === "craft" && s.age > 20) income += 260;
      if (d.mobility === "move") income += 320;
      if (d.pace === "lighter") income -= 450;
      if (d.pace === "expert") income += 310;
      if (d.specialty === "people") income += 140;
      if (d.jobrisk === "reduced" && s.age >= 37 && s.age <= 39) income = Math.round(income*.8);
      if (d.retireplan === "part") income = Math.round(income*.62);
    }
    // 学习路线的20岁仍是申请阶段，接下选择后才开始按岗位结算。
    if (s.age === 20 && s.route === "study") income = 0;
    const parts = regional(s) ? root.LifeFinance.budget(s) : null;
    let householdCost = parts ? parts.total : cost + (s.childCount && s.age < 47 ? 350 : 0) - (d.household === "share" ? 150 : 0);
    let medicalCost = 0, missedPay = 0, familyChangeCost = 0;
    const episode = s.healthEpisode;
    if (episode?.status === "active") {
      const leave = episode.plan === "leave";
      missedPay = Math.round(income*(leave ? .24 : .08));
      medicalCost = leave ? 140 : 230;
      income -= missedPay;
      householdCost += medicalCost;
      apply(s,{health:leave ? 2 : 1});
      log(s,"这年的照护账","照护支出 " + medicalCost + "，调整工时后比原定工资少收入 " + missedPay + "。","finance");
      if (s.age === episode.until) {
        episode.status = "recovered";
        const text = "从这段恢复期走出来，你又能按平常的工时安排日子。下一年起，账上也不用再留出这笔照护费用。";
        log(s,"恢复期的最后一次交接",text,"echo",true);
        fact(s,"health","恢复日常安排",text);
      }
    }
    if (s.age >= 35 && s.age <= 37) {
      if (d.partnercrisis === "separate") familyChangeCost = s.childCount ? 320 : 220;
      if (d.partnercrisis === "renegotiate" && s.partnerStatus === "together" && s.age <= 36) familyChangeCost = 90;
      if (familyChangeCost) {
        householdCost += familyChangeCost;
        log(s,"家庭安排的花费","本年因" + (d.partnercrisis === "separate" ? "两处住家" : "重新分担日常") +
          "多支出 " + familyChangeCost + "。","finance");
      }
      if (s.age === 36 && d.partnercrisis === "renegotiate" && s.partnerStatus === "together") {
        apply(s,{bond:3});
        log(s,"不再默契地猜测","现在忙不过来时，你们会先问一句今天哪件事最需要帮忙。","echo",true);
      }
      if (s.age === 37 && d.partnercrisis === "separate") {
        apply(s,{happiness:2});
        log(s,"自己的门钥匙",s.childCount ? "两处住家的日子渐渐有了规律，孩子的日程仍记在你的本子上。" :
          "两处住家的日子渐渐有了规律。你把常用的东西放在了自己最顺手的位置。","echo",true);
      }
    }
    if (s.housing === "自有住房") {
      const repairs = s.age <= s.repairsUntil ? 0 : draw(s.seed,143,s.age) % 5 === 0 ?
        (parts ? root.LifeFinance.houseRepair(s) : Math.round(cost*.70)) : 0;
      if (!parts) householdCost -= Math.round(cost*.27);
      else parts.housing += repairs;
      householdCost += repairs;
      if (repairs) log(s,"修一修家里的旧物","这一年的住房维护另支出 " + repairs + " 记账单位。","finance");
    }
    const available = s.cash + income;
    const openingCash = s.cash;
    const drawFromSavings = Math.min(s.savings,Math.max(0,householdCost-available));
    s.savings -= drawFromSavings;
    s.cash = Math.max(0,available+drawFromSavings-householdCost);
    const shortfall = Math.max(0,householdCost-available-drawFromSavings);
    if (shortfall) {
      apply(s,{happiness:-2});
      log(s,"紧一紧日常支出","预算还差 " + shortfall + "，有些开销只能先缓一缓。","finance");
    }
    if (s.job) s.job.lastIncome = income;
    s.annualAccounts.push({age:s.age,income,cost:householdCost,drawFromSavings,shortfall,balance:s.cash,
      ...(parts ? {openingCash,food:parts.food,housing:parts.housing,transport:parts.transport,
        other:householdCost-parts.food-parts.housing-parts.transport} : {}),
      ...(medicalCost ? {medicalCost,missedPay} : {}),...(familyChangeCost ? {familyChangeCost} : {})});
  }
  function opportunities(s,pick) {
    switch (s.pending.id) {
      case "route":
        s.route = pick; s.routeCash = s.cash; s.canRewind = true;
        if (regional(s)) s.routeTransactionIndex = s.transactions.length;
        s.career = pick === "study" ? "在校学生" : "学徒";
        s.education.path = pick === "study" ? "继续升学" : "在岗学习";
        if (pick==="work" && s.countrySetVersion===2 && ["JPN","MEX"].includes(s.region)) {
          s.career="学生兼职"; s.education.path="在校学习并做日间兼职";
        }
        return pick === "study" ? local(s).education : local(s).job;
      case "opportunity":
        s.career = ({specialist:"技术进修生",office:"项目助理",lead:"带班人员",craft:"手艺学徒"})[pick];
        break;
      case "field":
        s.education.field = pick;
        s.education.label = fields[pick];
        return "你选修了" + fields[pick] + "；此后的对口招聘会参考这段学习经历。";
      case "profession": case "rehire":
        assumeJob(s,pick);
        return "你接受了" + s.job.title + "的岗位。入职游戏年薪为 " + s.job.annualPay + "。";
      case "jobrisk":
        if (pick === "search" && s.job) { s.job.status = "searching"; s.career = "正在求职"; }
        break;
      case "housing":
        if (pick === "settle" && s.housing === "自有住房") { s.cash -= Math.min(400,s.cash); s.repairsUntil = s.age+3; }
        else if (pick === "settle") {
          const transfer = Math.min(1200,s.cash); s.cash -= transfer; s.savings += transfer;
          return "你将 " + transfer + " 从钱包转入安家储蓄。";
        }
        break;
      case "relationship":
        s.partnerStatus = pick === "partner" ? "together" : "none";
        s.partnerEndAge = pick === "partner" ? partnerEndAge(s) : null;
        s.household = pick === "partner" ? "与伴侣生活" : "独立生活";
        break;
      case "partnercrisis":
        if (pick === "separate") {
          s.partnerStatus = "separated";
          s.household = s.childCount ? "伴侣分居，两地共同照料孩子" : "伴侣分居，独自居住";
          return s.childCount ? "你们分开居住，写下了共同照料孩子的安排。" : "你收好自己的东西，开始独自居住。";
        }
        return "你们决定继续同住，把日常要做的事重新分配，也留出定期商量的时间。";
      case "illness":
        s.healthEpisode = {since:s.age,plan:pick,until:s.age+(pick === "leave" ? 2 : 3),status:"active"};
        return pick === "leave" ? "你交出一部分班次，为两年的休养和复诊留出了位置。" :
          "你和同事重新排班，把未来三年的复诊和照护时间提前留好。";
      case "household":
        if (pick === "parent") { s.childCount = 1; s.household = "与伴侣、孩子生活"; }
        else if (pick === "share") s.household = "与朋友合住";
        else if (pick === "alone") s.household = "独自居住";
        break;
      case "retireplan":
        s.retired = pick === "retire";
        s.career = s.retired ? "退休" : "部分工时";
        if (s.job) s.job.status = s.retired ? "retired" : "partTime";
        break;
    }
    return null;
  }
  function chooseInside(s,id) {
    const card = s.pending;
    const selected = card?.options.find(option => option.id === id);
    if (!s.pending || !selected) return false;
    s.actions.push({age:s.age,type:"choose",id});
    const beforeCash = s.cash, beforeSavings = s.savings;
    s.decisions[card.id] = id;
    const thread = card.id.startsWith("thread-") ? {threadKey:card.id,...(card.tone ? {tone:card.tone} : {})} : null;
    const receipt = thread ? storyEffects(s,selected.effects,selected.label,card.id) : "";
    if (!thread) apply(s,selected.effects || {});
    const answer = opportunities(s,id) || selected.outcome || selected.note;
    const outcome = receipt ? answer + receipt : answer;
    if (!thread && regional(s) && s.cash !== beforeCash) {
      const cashDelta = s.cash-beforeCash;
      s.transactions.push({age:s.age,label:selected.label,kind:s.savings!==beforeSavings ? "transfer" : cashDelta<0 ? "expense" : "income",cashDelta});
    }
    log(s,selected.label,outcome,"choice",true,card.sourceKey,thread);
    fact(s,card.category || "personal",selected.label,outcome);
    if (selected.follow) {
      const {after,title,text} = selected.follow;
      s.promises.push({age:s.age+after,title,text,...(card.sourceKey ? {sourceKey:card.sourceKey} : {}),
        ...(thread ? {...thread,threadKey:card.id+"-echo"} : {})});
    }
    s.pending = null;
    return true;
  }
  function focusInside(s,id) {
    if (s.ended || s.focus === id || !focusIds(s.age).includes(id)) return false;
    s.focus = id;
    s.actions.push({age:s.age,type:"focus",id});
    return true;
  }
  function buyInside(s,id) {
    const item = shopOptions(s).find(option => option.id === id && option.enabled);
    if (!item) return false;
    const cashDelta = (item.credit || 0) - item.cost;
    s.cash += cashDelta;
    const good = shop.find(row => row[0] === id);
    if (good) apply(s,good[6]);
    if (id === "deposit") s.savings += item.cost;
    if (id === "withdraw") s.savings -= item.credit;
    if (id === "buyfund") s.assets.fundUnits++;
    if (id === "sellfund") s.assets.fundUnits--;
    if (regional(s)) {
      const trade = ["buyfund","sellfund","buyhome","sellhome"].includes(id);
      const transfer = id === "deposit" || id === "withdraw";
      const travel = id === "shared" || id === "flexible";
      const tx = {age:s.age,label:item.label,kind:trade ? "asset" : transfer ? "transfer" : travel ? "arrangement" : "expense",cashDelta};
      if (id === "buyfund") s.assets.fundBasis += item.cost;
      if (id === "buyhome") s.assets.homeBasis = item.cost;
      if (id === "sellfund" || id === "sellhome") {
        const fund = id === "sellfund";
        const basis = fund ? Math.round(s.assets.fundBasis/(s.assets.fundUnits+1)) : s.assets.homeBasis;
        if (fund) s.assets.fundBasis -= basis;
        else s.assets.homeBasis = 0;
        tx.principal = basis;
        tx.realizedGain = cashDelta-basis;
        tx.fee = (fund ? assetPrice(s) : homePrice(s))-cashDelta;
      }
      if (travel) {
        s.commute = id;
        apply(s,id === "shared" ? {bond:1,happiness:-1} : {happiness:1});
      }
      s.transactions.push(tx);
    }
    if (id === "buyhome" || id === "sellhome") {
      s.housing = id === "buyhome" ? "自有住房" : "租住";
      fact(s,"family",item.label,"你现在的住房安排是" + s.housing + "。");
    }
    s.actions.push({age:s.age,type:"buy",id});
    const travel = regional(s) && (id === "shared" || id === "flexible");
    log(s,item.label,travel ? item.note : (item.credit ? "到账 " + item.credit : "钱包支出 " + item.cost) + " 记账单位。" + item.note,"purchase");
    return true;
  }
  function tick(s) {
    for (const scene of yearScenes(s)) s.log.push({age:s.age,...scene});
    applyFocus(s);
    s.age++;
    s.stage = stage(s.age);
    if (!focusIds(s.age).includes(s.focus)) s.focus = "balance";
    const length = lifespan(s);
    if (s.age >= Math.max(1,Math.floor(length))) {
      s.ended = true;
      s.stage = "告别";
      s.scenes = [];
      s.promises = [];
      const has65 = Number.isFinite(s.sex === "male" ? s.origin.survive65m : s.origin.survive65f);
      const anchor = !has65 && Number.isFinite(s.origin.survive60) ? 60 : 65;
      const band = length < 1 ? "infant" : length < 5 ? "earlyChildhood" : length < anchor ? "before"+anchor : "later";
      s.ending = {band,years:Math.floor(length),months:Math.floor((length%1)*12)};
      let text = band === "infant" ? "这一页停在了生命最初的一年。爱你的人记得第一次拥抱你的时候。" :
        band === "earlyChildhood" ? "这一生还很短，关心你的人把那几年的相处和笑声留在了记忆里。" :
        s.name + "的一生在这里告一段落。留下的记忆里，有过寻常的日子，也有亲手做过的选择。";
      if (s.decisions.partnercrisis === "separate") text += s.childCount ?
        "分开居住以后，你仍记得怎样为孩子留出自己的时间。" : "分开居住的那一年，你重新学会安排自己的日常。";
      if (s.decisions.partnercrisis === "renegotiate") text += "伴侣间那次坐下来谈分工的夜晚，也留在了你的回忆里。";
      if (s.healthEpisode) text += s.healthEpisode.status === "recovered" ?
        "生病后重新回到平常日子的那个早晨，是你一直记得的事。" : "那本重新排过的工作日历，记着你曾怎样给身体留出时间。";
      log(s,"把这一生合上",text,"ending",true);
      return;
    }
    if (s.age === 6) s.career = "在校学生";
    if (s.partnerStatus === "together" && s.age >= s.partnerEndAge) {
      s.partnerStatus = "widowed";
      s.household = s.childCount ? "伴侣离世，与孩子保持联系" : "伴侣离世，独立生活";
      const text = "曾和你共同生活的伴侣离世了。你把一起走过的日子记进这本手记。";
      log(s,"共同生活的人",text,"milestone",true);
      fact(s,"family","伴侣离世",text);
    }
    if (s.partnerStatus === "separated" && (s.age === s.partnerEndAge || s.age === 46 && s.childCount)) {
      s.household = s.childCount ? "分开居住，和孩子保持联系" : "独自居住";
    }
    if (s.education.field && s.age >= 22 && s.age <= (s.decisions.opportunity === "specialist" ? 26 : 24)) s.education.years++;
    if (s.age >= 17 && s.age <= 19) settleSchool(s);
    if (s.age >= 20) adultFinances(s);
    if (s.age === 21 && ["specialist","craft"].includes(s.decisions.opportunity)) {
      s.career = s.decisions.opportunity === "specialist" ? "技术员" : "熟练技工";
      fact(s,"career","开始独立上岗","你现在的职业是" + s.career + "。");
    }
    if (s.age === 70 && s.decisions.retireplan === "part") {
      s.career = "退休"; s.retired = true;
      if (s.job) s.job.status = "retired";
      log(s,"最后一次交班","你放下工作包，结束了这几年的部分工时。","milestone",true);
      fact(s,"career","正式退休","部分工时结束，你决定把接下来的生活交还给自己。");
    }
    for (const echo of s.promises.filter(x => x.age === s.age)) {
      const thread = echo.threadKey ? {threadKey:echo.threadKey,...(echo.tone ? {tone:echo.tone} : {})} : null;
      log(s,echo.title,echo.text,"echo",true,echo.sourceKey,thread);
    }
    s.promises = s.promises.filter(x => x.age > s.age);
    storyEvents(s);
    s.scenes = makeScenes(s);
    s.pending = publicCard(decision(s),s);
    if (s.pending) log(s,s.pending.title,s.pending.text,"decision",false,s.pending.sourceKey);
  }

  function enableRegionalStoriesForNextYear(s) {
    if (root.IndiaLife && s.region === "IND" && s.edition === "regional-2" && !owns(s,"indiaLifeFrom")) {
      s.indiaLifeFrom = s.age + 1;
    }
    if (s.edition === "regional-2" && localCities.includes(s.region) && !owns(s,"cityArcFrom")) {
      s.cityArcFrom = s.age + 1;
    }
  }
  function advance(s) {
    if (s?.version === 1) return legacy.advance(s);
    if (!s || s.version !== 2 || s.ended || s.pending) return s;
    const fresh = clone(s);
    enableRegionalStoriesForNextYear(fresh);
    if (hasLocalHouseholdBudget(fresh) && !owns(fresh,"householdBudgetFrom")) fresh.householdBudgetFrom = fresh.age + 1;
    if (root.CountryStories && !owns(fresh,"localStoriesFrom")) fresh.localStoriesFrom = fresh.age + 1;
    if (!owns(fresh,"storyFrom")) fresh.storyFrom = fresh.age + 1;
    tick(fresh);
    return fresh;
  }
  function next(s) {
    if (s?.version === 1) return legacy.next(s);
    if (!s || s.version !== 2 || s.ended || s.pending) return s;
    const fresh = clone(s);
    enableRegionalStoriesForNextYear(fresh);
    if (hasLocalHouseholdBudget(fresh) && !owns(fresh,"householdBudgetFrom")) fresh.householdBudgetFrom = fresh.age + 1;
    if (root.CountryStories && !owns(fresh,"localStoriesFrom")) fresh.localStoriesFrom = fresh.age + 1;
    if (!owns(fresh,"storyFrom")) fresh.storyFrom = fresh.age + 1;
    do { tick(fresh); } while (!fresh.ended && !fresh.pending && fresh.age !== 19);
    return fresh;
  }
  function choose(s,id) {
    if (s?.version === 1) return legacy.choose(s,id);
    if (!s?.pending || s.version !== 2 || s.ended || !s.pending.options.some(x => x.id === id)) return s;
    const fresh = clone(s);
    return chooseInside(fresh,id) ? fresh : s;
  }
  function setFocus(s,id) {
    if (!s || s.version !== 2 || s.ended || s.focus === id || !focusIds(s.age).includes(id)) return s;
    const fresh = clone(s);
    focusInside(fresh,id);
    return fresh;
  }
  function buy(s,id) {
    if (!shopOptions(s).some(x => x.id === id && x.enabled)) return s;
    const fresh = clone(s);
    buyInside(fresh,id);
    return fresh;
  }
  function rebuild(s,toRoute) {
    const fresh = create(s);
    let i = 0;
    const target = toRoute ? 16 : s.age;
    while (fresh.age <= target) {
      while (i < s.actions.length && s.actions[i].age === fresh.age) {
        const a = s.actions[i++];
        if (toRoute && fresh.age === 16 && a.type === "choose") return fresh;
        if (fresh.ended) return null;
        const fn = a.type === "choose" ? chooseInside : a.type === "focus" ? focusInside : a.type === "buy" ? buyInside : null;
        if (!fn || !fn(fresh,a.id)) return null;
      }
      if (fresh.age === target) return (toRoute || i === s.actions.length) ? fresh : null;
      if (fresh.ended || fresh.pending) return null;
      tick(fresh);
    }
    return null;
  }
  function rewind(s) {
    if (s?.version === 1) return legacy.rewind(s);
    if (!s || s.version !== 2 || !s.canRewind) return s;
    return rebuild(s,true) || s;
  }
  function same(a,b) {
    if (a === b) return true;
    if (!a || !b || typeof a !== "object" || typeof b !== "object" ||
        Array.isArray(a) !== Array.isArray(b)) return false;
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every(k => owns(b,k) && same(a[k],b[k]));
  }
  function valid(s) {
    if (s?.version === 1) return legacy.valid(s);
    if (!s || s.version !== 2 || !Number.isInteger(s.seed) || s.seed < 0 || s.seed > 0xffffffff ||
      !Number.isInteger(s.age) || s.age < 0 || s.age > 105 || !Array.isArray(s.actions) ||
      !["tight","steady"].includes(s.family) || (owns(s,"edition") && s.edition !== "regional-2") || (owns(s,"localStoriesFrom") &&
      (!Number.isInteger(s.localStoriesFrom) || s.localStoriesFrom < 0 || s.localStoriesFrom > 105)) ||
      (owns(s,"storyFrom") && (!Number.isInteger(s.storyFrom) || s.storyFrom < 0 || s.storyFrom > 105)) ||
      (owns(s,"householdBudgetFrom") && (!Number.isInteger(s.householdBudgetFrom) || s.householdBudgetFrom < 0 || s.householdBudgetFrom > 105)) ||
      (owns(s,"indiaLifeFrom") && (!Number.isInteger(s.indiaLifeFrom) || s.indiaLifeFrom < 0 || s.indiaLifeFrom > 105)) ||
      (owns(s,"cityArcFrom") && (!Number.isInteger(s.cityArcFrom) || s.cityArcFrom < 0 || s.cityArcFrom > 105))) return false;
    try {
      if (!originFor(s.region,s.birthYear)) return false;
      const canonical = rebuild(s,false);
      return canonical !== null && same(canonical,s);
    } catch { return false; }
  }
  function finance(s) {
    const active = regional(s);
    const rows = s.annualAccounts || [];
    const school = s.ledger?.at(-1);
    const savings = s.savings || 0, fundUnits = s.assets?.fundUnits || 0;
    const fundPrice = s.version === 2 ? assetPrice(s) : 0;
    const fundValue = fundUnits*fundPrice;
    const homeValue = s.housing === "自有住房" ? homePrice(s) : 0;
    const annual = rows.at(-1);
    const lastYear = school && (!annual || annual.age < school.age) ? {age:school.age,income:school.income,
      cost:(school.schoolOrLiving ?? school.cost)+(school.threadExpense || 0),aid:school.aid,drawFromSavings:0,shortfall:0,balance:school.balance} : annual;
    const currency = root.LifeFinance?.currency(s) || null;
    return {currency,unit:root.LifeFinance?.unit(s) || "记账单位",year:active ? 2021 : null,basis:root.LifeFinance?.basis(s) || "原版游戏记账单位。",
      cash:s.cash,savings,fundUnits,fundPrice,fundValue,homeValue,netWorth:s.cash+savings+fundValue+homeValue,
      familySupport:active && s.age < 17, lastYear:lastYear ? {...lastYear} : null,
      transactions:(s.transactions||[]).map(t=>({...t})), commute:s.commute || null};
  }
  root.Life = Object.freeze({create,advance,next,choose,rewind,valid,yearScenes,focusOptions,setFocus,shopOptions,buy,finance,money,moneyText,
    legacyEconomy});
})(globalThis);
