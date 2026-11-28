/* 出生抽签使用公开统计的权重。姓名与城市插画属于故事创作。 */
(() => {
  'use strict';
  const names = new Map();
  function assign(codes, pool) {
    const list = pool.split(' / ');
    codes.split(' ').forEach(code=>names.set(code,list));
  }
  assign('GBR IRL USA CAN AUS NZL JAM TTO BHS BRB GRD BLZ ATG VCT LCA CYM BMU GIB IMN CHI','Alex / Jordan / Morgan / Robin / Avery / Jamie / Taylor / Casey');
  assign('FRA BEL CHE CAN MCO LUX MAF NCL PYF','Camille / Noa / Lou / Charlie / Alix / Sacha / Émile / Inès');
  assign('MEX GTM SLV HND NIC CRI PAN CUB DOM VEN COL ECU PER BOL CHL PRY ARG URY ESP PRI GNQ','Luz / Mateo / Mar / Sol / Noa / Camila / Leo / Ari');
  assign('BRA PRT AGO MOZ CPV GNB STP TLS','Rafa / Joana / Lucas / Clara / Lia / Rui / Alex / Inês');
  assign('EGY IRQ SYR JOR LBN PSE YEM SAU ARE OMN QAT KWT BHR MAR DZA TUN LBY SDN MRT','努尔 / 莱拉 / 萨米尔 / 阿米娜 / 奥马尔 / 萨拉 / 亚辛 / 萨尔玛');
  assign('IND','阿南 / 妮莎 / 阿米尔 / 梅拉 / 普里娅 / 拉维 / 基兰 / 安妮塔');
  assign('PAK BGD AFG','努尔 / 阿米尔 / 萨拉 / 伊姆兰 / 阿明 / 玛丽亚姆 / 阿里 / 拉希德');
  assign('IDN','德维 / 阿迪 / 阿尤 / 利娜 / 巴尤 / 普特里 / 里兹基 / 苏里亚');
  assign('NGA','阿德 / 阿米娜 / 奇迪 / 阿达 / 穆萨 / 比西 / 恩戈齐 / 萨尼');
  assign('ETH ERI','塞拉姆 / 达维特 / 玛希 / 哈娜 / 梅隆 / 约纳斯');
  assign('COD COG CMR GAB CIV SEN BEN BFA MLI NER TGO CAF TCD GIN','阿明娜 / 玛丽 / 约瑟夫 / 萨拉 / 保罗 / 法图 / 艾莉 / 穆萨');
  assign('KEN TZA UGA ZMB MWI','阿马尼 / 内玛 / 丹尼尔 / 格蕾丝 / 彼得 / 乔伊 / 法拉哈 / 詹姆斯');
  assign('ZAF NAM ZWE BWA LSO SWZ','莱拉托 / 塔皮瓦 / 萨姆 / 恩科西 / 塔里罗 / 格蕾丝');
  assign('RUS BLR UKR KAZ KGZ','萨莎 / 米沙 / 妮娜 / 阿丽娜 / 韦拉 / 米拉 / 安娜 / 尼基塔');
  assign('DEU AUT LIE','Mika / Leon / Nora / Kim / Toni / Mia / Alex / Jona');
  assign('SWE DNK NOR FIN ISL FRO','Linnea / Emil / Alex / Mika / Liv / Elias / Robin / Ida');
  assign('NLD BEL ABW CUW SXM','Noor / Sam / Robin / Luca / Max / Evi / Isa / Finn');
  assign('ITA SMR','Luca / Giulia / Andrea / Marta / Elia / Sofia / Noemi / Lorenzo');
  assign('JPN','遥 / 葵 / 直人 / 优衣 / 莲 / 美咲 / 凛 / 悠太');
  assign('KOR PRK','智友 / 敏俊 / 书妍 / 佑真 / 瑞允 / 知恩 / 恩宇 / 允书');
  assign('HKG MAC SGP TWN','陈嘉宁 / 林子晴 / 周明远 / 许文心 / 黄晓恩 / 李可昕');
  assign('PHL','安吉尔 / 米格尔 / 丽莎 / 保罗 / 玛雅 / 卡洛 / 安娜 / 加布里埃尔');
  assign('VNM','明 / 兰 / 安 / 芳 / 海 / 玉 / 云 / 灵');
  assign('THA','玛莉 / 阿南 / 素达 / 妮达 / 帕特 / 纳林');
  assign('TUR AZE','德尼兹 / 艾达 / 埃米尔 / 泽伊内普 / 阿里 / 德里娅');
  assign('IRN','萨拉 / 礼萨 / 妮卡 / 阿里 / 玛丽亚姆 / 纳维德');
  assign('ISR','诺阿 / 阿里尔 / 米哈尔 / 丹尼尔 / 雅埃尔 / 奥里');
  assign('POL CZE SVK SVN HRV BIH SRB MKD MNE BGR','米拉 / 安娜 / 马尔科 / 伊万 / 尼娜 / 卢卡');
  assign('GRC CYP','玛丽亚 / 尼科斯 / 安娜 / 亚尼斯 / 埃莱妮 / 阿列克斯');
  assign('CHN','陈知秋 / 周雨禾 / 罗安平 / 何嘉树 / 向小满 / 许星野 / 姜青禾 / 梁予宁');
  assign('FRA','Camille Roy / Charlie Simon / Noa Brun / Lou Morel / Sacha Petit / Alix Laurent / Émile Roux / Inès Martin');
  const storyNicknames = ['小星','小月','小禾','小雨','小芽','小溪','小石','小满'].map(n=>n+'（故事小名）');
  const places = new Map();
  for(const [iso,country,iso2,area,incomeGroup,pop,birthRate,lifeExp,infantMortality,ppp,under5,survive65m,survive65f,urbanPct,sexRatio] of globalThis.DemographicRows || []) {
    const region=iso==='CHN'?'chengdu':iso==='FRA'?'lyon':iso;
    const name=region==='chengdu'?'成都':region==='lyon'?'里昂':country;
    const row=Object.freeze({iso,region,iso2,name,label:name,country,area,incomeGroup,population:pop,birthRate,
      lifeExp,infantMortality,ppp,under5,survive65m,survive65f,urbanPct,sexRatio,names:names.get(iso)||storyNicknames,usingNickname:!names.has(iso),
      image:region==='chengdu'||region==='lyon'?'assets/'+region+'.jpg':null});
    places.set(region,row);if(region!==iso)places.set(iso,row);
  }
  const list=[...new Set(places.values())];
  const original = new Set(["CHN","FRA","EGY","IND","IDN","NGA","BRA","PAK","BGD"]);
  const newSettings = {
    JPN:{id:"saitama",label:"埼玉县"},
    DEU:{id:"nrw",label:"北莱茵-威斯特法伦州"},
    MEX:{id:"puebla",label:"普埃布拉州"}
  };
  const originalList = list.filter(p => original.has(p.iso));
  const playableList = list.filter(p => original.has(p.iso) || Object.hasOwn(newSettings,p.iso));
  const years=Object.keys(globalThis.WorldCohorts||{}).length?Array.from({length:151},(_,i)=>1950+i):[2026];
  const yearCache=new Map();
  let fullHistoryRequest;
  let fullHistoryLoaded=false;
  function needsFullHistory(state) {
    const iso=places.get(state?.region)?.iso;
    return Boolean(iso && !fullHistoryLoaded && state.birthYear!==2026 &&
      years.includes(state.birthYear) && !Object.hasOwn(globalThis.WorldCohorts,iso));
  }
  function loadFullHistory() {
    if (fullHistoryRequest) return fullHistoryRequest;
    fullHistoryRequest=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      const previous=globalThis.WorldCohorts;
      function failed() {
        script.remove();
        fullHistoryRequest=null;
        reject(new Error('出生年代资料未能载入'));
      }
      script.src='./world-cohorts.js';
      script.onload=()=>{
        if (globalThis.WorldCohorts===previous) return failed();
        fullHistoryLoaded=true;
        yearCache.clear();
        resolve();
      };
      script.onerror=failed;
      document.head.append(script);
    });
    return fullHistoryRequest;
  }
  function cohort(year){
    if(!Number.isInteger(year)||year===2026||!years.includes(year))return null;
    if(yearCache.has(year))return yearCache.get(year);
    const indexed=new Map();
    for(const base of list){
      const line=globalThis.WorldCohorts[base.iso]?.[year-1950];
      if(!line||!(line[0]>0)||!(line[1]>0)||!(line[2]>0))continue;
      const [pop,born,lifeExp,imr,under5,sexRatio,q60]=line;
      const row={...base,population:pop,births:born,birthRate:born/pop*1000,lifeExp,infantMortality:imr,under5,
        sexRatio,survive60:q60==null?null:100-q60/10,survive65m:null,survive65f:null,
        urbanPct:null,incomeGroup:'unknown',ppp:null,dataYear:year};
      indexed.set(base.iso,row);indexed.set(base.region,row);
    }
    const data={indexed};yearCache.set(year,data);return data;
  }
  function place(id,year){const epoch=cohort(year);return epoch?epoch.indexed.get(id):places.get(id);}
  function hash(seed, salt) {
    let x=(seed ^ Math.imul(salt,0x9e3779b9))>>>0;
    x=Math.imul(x^(x>>>16),0x7feb352d);
    x=Math.imul(x^(x>>>15),0x846ca68b);
    return (x^(x>>>16))>>>0;
  }
  function sample(seed,mode='newborn',year=2026,countrySetVersion=2) {
    const byPop=mode==='population';
    const epoch=cohort(year);
    const countries=countrySetVersion===1 ? originalList : playableList;
    const pool=epoch ? countries.map(p=>epoch.indexed.get(p.iso)).filter(Boolean) : countries;
    const weight=p=>byPop?p.population:(p.births??p.population*p.birthRate/1000);
    let target=hash(seed,73)/4294967296*pool.reduce((sum,p)=>sum+weight(p),0);
    for(const p of pool){
      target-=weight(p);
      if(target<0)return p.region;
    }
    return pool[pool.length-1].region;
  }
  function storySetting(s){
    if(s.edition!=="regional-2")return null;
    if(s.region==="BGD"&&s.dhakaWorkshop===1)return {id:"dhaka",label:"达卡"};
    if(s.countrySetVersion===2 && Object.hasOwn(newSettings,s.region))return newSettings[s.region];
    if(s.region!=="IND")return null;
    const punjab=hash(s.seed,5801)%2;
    const name=punjab?"旁遮普邦":"泰米尔纳德邦";
    return {id:punjab?"punjab":"tamil",label:s.birthYear<1970?"今"+name+"一带":name};
  }
  const personalNames={
    chengdu:[["陈远","周明川","林望","何嘉树","许宁","方晏"],["周雨禾","杨舒","罗晴","何嘉宁","林秋","方悦"]],
    lyon:[["Louis","Thomas","Hugo","Antoine","Alexandre","Paul"],["Camille","Julie","Manon","Clara","Louise","Inès"]],
    EGY:[["亚辛","奥马尔","卡里姆","优素福","哈立德","阿米尔"],["莱拉","萨尔玛","玛丽娅姆","努尔","迪娜","娜达"]],
    IND:[["阿伦","基兰","拉维","维杰","阿南德","迪帕克"],["米娜","普丽娅","妮莎","迪帕","拉塔","安妮塔"]],
    IDN:[["阿里夫","阿迪","里兹基","巴尤","迪马斯","巴古斯"],["德维","普特丽","阿尤","拉妮","迪安","萨里"]],
    NGA:[["阿德","图恩德","奇迪","埃梅卡","穆萨","优素福"],["阿达","奇奥玛","阿米娜","齐纳布","博拉","托因"]],
    BRA:[["若昂","卢卡斯","佩德罗","拉斐尔","安德烈","加布里埃尔"],["玛丽亚","安娜","卡米拉","朱莉娅","贝娅特丽斯","克拉拉"]],
    PAK:[["阿里","哈姆扎","比拉尔","伊姆兰","阿西夫","萨阿德"],["萨娜","阿伊莎","马哈姆","玛丽娅姆","希娜","伊克拉"]],
    BGD:[["拉菲克","阿尼克","沙基布","哈桑","拉希姆","萨吉布"],["里帕","法尔扎娜","希拉","努斯拉特","萨比娜","塔尼娅"]],
    JPN:[["健一","浩二","诚","直人","修","拓也"],["惠子","直美","由美","绫子","遥","美纪"]],
    DEU:[["Martin","Andreas","Stefan","Daniel","Jonas","Tobias"],["Anna","Kathrin","Lena","Julia","Leonie","Sabine"]],
    MEX:[["Luis","José","Miguel","Javier","Rafael","Daniel"],["María","Elena","Lucía","Carmen","Isabel","Teresa"]]
  };
  function personalName(region,sex,seed,countrySetVersion=2){
    if(countrySetVersion!==2 && Object.hasOwn(newSettings,region))return null;
    const names=personalNames[place(region)?.region];
    if(!names)return null;
    const group=sex==="female"?1:sex==="male"?0:hash(seed,5802)%2;
    return names[group][hash(seed,5803)%names[group].length];
  }
  const milestones=[
    [1969,7,'人类第一次登上月球','1969年7月，阿波罗11号的登月舱抵达月面。地球上第一次有人走在另一颗天体上。'],
    [1980,5,'天花被宣布根除','1980年5月，世界卫生大会正式宣布全球根除天花。'],
    [2000,11,'太空中有了长期住户','2000年11月，国际空间站迎来首批长期驻留的乘组。从此，人类在这座空间站上持续生活。']
  ];
  function worldScenes(s){
    const from=(s.birthYear+s.age)*12+(s.month||1)-1;
    return milestones.flatMap(([y,m,title,text])=>{
      const offset=y*12+m-1-from;
      return offset>=0&&offset<12?[{at:(offset+0.5)/12,kind:'world',title:'世界纪事 · '+title,text}]:[];
    });
  }
  globalThis.LifeWorld=Object.freeze({sample,place,list,playableList,personalName,storySetting,hash,years,worldScenes,needsFullHistory,loadFullHistory,dataYear:2023});
})();

