/* A camera may claim an Indian event only by its identity, lifetime phase and region.
   Common life events are owned by the shared stage. A later consequence has its own shot. */
(() => {
  "use strict";
  const passages = { tamil: new Map(), punjab: new Map() };
  const detail = (room, place, insert) => ({room, place, ...(insert && {insert})});
  function register(region, room, place, titles, insert) {
    for (const title of titles.split("|")) {
      if (passages[region].has(title)) throw Error("Duplicate India shot: "+title);
      passages[region].set(title, detail(room,place,insert));
    }
  }
  const south = (...args) => register("tamil", ...args);
  const north = (...args) => register("punjab", ...args);
  const both = (...args) => { south(...args); north(...args); };

  // Named annual events. A close shot depicts the object at stake without implying a
  // different person's age, home, job or gender. No stems or keyword matching here.
  south("missed-train","站台","末一节车厢过去了");
  north("missed-train","站台","等下一班的人");
  south("pongal-teen","丰收节的院子","锅边溢出的第一口");
  south("pongal-pot","记忆中的米锅","有一年你没回去");
  north("langar","谒师所公共厨房","靠墙的一排先添");
  north("langar-later","谒师所公共厨房","有人认得你的凳子");
  south("clinic-flower","诊所门口","花只能留在外头");
  north("clinic-thread","诊所候诊处","两根线捻不进针眼");
  south("jasmine-detail","茉莉花串","跑进来的香味|卖完得趁早|剪刀没有铃声");
  north("stitch-detail","普尔卡里绣样","布边上的小太阳|绣花也有背面|少数了一根线|针脚偏的那一边");
  south("kolam","门前","给你的那个缺口|没画完的那一笔");
  south("lamps","灯节的门前","灯放在哪一格");
  south("child-stall","童年时的花摊","一小截花也有人要");
  north("child-stall","童年时的布摊","第一次替人留东西");
  south("school","学校午饭时","饭盒多了一层");
  north("school","学校午饭时","两张不一样的圆饼");
  south("eggplants","田头","在田头先拣一回");
  south("market-scale","农户直销市场","秤回到零");
  north("field-delivery","村道","先送布再赶集");
  north("stitch-detail","布摊的绣样","给来晚的人留样");
  both("platform","站台","站台上的两行字");
  south("platform","站台","一截没喊完的站名");
  north("platform","站台","车停下才轮到你");
  south("lunch-detail","旅途中的饭盒","饭盒过了两排");
  north("lunch-detail","旅途中的饭包","包饼的布");
  north("thread-light","绣坊门口","线团躲进阴影里");
  south("dosa","家里的饼铛","最后一个吃饭的人|谁先吃热的");
  north("dough","家里的饼板","最后一张要等谁|烙饼上的小耳朵|手上的面粉");
  south("teach-class","课堂","把点留在黑板上");
  north("teach-class","课堂","慢一点让人看清");
  south("platform","站台","不赶的那班车");
  north("platform","站台","慢车多停了一站");
  south("memory-flower","旧本子旁","花谢了，结还在");
  north("memory-stitch","家里的旧披巾","认出来的是背面");
  south("idli","家里的蒸屉","门口那份早饭|会长高的米浆|少做一把米");
  north("lunch-detail","家里的饼和布巾","盖在布巾下面");
  south("lunch-detail","上学的饭盒","饭盒里的声音");
  north("greens","厨房的芥菜","冬天那锅芥菜");
  north("lunch-detail","带去赴约的午饭","一份午饭的分量");
  both("shared/radio","收音机","两次听到同一个地名|广播里那个熟悉的地名|播音员停顿的地方");
  both("toy-workbench","黄铜碗","碗沿的月牙","reflection");
  north("toy-workbench","黄铜碗","不是裂了一道","brass");
  north("toy-workbench","摊位上的铜碗","摊位上一串敲痕","brass");
  both("shared/post","信件","模糊的第六个数字|地址簿上多出的一格");
  both("toy-workbench","手绘村图","村图上差了一条小路","map");
  both("shared/garden","学校的菜园木牌","一排空的小木牌");
  both("platform","站台","从孟买到塔那|站台的两端");

  // One postcard is used as an insert only when a letter really contains a ticket.
  // Other paper memories use the regional neutral tabletop with the exact prop.
  const follow = {
    "ind-market-apprentice": {
      weave: s => s==="tamil"?detail("jasmine-detail","收到的短花串"):detail("stitch-detail","收到的绣样"),
      sell: () => null // The memory is two friends imitating a voice, away from the stall.
    },
    "ind-radio-game": {map:detail("toy-workbench","展开的旧图","map"),voices:null},
    "ind-rail-visit": {visit:detail("shared/rail-photo","朋友寄来的合影"),direct:detail("shared/post","回信里的车票")},
    "ind-letter-platform": {send:detail("toy-workbench","收到的回信","envelope"),wait:detail("toy-workbench","信封背面","reply")},
    "ind-stall-space": {shade:detail("shared/stool-ring","凳子上的杯印"),goods:detail("shared/crate-mark","摊间的浅痕")},
    "ind-trip-companion": {window:detail("toy-workbench","少年画的弯道","trees"),meal:detail("lunch-detail","再次出门的饭盒")},
    "ind-old-measure": {
      keep:s=>s==="tamil"?detail("basket-home","留在家里的竹篮"):detail("cloth-home","留在家里的旧方布"),
      show:s=>s==="tamil"?detail("jasmine-detail","年轻人在教人用竹篮"):detail("stitch-detail","年轻人在教人用旧布")
    },
    "ind-last-round": {guide:null,draw:detail("toy-workbench","带回来的摊图","map")},
    "ind-morning-batch": {steam:detail("idli","家里的蒸屉"),train:null},
    "ind-meal-turn": {early:detail("dough","盆底的面团"),swap:detail("toy-workbench","旧轮值表","roster")},
    "ind-bowl-loan": {lend:detail("toy-workbench","展览说明背面","reply"),table:detail("toy-workbench","饭桌的铜碗","brass")}
  };
  const cards = {
    "ind-radio-game":[10,"shared/radio","摊后的收音机"],
    "ind-market-apprentice":[14,"teen-wait","少年时的摊位",{sell:"teen-sell"}],
    "ind-morning-batch":[18,"idli","家里的蒸屉",{train:"platform"}],
    "ind-meal-turn":[18,"dough","家里的饼板",{swap:"toy-workbench"}],
    "ind-rail-visit":[27,"platform","站台",{direct:"carriage"}],
    "ind-letter-platform":[32,"platform","等人的站口"],
    "ind-stall-space":[47,"stall-space","摊棚下"],
    "ind-trip-companion":[55,"train-share","车厢",{window:"train-window",meal:"train-meal"}],
    "ind-bowl-loan":[60,"toy-workbench","放碗的桌子"],
    "ind-old-measure":[69,null,"家中的旧物"],
    "ind-last-round":[77,"market-plan","市集",{guide:"market-walk",draw:"toy-workbench"}]
  };
  let index;
  function eligibleAnnual(region,title,age,source){
    if(!index){
      const pack=globalThis.CountryStories?.packs?.get("IND");
      if(!pack)return false;
      index=new Map(pack.scenes.map(row=>[row.title,row]));
    }
    const row=index.get(title);
    return row && row.source===source && (!row.setting||row.setting===region) &&
      age>=row.minAge && age<=row.maxAge;
  }
  function resolve(s, info, region) {
    if (s.region!=="IND") return null;
    const age=info.eventAge??s.age, title=info.eventTitle||"", mode=info.mode;
    const id=(info.cardId||info.originCard||"").replace(/^local-IND-/,"");
    let shot, key;
    if(mode==="cradle"&&age===0){
      const home=s.residence==="rural"?"rural":"urban";
      key="birth/"+home;shot=detail("birth-"+home,home==="rural"?"村里的家":"城里的家");
    }else if(mode==="echo"&&follow[id]){
      const value=follow[id][info.originOption];
      key="echo/"+id+"/"+info.originOption;shot=typeof value==="function"?value(region):value;
    }else if(["choice","response"].includes(mode)&&cards[id]&&cards[id][0]===age){
      const [,room,place,cuts]=cards[id];
      if(id==="ind-morning-batch"&&region!=="tamil"||["ind-meal-turn","ind-bowl-loan"].includes(id)&&region!=="punjab")return null;
      const textile=region==="tamil"?"jasmine-detail":"stitch-detail";
      const actualRoom=id==="ind-old-measure"?textile:room;
      let alternatives=cuts;
      if(id==="ind-market-apprentice")alternatives={...cuts,weave:textile};
      if(id==="ind-old-measure"){
        const prop=region==="tamil"?"basket":"cloth";
        alternatives={keep:prop+"-home",show:prop+"-market"};
      }
      key=mode+"/"+id;shot={room:actualRoom,place,cuts:alternatives,card:id};
    }else if(age===2&&(id==="temper"||mode==="response"&&["先挥挥手","靠在熟悉的人身边看看"].includes(title))){
      const room=mode==="choice"?"door-wait":title==="靠在熟悉的人身边看看"?"door-watch":"door-wave";
      key="child/temper";shot={room,place:"门槛旁",cuts:{wave:"door-wave",watch:"door-watch"}};
    }else if(info.kind==="toy"&&(age===5&&(id==="make"||["一起把轮子装回去","把它改成一艘船"].includes(title))
          ||age===7&&mode==="echo"&&["那只轮子","玩具船的新航线"].includes(title))){
      key="child/toy/"+mode;shot=detail("toy-workbench","木车旁");
    }else if(age===4&&(id==="story-chapter-song"||mode==="response"&&["大声把结尾唱出来","悄悄教给旁边的小孩"].includes(title))
          ||age===5&&mode==="echo"&&["你起的调","错唱的那个字"].includes(title)){
      const quiet=["错唱的那个字","悄悄教给旁边的小孩"].includes(title)||info.originOption==="whisper";
      key="child/song/"+mode;shot={room:mode==="choice"?"song-wait":quiet?"song-teach":"song-lead",place:"家门边",cuts:{loud:"song-lead",whisper:"song-teach"}};
    }else if(mode==="scene"&&info.sourceKey?.startsWith("IND/")&&eligibleAnnual(region,title,age,info.sourceKey.slice(4))){
      key="annual/"+title;shot=passages[region].get(title);
    }
    if(!shot) return null;
    const room=castRoom(region,s.sex,shot.room);
    const cuts=shot.cuts&&Object.fromEntries(Object.entries(shot.cuts).map(([id,name])=>[id,castRoom(region,s.sex,name)]));
    return {...shot,room,cuts,key,asset:asset(region,room)};
  }
  function castRoom(region,sex,room){
    if(sex==="female"&&room==="child-stall")return room+"-girl";
    const youth=["teen-wait","teen-sell","song-wait","song-lead","song-teach"];
    if(region==="tamil"&&sex==="female"&&youth.includes(room))return room+"-girl";
    if(region==="punjab"&&sex==="male"&&youth.includes(room))return room+"-boy";
    if(sex==="female"&&["train-window","train-meal"].includes(room))return room+"-female";
    if(region==="tamil"&&sex==="male"&&["teach-class","market-walk","basket-home","basket-market"].includes(room))return room+"-male";
    if(region==="punjab"&&sex==="female"&&["teach-class","market-walk","cloth-home","cloth-market"].includes(room))return room+"-female";
    return room;
  }
  function asset(region,room){return "india-life/"+(room.startsWith("shared/")?room.replace("/","-"):region+"-"+room);}
  globalThis.IndiaDirection=Object.freeze({resolve,asset});
})();
