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
