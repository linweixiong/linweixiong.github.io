// 当代制度按对应资料的年代触发。人物、家事和选择的后果均为原创。
(() => {
  "use strict";
  const stories = globalThis.CountryStories;
  const ref = (id, label, url) => ({id, label, url});
  const scene = (minAge, maxAge, source, title, text, conditions = {}) =>
    ({minAge, maxAge, source, title, text, ...conditions});
  const option = (id, label, note, effects, after, title, text) =>
    ({id, label, note, effects, follow: {after, title, text}});

  // 保留原有抉择 ID，使下一阶段仍能从同一条选择记录接续。
  function editChoice(iso, id, patch, notes = {}) {
    const original = stories.packs.get(iso).choices.find(item => item.id === id);
    return {...original, ...patch, options: original.options.map(o => notes[o.id] ? {...o, note: notes[o.id]} : o)};
  }

  stories.revise("EGY", {
    sources: [
      ref("egy-shifts", "埃及教育和技术教育部 · 2023—2027 教育规划中的学校轮班", "https://planipolis.iiep.unesco.org/sites/default/files/ressources/egypt_Education%20sector%20plan%202023-2027.%20Egypt.pdf"),
      ref("egy-pool", "埃及金融监管局与日本国际协力机构 · 家庭轮转储蓄实地调查", "https://fra.gov.eg/wp-content/uploads/2021/01/Microinsurance-Demand-Study.pdf"),
      ref("egy-train", "埃及国家铁路 · 出发站、到达站及车次查询", "https://obs.enr.gov.eg/o-city/obs/enr/railway/en/home"),
      ref("egy-meter", "埃及电力控股公司 · 2019 年单相预付费电表与充值卡规范", "https://www.eehc.gov.eg/CMSEehc/media/oxnh0hhv/edms-20-300-1-single-phase-prepaid-kwh-didital-meter.pdf"),
      ref("egy-harvest", "联合国粮农组织埃及办公室 · 产区椰枣采后分拣与运输", "https://www.fao.org/egypt/news/detail/from-field-to-market--fao-supports-a-transformative-shift-in-the-quality-of-egyptian-dates-through-improved-harvest-and-post-harvest-practices/en")
    ],
    removeScenes: ["把醋另盛", "往后错半拍", "现在轮到台边的人了"],
    scenes: [
      scene(0, 0, "birth", "写在纸上才放心", "你刚吃完奶就在家里睡着了。去办出生证明的家人回来，把纸递给抱着你的人。两人把你的名字轻轻念了一遍，第二遍才敢念出声。", {fromYear:2019,toYear:2026}),
      scene(7, 11, "library", "故事讲到一半", "住在亚历山大的表妹从儿童图书馆回来，给你捎了一张画。图上有门、有狗，却没有门后面的人。她想让你也猜猜故事的结尾，再把你猜的画寄还给她。", {fromYear:2010}),
      scene(17, 26, "weave", "布头上那道斜线", "你替人把两块手织布样送回铺里。店主是从上埃及来的织工，接布时把两块布的经线对齐，让你看看一边松、一边紧的边。回去一路，你忍不住也拿自己的衣角比。", {requires:{jobSector:"craft"}}),
      scene(32, 63, "metro", "写给来开罗的人", "你和从外地来的亲人约在开罗碰面。你把他从拉姆西斯一带往南搭一号线的方向写在纸上，又加一句：如果错过约好的车次，就在出口等，我会来找你。", {fromYear:1988,requires:{residence:"urban"}}),
      scene(6, 10, "egy-shifts", "篮子里的第二顿饭", "你家附近这所小学分早班和午班。你放学跨进门槛，读午班的姐姐正要出门。篮子里留着她还没吃的午饭，你只好提着篮子追到街口。", {fromYear:2023,toYear:2026}),
      scene(11, 18, "egy-train", "车票还在家里", "送舅舅去火车站，半路他一摸口袋，车票还压在桌上。你先跑回去，一手攥着票，一手替他拉上院门。回来时他气还没喘匀，只记得问你有没有锁门。"),
      scene(18, 29, "bread", "卡在谁的围裙里", "你答应帮一位能领补贴面包的亲人提篮子。到了街角，他才记起自家的面包卡放在昨天的围裙里。你们分头回去找，面包房旁那家店已经开门了。", {fromYear:2015,toYear:2026}),
      scene(21, 38, "egy-meter", "抽屉里有两张卡", "你替住在附近的舅舅跑一趟，给他家预付费电表充电费。抽屉里两张卡模样很像，他在电表卡的纸套上画了盏灯。回来后，你照旧把它插回有灯的那一格。", {fromYear:2019,toYear:2026}),
      scene(24, 45, "egy-harvest", "压在最下面的一筐", "给来自阿斯旺的一批椰枣分拣时，你发现最下层的软枣已经挤破了几颗。大家重新腾出浅筐。原本等着拉货的人也过来搭手，催了半天的车反而走得更早。", {fromYear:2026,toYear:2026,requires:{jobSector:"land",jobStatus:"employed"}}),
      scene(28, 47, "egy-pool", "不是漏了一个人", "亲友约在饭后清点这月的轮转储蓄。邻居把领款人的名字念了两遍，你以为她漏念了谁。她把册子转过来，一栏是本月谁交了钱，另一栏才是轮到谁拿走这一份。", {fromYear:2021,toYear:2026}),
      scene(35, 46, "egy-shifts", "接错了半个钟头", "孩子这学期在分时段上课的学校读午班。你照旧到校门口去接，早班的孩子还没散完。第二天你调整了交班时间，把校门口白等的半小时补回给了同事。", {fromYear:2023,toYear:2026,requires:{children:true,jobStatus:"employed"}}),
      scene(43, 64, "water", "最后一块地的钟点", "一位在尼罗河三角洲种地的亲人放你听他留下的口信。水已经过了前面几块地，他还得等到渠尾来水才能动身。你们换了约好吃饭的时辰，给晚到的那位留了一盏灯。", {fromYear:2020,toYear:2026,requires:{residence:"rural"}}),
      scene(58, 88, "egy-train", "接人要问车次", "外地的晚辈只说坐晚车来。你找人一问，当晚先后有两趟都到你要去的车站。等对方把票上的车次报清楚，你才肯放下热水壶、拿钥匙出门。")
    ],
    choices: [
      editChoice("EGY", "secondary-path", {}, {"technical-visit":"来回要花车钱，你能亲眼看看实践课，也知道这段路每天要走多久。"}),
      editChoice("EGY", "training-or-care", {}, {attend:"要付路费，还得托熟人替你跑一趟。你能亲手练习那道难题。"}),
      {age:32,id:"egy-turn-to-save",title:"这月轮到谁拿钱",source:"egy-pool",category:"family",fromYear:2021,toYear:2026,
        text:"你和几位亲友每月凑一笔钱，轮流拿整份。这月原本轮到你，家里的冰箱又开始漏水。下一位成员来商量能否对换，他得给孩子预备开学用品。换不换，两家下个月都照常交钱。",
        options:[
          option("swap","同他换一个月，先修冰箱撑一阵","要先花一笔维修费；对方开学前能拿到整份钱。",{cash:-100,bond:3},1,"搬冰箱那天","旧冰箱最后还是换了。搬的时候，那位和你对调过顺序的邻居第一个赶来。他还记得那年孩子开学，你替他匀出的一个月。"),
          option("keep","按原顺序领钱，照原计划换冰箱","家里今年少操一份心；邻居要另想办法筹开学的钱。",{happiness:2,bond:-1},2,"把两家的月份写开","新一轮储蓄开始，你和邻居先找出各自用钱最紧的月份。两个人把月份写开，再坐下来商量谁排前面。")
        ]}
    ]
  });

  stories.revise("IDN", {
    sources: [
      ref("idn-pelni","印尼国家航运公司 PELNI · 船票、值船与行程变更","https://www.pelni.co.id/index.php/faq-id"),
      ref("idn-recycle","雅加达省政府 · 社区回收银行的称重和记账","https://www.jakarta.go.id/index.php/bank-sampah"),
      ref("idn-jkn","印度尼西亚社会健康保险经办机构 · 参保人在基层机构预约排队","https://bpjs-kesehatan.go.id/user-manual-mobile-jkn/mobilejkn/antreanfktp.html"),
      ref("idn-textbook","印尼教育政策研究中心 · 职业中学教科书使用调查","https://pskp.kemendikdasmen.go.id/assets_front/images/produk/1-gtk/kebijakan/15__PB_Buku_Teks_SMK.pdf"),
      ref("idn-prepaid","印尼国家电力公司 · 预付费电表按千瓦时扣减","https://www.pln.co.id/cara-hitung-token-listrik-prabayar-pln")
    ],
    removeScenes:["先找摇错的人","最轻的那件乐器"],
    scenes: [
      scene(7,12,"idn-school","把白线留到最后","和你交换画片的孩子在北加浪岸上学。她寄来了学校蜡染课上做的一小方布，要你找出画上的鱼。你对着彩色的地方看了半天，最后才看清留白的鱼尾。",{fromYear:2005}),
      scene(19,36,"idn-pinisi","船肋旁的一块木片","一个在南苏拉威西造船场当学徒的亲人捎回一块薄木片，让修门框的你试试做样板。你照它的弧线画了一笔才懂，他把工作时比对形状的办法带回家了。",{requires:{jobSector:"craft"}}),
      scene(28,48,"idn-rain","空格和一个零","早上帮邻居整理气候田间学校留下的雨量表。你想把中间的一格补上，他拦住说那天你俩都去赶集了。没有人来量过雨，这格就该空着。",{fromYear:2017,requires:{residence:"rural"}}),
      scene(4,9,"idn-posyandu","把卡拿给谁","陪亲戚带小宝宝到附近按日期开门的 Posyandu 称重，大人两手都占着，让你保管生长记录卡。你一直把它举得高高的，直到志愿者蹲下来跟你说，现在可以给她了。",{fromYear:2024,toYear:2026}),
      scene(8,14,"idn-recycle","能存进去的旧作业纸","住在雅加达的姑姑给你看过她家附近回收点的小账本。你替她拆开纸箱、把胶带剥掉，看着分类好的纸过秤。回家路上你还在问，那秤究竟有没有算进装纸的袋子。",{fromYear:2025,toYear:2026,requires:{residence:"urban"}}),
      scene(15,23,"idn-textbook","纸条跟着书一起还","一位读职业中学的朋友向学校借了本课本，你们一起琢磨图里的零件。下课他把你夹的纸条抽出来，说书得还给下一班，可纸上那个画错了三遍的轮子他想留着。",{fromYear:2020,toYear:2026}),
      scene(19,33,"idn-pelni","票写的是后半夜","你在给另一座岛上的亲人核对 PELNI 船票。电话里说的是周五晚上，票上却是周六凌晨。你们干脆把周五那格画了个大圈，在旁边写上先从家里出门。",{fromYear:2024,toYear:2026}),
      scene(23,42,"idn-pay","钱对了，袋数没对","你帮亲人把买来的米带回去。摊主把 QRIS 收款记录里的金额看了两遍，发现自己只给你装了一袋。她补装第二袋时，你已经把第一袋卸回秤边，省得抱混。",{fromYear:2020,toYear:2026}),
      scene(30,54,"idn-jkn","隔一张椅子还有个位","一位已参加 JKN 的亲人约你陪诊。他在自己登记的基层诊所取好了手机队号。到了门口，他盯着屏幕怕错过，你去找两张椅子；叫到号时，那两张椅子还没坐暖。",{fromYear:2025,toYear:2026}),
      scene(36,59,"idn-prepaid","电表上的数不是钱","邻居新搬的屋子用预付费电表，想请你帮她看小票。她一直拿充值金额和表上的数对，换成小票上写的用电量一看，就把原先打算再付一遍的钱收回钱包。",{fromYear:2026,toYear:2026}),
      scene(48,68,"idn-recycle","要分两次推的手车","雅加达的亲人问你能不能帮忙，把纸板和空罐推到社区回收点。一本小账要按种类过秤。纸板先送过去了；回来装罐子时，从箱缝里又滚出一只，你只好追着它跑。",{fromYear:2025,toYear:2026,requires:{residence:"urban"}}),
      scene(61,84,"idn-posyandu","有人记得下次是哪一天","家里刚有了个小宝宝。照料他的人收拾称重时带回的记录，你拿出自己的日历，把社区保健点下次开门的日子也记了一份。到了那天，是大人打来电话提醒你别急着出门，他们已经到了。",{fromYear:2024,toYear:2026})
    ],
    choices:[
      editChoice("IDN","idn-rain-record",{requires:{residence:"rural"}}),
      {age:32,id:"idn-port-company",title:"谁陪她上这趟船",source:"idn-pelni",category:"family",fromYear:2024,toYear:2026,
        text:"姨妈要坐 PELNI 的客船去另一座岛和亲人团聚，头一回独自办登船手续。你已经答应周末替家里守摊。陪她走全程要再买一张票，守摊的人也得临时换。",
        options:[
          option("sail","请人换班，和她一起买票上船","多花一份船费，家里得另找人开摊，她一路有人作伴。",{cash:-125,bond:3,happiness:-1},2,"第二次的船票","姨妈又要渡海。这回她自己把票和证件装好，还帮另一名旅客找到了办手续的地方。你接到的电话只有一句：已经坐下了。"),
          option("meet","陪到出发港，请另一边的亲人来接","你能赶回去守摊；上船后这段路，她要独自走。",{bond:1,knowledge:2},1,"下船先找蓝袋子","下一次有人独自坐船，家人又约定在到达港哪一处碰头。姨妈替对方想了个信号，让来接的人提一只颜色醒目的袋子。")
        ]}
    ]
  });

  stories.revise("NGA", {
    sources: [
      ref("nga-cassava","国际热带农业研究所 · 尼日利亚流动木薯加工和收获后运输","https://biblio.iita.org/documents/U14ManAbassGrowingNothomDev.pdf-9664599408fadb7d773c23338e5a5a47.pdf"),
      ref("nga-transfer","尼日利亚银行间结算系统 · 即时转账的收款人姓名与交易状态查询","https://contactcentre.nibss-plc.com.ng/support/solutions/articles/47001265115-what-are-the-services-under-nip-that-customers-can-utilize-"),
      ref("nga-exam","尼日利亚联合招生考试委员会 JAMB · 考试单上的考点、日期与时间","https://support.jamb.gov.ng/faqs"),
      ref("nga-clinic","联合国儿童基金会尼日利亚办公室 · 儿童常规免疫的记录及接种安排","https://www.unicef.org/nigeria/frequently-asked-questions-immunization")
    ],
    removeScenes:["布上藏着一排字","谁给冠军让个座"],
    scenes: [
      scene(0,1,"nga-birth","收好你的那张小卡","你出生这年，住在凯比州的亲戚也添了个宝宝。他们在比尔宁凯比的基层卫生点给孩子办了出生登记，把拿到的通知卡拍给你家人看。两边终于弄清两个孩子的生日只差一天。",{fromYear:2026,toYear:2026}),
      scene(6,13,"nga-hub","今天是爸爸来带读","今天带社区学习小组的是同伴的爸爸。他念得快，碰上一个长句，一口气没跟上。你们商量把句子分开，前半截他来念，后半截由大家接。",{fromYear:2024,toYear:2026}),
      scene(18,40,"nga-transit","拉各斯站台前的小卡","到拉各斯办事，住在那里的亲人带你搭使用 Cowry 卡的公交。你掏钱找零，他指了指刷卡机，说这一路得先给卡充值。等你收好卡，他自己的零钱倒落在柜台上了。",{fromYear:2024,toYear:2026}),
      scene(24,43,"nga-rain","雨季从哪一页开始","种地的亲人把尼日利亚气象局今年的季节预报摊在桌上。你替他找村子所在的地区，刚才以为会早来的雨，原来讲的是旁边另一区。你们把商量好的雇车日期先用铅笔记着。",{fromYear:2026,toYear:2026,requires:{residence:"rural"}}),
      scene(1,5,"nga-clinic","纸上还有一个日期","家里人收好你的接种记录，把下次约的日期念给另一位照看你的人。他手上沾着面粉，只能请别人替他在日历上画一圈。后来你先认得那个圈，才认得里面的数字。",{fromYear:2025,toYear:2026}),
      scene(6,12,"nga-hub","带读本得多留一份","到社区学习点借读本，同桌一连几天没来。你在读本里夹了个纸签，请志愿者先替他留一份。下回他回来了，纸签夹反了，故事竟然从最后一页讲起。",{fromYear:2024,toYear:2026}),
      scene(12,20,"nga-cassava","袋口上系了两种布条","亲戚家的木薯和邻居的收获一同送去加工。几个袋子全是一个颜色，你把旧布撕成两种记号。装车时没人再争哪袋是谁的，丢下来的那截布刚够系在钥匙上。",{requires:{residence:"rural"},fromYear:2016,toYear:2026}),
      scene(17,23,"nga-exam","考点不在报名那条街","复习时一位同学来找你认路。他刚打出 JAMB 考试单，才发现考点和自己报名的地方不在一处。你们重新画路线，纸上写得最大的是他要出门的钟点。",{fromYear:2024,toYear:2026,requires:{route:"study"}}),
      scene(20,35,"nga-transfer","收款人的全名","亲人托你给修理铺转账，对方平常只用店里的绰号。转账时银行显示的是户名，你只好拨电话问全名。老板把姓和名慢慢念完，又笑说，你是这一带头一个这么正式叫他的人。",{fromYear:2024,toYear:2026}),
      scene(26,44,"nga-cassava","车上多腾出一排","你在乡下帮忙安排一批木薯运去加工。隔壁农户那里今天来了流动加工机，几户人一合计，把附近的收获先在那里处理。原先挤着装大块鲜根的车，现在能替远处一户也带上一些。",{fromYear:2016,toYear:2026,requires:{jobSector:"land",residence:"rural"}}),
      scene(34,51,"nga-exam","两只闹钟隔了一刻钟","家里有个准备参加大学入学考试的晚辈，考点给的场次很早。他说让你叫醒他，又担心自己把你也弄迟到。你们各定一只闹钟，他的那只早响一刻钟。",{fromYear:2024,toYear:2026}),
      scene(42,61,"nga-transit","圈起来的那一站","亲人请你到拉各斯帮忙照料家人。对方把受交通局管理的公交线路写出来，提醒你带上充过值的 Cowry 卡，还特意圈出容易坐过的一站。你在旁边添上接你那个人的名字。",{fromYear:2024,toYear:2026,requires:{residence:"urban"}}),
      scene(57,84,"nga-cassava","少买一盆也行","你和一位邻居合着买了一批 gari 木薯颗粒。她得知孩子这周回不来，怕买多了占地方。两人重新把各自要的份量量好，空出来的那个容器被她洗净，装了你要带回家的勺子。")
    ],
    choices:[
      editChoice("NGA","nga-film-kitchen",{
        text:"熟人拍一部尼日利亚家庭短片，向你家借厨房。周六原本要在这里备几家人的饭，你只能匀出半天。摄制组请你定个时段，演员和录音的人好分别安排。"
      },{"record-dialogue":"把安静的时间留给演员，家人要把备菜往后挪。","record-kitchen":"照常备饭，让录音的人采到声音。演员得把排练挪到别处。"}),
      {age:47,id:"nga-processing-turn",title:"流动加工机在村里只停一天",source:"nga-cassava",category:"family",fromYear:2016,toYear:2026,
        requires:{residence:"rural"},
        text:"家里有一批刚收的木薯。能进村的流动加工机排满了，你家和邻居合用的小车也只够装一趟。邻居那批先收，你们原先却约好先运你家的。",
        options:[
          option("lend","把小车先让给邻居，自己另外雇车","邻居的鲜根少等一程，你家这批得另付运费。",{cash:-95,bond:3},1,"车还在原处等着","又到收木薯的时候，邻居提前推车来了。他记得上次是谁多花了一趟车费，把车柄递给你说，今天先由你定。"),
          option("share","两家各留半车，分清袋子再一起送","省下另雇车的钱，两家今天都只能加工一部分，你还得留下分袋。",{knowledge:2,health:-1,bond:1},2,"袋绳上两种颜色","隔了两季，又有几家打算合车。你从柜子里拿出两截系过袋口的旧绳，告诉大家先分清各家的份数，到了机器跟前才不用争。")
        ]}
    ]
  });
})();
