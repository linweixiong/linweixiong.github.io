/* 两座城市的生活范围只代表成都与里昂。 */
(() => {
  "use strict";
  const scene=(minAge,maxAge,title,text,source,conditions={})=>({minAge,maxAge,title,text,source,...conditions});
  const opt=(id,label,note,effects,after,title,text)=>({id,label,note,effects,follow:{after,title,text}});
  CountryStories.revise("CHN",{
    sources:[
      {id:"cd-kitchen",label:"联合国教科文组织 · 成都的市井饮食与川菜",url:"https://www.unesco.org/en/creative-cities/chengdu"},
      {id:"cd-douban",label:"中国非物质文化遗产网 · 郫县豆瓣传统制作技艺",url:"https://www.ihchina.cn/art/detail/id/14636.html"},
      {id:"cd-water",label:"联合国教科文组织 · 都江堰灌溉系统",url:"https://whc.unesco.org/en/list/1001/"}
    ],
    scenes:[
      scene(0,2,"隔壁端来的碗","忙着照料你，家里错过了饭点。隔壁端来一碗抄手，问要不要红油，抱着你的人说自己吃清汤的。等你睡稳，那碗抄手已经涨得胖胖的了。","cd-kitchen"),
      scene(4,10,"筷尖上的豆瓣","家里炒菜，你非要学着舀豆瓣。大人让你先用筷尖蘸一点尝尝咸淡。你这才懂，为什么锅边的盐罐从刚才起就没有开过。","cd-douban"),
      scene(12,21,"一份面，两只碗","放学和同伴合吃一份面。一个想加红油，一个不想，你们请店主多给一只小碗。以后再来，对方见你们进门就会先把红油放到桌边。","cd-kitchen"),
      scene(23,48,"末端那小块菜地","在成都平原帮亲友看菜地，大家都说水已经来了，你站在水沟末端却还看不见水。去上头问了一圈才知道，入口畅通和每块地都喝到水之间还隔着好几双手。","cd-water",{requires:{residence:"rural"}}),
      scene(35,60,"豆瓣罐上的姓","去郫都探亲，主人给你装了一小罐豆瓣，把自家姓氏写在盖上。回去后你想照这个味调菜，打听半天，得到的答案先是「别急着下盐」。","cd-douban",{fromYear:2017}),
      scene(61,90,"少点红油，多点葱","一家人好不容易凑在同一桌。你没急着替大家调味，先把几只碟子放到能伸手够到的地方。有个年轻人悄悄问，再添一碟清汤会不会扫兴。你把自己那碟推给了他。","cd-kitchen")
    ],
    choices:[{age:14,id:"cd-stall",title:"收摊前还剩半小时",source:"cd-kitchen",text:"认识的面摊老板临时少个人，问你能不能搭把手。同学已经在巷口等你一起回去，正想把今天在班上没说完的话讲完。收摊前只剩半小时。",
      options:[opt("bowls","留下帮忙收碗，和同学另约","老板能早点回家，你得主动把这次没走完的路约回来。",{bond:2,health:-1},2,"收到最后的那只碗","再次路过那口锅，老板添给你一小碗面，说那天你帮忙收完摊，他赶上了回家吃饭的点。这是你头一次知道那半小时用在了哪里。"),
        opt("walk","陪同学走回去，明天再来帮摊","把这半小时留给愿意开口的人。",{bond:3,happiness:1},2,"同一条巷子再走一次","同学约你在老地方碰头。这次轮到你有话想说，对方没催，到了巷口又陪你多走了一段。")]}]
  });
  CountryStories.revise("FRA",{
    sources:[
      {id:"ly-market",label:"里昂市政府 · 让·饶勒街市",url:"https://www.lyon.fr/lieu/marches-alimentaires/marche-alimentaire-jean-jaures"},
      {id:"ly-canteen",label:"里昂市政府 · 学校食堂与菜单",url:"https://www.lyon.fr/actualite/enfance-et-education/quest-ce-quon-mange"},
      {id:"ly-stage",label:"法国教育部 · 初中毕业年级的职业观察实习",url:"https://eduscol.education.gouv.fr/5226/sequence-d-observation-en-milieu-professionnel-pour-les-eleves-des-classes-de-troisieme"}
    ],
    scenes:[
      scene(0,2,"纸袋下面那层桃子","家里人推着你去里昂的街市买东西。到家才发现有人把袋底碰软的一只桃子换成了熟得刚好的。没人记得是在哪家摊前换的。","ly-market"),
      scene(5,11,"我能自己念菜单","在里昂一所市立学校吃午饭前，你试着把菜单上的菜名读给同桌听。你们把一种菜猜成了两种，等盘子端来，才商量出谁猜得更像。","ly-canteen",{fromYear:2022}),
      scene(13,19,"口袋里的三个问题","朋友刚结束初中最后一学年的职业观察，回家时口袋里还装着纸条。三个问题只问出去一个，但那一个的答案整整写了半页。","ly-stage",{fromYear:2010}),
      scene(21,43,"最后一篮的价钱","你在让·饶勒街市帮相熟的人收买好的菜。一篮熟果摊主要你便宜带走，你掂了掂，说两个人一周也吃不完。旁边的人问，要不要一人提一半。","ly-market"),
      scene(32,56,"今晚菜已经吃过了","接亲友的孩子回家，路上才听说今天学校午餐刚吃过你准备做的那样菜。你翻出这周里昂学校的菜单，头一回让孩子挑家里晚上怎么搭配。","ly-canteen",{fromYear:2022}),
      scene(58,88,"见面不用买东西","搬远一点以后，你还是隔阵子就回老街市。你已经不再买那么大一兜菜，摊上的人也不急着称重，先问你上次提到的那个人后来怎么样。","ly-market")
    ],
    choices:[{age:14,id:"ly-observe",title:"这一周想跟着谁",fromYear:2010,source:"ly-stage",text:"班里在准备初中最后一学年的职业观察实习。熟人的铺子愿意接你一周，能看到进货到关门的全过程；另一家陌生单位也在找人，工作更接近你想探索的方向，每天却要多换一次车。",
      options:[opt("shop","留在近处，跟完整个工作日","每天省下一段交通，反而有机会看到打烊以后的事。",{bond:2,knowledge:1},2,"开门以前的工作","再有人把铺子的营业时间当作工作时间，你会想起跟岗那周。门还锁着，里面已经有人在核进货单。"),
        opt("commute","去陌生单位，自己走一遍换乘","先用自己的早晨试试那个职业方向和那段通勤。",{knowledge:3,health:-1},2,"时刻表的反面","把实习那周的纸从抽屉里翻出来，背面是你记下的工作步骤，正面密密写着换乘时间。十六岁再想去哪儿学，你把两面都看了一遍。")]}]
  });

  // 每张卡都可从初次相识进入。只有存档真正选过前一张卡，才使用相应的重逢。
  function arc(age, id, title, source, prior, fallback, variants) {
    return {age,id,title,source,cityArc:true,...fallback,
      resolve(state) {
        const previous = state.decisions?.[prior];
        return Object.hasOwn(variants,previous) ? variants[previous] : fallback;
      }};
  }

  const bowlShift = opt("hands","站在锅边报碗数，让春梅先坐下吃","锅里一次能下的面有限，得记住谁要清汤。",{knowledge:2,bond:1},2,
    "有人喊清汤，你不用回头","再去吃面，春梅隔着锅台问你要什么，你也隔着锅台报回去。端来的除了清汤面，还有碗底一小撮豌豆。她说，当年你报遍全桌，独独忘了给自己要。");
  const noodlePlan = opt("change","跟等饭的人商量，分两拨下面","晚一点吃的那一桌肯等，春梅就能跟头一桌坐下来。",{bond:3},1,
    "头一拨专留一个空位","又逢几家搭伙，春梅先把一个空位留给烧菜的人。有位刚坐下的客人听明白了，自己接走了第二拨的漏勺。");
  const walkWith = opt("hands","陪春梅把一碗热面端过去","你得用掉吃饭的时间，也能听她自己说说家里的事。",{bond:3,health:-1},2,
    "在楼下多喊一声","去春梅家附近办事，你在楼下喊了一声。她母亲听出是那天端面上楼的人，隔着窗教你把手里那把豌豆尖怎么掐才嫩。");
  const gatherEarly = opt("change","问桌上的人能否提早开饭","大家挪一挪钟点，让春梅能在离席前吃完。",{knowledge:1,bond:2},1,
    "热汤赶上了正点","春梅再来搭伙时，几个人把晚饭往前挪了一刻钟。她吃完一整碗才起身，走到门口还跟你争：刚才那碗里，你的肉臊子明明多一点。");
  const aprons = opt("stove","留下看火，让做饭的人先去听一段","看住炉上这两口锅，台前那段戏就赶不上了。",{bond:3,health:-1},2,
    "那天台上是怎么回的头","有人好意把你错过的戏哼给你听。唱词大致还在，可一说到演员怎样回头，一个说是听见脚步，一个说是先看见了人。你给两人续了茶。那一眼是怎样演的，站在灶边的你到底没看见。");
  const shortMenu = opt("table","去跟坐席的人商量，少上最后一道热菜","有人想吃全席，你得亲口问大家肯不肯。",{knowledge:2,bond:1},3,
    "空下来的那口锅","下回办席，有人想起你当初少上的那道菜，索性匀出一口锅烧洗碗水。散席后没再等灶，洗到最后的人也坐下来吃了两口。");
  const askSinger = opt("listen","请帮腔的人坐在你身边，听完再问","你想听清楚，刚才接住演员那句的究竟是谁。",{knowledge:2,bond:1},2,
    "听得出是谁先开口","另一回听同一段，有个嗓子只冒出半句你就认出来了。散场时你去打招呼，对方笑你上回问了半天，这回总算没有谢错人。");
  const joinSinger = opt("join","到边上跟大家轻轻试一句帮腔","让熟手领着进，唱错了就从头来。",{happiness:2,bond:2},1,
    "你给晚来的人留着气口","又有人在这句上提早开口。你忍住笑，像上回别人带你那样，把进声的地方轻轻哼了一遍。旁边多出一个声音，这回进得正好。");

  CountryStories.revise("CHN",{
    sources:[
      {id:"cd-river-pavilion",label:"成都市地方志编纂委员会办公室 · 锦江边的望江楼（方志四川发布）",url:"https://m.thepaper.cn/newsDetail_forward_24721306"},
      {id:"cd-opera",label:"中国非物质文化遗产网 · 川剧高腔中的帮、打、唱",url:"https://www.ihchina.cn/project_details/13161/"}
    ],
    choices:[
      arc(29,"cd-noodle-shift","面正要下锅","cd-kitchen","local-CHN-cd-stall",
        {text:"你到成都城南帮忙备一顿面。掌勺的人介绍春梅给你认识，她一直忙着收空碗，连自己的午饭都没顾上。头一锅水滚起来，院里两桌人都等着。",options:[bowlShift,noodlePlan]},{
          bowls:{text:"当年一起收碗的面摊老板又掌了勺。这次你到门口，他就腾出手招呼你：锅边缺个肯记清汤碗数的人。春梅在旁边收空碗，明明该吃饭了，还没轮到她坐下。",options:[bowlShift,noodlePlan]},
          walk:{text:"当年陪回家的同学在巷口叫住你，说你总算也赶上了一回热面。你们刚端起碗，同桌的春梅就得回去照应母亲。她倒回半碗没吃的面，老同学看了看还烫手的锅。",options:[walkWith,gatherEarly]}
        }),
      arc(55,"cd-cooks-seat","掌勺的人也想听戏","cd-river-pavilion","local-CHN-cd-noodle-shift",
        {text:"望江楼附近，靠锦江的一处院子里有人唱戏，几家人合办了一桌饭。灶边的春梅给你指了一扇窗，台上的声音隔窗听得清，人却看不见。她想让另一位做菜的人也去台前坐一会儿。",options:[aprons,shortMenu]},{
          hands:{text:"望江楼边办一桌饭，春梅一把拉你进院，说当年你亲自搭过她的手，这回有个人更想找替手。掌勺的师傅背着台口切菜，听见喜欢的一折开唱，只来得及往窗外望一眼。",options:[aprons,shortMenu]},
          change:{text:"望江楼边的院子里搭桌听戏。春梅还记得当年那顿面，你敢开口请整桌人一起挪钟点。今天掌勺的师傅舍不得错过一折戏，又答应客人要上最后一道热菜，春梅请你一起去问问。",options:[aprons,shortMenu]}
        }),
      arc(65,"cd-second-voice","刚才接腔的是谁","cd-opera","local-CHN-cd-cooks-seat",
        {text:"你在成都一处院子里听人清唱川剧高腔。唱的人歇了半句，边上几个人开口帮腔。你扭头找是哪个嗓子领的，一个同来听戏的人往旁边让了让，腾出地方给你。",options:[askSinger,joinSinger]},{
          stove:{text:"春梅约你来听一段川剧高腔：上回你留下看火，这回灶旁没人等你。你坐稳才听出来，台上唱到半截，先在身后接住那句的是位帮腔的人。春梅悄悄给你指了指座位。",options:[askSinger,joinSinger]},
          table:{text:"一起商量过减一道热菜的那几位，如今又凑来听清唱。春梅身边还留着个座位。川剧高腔唱到要紧处，你听见两边有人接声，其中一个正是当年最舍不得撤菜、最后却点了头的客人。",options:[askSinger,joinSinger]}
        })
    ]
  });

  const unpack = opt("hands","陪伊内丝拆第一批货，自己示范一次点数","赶不上去办原来那件事，但她能亲手点完再签收。",{knowledge:2,bond:1},2,
    "少的那一筐从哪儿算起","伊内丝请你看一眼一张退货单。一筐货没有到，她把空筐和少到的货分作两行。她说，上回跟你一块点过以后，才知道看起来都是一个空位，账会差多少。");
  const shiftStart = opt("change","问送货的人能不能分两趟交接","少一批货同时进门，新来的人能自己问清楚。",{bond:2,knowledge:1},1,
    "两个人都腾得出手","又一次有人来送东西，伊内丝已经能站在门口点货。第二批来得迟，等货的几个人轮流给对方留了十分钟吃东西，不用一边吃一边签字。");
  const ride = opt("hands","先陪她走到站，再让她带你走回去","多留出一程，让她用自己的办法认路。",{bond:3,health:-1},2,
    "先报哪一边的出口","再约在佩拉什见，伊内丝开口先说哪一侧，再说几点。她后来也接过一位头一回来的新人，有了这句话，两个人都没在站外兜圈。");
  const askWork = opt("change","陪她去问，可否换一个交接的钟点","请等她的人也听听路上的难处。",{knowledge:2,bond:2},1,
    "晚到的那十分钟","伊内丝来捎话，新的交接时间让她不用再一路跑。倒是有人得为她多留十分钟，她记在心上，下一回主动接了那人的收尾活。");
  const deliver = opt("carry","替她送完今天最后两篮","走一趟能看见路上哪一段最难提。",{bond:3,health:-1},2,
    "最后那家多走一层楼","以后再分送菜的活，你先问有没有楼梯。跟你搭手的人一直以为两篮一样重。等你陪着上到最后一层，对方把空篮子换到左手，腾出右手扶栏杆。");
  const divide = opt("divide","请收菜的人到街角碰头，重排以后怎么送","有人能下来，也有人实在下不了楼。",{knowledge:2,bond:2},3,
    "留着一个上楼的名额","新的交接点已经有人用熟了。今天却有人提不起篮子。伊内丝从本子末尾翻出一个先前没删掉的名字：这个人早说过，碰上这种日子，自己可以多走一趟。");
  const upper = opt("up","带几个人上楼，在屋里陪她看窗灯","在房间里多待一会儿，会错过楼下的招呼。",{bond:3,happiness:1},2,
    "窗内也能做东","又是十二月，楼上的主人给你端出一碟热栗子。她说起那年几个人挤在窗边，一边说一边腾椅子。对岸那家后来搬走了，窗户是暗的；上回没能当面说的那声再见，你至今也没机会补上。");
  const signal = opt("across","下楼到对岸，商量亮几下来回答她","隔得远，得等对方自己认出是回应。",{happiness:2,knowledge:1},1,
    "隔河认出的第三盏灯","下一回你正站在索恩河边，对面相熟的人接连亮出三盏窗灯。旁边有人当它只是好看，你却知道那一家是在招呼你，便去敲熟人的门，借窗台摆出了三只亮着的灯杯。");

  CountryStories.revise("FRA",{
    sources:[
      {id:"ly-perrache",label:"里昂市政府 · 佩拉什车站的地点与历史",url:"https://www.lyon.fr/lieu/sncf/gare-de-perrache"},
      {id:"ly-quay-market",label:"里昂市政府 · 圣安托万与塞莱斯坦河岸街市",url:"https://www.lyon.fr/lieu/marches-alimentaires/marche-alimentaire-saint-antoine-celestins"},
      {id:"ly-window-lights",label:"里昂灯光节官方史 · 1852年以来十二月八日的家庭窗灯",url:"https://www.fetedeslumieres.lyon.fr/fr/page/histoire-de-la-fete"}
    ],
    choices:[
      arc(29,"ly-first-shift","佩拉什车站那一头","ly-perrache","local-FRA-ly-observe",
        {text:"在里昂佩拉什车站外，你遇见头次来这一带做事的伊内丝。她找得到地方，烦恼的是回来得晚，交接时总有人要等她。她问你，能不能帮忙把这件事跟对方讲明白。",options:[ride,askWork]},{
          shop:{text:"当年接你跟岗的那位店主约你到里昂佩拉什站旁。如今有个叫伊内丝的新帮手，头次碰上几批货一同进门。店主说，你见过门还没开就开始核的进货单，今天愿不愿给她搭把手？",options:[unpack,shiftStart]},
          commute:{text:"当年在那家要多换一趟车的单位接待你的人，如今在佩拉什附近做事。对方带伊内丝来找你。她手里攥着第一次上工的路线，担心回来交接时会迟到，跟你从前掐着时刻表的样子很像。",options:[ride,askWork]}
        }),
      arc(55,"ly-last-basket","一篮菜要送几层楼","ly-quay-market","local-FRA-ly-first-shift",
        {text:"在里昂圣安托万河岸，你认识了给附近人家捎菜的伊内丝。最后两家各有一篮，一户能下楼，另一户一直在楼上等。她手腕不舒服，想跟你商量今天怎么送，往后又怎么接得下去。",options:[deliver,divide]},{
          hands:{text:"圣安托万河岸上，伊内丝一眼认出你。当年你陪她把头一件事从头做到尾，她一直记得。今天她指给你看，这一边两篮菜隔得只有几步，真送到门口，却得爬不同的楼梯。她的手腕疼了几天。",options:[deliver,divide]},
          change:{text:"当年你陪伊内丝去商量改交接，她如今也习惯先问大家赶不赶得上。在圣安托万河岸收拾好菜篮，她发现有两户从来没说过意见，一问才知道，一户能下楼，另一户连走到街角也很吃力。",options:[deliver,divide]}
        }),
      arc(65,"ly-window-answer","隔着索恩河的两扇窗","ly-window-lights","local-FRA-ly-last-basket",
        {text:"十二月八日，索恩河边一户人家准备像往常一样在窗边摆小灯。主人这几年不便下楼，却认得河对岸的一户。你去帮忙，两边都想知道，这回能不能看见对方的灯。",options:[upper,signal]},{
          carry:{text:"伊内丝陪你去看那回送菜爬到最后一层楼的人。十二月八日，窗上摆了小灯，楼下几位邻居在等。主人指着索恩河对岸一扇窗，说这几年自己出不了门，也想让那一家知道她还看得见。",options:[upper,signal]},
          divide:{text:"伊内丝约来当年一起商量送菜的几个人过十二月八日。一家负责照顾楼上行动不便的人，另一家就住在索恩河对岸。几盏小灯分到两边，一位主人问你是上楼坐坐，还是过去找她一直想招呼的邻居。",options:[upper,signal]}
        })
    ]
  });
})();
