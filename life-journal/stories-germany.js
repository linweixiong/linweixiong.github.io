/* 北威州的地方背景。人物、对白与抉择均为虚构。 */
(() => {
  "use strict";
  const urban={residence:"urban"}, rural={residence:"rural"};
  const source=(id,label,url)=>({id,label,url});
  const scene=(id,minAge,maxAge,title,text,source,limits={})=>({id,setting:"nrw",minAge,maxAge,title,text,source,...limits});
  const choice=(age,id,category,title,text,source,options,limits={})=>({age,id,setting:"nrw",category,title,text,source,options,...limits});
  const option=(id,label,note,effects,after,title,text)=>({id,label,note,effects,follow:{after,title,text}});

  globalThis.CountryStories.register("DEU",{
    sources:[
      source("football","德国联合国教科文组织委员会 · 社区空地足球的自订规则","https://www.unesco.de/staette/bolzplatzkultur"),
      source("lanterns","德国联合国教科文组织委员会 · 莱茵地区的提灯传统","https://www.unesco.de/staette/martinstradition-im-rheinland"),
      source("apples","北威州环境部门 · 传统果树草地、果实与榨汁用途","https://www.umwelt.nrw.de/system/files/media/document/file/broschuere_streuobstwiesen_rz_bf.pdf"),
      source("wupper","伍珀塔尔悬挂列车运营方 · 线路沿革及历史照片","https://schwebebahn.de/geschichte-der-schwebebahn"),
      source("orientation","北威州劳动厅 · 学校职业领域体验指南","https://www.mags.nrw/system/files/media/document/file/arbeit_broschuere_berufsfelderkundung-wegweiser-2014-rz_download.pdf"),
      source("dual","德国联邦职业教育研究所 · 企业与职业学校的教学协作","https://www.bibb.de/dokumente/pdf/HA099.pdf"),
      source("bus","北威州公共交通资料门户 · 志愿者参与的社区巴士","https://infoportal.mobil.nrw/projekte/buergerbus.html"),
      source("mine","鲁尔博物馆 · 矿灯与工业生活藏品","https://ruhrmuseum.de/museum/objektpatenschaften/vergebene-objekte"),
      source("voices","威斯特法伦-利珀地区协会 · 威斯特法伦方言及原声资料","https://www.mundart-kommission.lwl.org/de/veroeffentlichungen/westfaelische-mundarten/"),
      source("rhine","莱茵地区协会 KuLaDig · 下莱茵河地区的田野与截干柳","https://www.kuladig.de/Objektansicht/A-EK-20080619-0010")
    ],
    scenes:[
      scene("de-paper",3,6,"漏出一道光","莱茵地区的朋友送来一盏自己糊的纸灯笼。你把灯放在墙边，纸缝里漏出的光刚好照亮一根手指。大人拿来补纸时，你把那道小缝藏到了背后。","lanterns"),
      scene("de-windfalls",4,9,"带斑的那只苹果","你跟着邻居到他家的果树草地拾苹果。光洁的那只被递给了你，你却看中了有斑的那只。两块斑点挨得近，给它添上一道划痕，就有一张笑脸了。","apples",{requires:rural}),
      scene("de-shadow",6,10,"头顶上没有铁轨","有人从伍珀塔尔寄来一张老照片。你和大人看了半天，总觉得少了东西。等大人用手把车厢遮住，你才看明白，轨道在车顶上方，车厢底下那条亮带是河。","wupper"),
      scene("de-posts",8,12,"外套该算哪一边","街区空地上的两件外套就是球门。球擦着袖子过去，大家争了一阵，又把袖子仔细折回来。同伴把球还给你。刚才究竟进没进已经没人提了。","football",{requires:urban}),
      scene("de-first-work",13,14,"一只找不到的盒子","学校安排了职业体验，今天轮到你去看一家企业怎样收货。员工给你两只盒子，请你从纸单上找出没到的那只。你翻了三遍，才发现自己一直在找已经到了的东西。","orientation",{fromYear:2015,toYear:2026}),
      scene("de-week",17,19,"同一张桌子的两端","这阵子，你的学徒培训分在企业和职业学校两处。你拿着在学校画的草图回去请教。带你的人把纸旋了半圈，你才发现自己一直站在桌子的另一端看。","dual",{fromYear:2000,toYear:2026,requires:{route:"work"}}),
      scene("de-village-bus",20,33,"夹在时刻表里的纸","你去一个开通社区巴士的村子帮熟人办事。志愿司机在时刻表上替你点出回程那一趟。回家摊开纸，那个小圈正好画在折痕上，只剩两段互不相接的弧。","bus",{fromYear:1986,toYear:2026,requires:rural}),
      scene("de-spare-lamp",24,38,"照片里只露出半盏灯","朋友从鲁尔区带来一张旧工友合照，照片边上露出半盏矿灯。你问灯是什么样，朋友却把照片翻过来。背面写着人名，有个名字还被写错后仔细改过。","mine"),
      scene("de-return",32,45,"听错了也认得","来自威斯特法伦的老熟人一着急就带上家乡的口音。重逢时，你只听明白了半句，却一下认出那声短短的笑。你指了指自己的耳朵，对方慢下来，又笑了一遍。","voices"),
      scene("de-willows",35,53,"路过第三棵柳树","你替住在下莱茵河边的朋友送还一只篮子。纸条上画着一排修过树冠的老柳树，第三棵画得特别矮。你循着它找对了门。还篮子时，你请对方把纸条留给你。","rhine",{requires:rural}),
      scene("de-paper-scar",44,57,"提灯上的两道针脚","街坊翻出从莱茵地区带来的纸灯笼。灯身有一块补纸，线头还露在外面。你想把它藏好，对方却把纸灯转过来，说就凭那两道歪针脚，才认得出是谁做的。","lanterns"),
      scene("de-small-pitch",52,67,"鞋尖碰到线","你路过街区的小球场，球滚到了脚边。对面一个孩子用两只手比画，要你把球传到很窄的一道缝里。你踢偏了。孩子装出裁判的样子，判你重来一次。","football",{requires:urban}),
      scene("de-two-apples",58,75,"尝第二口才说","邻居带来两种苹果，请你猜哪一种榨出来的汁更酸。第一口你答得很快，第二口却改了主意。邻居亮出纸杯底下的记号：原来两杯是从同一壶里倒出来的。","apples"),
      scene("de-saying",68,88,"把最后那个词留着","有人念起来自威斯特法伦一带的老话，中间停下来等你接。你不敢保证接得对，只照当年听到的音念了一遍。对方写下自己的读法，把你那一个也并排留着。","voices"),
      scene("de-photo-edge",77,96,"剪不下来的照片边","整理旧纸时，你从一张伍珀塔尔悬挂列车的明信片边缘认出了旧友的笔迹。要留下那行字，就得把它旁边歪歪扭扭的邮戳也留着。最后你把整张卡放了回去。","wupper")
    ],
    choices:[
      choice(6,"de-short-game","personal","下一个是谁","你在空地边上等着踢球。来的人越来越多，小球门却只有一个。一个孩子把占位置用的帽子交给你，请你替大家拿个主意。","football",[
        option("short","轮到的人上场，缩短每局","大家都有完整的一局，进了第一个球也得让场。",{bond:3,happiness:-1},2,"领先的时候也下场","两年后，你刚进球就听到边上喊换人。一个小孩已经抱着帽子在等。你想起那顶占位置的帽子，把场地腾了出来。"),
        option("wide","把两队都扩大，一起踢","没人干等，你自己也可能半天碰不到一次球。",{happiness:2,bond:1},3,"终于轮到的一脚","又凑成一大群人踢球，你特意把球往最边上送。那边的小孩抬头找了半天，才敢相信球真是传给自己的。")
      ]),
      choice(18,"de-training","education","只够问一个问题","在企业练习时，一道工序总让你比别人晚一点。明天要去职业学校上课。你能请带教的人再做一遍，也能带着自己画的草图去课堂上把原理问清。今天只够准备一样。","dual",[
        option("watch","留下看看熟手的动作","看得见停顿的那一刻，今晚没时间誊图。",{knowledge:2,bond:2},2,"原来手在等一下","有人看你示范时老跟不上。你放慢动作，把自己当初没看出的那一下停顿单独做给对方看。"),
        option("sketch","把草图补全，带去问老师","先弄清原因，眼前这一次仍要慢慢做。",{knowledge:3,happiness:-1},3,"图纸上擦掉的一角","你在旧草图背面找到那行回答。当年最费劲的是把问题说清楚，现在别人还没问完，你已经知道该从哪里讲起。")
      ],{fromYear:2000,toYear:2026,requires:{route:"work"}}),
      choice(32,"de-reunion","personal","中间只空出一个钟头","一位从伍珀塔尔来的旧友只在附近停留一个钟头。对方带了很多年前从悬挂列车上拍下的底片，想和你一起挑几张看看。你更想知道这几年对方过得怎样。","wupper",[
        option("light","把底片对着光，一起挑照片","能认出不少旧地方，近况只能择要讲。",{knowledge:2,bond:1},3,"底片边沿那只手","朋友寄来选中的照片。放大后你才看见，旧车窗倒影里，一只手正举起来给拍照的人遮光。"),
        option("talk","把纸袋收好，先听对方讲","把这一个钟头全留给眼前的人，底片要等下次。",{bond:3,happiness:1},2,"照片背后写的近况","旧友后来寄来一张自己选的相片，背面写着上回没讲完的那件小事。你先读完字，才翻过去看图。")
      ]),
      choice(48,"de-press","family","榨汁之前留几个","邻居把一批果子带来分。这批果子太酸，鲜吃的人少。一起榨汁省事，但一旦混进大桶，再也尝不出那一棵老树的味道。邻居把最后一小筐交给你。","apples",[
        option("separate","单留一筐，和邻居慢慢尝","多一次收拾，也能记住这种果子的酸味。",{knowledge:3,bond:1},3,"一小瓶贴了签的汁","几年后，邻居带来一小瓶单独压的果汁。你刚抿一口就皱起眉。对方笑了：看来上次那种味道没记错。"),
        option("mix","一起倒进去，赶上这一轮分装","能把汁及时分给帮工的人，留不下单独那份味道。",{bond:3,happiness:1},2,"杯子是借来的","一次收拾屋子，你翻出那天分果汁用的杯子。想不起酸不酸了，你倒还记得谁捧着杯子，一口气喝完了。")
      ]),
      choice(60,"de-lamp","family","照片背面的问号","一位熟人想把鲁尔区一张矿工合照里的姓名写全。最边上那个人被矿灯挡住了半边脸。带照片来的人只敢说一个姓，还想再找人问问。现在就差这一处。","mine",[
        option("pencil","先用铅笔记下姓，旁边打问号","保住一条线索，也得让后来的人看清仍待核实。",{knowledge:3},4,"有人把问号圈了起来","后来一位知情人指着问号，认出那个姓其实属于旁边的人。你们擦掉铅笔字，顺便把两个人的位置都核清了。"),
        option("blank","把那格空着，约好一起去问","暂时交不出完整名单，但能听别人自己认人。",{bond:3,knowledge:1},3,"忽然叫出来的小名","一次见面，有人看到空着的那格，脱口叫出一个小名。一下子没人想得起全名，你却知道这次该从哪里继续问了。")
      ]),
      choice(73,"de-voice","personal","只念一遍，还是再念一遍","一个年轻人搜集身边人听过的说法。你记得一位威斯特法伦朋友喊人进屋时的语调，却不确定最后一个词。对方翻开本子，等你开口。","voices",[
        option("sound","按记得的声音念，标出听不清的地方","能留下节奏，拼写会有一处空白。",{bond:2,knowledge:1},2,"空白也有节拍","有人照着本子念到空白，竟和你一样先停了一拍。你听见的又是那个叫人进屋的声音。"),
        option("meaning","写下普通德语的大意和当时的场景","别人容易理解，那个尾音留在自己的记忆里。",{knowledge:2,happiness:1},3,"门边多写的一行","年轻人把那段大意抄给你看，页边还记了你的补充：当时门已经推开，就等最后一个人进去。")
      ])
    ]
  });
})();
