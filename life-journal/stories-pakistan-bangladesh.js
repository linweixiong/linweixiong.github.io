/* The documentation supports the local setting. Households, choices and delayed outcomes are fictional. */
(() => {
  "use strict";
  const registry = globalThis.CountryStories;
  const rural = {residence:"rural"};
  const urban = {residence:"urban"};
  const source = (id,label,url) => ({id,label,url});
  const scene = (id,minAge,maxAge,title,text,source,limits={}) =>
    ({id,minAge,maxAge,title,text,source,...limits});
  const choice = (age,id,title,text,source,options,limits={}) =>
    ({age,id,title,text,source,options,...limits});
  const option = (id,label,note,effects,after,title,text) =>
    ({id,label,note,effects,follow:{after,title,text}});

  registry.register("PAK", {
    sources:[
      source("pk-school","联合国儿童基金会巴基斯坦办公室 · 社区学校和加速学习中心的分时上课安排","https://www.unicef.org/pakistan/media/3716/file/ALP%20Report%202014-15.pdf"),
      source("pk-river","联合国儿童基金会巴基斯坦办公室 · 拉詹普尔等地季风涨水对上学路的影响","https://www.unicef.org/pakistan/stories/learning-through-it-all"),
      source("pk-canal","世界银行 · 巴基斯坦农村灌溉轮次及相邻地块的换班安排","https://documents1.worldbank.org/curated/en/255631468774953429/pdf/303810PK.pdf"),
      source("pk-transit","旁遮普公共交通管理局 · 拉合尔快速公交线路与开通时间","https://pma.punjab.gov.pk/lahore_metrobus_system"),
      source("pk-ball","联合国工业发展组织 · 锡亚尔科特运动用品生产中的手缝和计件收入","https://downloads.unido.org/ot/48/49/4849206/TYPE_Global_value_chains_local_clusters_and_CSR.pdf"),
      source("pk-remit","巴基斯坦国家银行 · 国家支付系统战略中的家庭汇款","https://www.sbp.org.pk/ps/PDF/NPSS.pdf")
    ],
    scenes:[
      scene("pk-soft-ball",2,7,"没打气的礼物","家里拆开从锡亚尔科特捎来的包裹。你抱住那只瘪瘪的手缝足球，觉得它刚好能当枕头。打足气后第一次踢过去，你反倒有点舍不得刚才那个样子。","pk-ball"),
      scene("pk-second-class",7,14,"黑板上的两行日期","街坊借用早上的教室办下午的学习班。你和一个上午来上课的朋友指着同一处黑板上的算式，先后说「是我们班写的」。擦黑板的人笑了，原来那一格整天都没擦过。","pk-school",{fromYear:2014,toYear:2026}),
      scene("pk-rain-route",8,17,"课本到了，人还没齐","季风雨冲断了村外的一段上学路。有人从能通行的另一条路带来学校捎的练习纸。你和邻居在桌边平分纸张，抄下最后一道题，给路另一头的朋友留了一份。","pk-river",{requires:rural}),
      scene("pk-bus-walk",15,34,"下车后还要走多久","住在拉合尔的亲友要独自去办事，请你替他核对快速公交站名。你先圈好了站，他却指着下车后那段路，说该把走路的时间也算进约定里。你们把出门时间又往前挪了。","pk-transit",{requires:urban,fromYear:2013,toYear:2026}),
      scene("pk-rate-book",20,41,"最后一列才是收入","从锡亚尔科特来的朋友带来一张手缝足球的老账页。你看见做完的球多，以为那周挣得最多。他点了点另一栏的单价。你重新算了一遍，才明白他为什么连星期天都忙。","pk-ball"),
      scene("pk-water-turn",27,56,"纸条上是后半夜","村里靠轮次用渠水的邻居要出门，托你帮忙带句话。纸上写着后半夜的时刻。你原以为只是传个数字，到了隔壁才知道，两家还得当面说清谁在哪一头等。","pk-canal",{requires:rural}),
      scene("pk-family-transfer",39,68,"少算了一次汇款","整理家用时，一笔亲人从国外汇回的钱被抄进了两页。你们从头核对，把重复的一行划掉。原定一起买的几样东西只好先买一样，晚饭时每个人都说了自己的理由。","pk-remit"),
      scene("pk-old-register",61,91,"轮水簿里的外号","邻居拿来长辈留下的旧轮水簿，几行旁边只有外号。你认出了其中两个，又找另一位老人辨出第三个。那些换过轮次、互相搭过手的人，终于在纸上有了全名。","pk-canal",{requires:rural})
    ],
    choices:[
      choice(14,"pk-evening-hour","下午那一个小时","附近加速学习班给刚回到课堂的学生留了复习时间。一位朋友约你一起重做错题，家里却也在同一个钟点需要人去接年幼的亲人。大家都能另作安排，但得由你今天说定。","pk-school",[
        option("lesson","留下复习，先把接人的事交代好","争取一段完整学习时间，家人这周要多绕一趟。",{knowledge:4,bond:-1},2,"仍写着两种解法","朋友收着那天下午写的纸，一道题旁边挤着你们两种解法。再碰上难题，你们知道可以先坐下来各算一遍。"),
        option("pickup","固定去接人，向朋友借笔记补上","家里能把这段路放心交给你，补课要自己找时间。",{bond:4,happiness:-1},2,"轮到有人等你","那位年幼的亲人如今认得路了。有天你办事晚归，出了路口却看见一个人朝你招手，说这回换他来接。")
      ],{fromYear:2014,toYear:2026}),
      choice(27,"pk-remittance-plan","一笔钱，两个日子","家里收到一笔亲人寄回的钱，说近来换工，下一笔还没日期。屋里有一扇不好关的窗要修，这个月也得留日常周转的钱。你和家人把两个数写在桌上，合起来超过了预算。","pk-remit",[
        option("repair","先修常卡住的窗","立刻付出一笔钱，让每天受窗户困扰的人轻松些。",{cash:-100,bond:3},2,"不用再抬一下","朋友来时顺手关上了那扇窗。你忽然想起从前每个人都会先抬一下窗框，如今这个小动作已经从家里消失了。"),
        option("reserve","先留周转的钱，再约修理日","自己继续凑合一阵，把下一次付款的主动权留在家里。",{knowledge:3,happiness:-1},2,"纸袋上的新日期","家人还记得当年分开写开支的办法。再碰到两件事同时要花钱时，桌上很快又出现两个写着日期的纸袋。")
      ]),
      choice(46,"pk-water-shift","换不换这一轮","乡下熟识的两户人家正在商量能不能换一次渠水轮次。其中一户的人要进城陪长辈办事，想让你陪同；另一户请你留下，等双方都到齐再帮着把约定记清。约好的时刻撞在了一起。","pk-canal",[
        option("town","把进城的来回路程接下来","陪长辈走完复杂的一趟，邻居另找见证的人。",{bond:4,health:-1},3,"这次认得回程路","长辈又要去同一个地方，这回自己说出了返程的路口。到家后仍然来找你，只是想讲讲路上新开了什么铺子。"),
        option("record","留在村里记下两家的约定","花半天弄懂各自守水的时刻，长辈这次要另找陪伴。",{knowledge:4,bond:-1},3,"那张纸仍有用","两家人又碰到出门的日子。这次他们摊开你留下的旧纸，照着记了三项：原来的轮次、换过的轮次、该告诉谁。")
      ],{requires:rural})
    ]
  });

  registry.register("BGD", {
    sources:[
      source("bd-class","联合国儿童基金会孟加拉国办公室 · 季风汛期中断学习与社区学习点","https://www.unicef.org/bangladesh/en/stories/tawhida-and-tania-friendship-beyond-currents"),
      source("bd-language","联合国儿童基金会南亚区域办公室 · 孟加拉国初等教育中的多语学习实践","https://www.unicef.org/rosa/media/3036/file/Early%20literacy%20and%20multilingual%20education%20in%20South%20Asia.pdf"),
      source("bd-float","联合国粮农组织 · 孟加拉国南部湿地的漂浮菜床和季节性生产","https://www.fao.org/giahs/around-the-world/detail/bangladesh-floating-gardens-system/"),
      source("bd-weave","联合国教科文组织 · 达卡周边的贾姆达尼手工织造与家庭作坊","https://ich.unesco.org/en/RL/traditional-art-of-jamdani-weaving-00879?lang=en"),
      source("bd-rickshaw","联合国教科文组织 · 达卡客运三轮车、车绘与工坊传承","https://ich.unesco.org/en/RL/rickshaws-and-rickshaw-painting-in-dhaka-01589?RL=01589")
    ],
    scenes:[
      scene("bd-seat",2,7,"画着鱼的车尾","家里有人要坐三轮车去送东西，把你也带上了。你一直回头找刚才那条画在车尾的鱼。直到下车才弄懂，自己坐上去以后当然就看不见它了。","bd-rickshaw",{requires:urban}),
      scene("bd-two-names",5,13,"两种叫法都画进来","一个朋友用家里常说的词告诉你水鸟叫什么，再想了想，又说出课堂上用的叫法。你在纸上只画了一只鸟，却在它两边各留一行字，请他都写下来。","bd-language",{fromYear:2006,toYear:2026}),
      scene("bd-dry-pages",9,18,"一摞干的课本","连日涨水，村里的学习点暂时开不了课。重新见面时，你和伙伴把保存下来的课本按缺页重新分组。两本从不同地方带来的残本合在一起，刚好够大家接着读。","bd-class",{requires:rural}),
      scene("bd-season-seedlings",15,32,"苗要等水，买主也要等","一位从南部湿地来的亲友寄信说，漂浮菜床上的菜苗长好了，来取苗的人却得改天。你家原等着他来吃饭，只好先放回一副碗筷。信末又加了一行，让你把空出的日子留给自己的事。","bd-float"),
      scene("bd-loom-account",24,46,"图案停在第三行","熟人在达卡周边做贾姆达尼手织布。你帮他算一块布的工期，以为多添几个图案只要多添一点线。他把织到一半的纹样指给你看，你才把账本里那半天改成了另算工时。","bd-weave"),
      scene("bd-homeward",32,58,"车棚下多留一个位置","要带长辈去见人，对方不太走得动。你提前到路边约好一辆三轮车。回来的那一程没法提早订，你们商量好在哪家熟识的铺子等，给一天留出了一段空白。","bd-rickshaw",{requires:urban}),
      scene("bd-bed-doc",45,71,"菜床的名字","南部湿地一位靠浮床种菜的亲友把两页旧账交给你。你照日期抄了一遍，他却说得按雨水来前、来后分开看。你用不同颜色重画了线，两季之间哪段时间卖得少，这才清清楚楚。","bd-float",{requires:rural}),
      scene("bd-woven-edge",62,92,"摸到手指认得的花","找东西时翻出一块贾姆达尼旧布。年轻的亲人先看见花纹，你却先摸到有一处纹样没做到边。你说起当年等一块布怎样等过了约好的日子，他第一次问你那布后来做了什么。","bd-weave")
    ],
    choices:[
      choice(10,"bd-school-return","复课的第一张桌子","村里的学习点在水退以后重新开门。桌子不够摆，老师让大家商量怎么用半个下午。你带来了几页一直没弄懂的题；身旁的朋友缺了更多课，连从哪页翻起都还拿不准。","bd-class",[
        option("catchup","先把自己积下的题问明白","保住难得的当面提问时间，朋友要再等一会儿。",{knowledge:4,bond:-1},2,"角落里的小箭头","你又翻到那几页练习，看见老师画的小箭头。旁边后来添了别人的笔迹；原来那页纸还在伙伴中间传过一轮。"),
        option("pair","先和朋友对上缺掉的页数","两个人一起回到学习里，这周得自己挤时间补题。",{bond:4,happiness:-1},2,"给你留的那一页","一次你来迟了，朋友已经替你折好该从哪里读的那一页。你还没开口，他就说，自己知道找不到开头是什么滋味。")
      ],{requires:rural}),
      choice(14,"bd-language-page","一页纸留给哪种声音","一起做读物的伙伴里，有人在家里惯用的语言和课堂上的不一样。大家决定一起做一张词卡。纸已经不多，留给原话和图画的地方得重新分。","bd-language",[
        option("words","为两种叫法留位置","仔细听伙伴说原话，图案只能画小一些。",{knowledge:3,bond:2},3,"有人照着读了一遍","一次又谈起那种水鸟，新加入的伙伴指着词卡慢慢读。原来教你的人点点头，替他轻轻正了一个音。"),
        option("drawing","画清意思，请伙伴当面教大家念","不会读字的人更容易跟上，伙伴不在时少了声音线索。",{happiness:3,bond:1},3,"折起的画也认得","那张画已经折去一角，依旧有人从鸟脚边的水草认出它。伙伴说自己把这个词当面教过许多人，你画的草回回都帮了忙。")
      ],{fromYear:2006,toYear:2026}),
      choice(27,"bd-loom-delay","一块布赶不上相聚","达卡周边一位熟识的织工为你家做一块贾姆达尼布。聚会的日子定了，纹样却比预想得慢。织工开口问，愿不愿意简化一段花纹；家里有人盼着当天能看到，有人很喜欢原来的图。","bd-weave",[
        option("simplify","同织工商量简化最后一段","尽量赶上相聚，整幅纹样会留下一处不同。",{bond:3,happiness:-1},3,"看得出的那一段","家人又摊开那块布，立刻指认出当初改过的地方。大家记得的并非少了几朵花，而是那天谁伸手接过了它。"),
        option("wait","同意延期，临时借一块布","保留原来的工时，另外花些钱解决眼前的事。",{cash:-70,knowledge:3},2,"织工带来的最后一朵花","对方送来一小块织样，叫你看当初没有省略的那段。后来再有人请你估手艺活的交期，你总愿意先听完对方怎么算。")
      ])
    ]
  });

  const panelSource="bd-dhaka-panel",panelKey="BGD/"+panelSource,cardId="bd-dhaka-door-panel";
  const inWorkshop={setting:"dhaka",requires:urban};
  const met="bd-dhaka-door-intro",streetEcho="bd-dhaka-door-street-echo",insideEcho="bd-dhaka-door-inside-echo";
  const has=(s,id,age)=>s.log.some(e=>e.id===id&&e.sourceKey===panelKey&&e.age===age);
  // The two possible age-eleven memories both include this child's actual mother.
  // Her lifespan comes from the household record, never from the selected answer.
  const motherPresent=s=>globalThis.LifeFamily?.members({...s,age:11}).some(p=>p.role==="母亲"&&p.living);
  const remembers=(pick,echo)=>s=>s.decisions["local-BGD-"+cardId]===pick&&has(s,echo,11);
  registry.revise("BGD",{
    sources:[source(panelSource,"联合国教科文组织 · 达卡三轮车彩绘、花鸟纹样与画师受托作画","https://ich.unesco.org/en/RL/rickshaws-and-rickshaw-painting-in-dhaka-01589?RL=01589")],
    scenes:[
      scene(met,8,8,"门响一声，她就知道",
        "达卡的作坊里，你常蹲在母亲旁边，看她给客运三轮车的车尾板描红花。蓝鸟的眼睛总是最后才点。回到家，你抬了一下老木门，松插销哐当地掉下来。从屋里看，门框右上角有道小裂口。母亲埋头洗笔，笑着说：「听这一下就知道是你。」",panelSource,
        {...inWorkshop,storyBeat:met,available:motherPresent}),
      scene("bd-dhaka-door-street-later",18,18,"抬门以前，先停一下",
        "搬进新住处，门有点涩。你下意识伸手往上一提，又笑着收了回来。你想起当年母亲站在达卡街上，差点去开三轮车上的那扇门。眼前的门不用抬，往里轻轻一推就开了。",panelSource,
        {...inWorkshop,storyBeat:"bd-dhaka-door-street-later",available:remembers("street",streetEcho)}),
      scene("bd-dhaka-door-inside-later",18,18,"把凳子转半圈",
        "借宿的小表亲趴在窗边，听见巷子里响过几次脚步，都够不着看。你原想站着替人瞧，想起当年母亲画的那只书包，索性坐低一点。你把凳子转了半圈，让孩子坐到正好看得见门口的地方。",panelSource,
        {...inWorkshop,storyBeat:"bd-dhaka-door-inside-later",available:remembers("inside",insideEcho)})
    ],
    choices:[
      choice(9,cardId,"画反了的门闩",
        "搬家前，常到达卡作坊补漆的车主送来一块空车尾板。听说你们要搬，他主动请母亲把这扇旧门画上去：「两边我都喜欢，你们挑。」母亲放好颜料。站在巷口能看见你每天走回来的路，坐到她的凳子上，才看得见门闩。",
        panelSource,[
          {id:"street",label:"从巷口画那扇门",note:"退到放学时转过的那个弯。站在这边，只看得见门板外侧。",effects:{knowledge:2,happiness:2},
            outcome:"你跑到巷口比给母亲看。她从外面画下掉了漆的绿门板和左上角的小裂口，松插销藏在另一面。车主把画好的板装回去，骑过街角，那扇门才在车后朝向你们。",
            follow:{after:2,id:streetEcho,title:"手伸向车尾那扇门",text:"搬走两年，达卡街口一辆三轮车转过弯，你才看见车尾左上角那道裂口。你喊熟人停一停。母亲上前伸手做了个提门的动作，停在漆面前，自己先笑了：「还以为得抬一下才推得开。」车主把脚撑在地上，等你们看够。"}},
          {id:"inside",label:"坐到母亲的位置画",note:"从屋里看门口，留意她每天能看到什么。",effects:{bond:3,knowledge:1},
            outcome:"你看着母亲落笔，脱口说门闩画反了。她在门外补上一个背书包的小人：「每天走到这儿，你就开始喊我了。」你挪到她的凳子上坐了一会儿。门框的裂口果然在右手边。她把起稿的小纸折好，夹进画本。",
            follow:{after:2,id:insideEcho,title:"门外那个背书包的人",text:"搬来两年，母亲摊开画本晾潮气，那张起稿的小纸从夹页里滑出来。画里的书包只有一根带子。你问她另一根呢。她笑着说：「你那时候总只肯背一边呀。」你把脚边的书包捞上膝盖，两根带子好好地并排放着。"}}
        ],{...inWorkshop,storyBeat:cardId,available:s=>motherPresent(s)&&has(s,met,8)})
    ]
  });
})();
