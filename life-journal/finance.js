/* regional-2. Canonical amounts are whole 2021 household-consumption international dollars.
 * ICP 2021, source 90, time YR2021, classifications PPPGlob and PCAP.PP.
 * Each row: ISO currency, 9100000 household PPP and per-capita consumption; pairs
 * of category PPP and per-capita volume for 1101000 food, 9060000 housing/utilities,
 * 1107000 transport; PPPs for 9080000 health, 9110000 recreation, 9120000 education.
 * Country benchmarks, not city quotations. Same real price basis for every life year.
 */
(() => {
  "use strict";
  const rows = {
    chengdu:["CNY",4.012828,7755.149,7.201129,811.740,2.080435,2900.994,4.569888,670.085,1.978643,4.330307,3.500826],
    lyon:["EUR",.766460,25152.707,.934540,2766.820,.682226,7885.867,1.116004,2111.544,.417773,.874693,.391035],
    EGY:["EGP",4.114450,13589.919,8.570927,2449.019,1.577075,4719.294,6.616291,680.464,1.873552,5.600804,1.463133],
    IND:["INR",19.468950,5213.395,37.016174,847.300,9.931925,1364.546,39.291584,407.934,8.187454,27.150805,10.294384],
    IDN:["IDR",5353.559570,6469.258,10934.542969,1008.459,2480.891602,1569.566,7723.249512,536.880,2931.437256,6340.174805,2270.289307],
    NGA:["NGN",155.723541,3293.042,345.900391,662.117,96.332298,440.816,217.439636,212.288,63.484314,138.312607,79.516953],
    BRA:["BRL",2.449863,10340.648,3.744554,1367.580,1.354392,3300.501,4.140561,777.232,1.783907,3.271005,1.621992],
    PAK:["PKR",42.527672,5425.272,82.715271,986.191,25.202881,2072.753,76.393250,197.162,21.887793,47.613293,17.705059],
    BGD:["BDT",29.214880,5198.328,62.439781,1259.562,12.416494,2027.527,54.095959,119.028,11.008857,37.954159,12.283349]
  };
  const sources = Object.freeze({
    icp:"https://databank.worldbank.org/source/icp-2021/",
    observations:"https://api.worldbank.org/v2/sources/90/country/CHN;FRA;EGY;IND;IDN;NGA;BRA;PAK;BGD/series/9100000;1101000;9060000;1107000;9080000;9110000;9120000/classification/PPPGlob;PCAP.PP/time/YR2021?format=json&per_page=250",
    methods:"https://www.worldbank.org/en/programs/icp/data",
    hours:"https://unstats.un.org/sdgs/metadata/files/Metadata-08-05-01.pdf",
    hourlyData:"https://unstats.un.org/SDGAPI/v1/sdg/Series/Data?seriesCode=SL_EMP_EARN",
    china:"https://www.stats.gov.cn/sj/zxfb/202302/t20230203_1901473.html",
    france:"https://www.insee.fr/fr/statistiques/7672130?sommaire=7656168",
    cpi:"https://data.worldbank.org/indicator/FP.CPI.TOTL"
  });
  // SDG 8.5.1, all occupations, both sexes, age 15+. Bracketed CPI values
  // are World Bank FP.CPI.TOTL for 2021 and for the wage observation year.
  const hourly = {EGY:[17.88,2021,1,1], IDN:[16734.73,2021,1,1], BRA:[14.99,2021,1,1], PAK:[120.56,2021,1,1],
    IND:[77.30,2022,192.378725,205.266241], BGD:[67.78,2022,200.437039,215.864587], NGA:[546.76,2024,354.296242,699.392616]};
  const round = Math.round;
  const entryShare = .82;
  function current(s) {return s?.edition === "regional-2" && Object.hasOwn(rows,s.region);}
  function baseWage(s) {
    const [currency,ppp] = rows[s.region];
    if (currency === "CNY") return 62884/ppp;
    if (currency === "EUR") return 39851/ppp;
    const [rate,,referenceCPI,surveyCPI] = hourly[s.region];
    return rate*referenceCPI/surveyCPI*1920/ppp;
  }
  function budget(s) {
    const [,ppp,volume,foodPPP,foodVolume,housingPPP,housingVolume,travelPPP,travelVolume] = rows[s.region];
    const urban = s.residence === "urban";
    const child = s.childCount && s.age >= 29 && s.age < 47;
    const shared = s.partnerStatus === "together" || s.decisions?.household === "share";
    const foodBase = foodPPP * foodVolume/ppp * .82;
    const housingBase = housingPPP * housingVolume/ppp * (urban ? 1.1 : .85);
    const travelBase = travelPPP * travelVolume/ppp * .70;
    const food = round(foodBase*(child ? 1.32 : 1));
    const housing = round(housingBase*(s.housing === "自有住房" ? .32 : 1)*(shared ? .76 : 1));
    const mobility = s.commute === "shared" ? .67 : s.commute === "flexible" ? 1.19 : 1;
    const transport = round(travelBase*(child ? 1.12 : 1)*(s.retired ? .72 : 1)*mobility);
    const other = round(Math.max(volume*.12,volume*.72-foodBase-housingBase-travelBase)*(child ? 1.16 : 1));
    return {food,housing,transport,other,total:food+housing+transport+other};
  }
  function economy(s) {
    const data = rows[s.region], adult = budget(s), wage = round(baseWage(s)*entryShare);
    const pupil = round(data[2]*.09*data[11]/data[1] + adult.transport*.25);
    const homeShare = round(adult.total*.34);
    return {wage:s.age <= 19 ? round(wage*.53) : wage,study:pupil,homeShare,
      cost:s.age <= 19 ? (s.route === "work" ? homeShare : pupil) : adult.total};
  }
  function cashAtBirth(s) { return round(rows[s.region][2]*[0,.06,.16,.34,.75,1.5][s.quintile]); }
  function goods(s,id) {
    const r = rows[s.region];
    const prices = {supplies:[10,11],outing:[21,7],sport:[36,10],culture:[12,10],course:[190,11],checkup:[70,9]};
    const [units,category] = prices[id];
    return Math.max(1,round(units*r[category]/r[1]));
  }
  function home(s) {
    const r = rows[s.region];
    return round(r[5]*r[6]/r[1]*(s.residence === "urban" ? 1.1 : .85)*20);
  }
  function basis(s) {
    if (!current(s)) return "这份存档沿用原来的游戏记账单位。";
    let wage = "收入参照2021年平均小时报酬，按每年1,920小时建模。";
    if (s.region === "chengdu") wage="收入参照中国城镇私营单位年平均工资。";
    if (s.region === "lyon") wage="收入参照法国私营部门全时当量年平均税前工资。";
    const sample = hourly[s.region];
    if (sample && sample[1] !== 2021) wage="收入参照"+sample[1]+"年平均时薪，按消费物价指数折回2021年，每年按1,920小时建模。";
    return "金额按2021年全国消费购买力折算为本币，适用于整段人生。"+wage+"具体职业、家庭分摊和商品采用模拟金额；住房按当地住房服务支出的约20年建模。";
  }
  const number = new Intl.NumberFormat("zh-CN",{maximumFractionDigits:0});
  const symbols = {CNY:"¥",EUR:"€",INR:"₹",IDR:"Rp",NGN:"₦",BRL:"R$",BDT:"৳"};
  const currencyNames = {CNY:"人民币",EUR:"欧元",EGP:"埃及镑",INR:"印度卢比",IDR:"印尼盾",
    NGN:"尼日利亚奈拉",BRL:"巴西雷亚尔",PKR:"巴基斯坦卢比",BDT:"孟加拉塔卡"};
  function money(s,n) {
    if (!Number.isFinite(n)) return "—";
    if (!current(s)) return number.format(n)+" 记账单位";
    const [iso,ppp] = rows[s.region];
    const amount = number.format(Math.abs(n*ppp));
    const rendered = symbols[iso] ? symbols[iso]+amount : amount+(iso === "EGP" ? " 埃镑" : " 巴基斯坦卢比");
    return n < 0 ? "−"+rendered : rendered;
  }
  // Only replace amounts whose surrounding words explicitly identify money. Ages,
  // years, percentages and stat changes are intentionally left untouched.
  function moneyText(s,text) {
    if (!current(s) || typeof text !== "string") return text;
    const marks = [];
    const protect = value => {marks.push(value);return "\uE000"+String.fromCharCode(0xE020+marks.length-1)+"\uE001";};
    const mark = n => protect(money(s,Number(n)));
    const tagged = text.replace(/[\d,]+ (?:埃镑|巴基斯坦卢比)/g,protect)
      .replace(/(\d+(?:\.\d+)?)\s*(?:游戏)?记账单位/g,(_,n)=>mark(n))
      .replace(/(最多(?:用|花|支付)?|钱包支出|到账|工资|年薪(?:为)?|学习支出|家庭开销|生活支出|照护支出|多支出|少收入|另支出|助学补足|每年至少|自选消费|积蓄剩下|预算还差|将|转入|每年多安排|每年多支出|花费|支出)\s*(\d+)(?![\d%％岁年月天])/g,(_,prefix,n)=>prefix+mark(n));
    return tagged.replace(/\uE000(.)\uE001/g,(_,symbol)=>marks[symbol.charCodeAt(0)-0xE020]);
  }
  const names = new Intl.DisplayNames("zh-CN",{type:"currency"});
  const unavailable = Object.freeze({legacy:true,available:false,code:null,unit:"旧账点",year:null,factor:1,
    basis:"这份旧账缺少可核实的本币折算资料，按原有点数显示。"});

  function displayInfo(s) {
    const region = s?.region;
    if (!region) return unavailable;
    const row = Object.hasOwn(rows,region) ? rows[region] : null;
    if (current(s)) return {code:row[0],unit:currencyNames[row[0]],factor:row[1],year:2021,
      legacy:false,available:true,basis:basis(s)};
    const reference = row ? {code:row[0],perPerson:row[1]*row[2],year:2021} : globalThis.LegacyCurrencyData?.[region];
    if (!(reference?.perPerson > 0)) return unavailable;
    const {code,year,perPerson} = reference;
    const original = globalThis.Life.legacyEconomy(s);
    const consumptionFactor = perPerson/original.cost;
    const wageFactor = row ? baseWage(s)*entryShare*row[1]/original.wage : Infinity;
    const factor = Math.min(consumptionFactor,wageFactor);
    const anchor = wageFactor <= consumptionFactor ? "以当地初入职场的模拟年薪对应旧账的基本年薪" : "以当地人均家庭消费对应旧账的一年基本开销";
    return {code,unit:currencyNames[code] || names.of(code),year,legacy:true,available:true,factor,
      basis:"按"+year+"年价格，"+anchor+"。收入、支出与积蓄按同一比例折算，保留这份旧账的收支关系。"+(reference.note || "")};
  }

  function displayMoney(s,n) {
    if (!Number.isFinite(n)) return "—";
    if (current(s)) return money(s,n);
    const info = displayInfo(s);
    return number.format(n*info.factor)+" "+info.unit;
  }

  // Journal strings are part of the saved replay. Translate them at render time
  // and leave any amount that already carries a local currency untouched.
  const explicitMoney = /(?:R\$|Rp|\p{Sc})\s*[\d,]+(?:\.\d+)?|[\d,]+(?:\.\d+)?\s*(?:埃镑|埃及镑|巴基斯坦卢比|印度卢比|印尼盾|人民币|欧元|尼日利亚奈拉|巴西雷亚尔|孟加拉塔卡|旧账点)/gu;
  const bareMoney = /(最多(?:用|花|支付)?|钱包支出|到账|工资|年薪(?:为)?|学习费用|学习支出|家庭开销|生活支出|照护支出|多支出|少收入|另支出|助学补足|每年至少|自选消费|积蓄剩下|预算还差|转入|每年多安排|每年多支出|花费|支出|年末结余|另有收入|将(?=\s*[\d,]+\s*从钱包))\s*([−-]?[\d,]*\d(?:\.\d+)?)(?![\d,.%％岁年月天份次])/g;
  const amountInText = new RegExp("([−-]?[\\d,]*\\d(?:\\.\\d+)?)\\s*(?:游戏)?记账单位|"+bareMoney.source+"(?:\\s*(?:游戏)?记账单位)?","g");
  function displayText(s,text) {
    if (typeof text !== "string" || !/\d/.test(text)) return text;
    const info = displayInfo(s);
    const localSuffix = info.available && !currencyNames[info.code] ? "|[\\d,]+\\s*"+info.unit.replace(/[.*+?^$(){}|[\]\\]/g,"\\$&") : "";
    const split = text.split(new RegExp("("+explicitMoney.source+localSuffix+")",explicitMoney.flags));
    const format = n => displayMoney(s,Number(n.replace(/,/g,"").replace("−","-")));
    return split.map((part,i) => {
      if (i%2) return part;
      // A single replacement pass prevents an explicitly tagged amount from being
      // converted twice when it also follows a word such as 工资 or 支出.
      return part.replace(amountInText,(_,tagged,prefix,amount) => tagged ? format(tagged) : prefix+format(amount))
        .replace(/游戏年薪/g,"年薪");
    }).join("");
  }

  globalThis.LifeFinance = Object.freeze({current,economy,budget,goods,home,cashAtBirth,baseWage,basis,money,moneyText,sources,
    displayInfo,displayMoney,displayText,
    currency:s=>current(s)?rows[s.region][0]:null,unit:s=>current(s)?currencyNames[rows[s.region][0]]:"记账单位",
    houseRepair:s=>round(rows[s.region][5]*rows[s.region][6]/rows[s.region][1]*.18)});
})();
