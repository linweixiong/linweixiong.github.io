/* Source records document the setting. The people, dialogue and consequences are fictional. */
(() => {
  "use strict";
  const stories = globalThis.CountryStories;
  const urban = {residence:"urban"};
  const rural = {residence:"rural"};
  const source = (id,label,url) => ({id,label,url});
  const scene = (id,minAge,maxAge,title,text,source,conditions={}) =>
    ({id,minAge,maxAge,title,text,source,...conditions});
  const choice = (age,id,title,text,source,options,conditions={}) =>
    ({age,id,title,text,source,options,...conditions});
  const option = (id,label,note,effects,after,title,text) =>
    ({id,label,note,effects,follow:{after,title,text}});

  stories.register("IND", {
    sources:[
      source("ind-air","印度公共广播机构 · 全印广播电台的地区语言新闻史","https://prasarbharati.gov.in/en/air-news/"),
      source("ind-metal","旁遮普邦阿姆利则区政府 · 詹迪亚拉古鲁的黄铜和红铜器皿","https://amritsar.nic.in/handicraft/"),
      source("ind-rail","印度铁路 · 客运铁路的起点与发展","https://indianrailways.gov.in/Indian%20Railways%20Whistling%20Ahead-%20%20Story%20of%20Growth%20and%20Modernisation-Booklet.pdf"),
      source("ind-post","印度通信部 · 自1972年起使用的六位邮政编码","https://www.pib.gov.in/PressReleasePage.aspx?PRID=2131707"),
      source("ind-garden","印度学校教育与扫盲部 · 学校营养菜园指导文件","https://pmposhan.education.gov.in/guideline.html"),
      source("ind-water","印度政府新闻局 · 农村饮用水项目与村级用水规划","https://www.pib.gov.in/FactsheetDetails.aspx?Id=148561&lang=2&reg=3")
    ],
    scenes:[
      scene("ind-brass-rim",1,6,"碗沿的月牙","来做客的人带来一只旁遮普工匠打的黄铜碗。大人转动碗口，墙上的亮斑就跟着跑。你的手掌摊在墙上，终于捉住了一小块光。","ind-metal"),
      scene("ind-bulletin",5,11,"两次听到同一个地名","小店的收音机先后传出两种语言的新闻。你没能跟上第二段，却听出了刚才那个地名。店主抽出一张包货的纸，在角上写给你看。","ind-air",{fromYear:1955,toYear:2026,requires:urban}),
      scene("ind-garden-label",7,14,"一排空的小木牌","附近学校的菜园开放半天。孩子们在木牌上写菜名，你画了一片叶子。掌勺的人过来认菜，先指中了你画的那一排。","ind-garden",{fromYear:2019,toYear:2026}),
      scene("ind-envelope",10,19,"模糊的第六个数字","旧信封上的六位印度邮编有一位被雨晕开。你把信封放到一摞来信旁边，从同一笔斜斜的收尾认出了那个数字。信纸已经不在了，写字的人却像又来过。","ind-post",{fromYear:1973}),
      scene("ind-water-map",16,33,"村图上差了一条小路","村里讨论饮用水的事，一张手画的取水点地图压在桌上。你顺手添了通往最后几户的小路。有人把纸转了半圈，说从自家门口看，这下方向才对。","ind-water",{fromYear:2019,toYear:2026,requires:rural}),
      scene("ind-history-rail",20,42,"从孟买到塔那","和朋友等火车时，你们看见一幅印度早期铁路的图。第一班客车从孟买开到塔那。朋友在图边用手丈量，笑说自己小时候以为它第一天就穿过了半个国家。","ind-rail",{requires:urban}),
      scene("ind-copper-handle",30,52,"摊位上一串敲痕","手工艺展上，一个来自詹迪亚拉古鲁的摊位摆着红铜器皿。你问一圈细细的凹痕是不是装饰。摊主把器皿翻过来，让你沿着敲出来的弧面摸过去。","ind-metal"),
      scene("ind-address-book",36,64,"地址簿上多出的一格","村里有人整理多年前寄来的信。最早一批地址没留邮编的位置，后来那一批却挤着六个数。你把两封翻过去看，寄信人画的小花从来没换过。","ind-post",{fromYear:1980,requires:rural}),
      scene("ind-broadcast-voice",48,73,"播音员停顿的地方","一次老广播重听会上，你听见熟悉的地区语言新闻。有人记住了那天的消息，你记住的却是播音员吸气的地方。坐在旁边的人也在同一拍停了下来。","ind-air",{fromYear:1970}),
      scene("ind-platform",61,91,"站台的两端","陪朋友等车，你们把当年错过火车的往事又讲了一遍。你记得自己在站牌旁奔跑，对方却记得站台另一头有人一直替你拎着袋子。这是你第一次听到另一头的故事。","ind-rail")
    ],
    choices:[
      choice(10,"ind-radio-game","新闻结束前的一张纸","伙伴找来一段印度地区语言广播的旧录音，约你把它做成游戏。你们只有一张大纸，画地图和写对白都要占地方。","ind-air",[
        option("map","把听到的地名连成地图","先学会辨认地方，来不及排练对话。",{knowledge:3,happiness:-1},3,"地图上的折痕","伙伴带来一封外地来信。信上那个陌生地名，竟在你们折了好几遍的那张纸上。你这才知道当初那条线通到了哪里。"),
        option("voices","各学一句，轮流当播音员","两个人都能开口，许多地名只能略过。",{bond:3,happiness:1},2,"差半拍的搭档","那位伙伴在人群里学起当年的开场白，故意差半拍。你从另一头接了下半句，两个人都忍不住笑出声。")
      ],{fromYear:1960}),
      choice(27,"ind-rail-visit","多换一趟车吗","一位久未见面的朋友住在铁路沿线。你本来可以买直达车票，换一趟车就有时间见面，却会多花车钱，抵达时也晚。朋友回信说，都可以。","ind-rail",[
        option("visit","留半天换车，去见面","多花车钱，能在站边坐下来谈一次。",{cash:-80,bond:4},3,"车站茶摊的一张合影","朋友寄来那天换车时拍的照片。你这才发现，两人的杯子早就空了，谁都舍不得起身赶路。"),
        option("direct","按原计划走，写封长信","按时抵达，把没说完的话慢慢写清。",{knowledge:2,happiness:1},2,"留在信封里的车票","朋友把你的信读了好几回，又在回信里夹了一张当地的旧车票。你们开始交换各自窗外的景色。")
      ]),
      choice(60,"ind-bowl-loan","柜门里的黄铜碗","家里保留着一只詹迪亚拉古鲁的黄铜碗。社区要办一场讲日用器皿的展览，想借它一季。熟悉它的人有的想让邻居看看，有的舍不得把饭桌上的位置空出来。","ind-metal",[
        option("lend","借出碗，亲手写说明","让更多人听见这段来历，暂时少一件常用的器皿。",{knowledge:3,bond:-1},2,"写在说明纸背面","展览的说明纸还给了你。纸背有一位观众轻轻写的几个字，说自己终于知道外祖家那只碗为什么留着锤痕。"),
        option("table","留在饭桌，约人来家里看","保留日常的用法，能邀请的人要少得多。",{bond:3,happiness:1},3,"轮到客人盛第一勺","一位当年受邀的邻居又来了。这回没人介绍铜碗，他却知道该把碗搁在谁的手边。")
      ])
    ]
  });

  stories.register("BRA", {
    sources:[
      source("bra-verse","巴西国家历史艺术遗产局（IPHAN）· Cordel 民间诗册与公开朗读","https://www.gov.br/iphan/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/banco-de-pareceres/registros/literatura-de-cordel.pdf/@@display-file/file"),
      source("bra-roda","巴西国家历史艺术遗产局（IPHAN）· 卡波耶拉活动圈","https://bcr.iphan.gov.br/bens-culturais/roda-de-capoeira/"),
      source("bra-market","圣保罗市政府 · 街区露天市场百年史","https://prefeitura.sp.gov.br/w/noticia/cem-anos-das-feiras-livres-e-comemorado-no"),
      source("bra-school","巴西国家教育发展基金（FNDE）· 家庭农业与学校餐食采购","https://www.gov.br/fnde/pt-br/acesso-a-informacao/acoes-e-programas/programas/pnae/agricultura-familiar-pnae"),
      source("bra-alert","巴西政府公共服务平台 · 按邮编登记民防天气及灾害预警","https://www.gov.br/pt-br/servicos/solicitar-cadastro-para-recebimento-de-avisos-e-alertas-de-desastres"),
      source("bra-family-health","巴西应用经济研究所（IPEA）· 家庭健康策略的历史与社区团队","https://catalogo.ipea.gov.br/politica/1417/estrategia-saude-da-familia")
    ],
    scenes:[
      scene("bra-instrument",1,6,"圈外的小听众","卡波耶拉活动围成一个圈。弓形的贝林包琴响起，你先看见大人们的肩膀跟着晃，才听出那两下长长短短的音。回去的路上，你还在膝头轻轻拍。","bra-roda"),
      scene("bra-verse-end",6,13,"小册子没翻页","集上有人朗读一本叫 cordel 的巴西民间诗册。讲到最紧张的地方，他按住纸角，等周围的人猜最后的韵脚。你猜错了，却比猜对的人笑得还响。","bra-verse"),
      scene("bra-farm-crates",8,17,"箱边的粉笔字","在乡间集货点，你看见两摞蔬菜箱。一摞写着集市，另一摞写着一所公立学校的名字。送菜的人告诉你，这些箱子要分开点数，你便把压住字的叶子挪开了。","bra-school",{fromYear:2010,toYear:2026,requires:rural}),
      scene("bra-market-photo",12,29,"相片里的露天市场","城市里的一场小展览摆出圣保罗街市的老相片。你原在找最眼熟的菜，旁边的人却一下认出了摊前歪着吃油炸馅饼的姿势。照片里那人拿的纸袋和他手里的一模一样。","bra-market",{requires:urban}),
      scene("bra-storm-code",18,43,"纸上写了两个邮编","你和一位朋友在城市社区活动室登记民防短信。你填住处的邮编，对方又记下经常去照应亲人的那个。你们原以为住得不远，摊开地图才发现相隔好几条街区。","bra-alert",{fromYear:2021,toYear:2026,requires:urban}),
      scene("bra-shelf",22,47,"诗册的书脊朝哪边","图书室收来一摞薄薄的 cordel 诗册。挤在厚书之间，根本看不见。你帮忙把其中几本封面朝外，刚搬完椅子，已经有人站到架子前读出了声。","bra-verse"),
      scene("bra-lane",28,58,"路口的旧称呼","在乡间，一位社区卫生工作者来打听一个路口。地图上的名称和邻里日常用的不同。你在纸背画了两棵树，他看懂了，把两个名字并排写了下来。","bra-family-health",{fromYear:1995,toYear:2026,requires:rural}),
      scene("bra-circle-song",35,63,"合唱从哪一个字进","卡波耶拉圈边，熟悉曲子的人正在教新来的听众接唱。你把第一句唱得太早，旁边的人没有打断，只在下一轮用手掌点了个拍。这回两个人同时进了歌。","bra-roda"),
      scene("bra-market-map",51,77,"一张不标街名的地图","一位早年住过圣保罗的邻居凭记忆画街市的位置。图上没有街名，倒有一行「卖油炸馅饼的人」。你以为这不够精确，另一位老街坊却一眼就找到了拐角。","bra-market"),
      scene("bra-verse-margin",62,92,"页边的另一个结尾","一本读了多年的 cordel 诗册从朋友家转回来。页角有铅笔添的另一种结尾。你把印刷的和手写的各念一遍，发现两种都押韵，便把铅笔留在了旁边。","bra-verse")
    ],
    choices:[
      choice(10,"bra-share-verse","只能借一个下午","邻居借给你一本 cordel 小诗册，吃晚饭前要还。你可以把喜欢的一节慢慢抄下来，也可以现在就拉朋友来听，大家一起猜下一个韵脚。","bra-verse",[
        option("copy","抄下最喜欢的一节","有时间琢磨押韵，只能独自读这一次。",{knowledge:3,happiness:-1},3,"一张折成四方的纸","你从一本旧书里抖出那张抄诗纸。以前怎么也念不顺的一行，现在一口气就读到了底；笔迹比记忆里大得多。"),
        option("read","拉朋友来轮流念","一起读完，却留不下完整的文字。",{bond:3,happiness:1},2,"记忆里拼出来的韵脚","朋友还记得开头，你记得中段。你们把当年的诗接起来，结尾各唱了一种，谁都舍不得改。")
      ]),
      choice(27,"bra-pack-list","一车菜，两份交货单","乡间一个给公立学校供货的小组要整理明天的蔬菜。你答应来帮半天。负责点箱的人想找搭手，另一边有人第一次跟车，也盼你陪着认路。","bra-school",[
        option("count","留下核对箱子和交货单","熟悉交接细节，没法陪新手跑这一趟。",{knowledge:3,bond:-1},2,"一栏留给空箱","小组后来重做交货单，把当年你反复问起的空箱单独留了一栏。你再次来帮忙，隔着老远就看明白了。"),
        option("ride","同行，帮新手记卸货口","在路上结识搭档，回来时已错过整理单据。",{bond:3,health:-1},3,"有人替你叫住了车","你又来送一张迟到的单子。那位同行过的搭档远远认出你，把就要离开的车喊停，仍习惯把靠窗的位置让出来。")
      ],{fromYear:2010,toYear:2026,requires:rural}),
      choice(46,"bra-circle-role","圈里还有两个空位","卡波耶拉小组约你帮忙办一场邻里活动。组织者想让你练熟应答唱段，好带大家接歌；刚搬来的几位邻居又约你先在门口等他们一起进去。两件事都得提前到。","bra-roda",[
        option("chorus","早些去排练应答唱段","学会听领唱给的信号，新邻居要自己找路。",{knowledge:3,happiness:1},2,"领唱停了一拍","下一回聚会，领唱在熟悉的小节停下来。你接住了那句，身后生疏的声音也跟了上来。"),
        option("welcome","守在入口等第一次来的人","省下别人进门时的踌躇，少一次排练机会。",{bond:4,happiness:-1},3,"入口处有人挥手","当年在门口和你碰面的邻居这次比你到得早。他也带着两位新人，隔着人群朝你举起手。")
      ])
    ]
  });
})();
