/* 两个虚构家庭。资料界定当地物件、生活场所与适用年代，人物及选择属于故事。 */
(() => {
  "use strict";
  const south=s=>LifeWorld.storySetting(s)?.id==="tamil";
  const rural=s=>s.residence==="rural";
  const friend=s=>south(s)?"卡拉":"古尔普里特";
  const active=(s,age=s?.age)=>s?.region==="IND"&&s.edition==="regional-2"&&Number.isInteger(s.indiaLifeFrom)&&age>=s.indiaLifeFrom;
  const made=(s,card)=>s.decisions?.["local-IND-"+card];
  const sources=[
    ["ind-jasmine","印度旅游部 · 马杜赖的茉莉与花市","https://www.incredibleindia.gov.in/en/tamil-nadu/madurai"],
    ["ind-phulkari","印度旅游部 · 旁遮普的普尔卡里刺绣","https://www.incredibleindia.gov.in/en/punjab/phulkari"],
    ["ind-kolam","印度旅游部 · 泰米尔纳德邦的门前地画与灯节","https://www.incredibleindia.gov.in/en/festivals-and-events/karthigai-deepam"],
    ["ind-farm-market","泰米尔纳德邦农业市场部门 · 农户直销市场及开设年份","https://www.agrimark.tn.gov.in/index.php/Infra/us_details"],
    ["ind-punjab-market","印度旅游部 · 卢迪亚纳市集与当地工艺","https://www.incredibleindia.gov.in/en/punjab/ludhiana"],
    ["ind-boarding","印度铁路金奈分局 · 站台、车门与上下车","https://sr.indianrailways.gov.in/cris/uploads/files/1731922077518-No.PUB-MAS-2022-02-03.pdf"],
    ["ind-pongal","印度旅游部 · 泰米尔纳德邦收获节溢锅的习俗","https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/destinations/coimbatore/pongal-festival.html"],
    ["ind-langar","锡克教谒师所管理委员会 · 阿姆利则的公共厨房","https://new.sgpc.net/around-harmandir-sahib/"],
    ["ind-handicrafts","印度纺织部手工艺发展专员办公室 · 手工艺与从业者","https://indian.handicrafts.gov.in/en"]
  ].map(([id,label,url])=>({id,label,url}));

  function birth(s) {
    const place=LifeWorld.storySetting(s).label;
    if(south(s))return "你出生在"+place+"。"+(rural(s)?"村道边有人卸下清早摘的茉莉。":"楼下卖花的人用泰米尔语喊了一声。")+"家里把你抱到门边。隔壁原本来送一小串茉莉，看你睡着，把花轻轻挂在门钩上就走了。";
    return "你出生在"+place+"。"+(rural(s)?"院门外，去赶集的脚步刚过去。":"街口的铁卷门一扇接一扇升起来。")+"旁边有人用旁遮普语应了一声，把搭在膝上的绣布挪开，好让抱你的人坐下吃完那张热饼。";
  }
  const stageByTitle=new Map(),scenes=[];
  function moments(setting,rows){
    for(const [minAge,maxAge,art,source,title,text,extra] of rows){
      scenes.push({minAge,maxAge,setting,source,title,text,indiaLife:true,...extra});
      stageByTitle.set(title,art);
    }
  }
  moments("tamil",[
    [23,24,"platform","ind-boarding","末一节车厢过去了","你们下楼梯时车已经动了。一个乘客追着车厢想攀上去，旁边有人喊他停，他在站台上收住了脚。卡拉也正要跑，听见你说下一班一起坐，终于把篮子放下来。你们误了花市最忙的一阵，半天谁也没催谁。"],
    [15,16,"home","ind-pongal","锅边溢出的第一口","邻居在丰收节煮米。你看见米汤快溢出来，伸手就想把锅挪走。卡拉笑着挡住你的手，把你喊进大家的欢呼声里。你后来记得的是她那句，等它自己满出来。"],
    [45,49,"clinic","ind-jasmine","花只能留在外头","陪邻居去诊所复查，你在街口买了短短一截茉莉。她今天闻不得浓香。你把花留在外边，空着手陪她坐了一上午。后来她记得的，是你替她占住了门边那个凉快的位置。"],
    [78,80,"home","ind-pongal","有一年你没回去","又逢丰收节，年轻人要你讲一回等米汤溢出来的事。你想起有一年人在外头，托人说下次一定回来。那年守在锅边、最爱回头找你的那个人，后来再没有和你一起等过那一下。"],
    [1,2,"home","ind-jasmine","跑进来的香味","隔壁把茉莉花串挂在门钩上。你还不会说花的名字，听见竹篮擦过门框就把头扭过去。"],
    [3,4,"lane","ind-kolam","给你的那个缺口","邻居蹲在门前画科拉姆地纹。你一脚踩掉一个白点。她没补上，反而让你从缺口走进去，又从缺口走回来。"],
    [5,6,"stall","ind-jasmine","一小截花也有人要","一个叫卡拉的孩子把落在摊布上的花捧给你。摊主刚剪短一段花串，原来是下工的人只想买一小截，回去还赶得上给人戴。"],
    [7,8,"school","ind-tamil-table","饭盒多了一层","课间打开饭盒，下层除了柠檬饭，还藏着一只小盒。邻座把自己的小盒也推过来，你们各尝一口，才认出家里放的酸味不一样。"],
    [9,10,"lane","ind-kolam","灯放在哪一格","灯节傍晚，街坊在门前的花纹上摆陶灯。你看邻居把最亮的一盏移到边上。她说，那格在窗前，从床上也看得着。"],
    [11,13,"stall","ind-jasmine","卖完得趁早","卡拉叫你摸摸篮底。花蕾已经暖了，上面却还挂着露。临近中午，摊主把剩下的分成短串，有人用只够买一小串的钱也能挑一份。"],
    [16,19,"field","ind-farm-market","在田头先拣一回","跟邻人进城赶直销市场前，你在地头替一筐茄子拣掉软烂的。摊上有人嫌一只长歪，大叔把它带回去烧晚饭，说好菜差点被相貌耽误。",{requires:{residence:"rural"},fromYear:1999,toYear:2026}],
    [16,19,"stall","ind-farm-market","秤回到零","在农户直销市场，你见菜农把空盘托起来，给你看秤针回到零。后来人多，排在后面的人也踮起脚，要看清称给自己的那一份。",{requires:{residence:"urban"},fromYear:1999,toYear:2026}],
    [20,23,"platform","ind-boarding","一截没喊完的站名","你跟亲友在站台上等车停稳。身边一位长辈把站名按泰米尔语慢慢读给孩子听；孩子刚学会头两个音，一列慢车进来，把后半句淹掉了。"],
    [25,29,"carriage","ind-tamil-table","饭盒过了两排","车厢里，有人把一个扣得太紧的饭盒传给旁人帮忙。盖子一松，酸角饭的香气散了出来。那人递回去时多问了一句，做饭的人也坐在这节车里吗？"],
    [34,38,"stall","ind-jasmine","剪刀没有铃声","隔着花摊，你听得出剪刀换了人。以前那位每剪一串，手指总顺便敲一下篮沿。你等了好一会儿，才问起那个声音。"],
    [40,43,"home","ind-tamil-table","最后一个吃饭的人","多萨薄饼得趁热。你照例伸手接盘子，才看见摊饼的人手边连杯水都没剩。那天你站到锅前，给对方做的一张破了好几个洞。"],
    [51,54,"school","ind-kolam","把点留在黑板上","你受邀给附近的孩子画家门口的科拉姆。擦到一半，后排有人要你把那些起笔的小点留下。原来孩子想回家自己接完那些线。"],
    [61,65,"platform","ind-rail","不赶的那班车","你提早到站，茶杯还烫手，一班车已经走了。这次你慢慢把茶喝完。年轻时你总怕错过，今天怕的是没听完身边那个人刚开头的话。"],
    [72,76,"later","ind-jasmine","花谢了，结还在","一串干茉莉被夹在旧本子里。花瓣一碰就落，你本想掸掉，一个年轻人却问，这个结为什么每绕一下就换方向？你忽然又舍不得了。"],
    [81,90,"lane","ind-kolam","没画完的那一笔","傍晚在门边坐着，你看见孩子学人画地纹，故意给自己的脚留个缺口。你没让他补。你记得有人也这样让过你一回。"]
  ]);
  moments("punjab",[
    [23,24,"platform","ind-boarding","等下一班的人","车门边的人刚挤进去，列车就动了。一个年轻人追着想攀上车，最后停在了站台上。古尔普里特看着你们那包急着送的绣货，你说，这回迟到由我去讲。两个人又坐回茶摊旁，等下一班。"],
    [15,16,"home","ind-langar","靠墙的一排先添","古尔普里特带你去谒师所的公共厨房帮忙。你提着盛扁豆的桶，不知先给谁添。坐在前排的人指了指靠墙的那排，那里有位客人够不到勺子。你头一次知道，坐在一起吃还得有人走得到跟前。"],
    [45,49,"clinic","ind-phulkari","两根线捻不进针眼","陪熟人到诊所等看眼睛。她带着一截红线，想比给人看从前一遍就穿得过的针。你把手放回膝上，等她自己试完。后来她说，那天最舒服的一刻，就是你没急着替她穿。"],
    [78,80,"home","ind-langar","有人认得你的凳子","再到谒师所的公共厨房，你拎不起原来那样一桶豆子了。有人把凳子搬到碗堆边，请你坐着帮忙递。第一只接过去的手已经长满了皱纹，你却忍不住想，那是不是当年指给你靠墙那一排的手。"],
    [1,2,"home","ind-phulkari","布边上的小太阳","一条普尔卡里绣巾搭在椅背。照料你的人把针线盒挪远，任你盯着那块黄线绣成的小菱形。有人走过带起风，你的眼睛也跟着走。"],
    [3,4,"lane","ind-phulkari","绣花也有背面","邻居把绣布翻过去，正面齐齐的一排小花忽然成了长短不一的线。你摸了很久，又悄悄翻回去，怕花再也长不出来。"],
    [5,6,"stall","ind-punjab-market","第一次替人留东西","一个叫古尔普里特的孩子和你守着布摊。熟客去买菜，把挑中的绣巾放在你膝上。人家回来时，你的腿已经麻了，那条巾一寸也没滑下去。"],
    [7,8,"school","ind-punjab-table","两张不一样的圆饼","你与邻座打开饭包，都带了烙饼和豆子。你的饼边有一块深褐的焦斑。邻座说家里人总怕把饼烙焦，你却先把那一块掰给他尝。"],
    [9,10,"home","ind-metal","不是裂了一道","詹迪亚拉古鲁来的铜碗发出轻轻一响，你以为自己摔坏了。大人把碗口转到亮处，指给你看顺着碗壁一圈圈留下的锤印。"],
    [11,13,"stall","ind-phulkari","少数了一根线","古尔普里特把摊上的绣片递给你看。两朵看着一样的小花，一朵却总偏向左边。数到第三回才明白，前头有一针少跨了一根底布线。"],
    [16,19,"field","ind-punjab-market","先送布再赶集","你陪邻居把收好的绣片带去镇上。经过田边，两人把长布往里卷了又卷；怕路上沾灰，等到了摊前没人肯细看。",{requires:{residence:"rural"}}],
    [16,19,"stall","ind-punjab-market","给来晚的人留样","城里布摊摆得挨肩。挨着菜摊的那块绣巾一早卖掉了，摊主在本子上描了个角。你以为要补货，其实她是答应给下晚班的人留一个花样。",{requires:{residence:"urban"}}],
    [20,23,"platform","ind-boarding","车停下才轮到你","亲友在站名牌下等你，旁遮普语的站名正好露在肩头上方。车停稳，先让下车的人走完。等你踏上车厢台阶，再回头，那只挥着的手还在原处。"],
    [25,29,"carriage","ind-punjab-table","包饼的布","旅途中你揭开布包吃烙饼。邻座发现你一直捏着布角，怕它落地，替你把空饭盒挪了过来。下车时你帮忙把架上的另一包东西递下，两人才互问名字。"],
    [34,38,"work","ind-phulkari","线团躲进阴影里","替人把绣片送回作坊，你看见做活的人把两团近似的红线拿到门外比。屋里看着是一个颜色，天光下一团偏金，一团偏紫。你陪着站了许久。"],
    [40,43,"home","ind-punjab-table","最后一张要等谁","炉上又鼓起一张饼，等饭的人却临时被叫去帮忙。你把饼放回布里，等到它软下来，才听见门外有人问，怎么还给我留着？"],
    [51,54,"school","ind-phulkari","慢一点让人看清","你把一片绣样带给学校里的孩子。前排都要看正面，后排只想知道线从哪儿进去。你把布举到窗边，两边的人终于能同时看清了。"],
    [61,65,"platform","ind-rail","慢车多停了一站","在站上等家人，隔壁桌的茶添过两回。列车迟来的这半个下午，你同茶摊的人聊起早年市集上的铺子，发现你们认识同一个爱赊茶的老人。"],
    [72,76,"later","ind-phulkari","认出来的是背面","旧披巾的颜色早退浅了，年轻人看不出是谁绣的。你叫他把布翻过来，那人习惯绕远一点收线。你自己也没料到，手指还记得。"],
    [81,90,"lane","ind-phulkari","针脚偏的那一边","晒好的布收回门里，邻家孩子坚持把一朵偏了的小花露在外面。他说整条披巾只有这儿能认出是自己做的。你朝他点点头。"]
  ]);

  const artForCard={
    temper:"lane",make:"home",interest:"school",childhood:"stall",club:"school",training:"work",route:"school",
    "story-chapter-song":"lane","story-chapter-tower":"home","story-chapter-box":"home",
    "local-IND-ind-radio-game":"home","local-IND-ind-rail-visit":"platform","local-IND-ind-bowl-loan":"home",
    "local-IND-ind-morning-batch":"stall","local-IND-ind-meal-turn":"home"
  };
  const cards=[];
  const opt=(id,label,note,effects,after,title,text)=>({id,label,note,effects,follow:{after,title,text}});
  function arc(age,id,art,source,build){
    const full="local-IND-"+id;
    artForCard[full]=art;
    // 工具也读取静态选项索引；运行时再按实际出生邦和已做的选择生成该户的版本。
    const northern={region:"IND",edition:"regional-2",seed:0,decisions:{}};
    const def=build(northern);
    cards.push({age,id,indiaLife:true,source,...def,resolve:build});
  }
  arc(14,"ind-market-apprentice","stall","ind-handicrafts",s=>{
    const f=friend(s),t=south(s);
    return {title:t?"这一篮茉莉赶得上吗":"绣片差最后一排",text:(rural(s)?"你搭早班车到镇上，":"放学绕过街角，")+f+
      (t?"正在替花摊穿茉莉。天气一热，花开得快，放到明天就卖不出这个模样了。有人催着要一串，还有两个人已经掏出了零钱。":"正替布摊理一块普尔卡里绣片。少了一排针脚，买主却在催价。一个人算摊上的钱，就腾不出手把布翻过来。"),
      options:[
        opt("weave",t?"坐下来，帮忙串这一篮茉莉":"翻过绣布，一起数那排针脚","让搭档出去招呼客人，你把手里的活做完。",{knowledge:3,bond:1},3,t?"线结朝里的一串":"藏不住的第一针",t?"你收到一串短茉莉，摸到里面特意藏起来的小结。卡拉说上回你串得太松，她回家一路都能顺着花找到路，两个人笑了半天。":"有人送来一小片普尔卡里绣样。你把布翻过来，上回补的第一针还是歪的。古尔普里特说，正靠它才认得出是哪天做的。"),
        opt("sell","替搭档守摊，把价钱喊清","你敢开口吆喝，也得记住谁已经付过。",{bond:3,happiness:2},2,"一句少收了半截的吆喝",f+"在人群里故意学你头回喊价的腔调，最后一个音总是短一截。你开口反驳，发现自己现在还这么喊。")
      ]};
  });
  arc(32,"ind-letter-platform","platform","ind-rail",s=>{
    const f=friend(s),visited=made(s,"ind-rail-visit"),line=visited==="visit"?"上回换车，你多留了半天。":visited==="direct"?"上回你没下车，那封信却一直留着。":"你和老相识约在车站见一面。";
    return {title:"信送到了，人还没到",text:line+f+"这回托你带一封信，收信人还在赶来的路上。车已经进站，同路人愿意代你把信留下。你还有一趟约好的车。",
      options:[opt("send","把信托给同路人，搭原班车","车上还有约在等你。信到了，你也许听不到那人的回答。",{knowledge:2,happiness:1},1,"回信里的站名","回信写到了你的名字。原来同路人照着信封找了两遍，最后是站外的茶摊老板认出那个人。信送到了，你却有点想知道对方第一眼的表情。"),
        opt("wait","留在站口，等亲手交信","约好接你的人得再等一班，你想听收信人自己念。",{bond:3,happiness:-1},2,"信封里多的一张纸","后来收信人把信封带回来。背后多了几行字，是那天从站口慢慢走回去，在路边歇脚时才想出的话。")]};
  });
  arc(47,"ind-stall-space","stall","ind-handicrafts",s=>{
    const f=friend(s),choice=made(s,"ind-market-apprentice"),material=south(s)?"串花的竹篮":"包绣件的布卷";
    const start=choice==="weave"?"你认得"+material+"，先看货怕不怕晒。":choice==="sell"?"一声喊价，你认出了多年前同你一起守摊的腔调。":"你在熟悉的市集碰到"+f+"。";
    return {title:"棚檐下只剩一块阴凉",text:start+"棚影越来越短。一位等人来接的老熟客站不住了，邻摊又急着把一箱货推过来。你去问"+f+"怎样挪这半步地方。",
      options:[opt("shade","给老人留张凳，货先放回去","老人可以坐着等；你得跟邻摊解释这半步。",{bond:3,health:-1},2,"凳子上的杯印","摊上那张凳多了个淡淡的茶杯印。后来累了的人问这里能不能坐，摊主就拍拍那个印子，叫他坐下再挑。"),
        opt("goods","把自己的货往里收，通出条道","老人先靠着棚柱，你和邻摊都少摆一层货。",{knowledge:3,bond:1},1,"铺地上那道浅痕","下次赶集，摊位之间果然空出一条窄道。地上还留着第一箱货推过去的浅痕，你看见有人从那儿送一位老人回家。")]};
  });
  arc(55,"ind-trip-companion","carriage","ind-rail",s=>({title:"靠窗的位置，还是这一盒饭",text:(rural(s)?"天没亮先搭车到镇站，":"在城站等车的人渐渐多了，")+"你和邻居等车停稳才踏上车厢台阶。一路没顾上说话的人终于歇下来。对座一个少年朝窗外张望。你也想看那一段熟路，手边还有"+(south(s)?"一盒酸角饭。":"几张用布包好的烙饼。"),
    options:[opt("window","让他坐窗边，到了弯道叫我","你把最熟悉的一段路指给一个头一回来的人。",{happiness:2,bond:2},1,"认错的那片树","后来少年拿来一张沿途的画。树画错了一种，你还是一眼认出了那个弯。画的边角多了一只指向窗外的手。"),
      opt("meal","挪开饭盒，请他和大家分一口","窗边留给自己，也给坐过道的人腾出手来。",{bond:3,knowledge:1},2,"开饭前先松开盒扣","又一次长途搭车，有人递来一盒已经松开扣子的饭。你问他怎么知道你手上使不上劲。对方说，上回你把盒子传给别人之前，也是这么做的。")]}));
  arc(69,"ind-old-measure","later","ind-handicrafts",s=>{
    const item=south(s)?"串花用的旧竹篮":"从前包绣件的旧方布";
    return {title:"这件东西还要用",text:friend(s)+"家在整理摊上的老东西，送给你"+item+"。有个刚学着摆摊的年轻人过来问，能不能请你带过去演一回。"+(made(s,"ind-stall-space")==="shade"?"他说，现在那张留给人坐的凳子还有人照看。":made(s,"ind-stall-space")==="goods"?"他说，进货的人现在还走两摊之间那条路。":"他只听说你以前帮过摊上的忙。"),
      options:[opt("keep","留在家里，继续拿它装东西","明天还能照旧拿来用；那孩子要再等一个下午。",{happiness:3},2,"放回老地方","孩子再过来，看见旧物里装着还没用完的东西。他这回没有问它值多少钱，只问用了这么久，怎样才能少磨坏一点。"),
        opt("show","带去市集，让他亲手试一次","你愿意把心爱的东西交给一双还不熟练的手。",{bond:3,knowledge:1},2,"他记得手要放在哪里","你去摊上，年轻人正在教别人。他先说错了一处，随即用手演对了。你本想纠正那句话，看见对方已经学会，终于忍住。")]};
  });
  arc(77,"ind-last-round","stall","ind-handicrafts",s=>({title:"下回由谁认摊",text:"要接手跑腿的孩子把熟客的名字一一念出来。"+(south(s)?"早市卖花的人却常常只记得谁要一小串、谁要整篮。":"卖绣货的人却常常只记得谁爱摸布的背面，谁专挑那种暗红的线。")+"你走不了从前那么快，但还想把这些人的位置交给他。",
    options:[opt("guide","按自己的步子，陪他走一回","今天也许走不完整条街。",{bond:3,health:-1},1,"在歇脚处等齐","后来孩子带别人认摊，也走一段就停。有人问他是不是累了，他说，怕同来的人没有机会问。"),
      opt("draw","坐在家里，把熟客的位置画给他","你能画完整条街，看不到他头一次到底叫错谁。",{knowledge:3,happiness:1},1,"位置会动，名字也会","他把图带回来，划掉了一格，又添了一个挨得很近的小圈。那位客人现在常和另一个人一起出门。你的老图头一回有了别人的笔迹。")]}));

  CountryStories.revise("IND",{sources,scenes,choices:cards});

  function adapt(s,c){
    const t=south(s),f=friend(s);
    const overrides={
      temper:t?["门边的茉莉香","来串门的人把茉莉花篮放在门槛外，蹲下用泰米尔语叫你。你认得花香，还不认得这张脸。"]:
        ["门边那一片绣花","抱着一叠绣布的邻居在门槛外蹲下来，用旁遮普语叫你。你认得披巾上的亮线，还不认得这张脸。"],
      make:t?["滚到花篮边的轮子","木车的轮子滚到了邻居的茉莉花篮下。车身翻过来像小船，家人把轮子和一张折帆的纸放到你面前。"]:
        ["布卷下的木轮子","木车翻了，轮子滚进一卷待送的绣布底下。你从布边捡回来，发现剩下的车身倒很像条船。"],
      interest:["放学时别跑过了头","校门外有孩子拿旧木板当球棒。一颗球直奔"+(t?"卖茉莉的小篮子":"卖绣巾的摊布")+"而去。你可以跑过去补那个空位，也可以坐在旁边，把动作画下来。"],
      childhood:t?["星期六还剩最后一篮","家人答应给隔壁的花摊搭把手。你也想自己沿街看看，哪里的茉莉最早开，哪里的摊已经收了。"]:
        ["星期六的半截绣样","家人要带绣样到市集上比一比颜色。你也想独自转一圈，看看那些看起来差不多的布到底差在哪里。"],
      route:["校门口分开的两条路","家人翻到写着学费和车钱的那一页。"+(rural(s)?"去镇上念书得赶头班车。":"念书要从城里换一趟车。")+"附近也有师傅愿意带带你。你听着"+(t?"泰米尔语":"旁遮普语")+"的叫卖声，第一次想，要是早上不从这里经过，还会不会记得每个摊主的声音。"],
      "story-chapter-tower":t?["花篮旁的两座塔","隔壁串茉莉的桌边，你和另一个孩子拿木块垒塔。最后一块落在花篮底下，两座塔都差它才到桌沿。"]:
        ["两座塔共用一块木头","布摊后面，你们把木块摞成小塔。用来压绣布角的最后一块也腾出来了，只够给一边封顶。"],
      "story-chapter-song":t?["留半句给你唱","门边的花串一条条剪下来。有人用泰米尔语哼着收摊时爱唱的短歌，到了最后几个音偏不往下唱。旁边的小孩不知道下一句，只好盯着你的嘴。"]:
        ["没唱完的一句旁遮普语","有人叠好披巾，唱到自家收摊常哼的那句旁遮普语歌，把末尾留了出来。旁边的小孩才学会前半句，正等你给他开个头。"],
      "local-IND-ind-radio-game":["新闻结束前的一张纸",t?"摊后的收音机播着泰米尔语新闻。卡拉爱把播音员最后一个音拖得格外长。你却听出了两个相邻的地名，想赶在下一条消息前把它们连起来。":"布摊旁的收音机在播旁遮普语新闻。古尔普里特模仿起报站名的口气像模像样，你却想记下这个名字究竟在阿姆利则哪一边。包装纸的背面只有一小块空白。"],
      "local-IND-ind-rail-visit":["月台上约在茶摊见",(made(s,"ind-market-apprentice")?f+"从别处托人带来口信。":"一个老相识托人带来口信。")+
        (rural(s)?"从村里到镇站还要算上一截路。":"最方便的一班车能从城站直达。")+"若多换一趟车，你能在站外茶摊坐半天。对方只说，赶得上就来。"]
    };
    if(!overrides[c.id])return c;
    const [title,text]=overrides[c.id];return {...c,title,text};
  }
  function stage(s,view,ctx){
    const id=view.cardId||view.originCard;
    const info={...view};
    const named=stageByTitle.get(view.eventTitle);
    if(named||artForCard[id])info.indiaScene=named||artForCard[id];
    if(view.sourceKey==="IND/ind-handicrafts")info.sourceKey=south(s)?"IND/ind-jasmine":"IND/ind-phulkari";
    if(view.mode==="cradle"||(ctx.event?.kind==="birth"&&view.eventAge===0)){
      info.mode="cradle";info.kind="cradle";
      const opening=south(s)?"家人用泰米尔语轻声说话，小床边的纸鸟和铃轻轻晃着。":"家人用旁遮普语轻声说话，小床边的纸鸟和铃轻轻晃着。";
      const activity={__bird:"家人让床边的纸鸟晃了一下，等它轻轻摆回来。",__bell:"家人轻晃床边的小铃，等最后一点铃声停下来。"};
      info.caption=activity[ctx.action]||opening;
      if(view.mode==="cradle")info.detail=info.caption;
      info.items=view.items.map(item=>activity[item.id]?{...item,label:item.id==="__bird"?"晃晃纸鸟":"听听小铃",detail:activity[item.id]}:item);
    }
    if(view.mode==="choice"&&s.pending && artForCard[id]){
      // 首句留给演员进场；动作按钮继续走存档中的原 ID。
      const lines={
        temper:south(s)?"门外有茉莉香。卖花的人蹲下来，等你认出她。":"邻居放下绣布，用旁遮普语轻轻叫你。",
        make:south(s)?"小木轮滚到了茉莉花篮下面。":"轮子从绣布底下找回来了。剩下的木车像一条船。",
        interest:"球朝街摊滚了过去，孩子们等你补个空位。",childhood:s.pending.title,
        route:"学费和车钱摊在桌上。你要把接下来的日子放在哪里？",
        "local-IND-ind-radio-game":south(s)?"泰米尔语新闻快结束了，卡拉已经学起播音员的腔调。":"旁遮普语新闻快结束了，你听出了阿姆利则的名字。",
        "local-IND-ind-rail-visit":"多换一趟车，就能坐下来喝那杯茶。"
      };
      info.caption=lines[id]||s.pending.title;
      const short={
        "local-IND-ind-market-apprentice":{weave:south(s)?"帮串茉莉":"帮数针脚",sell:"守摊喊价"},
        "local-IND-ind-letter-platform":{send:"托人捎信",wait:"留下交信"},
        "local-IND-ind-stall-space":{shade:"留凳歇脚",goods:"挪货让路"},
        "local-IND-ind-trip-companion":{window:"让出窗座",meal:"分一盒饭"},
        "local-IND-ind-old-measure":{keep:south(s)?"留下竹篮":"留下方布",show:"带去试用"},
        "local-IND-ind-last-round":{guide:"陪走一回",draw:"画张摊图"}
      }[id];
      if(short)info.items=view.items.map(item=>({...item,label:short[item.id]||item.label}));
    }
    return info;
  }
  globalThis.IndiaLife=Object.freeze({active,birth,adapt,stage});
})();
