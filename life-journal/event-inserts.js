/* Film inserts show a physical object in this event. An unillustrated moment is
   typeset in the life journal; its age or category never supplies a cast. */
(() => {
  "use strict";
  const objects=[
    ["letter",/信封|回信|家书|信纸|明信片|一封信|那封信|这封信|写信|寄信|来信|寄来的信/],
    ["mending",/补丁|针脚|针线|缝补|针孔|缝衣|衣服.{0,5}缝/],
    ["keys",/钥匙(?:串|孔|齿)?/],
    ["schoolbook",/练习本|作业本|习题册|课本|错题本|笔记本|练习册/],
    ["clinic",/听诊器|听诊|医生.{0,6}(?:检查|出诊|问诊)|(?:门诊|诊室|复诊).{0,5}(?:医生|检查)/],
    ["rail",/火车票|铁路车票|站台边|月台边|站台.{0,8}(?:车厢|铁轨|列车)|铁轨/],
    ["accounts",/账本|账簿|记账本|收支账|家庭账册|账页/],
    ["tools",/扳手|螺母|螺帽/],
    ["packing",/行李袋|旅行包|旅行袋|收拾行李|打开行李|打包行李/],
    ["photos",/相片背面|照片背面|照片的背面|照片翻过来|翻过照片|一叠旧照/],
    ["window",/窗灯|窗前的灯|窗边的灯|窗台.{0,6}(?:灯|烛)|窗口.{0,4}灯光/]
  ];
  const directory="event-inserts/";
  function subject(text){
    for(const sentence of String(text||"").split(/[。！？；，]/u)){
      for(const [key,pattern] of objects){
        const match=sentence.match(pattern);
        if(match&&!/(?:没有|没带|并无|找不到|丢失的|丢了|忘带|忘拿|不用|不必|没去|不去|没能|取消|如果|要是|从未|从来没)[^，。]{0,9}$/u.test(sentence.slice(0,match.index)))return key;
      }
    }
    return null;
  }
  const localObjects={
    BRA:["cordel",/绳线小册|木刻小册|诗册|绳挂文学|科尔德尔/],
    IDN:["batik",/蜡染布|蜡染花布|蜡染图案|蜡染花样/],
    NGA:["adire",/adire|靛染布|靛蓝布|蓝染布|靛蓝披巾|防染布/i],
    BGD:["loom",/织机|织布机|木梭|织布梭/]
  };
  const illustrations=[
    ["boat",/纸船|玩具船|木船|折船/],["wheel",/木轮|玩具车|掉下的轮子/],
    ["ball",/布球|足球|皮球|球门/],["letter",/信笺|邮票/],
    ["pencil",/铅笔|笔尖|画笔/],["book",/书本|图册|书页|课本/],
    ["bell",/风铃|铃铛|门铃/],["bird",/一只小鸟|一只鸟|纸鸟/],
    ["bowl",/饭碗|空碗|瓷碗|一只碗/],["bag",/布袋|帆布包|背包|书包/],
    ["ticket",/车票|票根/],["cloth",/布巾|方巾|碎布|桌布/],
    ["chair",/椅子|木椅|空椅|藤椅/],["clock",/挂钟|闹钟|钟面/],
    ["lamp",/一盏灯|灯芯|油灯/],["leaf",/落叶|叶片|一片叶|一片树叶/],
    ["coin",/零钱|硬币|铜钱/],["tool",/钳子|扳手/]
  ];
  const moments=new Map([
    ["先缝袋子上的扣子","pouch"],["一粒扣子，两种用法","pouch"],
    ["装针的那块布","buttons"],["衣襟上的旧扣子","buttons"],
    ["打一个能解开的结","wrapped-bowl"],["碗底藏着什么","wrapped-bowl"],["把东西稳稳送到","wrapped-bowl"],
    ["桌角那道补了又补的口子","tablecloth"],["换块桌布，还是再缝一次","tablecloth"],
    ["多摆了两只碗","supper"],["有人接上了下一句","rain"],
    ["一小瓶贴了签的汁","apple-bottle"]
  ]);
  const localCards={
    "story-chapter-child-night":"bedtime","story-chapter-child-school":"school-return",
    "story-chapter-teen-freedom":"teen-outing",
    "local-FRA-ly-last-basket":"lyon-baskets","local-EGY-irrigation-notes":"canal",
    "local-IDN-idn-rain-record":"rain-gauge","local-BRA-bra-pack-list":"vegetable-crates",
    "local-BRA-bra-batch":"bean-pot","local-MEX-crooked-flower":"tile",
    "local-JPN-tea-parcel":"teapack","local-JPN-paper-last-sheet":"paper",
    "local-DEU-de-press":"press","local-JPN-canal-notes":"canal-japan",
    "local-DEU-de-reunion":"photo-negative","local-JPN-workshop-lunch":"sewing-machine",
    "local-BRA-bra-share-verse":"cordel","local-IDN-idn-batik-cloth":"batik",
    "local-NGA-nga-indigo-wrapper":"adire","local-BGD-bd-loom-delay":"loom"
  };
  const results=new Map([
    ["单留一筐，和邻居慢慢尝","apple-basket"],["一起倒进去，赶上这一轮分装","apple-mix"],
    ["陪孩子把这个故事接完","bedtime-tell"],["把开头记下，约好明晚来接","bedtime-note"],
    ["陪孩子整理好经过，自己去说","school-explain"],["同孩子一起去听双方说完","school-listen"],
    ["一起画清途中的折返点","teen-route"],["约一个碰面的地点和时辰","teen-meet"]
  ]);
  // A present-day object in a verified frame still needs to fit its event year.
  const earliest={"frame-014":1960,"frame-017":1980,"frame-021":1970,"frame-077":2016,
    "frame-080":1980,"frame-097":1975,"frame-101":1980,"frame-104":1970,"frame-109":1980,
    "frame-114":1980,"frame-134":1970,"frame-149":1980,"frame-159":2013,"frame-164":1990,
    "frame-168":2008,"frame-175":1990};
  function resolve(info,active,s={}){
    if(info.items?.some(i=>i.id==="__ledger"))return "accounts";
    if(info.mode==="farewell"||info.items?.some(i=>i.id==="__note"))return "journal";
    if(info.mode==="response"&&results.has(info.eventTitle))return results.get(info.eventTitle);
    const chosen=active&&info.items?.find(i=>i.id===active&&!i.id.startsWith("__"));
    const words=[chosen?.fullLabel||chosen?.label,info.eventTitle,info.detail].filter(Boolean);
    if(info.mode==="choice"&&Object.hasOwn(localCards,info.cardId))return localCards[info.cardId];
    const frame=globalThis.LifeStoryFrames?.get(info);
    if(frame==="frame-172"&&s.sex!=="female")return "buttons";
    if(frame&&(!earliest[frame]||s.birthYear+(info.eventAge??s.age)>=earliest[frame]))return "story-frames/"+frame;
    const exact=moments.get(info.eventTitle);
    if(exact)return exact;
    const local=localObjects[s.region];
    if(local&&words.some(text=>local[1].test(text)))return local[0];
    // A branch can name a different object from the initial dilemma.
    for(const wordsHere of words){const key=subject(wordsHere);if(key)return key;}
    for(const wordsHere of words){const found=illustrations.find(([,re])=>re.test(wordsHere));if(found)return "study-"+found[0];}
    return "journal";
  }
  function draw(info,s,art,t,v,active,key){
    const illustration=key.startsWith("study-"),path=key.includes("/")?key:directory+(illustration?"journal":key);
    const {ctx,backdrop,canPaint}=art;
    const item=info.items?.find(i=>i.id===active),acting=Boolean(item&&!item.id.startsWith("__"));
    const index=acting?info.items.indexOf(item):0;
    const direction=index%2?1:-1;
    const age=info.eventAge??s.age;
    const zoom=1+.075*v,drift=(info.reducedMotion||info.paused)?0:Math.sin(t*.3)*.6;
    backdrop(path,direction*v*10+drift,zoom);
    if(!canPaint(path))return;
    if(key==="story-frames/frame-039"){
      const oldYear=Number.isInteger(s.birthYear)&&Number.isFinite(age)?s.birthYear+Math.min(23,Math.max(0,age-1)):null;
      const inscription=oldYear?oldYear+"·05·12":"05·12";
      ctx.save();ctx.translate((600-600*zoom)/2+direction*v*10+drift,(300-300*zoom)/2);
      ctx.scale(zoom,zoom);ctx.translate(264,91);ctx.rotate(-.14);
      ctx.font='bold 18px "Journal Pixel", monospace';
      ctx.fillStyle="#d09965";ctx.fillText(inscription,0,1);
      ctx.fillStyle="#543027";ctx.fillText(inscription,0,0);ctx.restore();
      return;
    }
    if(key!=="journal"&&!illustration)return;
    const title=acting?(item.fullLabel||item.label):info.eventTitle||info.caption;
    const content=(title||"").trim();
    if(!content)return;
    ctx.save();
    ctx.translate(0,-2*v);ctx.rotate(-.012);
    ctx.textAlign="center";
    ctx.fillStyle="#82583b";
    const center=illustration?392:300;
    if(illustration)art.prop(key.slice(6),173,180,116,v*.025*direction);
    ctx.font='14px "Journal Pixel", "Microsoft YaHei", sans-serif';
    if(Number.isFinite(age))ctx.fillText(age+" 岁",center,75);
    const letters=Array.from(content),lines=[];
    ctx.font='bold 20px "Journal Pixel", "Microsoft YaHei", sans-serif';
    let row="";
    for(const c of letters){
      if(row&&ctx.measureText(row+c).width>(illustration?210:354)){lines.push(row);row="";}
      row+=c;
    }
    if(row)lines.push(row);
    ctx.fillStyle="#493347";
    lines.forEach((line,i)=>ctx.fillText(line,center,109+i*25));
    ctx.restore();
  }
  globalThis.EventInserts=Object.freeze({resolve,draw});
})();
