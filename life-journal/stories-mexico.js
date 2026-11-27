(() => {
  "use strict";

  const sources = [
    {id:"household",label:"墨西哥国家统计与地理研究所 · 普埃布拉州家庭收入与支出调查（2022）",url:"https://www.inegi.org.mx/contenidos/programas/enigh/nc/2022/doc/enigh2022_ns_presentacion_resultados_pue.pdf"},
    {id:"talavera",label:"墨西哥国家人类学与历史研究所 · 普埃布拉与特拉斯卡拉的塔拉韦拉陶艺",url:"https://lugares.inah.gob.mx/es/node/6405"},
    {id:"schoolbooks",label:"墨西哥全国免费教科书委员会 · 1960 年以来的小学课本",url:"https://historico.conaliteg.gob.mx/"},
    {id:"radio",label:"墨西哥国家原住民族研究所 · 库埃察兰 XECTZ 北部山区之声",url:"https://ecos.inpi.gob.mx/xectz/"},
    {id:"market",label:"普埃布拉州法规库 · 库埃察兰市集与露天集市条例",url:"https://ojp.puebla.gob.mx/media/k2/attachments/reglamento_de_mercados_y_comercio_no_establecido_del_mpio_de_cuetzalan.pdf"},
    {id:"ash",label:"普埃布拉市民防部门 · 火山灰降落时的社区指引",url:"https://memorias.pueblacapital.gob.mx/seguridad/proteccion-civil/130-proteccion-civil/1389-recomendaciones-en-caso-de-caida-de-ceniza-volcanica"},
    {id:"bookarchive",label:"墨西哥全国免费教科书委员会 · 开放历年教科书线上目录",url:"https://www.gob.mx/conaliteg/articulos/conoce-el-catalogo-historico-de-los-libros-de-texto-gratuitos"},
    {id:"time",label:"墨西哥国家统计与地理研究所 · 家务、无偿照护与时间使用调查",url:"https://inegi.org.mx/contenidos/saladeprensa/boletines/2025/enut/enut2024_RR.pdf"}
  ];
  const urban = {residence:"urban"};
  const rural = {residence:"rural"};
  const scenes = [
    {minAge:1,maxAge:3,title:"篮底那只柑橘",text:"家里人从集上回来，一低头，篮里最后一只柑橘正顺着你的腿往下滚。你用两只手去堵，倒把它按进了自己的鞋里。",source:"household"},
    {minAge:4,maxAge:6,title:"小碟边上漏了一瓣",text:"去普埃布拉城里亲戚家吃饭，你捧着一只手绘的塔拉韦拉小碟，把边上的花瓣挨个数了三遍。亲戚把碟转了小半圈，指指你的拇指。一直没数到的那瓣在底下。",source:"talavera",requires:urban},
    {minAge:5,maxAge:8,title:"坐稳的那一头",text:"邻居要往镇上带一筐东西，问你能不能帮忙试试提手。空筐拎起来挺神气，东西装好你就提不动了。大人给你留了最轻的一包，还请你自己挑一边走。",source:"household",requires:rural},
    {minAge:7,maxAge:10,title:"谁先写上名字",text:"老师把这一学年的免费课本发到桌上。你想把名字写得工整，迟迟不敢落笔。同桌早写好了，悄悄把一本旧本子推过来，让你在空白处多练两遍。",source:"schoolbooks",fromYear:1961},
    {minAge:10,maxAge:13,title:"瓷砖背面的一道线",text:"去普埃布拉城里取一小包补墙的瓷砖，作坊的人把相邻的两块翻过来，在背面画了一道相接的线。你试着调换它们的位置，正面的叶尖一下就接不到叶柄上了。",source:"talavera",requires:urban},
    {minAge:12,maxAge:17,title:"收音机要朝哪边",text:"北部山区的亲戚家正收听库埃察兰的「山区之声」。你才挪动收音机，歌声就埋进了沙沙声里。亲戚把你的手和收音机一起轻轻转回来；你听见最后一个音，两个人才同时松手。",source:"radio",requires:rural,fromYear:1995},
    {minAge:18,maxAge:24,title:"零钱盒底下的车票",text:"一周的车钱放在盒子里，今天回家却发现盒底多了一张折得方方正正的票。搭过早班车的家人想告诉晚班的人车费变了；盒子转了一圈，每个人都把那张票折回原样。",source:"household",requires:urban},
    {minAge:20,maxAge:25,title:"伞沿下的一席干地",text:"星期天你到库埃察兰赶集，跟相熟的摊主挤在一把伞下避雨。摊主先把你的篮子往里挪，又把一只空筐倒扣在湿地上。你这才明白，刚腾出来的干座是给你坐的。",source:"market",requires:rural,fromYear:2010},
    {minAge:28,maxAge:33,title:"纸袋里的两只杯把",text:"你替街坊从城里作坊领回两只塔拉韦拉杯。纸里一只杯把朝左、一只朝右。画花的人说，订货的那两位有个习惯，碰杯的时候总坐在桌子的同一边。",source:"talavera",requires:urban},
    {minAge:31,maxAge:36,title:"被划掉的半小时",text:"家里几个人都愿意陪一位年长的亲友出门，可人人以为回程有人接。你把往返的时间各写一行，安安静静地等大家填完；亲友最后拿过笔，把出门时间改晚半小时，说自己也想睡个好觉。",source:"time"},
    {minAge:35,maxAge:40,title:"盖子底下还很清",text:"你在州府留宿的那个晚上，当地发了落灰提醒。主人先盖好院里的储水桶，再收晾着的衣服。第二天打开桶盖，外面一层细灰，里面的水照见你俩探过来的脸。",source:"ash",requires:urban,fromYear:2020},
    {minAge:38,maxAge:44,title:"两道针脚中间",text:"今天要出门的鞋底裂了一道小口。修鞋人说不必整片换，让你坐下用手比一比哪里硌脚。你把旧鞋穿回去又走了两步，他在鞋底把那一处圈出来，这才动手。",source:"household"},
    {minAge:48,maxAge:55,title:"话音落下才动笔",text:"你在北部山区陪人听库埃察兰的本地电台。对方听到熟悉的地名便抬手示意，等那一句完整说完，才把地名念给你记。你把纸递回去，对方在旁边又写了一个家里一直在用的叫法。",source:"radio",requires:rural,fromYear:1995},
    {minAge:53,maxAge:61,title:"算到你这杯",text:"亲友拿着一周的开支表来问，明明没买什么，零钱怎么就不见了。你们把路上每人买过的饮料记进去，才想起其中两杯是你请的。一笔账算清，你又欠下了下回让对方请的约定。",source:"household"},
    {minAge:60,maxAge:69,title:"封面先认出了你",text:"一位年轻人打开免费教科书委员会的旧课本目录，替街坊查一本小学读物。对方没记住书名，翻到某一年的封面就把屏幕按住了。那个年过花甲的人把手指留在书上，说当年也是这样怕翻过头。",source:"bookarchive",fromYear:2020},
    {minAge:69,maxAge:84,title:"提手短的那只篮子",text:"见你要去买东西，邻人把两只空篮子并排给你选。你挑了提手短的那个，拎着不碰膝盖。回程对方想替你拿，你把重的一包递过去，自己的篮子还轻快地挽在胳膊上。",source:"household"},
    {minAge:75,maxAge:94,title:"杯沿小小的缺口",text:"收拾桌子的人捧着一只缺了口的普埃布拉彩陶杯，不敢往你这边看。你领着对方去摘院里剪下的一枝花。放到窗台上，那个小缺口恰好让枝条斜靠着。",source:"talavera"}
  ];

  const choices = [
    {age:13,id:"paper-cover",title:"这一张纸够包哪一本？",text:"邻居的小学生领回了免费课本。家里剩下一张厚纸，够把一本书从头包到尾，也能给几本书各补一个最容易卷起来的角。孩子要你帮忙，手里的剪刀一直没放下。",source:"schoolbooks",fromYear:1961,options:[
      {id:"cover-one",label:"让孩子挑一本，包整张封皮",note:"可以把最心爱的那本护好。",effects:{bond:2},follow:{after:2,title:"纸从里面翻开",text:"孩子把包得方方正正的书拿回来，翻开纸封的里侧给你看：上面写满了当年还不会拼、后来一个个学会的词。"}},
      {id:"corner-pieces",label:"裁成书角，让孩子自己动手",note:"几本都能补，贴起来要慢慢等。",effects:{knowledge:2},follow:{after:2,title:"柜子第三层的小信封",text:"那孩子拿出装着三角纸片的信封。你教的折法传到了同桌那里，如今班里有人抱来卷角的书，他们就各补一边。"}}
    ]},
    {age:27,id:"market-relief",title:"摊上腾出的一双手",text:"你到库埃察兰探望摆摊的亲友。星期日快收集了，对方从早到晚都没歇过。眼下还有顾客要结账，也还有满满一箱等着搬上回程的车；你只能帮完一头。",source:"market",fromYear:2010,options:[
      {id:"mind-stall",label:"留下接待顾客，请摊主去坐一会儿",note:"得现学哪种东西按份算、哪种按重量算。",effects:{bond:3},follow:{after:2,title:"价目纸上的小太阳",text:"你再到摊上，亲友指给你看一张画着小太阳的价目纸。自从你替过那回班，临时来照应的人都能照纸招呼客人；摊主总算肯坐下来喝完一杯。"}},
      {id:"carry-crates",label:"赶在车开前，和司机一起装箱",note:"摊主还要站一阵，收完摊就能空手上车。",effects:{knowledge:2,bond:1},follow:{after:2,title:"两短一长的绳头",text:"后来亲友接你赶同一班车，指了指车上捆好的箱子。你那天留了两根短绳和一根长绳，司机也照这个办法把各家的东西分开，卸错箱的事少了。"}}
    ]},
    {age:46,id:"turns-at-home",title:"空出来的究竟是哪一段？",text:"一家人凑时间照顾正在休养的亲友。一个人白天方便，却老碰上临时换班；另一个人可以坚持每周来一次，但路远。亲友最烦每回刚睡着，就有人推门问要不要帮忙。",source:"time",category:"family",options:[
      {id:"a-fixed-day",label:"先定一个固定的下午，其他时间另约",note:"留下一段安稳的时间，零碎差事得有人另外接。",effects:{bond:2},follow:{after:2,title:"下午那扇关着的门",text:"两年后亲友早已能自己出门。你依约来坐坐，才知道那个下午还被保留着，有人想上门便提前约；今天门没开，是因为房主人出去听音乐了。"}},
      {id:"choose-the-tasks",label:"把差事分开，请本人挑什么时候见人",note:"大家可以顺路分担，要多花工夫彼此交代。",effects:{knowledge:2,bond:1},follow:{after:2,title:"用铅笔写的名字",text:"另一个邻人需要帮忙，亲友把你们当初分过的差事写给对方，特意把每个名字都写成铅笔字：今天做不了就换个人，已经帮了忙的人也可以改主意。"}}
    ]},
    {age:52,id:"crooked-flower",title:"一道歪了的花边",text:"普埃布拉城里一位做彩陶的朋友给你看两块烧好的样砖，一块整齐，一块的叶尖歪出去一点。一个初学的年轻人想留下东西练手，朋友也想把这点失误留给后来的人看。",source:"talavera",requires:urban,options:[
      {id:"lend-sample",label:"商量把样砖借出去，约好送回的日子",note:"年轻人能慢慢看，作坊要等一段时间才有样品。",effects:{bond:2},follow:{after:3,title:"歪叶子回到墙上",text:"你去那间作坊，歪叶子的样砖旁多了另一块。原先来借砖的人把自己的练习也带回来，说第二次烧好才知道，两块都留着才能看出手稳了多少。"}},
      {id:"draw-at-bench",label:"把样砖留在作坊，腾个位置一起临摹",note:"今天得多留一会儿，以后过路的人也能看。",effects:{knowledge:3},follow:{after:3,title:"手腕该抬多高",text:"路过作坊，小桌前已经坐着另一个初学者。上回来临摹的年轻人正给他挪凳子：离桌沿近一点，手腕就不容易悬空。歪叶子的样砖还摆在那里。"}}
    ]},
    {age:67,id:"two-ways-home",title:"这趟路，怎样交给别人？",text:"住在另一镇的一位亲友，想学会独自去你的住处。你们可以搭车一起走一遍，可那样就赶不上早早约好的午饭；也可以把他最拿不准的岔路画下来，让他下次试。",source:"household",options:[
      {id:"ride-along",label:"跟亲友走一遍，请他来认下车的地方",note:"今天少见个人，路上可以随时停下来问。",effects:{bond:2},follow:{after:2,title:"等在你下车的那一边",text:"这次换你走一条陌生路线。那位亲友已经站在你该下车的一边，等你自己认出来才挥手。问他怎么不早一点招呼，他说当年有人就是这么陪他的。"}},
      {id:"draw-crossing",label:"画下两个容易认错的岔路，照常去吃饭",note:"保住两边的约，临时改道时得另找人询问。",effects:{knowledge:2},follow:{after:2,title:"纸背多了一条回程路",text:"亲友把用过的路线纸给你看。背面画着返程时看见的样子：来时招牌朝着人，回去只看得见一块木板。他让你把这一面也留给下一个来的人。"}}
    ]}
  ];
  globalThis.CountryStories.register("MEX",{
    sources,
    scenes:scenes.map(scene=>({...scene,setting:"puebla"})),
    choices:choices.map(choice=>({...choice,setting:"puebla"}))
  });
})();
