/* 舞台只读取故事与日志。选择、账目和延期兑现仍由 Life 处理。 */
(function installStageStories(root) {
  "use strict";
  const kinds = ["cradle","doorstep","toy","school","work","table","street","home","health","memory","farewell","kitchen"];
  const motifs = ["bird","bell","hand","chair","ball","wheel","boat","book","pencil","bag","bowl","key","ticket","clock","tool","leaf","letter","cloth","lamp","coin"];
  const catalog = new Map();
  // 选项 ID 对应当前实物。没有把握的动作以手势、原动作文字表达。
  function entry(id,kind,caption,actions = {}) { catalog.set(id,{kind,caption,actions}); }
  function country(iso, rows) {
    for(const [id,kind,caption,actions] of rows)entry("local-"+iso+"-"+id,kind,caption,actions);
  }
  country("CHN",[
    ["cd-stall","kitchen","面摊还没收完，巷口的同学也在等你。",{bowls:["bowl","帮老板收碗"],walk:["hand","陪同学走一段"]}],
    ["cd-noodle-shift","kitchen","水已经开了。春梅的面，什么时候下锅？",{}],
    ["cd-cooks-seat","kitchen","一折戏开了腔，掌勺的人还背对着台口。",{stove:["bowl","接过看火的活"],table:["chair","去席上商量菜单"]}],
    ["cd-second-voice","table","台上的声音停了半句，身边有人接了上去。",{listen:["chair","请帮腔的人坐近些"],join:["hand","跟着试唱一句"]}]
  ]);
  country("FRA",[
    ["ly-observe","school","跟近处的店主做一天，还是换一趟车去看看？",{shop:["book","跟铺子做一天"],commute:["ticket","试一次换乘"]}],
    ["ly-first-shift","work","佩拉什站旁，伊内丝的第一次交接还没走顺。",{}],
    ["ly-last-basket","street","两篮菜挨得不远，送到门口却有几层楼。",{carry:["bag","送完这两篮菜"],divide:["hand","重排交菜的地点"]}],
    ["ly-window-answer","home","索恩河两边的窗灯，今晚怎样互相招呼？",{up:["chair","上楼陪她看灯"],across:["lamp","到对岸用灯回应"]}]
  ]);
  country("EGY",[
    ["puppet-front-row","toy","小戏台前只剩一个好位置。",{answer:["hand","站前面接一句"],watch:["chair","让位，到侧面看"]}],
    ["secondary-path","school","九年级快结束了，两个下午怎么用？",{ "exam-prep":["book","留下复习"],"technical-visit":["ticket","去技术中学看看"]}],
    ["two-notebooks","work","纸上的步骤，能把手里做的事讲明白吗？",{try:["tool","一起重做一回"],describe:["pencil","把差别写清楚"]}],
    ["training-or-care","work","短课和复诊碰在一起，下班后往哪边走？",{attend:["book","换班去上短课"],accompany:["hand","照约陪人复诊"]}],
    ["irrigation-notes","work","一条渠，要听渠尾的人讲，也要算泵站的账。",{field:["hand","去听渠尾的人讲"],figures:["coin","核对泵站开支"]}],
    ["canal-song","memory","散场了，还来得及多问一句。",{tune:["hand","请他再哼末句"],frame:["tool","听他讲琴的木架"]}],
    ["egy-turn-to-save","table","两家各有急用，这个月轮谁领钱？",{swap:["clock","同他换一个月"],keep:["coin","照原来的顺序领"]}]
  ]);
  country("IND",[
    ["ind-radio-game","home","广播快结束了，纸上记个地名，还是先记声音？",{map:["pencil","把地名连成地图"],voices:["hand","轮流学播音"]}],
    ["ind-rail-visit","street","多换一趟车，能把一封信换成见一面。",{visit:["ticket","换车去见面"],direct:["letter","按原计划走，写信"]}],
    ["ind-bowl-loan","table","柜门一开，那只黄铜碗该去哪儿？",{lend:["bowl","借碗，写清来历"],table:["chair","请人来饭桌边看"]}],
    ["ind-morning-batch","kitchen","蒸屉还在火上，你的车也快到了。",{steam:["bowl","留下来看火"],train:["ticket","按点赶车，再回来"]}],
    ["ind-meal-turn","kitchen","有人要和面，有人要擀。哪种轮法合适？",{early:["bowl","先回来和面"],swap:["clock","隔一天各包一顿"]}]
  ]);
  country("BRA",[
    ["bra-share-verse","school","诗册只能借一个下午。你想怎样记住这一节？",{copy:["pencil","抄下喜欢的一节"],read:["book","拉朋友轮流念"]}],
    ["bra-pack-list","work","一边在核对菜箱，一边有人头一回跟车。",{count:["pencil","留下核交货单"],ride:["wheel","上车帮忙认路"]}],
    ["bra-circle-role","street","唱和的圈子要开始了，入口还有人头一回来。",{chorus:["hand","排练应答的唱段"],welcome:["chair","守在入口迎人"]}],
    ["bra-batch","kitchen","这一锅豆子，给晚班留，还是趁热一桌人吃？",{portions:["bowl","先装赶工的便当"],invite:["chair","约大家今天来吃"]}]
  ]);
  country("IDN",[
    ["idn-angklung-rehearsal","school","竹筒等着下一个音，旁边的人还没找到拍子。",{"play-part":["hand","守住自己的音"],"practice-entry":["hand","陪他单练进拍"]}],
    ["idn-rain-record","work","你离开雨量筒以后，谁来接着记？",{"train-pair":["hand","教会两个轮班的人"],"make-example":["pencil","留张填好的样表"]}],
    ["idn-batik-cloth","home","一块花布，两个人都想留下一点。",{"divide-cloth":["bag","把好布做成两只袋"],"keep-pattern":["cloth","补好整幅花样"]}],
    ["idn-port-company","street","她要坐这趟船，哪一段路由你来陪？",{sail:["boat","换班陪她上船"],meet:["hand","送到港口，约人来接"]}]
  ]);
  country("NGA",[
    ["nga-ayo-afternoon","table","木棋盘还摆着，时间只够再下一局。",{"face-expert":["hand","请熟手讲一局"],"teach-newcomer":["chair","把棋盘让给孩子"]}],
    ["nga-film-kitchen","kitchen","借来的厨房只剩半天，最后录什么？",{"record-dialogue":["hand","留给两位演员"],"record-kitchen":["bowl","留下厨房的声音"]}],
    ["nga-indigo-wrapper","memory","蓝布留下来，那些只有老友会念的字呢？",{"write-caption":["pencil","记下读法和来历"],"gather-readers":["cloth","请晚辈听本人念"]}],
    ["nga-processing-turn","work","加工机只停一天，两家的东西怎样运过去？",{lend:["wheel","让出小车，另雇车"],share:["bag","分开袋子，合用一车"]}]
  ]);
  country("PAK",[
    ["pk-evening-hour","school","一个下午不够分开用，复习和接人怎样安排？",{lesson:["book","留下复习，托人接"],pickup:["hand","自己接人，借笔记"]}],
    ["pk-remittance-plan","home","窗总卡住。眼前这笔钱，是修窗还是留作周转？",{repair:["tool","先把窗修好"],reserve:["coin","留钱周转，另约时间"]}],
    ["pk-water-shift","street","这一轮用水碰上进城，谁留下来说定时间？",{town:["ticket","接下来回的路程"],record:["pencil","记下两家的约定"]}],
    ["pk-training-ride","street","最后那两个拐弯，是陪着走，还是画给人看？",{walk:["hand","陪人走到窗口"],draw:["pencil","画清两个拐弯"]}]
  ]);
  country("BGD",[
    ["bd-school-return","school","重新坐回教室，先补自己的题，还是先对课本？",{catchup:["pencil","先问积下的题"],pair:["book","和伙伴对缺页"]}],
    ["bd-language-page","school","同一样东西有两种叫法，怎么放进这一页？",{words:["book","给两种叫法留位置"],drawing:["pencil","画意思，请伙伴念"]}],
    ["bd-loom-delay","work","布还在织机上，约好见面的日子快到了。",{simplify:["hand","商量简化最后一段"],wait:["cloth","等织完，先借一块"]}],
    ["bd-study-point","street","雨退了，书和复课的消息还没到齐。",{books:["book","逐户把书和信送到"],call:["letter","先托人带信，再核对"]}]
  ]);
  country("JPN",[
    ["kite-tail","toy","一张好纸，够一条大纸鱼，也够两只小风筝。",{one:["hand","扎一条鱼，一起放"],two:["pencil","裁成两只来比一回"]}],
    ["omiya-goodbye","street","大宫站的车快到了，两封信还在朋友手里。",{deliver:["letter","代为送信"],words:["hand","陪朋友练开场白"]}],
    ["canal-notes","street","水渠有老名字，也有纸上没画清的岔口。",{names:["pencil","照音记下绰号"],walk:["hand","走一趟，画清岔口"]}],
    ["workshop-lunch","memory","放大人脸，门边的缝纫机就要裁掉了。",{room:["tool","保留门口的机位"],faces:["pencil","放大人脸，记名字"]}],
    ["tea-parcel","home","入间的茶包好了，带茶的人却改了行程。",{send:["letter","附上家书寄过去"],visit:["bag","等能亲自带去"]}],
    ["paper-last-sheet","table","最后一张细川纸，写上名字还是留给人摸摸？",{ink:["pencil","让孩子写上名字"],sample:["hand","留作纸样，另找纸练"]}]
  ]);
  country("DEU",[
    ["de-short-game","toy","场边还有人在等，怎么让大家都踢得到球？",{short:["clock","轮换上场，缩短每局"],wide:["ball","扩大两队，一起踢"]}],
    ["de-training","work","只够再问一个问题。想再看一次，还是带图回去？",{watch:["tool","留下看熟手做"],sketch:["pencil","补完草图问老师"]}],
    ["de-reunion","memory","一个钟头，够挑几张底片，也够好好聊会儿。",{light:["hand","对光挑底片"],talk:["chair","放下纸袋听近况"]}],
    ["de-press","kitchen","榨汁前还来得及挑出几个，留到慢慢尝。",{separate:["bag","单留一筐尝味"],mix:["bowl","一起榨汁分装"]}],
    ["de-lamp","memory","旧照片背面差一个姓。你能认准吗？",{pencil:["pencil","先写姓，打问号"],blank:["hand","先空着，约人再问"]}],
    ["de-voice","memory","这一句旧说法，声音和意思你各记得多少？",{sound:["hand","照记得的声音念"],meaning:["pencil","写下大意和场景"]}]
  ]);
  country("MEX",[
    ["paper-cover","school","这张纸够包一本书，也够保护几本书的角。",{"cover-one":["book","包一整张封皮"],"corner-pieces":["hand","裁书角，让孩子包"]}],
    ["market-relief","work","车快开了，摊主也站了好久。你接哪一头？",{"mind-stall":["chair","守摊，让摊主歇会儿"],"carry-crates":["wheel","跟司机一起装箱"]}],
    ["turns-at-home","home","排照护的日子，也要听听本人想怎样过。",{"a-fixed-day":["clock","约一个固定下午"],"choose-the-tasks":["hand","分开差事，请本人挑"]}],
    ["crooked-flower","work","那道歪花边在样砖上，搬走还是在这里照着画？",{"lend-sample":["hand","借出样砖，约好送回"],"draw-at-bench":["pencil","留在作坊一起临摹"]}],
    ["two-ways-home","street","教别人认这趟路，陪着走一遍还是画出岔口？",{"ride-along":["ticket","一起走，请亲友认路"],"draw-crossing":["pencil","画出易错的岔口"]}]
  ]);

  entry("temper","doorstep","有人蹲了下来，把手停在你碰得到的地方。",{wave:["hand","朝对方挥挥手"],watch:["chair","靠在熟悉的人身边"]});
  entry("make","toy","轮子从玩具上掉了下来。还可以怎么玩？",{repair:["wheel","把轮子装回去"],story:["boat","把车身改成小船"]});
  entry("interest","toy","有人在空地上跑，也有人坐在旁边画。",{team:["hand","加入跑动的队伍"],sketch:["pencil","坐下来画"]});
  entry("childhood","doorstep","一个空闲的下午，你跟谁走？",{family:["bag","陪家人出门"],explore:["hand","自己去附近看看"]});
  entry("friend","doorstep","游戏散了，还有一个孩子站着。",{invite:["hand","邀请一起走"],listen:["chair","留步听对方说"]});
  entry("training","school","有半天能去看别人怎样工作，也有一册资料可以借。",{workshop:["tool","去现场看看"],reading:["book","借资料来读"]});
  entry("route","table","家里的账摊在桌上，未来三年的时间怎么用？");
  entry("field","school","挑一门你愿意花时间学熟的本领。");
  entry("specialty","work","有人等着联络，有一门手艺值得慢慢学。");
  entry("relationship","home","谈到以后，两个人想要怎样的生活？");
  entry("home","home","亲近的人要搬家了。以后，怎么彼此照应？");
  entry("mobility","work","新工作收入高一些，来回也远一些。");
  entry("partnercrisis","home","两个人都放下手里的活，谈今后要怎样住。");
  entry("jobrisk","work","订单少了。留在这里，还是去敲另一扇门？");
  entry("check","health","疲倦反复回来，你想怎样腾出一点时间？");
  entry("housing","home","把住处和手里的钱放在一起，重新算一遍。");
  entry("illness","health","原先排好的工时，要给复诊和休息挪个位置。");
  entry("care","home","亲友需要照应，有哪些事可以一起分担？");
  entry("mentor","work","新人打开笔记本，请你讲讲第一天怎么做。");
  entry("savings","table","眼下有了一点余地，留给急用还是挂念的人？");
  entry("pace","work","往后怎样工作，能给身体留些力气？");
  entry("retireplan","work","告别全职工作，可以一步走，也可以慢些走。");
  entry("retirement","street","星期三空了下来，你想把下午留给什么？");
  entry("story","memory","有人坐下来，愿意听你讲以前的日子。");
  entry("support","home","哪些熟悉的东西，再挪近一点会更好？");
  entry("keepsake","memory","那只旧盒子又打开了一回。");
  entry("thread-home-afternoon","home","门外有人在等，屋里还有一段故事没听完。");
  entry("thread-friend-farewell","memory","另一个记得朋友的人，也在这里坐下了。");
  entry("thread-chance-order","table","桌布裂了。是订一块，还是把两块旧布拼起来？");
  entry("thread-chance-pay","work","别人也在等这笔工钱，今天要不要一起去问？");
  entry("thread-chance-table","table","锅边少个帮手，新来的邻居也还站着。");
  entry("thread-chance-song","doorstep","雨又下起来，那段歌你还记得几个音？");

  // 城市续篇的 ID 跨路线稳定，画面和动作却取决于实际解析出的选项。
  function localVariant(c) {
    const first=c.options?.[0]?.label || "";
    if(c.id==="local-CHN-cd-noodle-shift"){
      if(first.includes("热面端过去"))return {kind:"table",caption:"同学刚端起碗，春梅却得起身回家了。",actions:{hands:["bowl","陪春梅送面上楼"],change:["clock","请大家提早开饭"]}};
      return {kind:"kitchen",caption:"第一锅水滚了。春梅忙着收碗，还没来得及吃。",actions:{hands:["bowl","替春梅报清汤碗数"],change:["clock","商量分两拨下面"]}};
    }
    if(c.id==="local-FRA-ly-first-shift"){
      if(first.includes("拆第一批货"))return {kind:"work",caption:"几批货一起进门，伊内丝头次碰上这阵仗。",actions:{hands:["hand","一起拆货点数"],change:["clock","商量分两趟交接"]}};
      return {kind:"street",caption:"伊内丝认得地方，担心的是赶不上交接。",actions:{hands:["ticket","陪她到站，换她带路"],change:["clock","陪她商量改钟点"]}};
    }
    return null;
  }

  // 新增或未精配的条目只采用文字中确有的物件；无实物动作保持中性。
  const motifWords=[
    ["wheel",/轮子|车轮|小车|运货|装箱/],["boat",/小船|玩具船|上船|船票|行船/],["ball",/布球|踢球|球门|足球|球场/],
    ["ticket",/车票|换乘|换车|赶车|坐车|通勤|车站|上车/],["letter",/口信|捎话|回信|写信|寄信|来信|信封|长信/],
    ["bowl",/碗|盘子|饭盒|下锅|洗菜|和面|开饭|烧菜|煮饭|炒菜|熬汤|尝咸淡/],["bag",/口袋|布袋|背包|行李|篮子|菜篮|书包/],
    ["key",/钥匙|住处|同住|合住|租房|搬家/],["cloth",/方布|桌布|布料|针脚|补丁|线头|缝|衣角/],
    ["pencil",/铅笔|画|写下|记下|签字|填表|地图|草图|标记/],["book",/课本|书册|书本|练习题|笔记|报名表|资料|复习|读书|进修|升学/],
    ["coin",/报酬|存款|房租|现钱|周转|款项|积蓄|筹钱|存钱|订金|账本|油钱/],["clock",/时间|班次|工时|歇|休息|钟点|约定|排班|时刻/],
    ["tool",/工具|钳子|螺丝|修理|手艺|修好|配件|扳手/],["lamp",/灯|烛光/],["leaf",/茶叶|新芽|树叶|种子|豆苗|菜苗/],
    ["chair",/椅|坐一会儿|坐下|凳|座位|留位/],["bird",/小鸟|水鸟|飞鸟/],["bell",/铃铛|小铃/]
  ];
  function objectIn(text){return motifWords.find(([,pattern])=>pattern.test(text||""))?.[0]||"hand";}
  function kindIn(text,category,age){
    if(/去世|离世|追思|没能道别|遗物|过世/.test(text))return "memory";
    if(/确诊|复诊|看诊|诊所|就诊|病房|康复|患病|疲倦|医生|养病/.test(text)||category==="health")return "health";
    if(/厨房|锅边|灶|炒菜|和面|下锅|蒸屉|烹|煮豆|菜谱|掌勺/.test(text))return "kitchen";
    if(/棋盘|饭桌|同桌吃|餐桌|碗筷|聚餐|席间/.test(text))return "table";
    if(/学校|课堂|中学|老师|同桌|上课|试卷|考试|课本|教室/.test(text)||category==="education")return "school";
    if(/工位|雇主|求职|应聘|班组|交班|工坊|作坊|摊主|轮班|工钱|停工|上工|上班/.test(text)||category==="career")return "work";
    if(/车站|巷子|巷口|街角|河岸|码头|车票|街市|路口|站台|站牌|步行|街上/.test(text))return "street";
    if(/敲门|门外|屋檐|门口|门边/.test(text))return "doorstep";
    if(/布球|玩具|积木|纸风筝|球门|陀螺|玩一局/.test(text))return "toy";
    if(/旧相片|旧照片|旧盒|年少时|当年|遗憾|怀念|想起从前/.test(text))return "memory";
    if(category==="family"||/家里|家人|住处|同住|邻居|亲友|伴侣/.test(text))return "home";
    return age<2?"cradle":age<6?"toy":age<16?"doorstep":age>=65?"memory":"home";
  }
  function firstSentence(text,title){
    const sentence=(text||"").match(/^[^。！？「」“”]{4,33}[。！？]/u)?.[0];
    return sentence || title || "";
  }
  function pendingView(s) {
    const c=s.pending, config=localVariant(c)||catalog.get(c.id);
    const detail=c.text||"",title=c.title||"";
    const items=(c.options||[]).map(o=>{
      const tuned=config?.actions[o.id];
      return {id:o.id,label:tuned?.[1]||o.label,fullLabel:o.label,motif:tuned?.[0]||objectIn(o.label),
        detail:o.note||"",disabled:Boolean(o.disabled)};
    });
    return {mode:"choice",kind:config?.kind||kindIn(title+" "+detail,c.category,s.age),
      caption:config?.caption||title,detail,eventTitle:title,cardId:c.id,sourceKey:c.sourceKey||null,tone:c.tone||null,items};
  }
  const cradleItems=[
    {id:"__bird",label:"看看小鸟",motif:"bird",detail:"轻轻碰一下眼前的小鸟玩具。"},
    {id:"__bell",label:"听听小铃",motif:"bell",detail:"摇一下小铃，等它慢慢停下来。"}
  ];
  function cradle(action) {
    const caption=action==="__bird"?"小鸟晃了一下，又轻轻摆回来。":action==="__bell"?"铃响了两声，最后一点声音也慢慢停了。":"你睁开眼。小鸟和小铃就在跟前。";
    return {mode:"cradle",kind:"cradle",caption,detail:caption,eventTitle:"最初的日子",motif:action==="__bell"?"bell":"bird",items:cradleItems.map(i=>({...i})),tone:null};
  }
  function realEvent(s,requested) {
    if(!requested||typeof requested!=="object")return null;
    const sameText=e=>e.title===requested.title && e.text===requested.text;
    return (s.log||[]).findLast(e=>sameText(e) && (requested.age==null||e.age===requested.age) &&
      (!requested.kind||e.kind===requested.kind)) ||
      ((requested.age==null||requested.age===s.age) && (s.scenes||[]).find(sameText)) || null;
  }
  function chosenLocal(s,e) {
    if(!["choice","echo"].includes(e.kind) || !e.sourceKey?.includes("/"))return null;
    const [iso,source]=e.sourceKey.split("/");
    const pack=root.CountryStories?.packs?.get(iso);
    for(const card of pack?.choices||[]){
      const id="local-"+iso+"-"+card.id, selected=s.decisions?.[id];
      if(!selected||card.source!==source)continue;
      const resolved=card.resolve?.(s)||card;
      const opt=resolved.options.find(o=>o.id===selected);
      if(!opt)continue;
      const matches=e.kind==="choice" ? e.age===card.age && e.title===opt.label :
        opt.follow && e.age===card.age+opt.follow.after && e.title===opt.follow.title && e.text===opt.follow.text;
      if(!matches)continue;
      const view=localVariant({id,options:resolved.options})||catalog.get(id);
      return {id,option:opt.id,label:opt.label,kind:view?.kind,motif:view?.actions[opt.id]?.[0]||objectIn(opt.label)};
    }
    return null;
  }
  const threadEcho=/^(?:home-(?:echo-|evening-echo$)|friend-(?:our-game|visit-kept|visit-missed|reply|no-reply|found|not-found|returned|learned|old-friends|unknown)$|chance-(?:order-(?:patch|wait|delivery|fraud|confide)|(?:pay|bag|table|song)-after)$)/;
  function logView(s,e) {
    const title=e.title||"",text=e.text||"", age=e.age??s.age,key=e.threadKey||"";
    const origin=chosenLocal(s,e);
    const toyEvent=title==="那只轮子"||title==="玩具船的新航线"||
      e.kind==="choice" && age===5 && ["一起把轮子装回去","把它改成一艘船"].includes(title);
    const mode=e.kind==="choice"?"response":e.kind==="echo"||threadEcho.test(key)?"echo":"scene";
    let kind=kindIn(title+" "+text,null,age);
    if(origin?.kind && e.kind==="choice")kind=origin.kind;
    if(toyEvent)kind="toy";
    if(/^home-loss-|^friend-(?:death|old-place|unknown)$/.test(key) || title==="共同生活的人")kind="memory";
    let motif=objectIn(title+" "+text);
    if(origin && (e.kind==="choice"||motif==="hand"))motif=origin.motif;
    if(toyEvent)motif=/轮子装回去|^那只轮子$/.test(title)?"wheel":"boat";
    const caption=toyEvent && e.kind==="choice" ? (motif==="wheel"?"你把轮子装回了原处。":"没了轮子的车身，成了你手里的小船。") : firstSentence(text,title);
    return {mode,kind,caption,detail:text,eventTitle:title,eventKind:e.kind,eventId:e.id||null,motif,tone:e.tone||null,
      ...(origin?{originCard:origin.id,originOption:origin.option,originAction:origin.label}:{}),
      sourceKey:e.sourceKey||null,threadKey:e.threadKey||null,eventAge:age,items:[]};
  }
  function finished(s) {
    const log=s.log||[],ending=log.findLast(row=>row.kind==="ending"), band=s.ending?.band;
    const caption=band==="infant"?"这短短的一生，也有人记得第一次抱起你。":
      band==="earlyChildhood"?"那些年一起做过的小事，留在了记得你的人那里。":
      (s.name?s.name+"的这一生，在这里合上了。":"这一生，在这里合上了。");
    const remembered=log.findLast(e=>e.kind!=="ending" && (e.kind==="echo"||e.tone==="joy"))||log.find(e=>e.kind==="birth");
    return {mode:"farewell",kind:"farewell",caption,detail:ending?.text||caption,eventTitle:ending?.title||"告别",tone:null,items:[],
      memory:remembered?{age:remembered.age,title:remembered.title,text:remembered.text}:null};
  }
  function describeBase(s,context={}) {
    if(!s)return {mode:"scene",kind:"home",caption:"",eventTitle:"",detail:"",tone:null,items:[]};
    if(!s.ended && !s.pending && s.age===0 && ["__bird","__bell"].includes(context?.action))return cradle(context.action);
    const forced=realEvent(s,context?.event);
    if(forced){
      if(forced.kind==="ending")return finished(s);
      const snapshot=logView(s,forced);
      if(forced.kind==="birth"&&snapshot.eventAge===0){
        snapshot.mode="cradle";snapshot.kind="cradle";
        if(!s.ended&&s.age===0&&!s.pending)snapshot.items=cradleItems.map(i=>({...i}));
      }
      return snapshot;
    }
    if(s.ended)return finished(s);
    if(s.pending)return pendingView(s);
    // 计时器公布该条之后才取年内场景。默认调用只读已发生的日志。
    if(Number.isFinite(context?.fraction)){
      const revealed=(s.scenes||[]).filter(row=>row.at<=context.fraction).at(-1);
      if(revealed)return logView(s,revealed);
    }
    if(s.age===0)return cradle();
    const year=(s.log||[]).filter(row=>row.age===s.age && row.kind!=="decision");
    const chosen=year.findLast(row=>row.kind==="choice");
    const echo=year.findLast(row=>row.kind==="echo"||row.threadKey?.startsWith("home-echo-"));
    const moment=year.findLast(e=>e.threadKey||e.kind==="milestone") || year.at(-1);
    if(chosen||echo||moment)return logView(s,chosen||echo||moment);
    const caption=s.age<6?"今天的故事，从你身边开始。":s.age<16?"又长大了一岁。":s.age<65?"新的一年从这里开始。":"又一年了。";
    return {mode:"scene",kind:kindIn("",null,s.age),caption,detail:"",eventTitle:"",tone:null,items:[]};
  }
  function describe(s,context={}){
    const view=describeBase(s,context);
    return root.IndiaLife?.active(s,view.eventAge??s?.age)?root.IndiaLife.stage(s,view,context):view;
  }
  root.StageStories=Object.freeze({describe,kinds:Object.freeze(kinds),motifs:Object.freeze(motifs)});
})(globalThis);
