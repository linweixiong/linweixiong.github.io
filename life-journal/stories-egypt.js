/* 埃及。资料记录生活背景，人物、对话、数值与延迟结局为原创游戏情节。 */
(() => {
  "use strict";

  const sources = [
    { id: "birth", label: "联合国儿童基金会埃及办公室 · 新生儿照护与出生证明", url: "https://www.unicef.org/egypt/newborn-baby-tips" },
    { id: "school", label: "联合国儿童基金会埃及办公室 · 社区学校与复式教学", url: "https://www.unicef.org/egypt/education" },
    { id: "secondary", label: "埃及教育和技术教育部 · 九年级考试及各省普通高中入学分数要求", url: "https://moe.gov.eg/media/ekfp2puv/strategic_plan_en.pdf" },
    { id: "further", label: "联合国教科文组织国际职业技术教育与培训中心 · 埃及在职人员职业培训", url: "https://connect.unevoc.unesco.org/home/Dynamic%2BTVET%2BCountry%2BProfiles/country%3DEGY?section=section-2-2" },
    { id: "library", label: "亚历山大图书馆 · 儿童馆的故事活动与外展服务", url: "https://www.bibalex.org/libraries/presentation/static/13150.aspx" },
    { id: "metro", label: "开罗地铁运营机构 · 一号线及分段开通日期", url: "https://www.cairometro.gov.eg/en/operations/1" },
    { id: "water", label: "世界银行 · 尼罗河三角洲的田间灌溉改造", url: "https://www.worldbank.org/en/results/2020/04/01/modernizing-irrigation-improved-water-security-for-farmers-in-egypt" },
    { id: "bread", label: "世界银行 · 埃及巴拉迪面包补贴与智能卡改革", url: "https://documents.worldbank.org/curated/en/617221555617293604/pdf/Impact-of-Fiscal-Policy-on-Inequality-and-Poverty-in-the-Arab-Republic-of-Egypt.pdf" },
    { id: "training", label: "国际劳工组织 · 埃及双元职业教育与岗位训练", url: "https://www.ilo.org/resource/article/ilo-accel-africa-supports-improved-apprenticeship-dual-education-system" },
    { id: "puppet", label: "联合国教科文组织 · 埃及阿拉戈兹手偶戏", url: "https://ich.unesco.org/en/USL/traditional-hand-puppetry-01376" },
    { id: "food", label: "联合国教科文组织 · 埃及科沙里饭及其日常习俗", url: "https://ich.unesco.org/en/RL/koshari-everyday-dish-and-associated-practices-02278" },
    { id: "weave", label: "联合国教科文组织 · 上埃及的手工织造", url: "https://ich.unesco.org/en/USL/handmade-weaving-in-upper-egypt-sa-eed-01605" },
    { id: "palm", label: "联合国教科文组织 · 椰枣树的栽培与棕叶手艺", url: "https://ich.unesco.org/en/RL/date-palm-knowledge-skills-traditions-and-practices-01902" },
    { id: "music", label: "联合国教科文组织 · 苏伊士运河地区的塞姆塞米亚琴", url: "https://ich.unesco.org/en/RL/semsemiah-instrument-crafting-and-playing-02119" }
  ];

  function scene(minAge, maxAge, source, title, text, conditions = {}) {
    return { minAge, maxAge, source, title, text, ...conditions };
  }
  function option(id, label, note, effects, after, title, text) {
    return { id, label, note, effects, follow: { after, title, text } };
  }

  const scenes = [
    scene(0, 0, "birth", "写在纸上才放心", "家人把你抱去办出生证明。你的名字已经在家里叫过好多回，真看见写在纸上的那一刻，抱你的人还是一字一字地指着读了两遍。", { fromYear: 2019, toYear: 2026 }),
    scene(0, 1, "palm", "门口的一只棕叶篮", "来探望你的人把带来的椰枣放在桌上。你紧紧抓住装枣的棕叶篮提手，大人只好等你睡着才把篮子挪开。"),
    scene(2, 5, "food", "最后一撮脆洋葱", "家里在分科沙里饭。你盯着米饭和扁豆上的脆洋葱，每分一碗就替人看还剩多少。轮到你，掌勺的人把压在勺背上的最后几片也轻轻敲了下来。"),
    scene(5, 10, "puppet", "它听见我了", "阿拉戈兹手偶刚把脸转过去，你在小戏台前插了一句嘴。台边的搭档朝幕里复述了一遍，手偶猛地回头。回去的路上，你还在琢磨它究竟怎样听见你。"),
    scene(6, 11, "school", "同一间教室，两道题", "你去找村里一个朋友，对方的社区学校还没下课。小些的孩子在数瓶盖，大些的正好用同一堆瓶盖讲乘法。你在门边等着，也跟着算出一个答案。", { fromYear: 2017, requires: { residence: "rural" } }),
    scene(7, 11, "library", "故事讲到一半", "去亚历山大探亲时，你赶上图书馆儿童馆办的一场讲故事活动。讲到一半，老师让大家猜结尾。你身边那个孩子猜得和你正相反，散场后你们索性又编了第三种。", { fromYear: 2010, requires: { residence: "urban" } }),
    scene(9, 15, "palm", "篮沿为什么不松", "赶集时，你看见一位手艺人正在收棕叶篮的边。对方留出一截给你摸，你才发现，外面看着平整，里面还压着前一条叶梢。", { requires: { residence: "rural" } }),
    scene(13, 22, "music", "掌声该落在哪一拍", "一支从苏伊士运河地区来的乐队带来一把塞姆塞米亚琴，几根木杆撑起三角形的琴架。你跟着拍手，总抢在乐手前头。等你终于跟对了，旁边的人也松了口气。"),
    scene(14, 23, "training", "同一本笔记的两面", "朋友正在读埃及的双元职业学校，一本笔记从前面抄课堂上的要点，翻过来又从后面记在企业实训时碰到的问题。两边终于快写到一起，朋友约你去挑一本新的。", { fromYear: 2022 }),
    scene(16, 24, "metro", "向南还是向北", "到开罗办事，要从拉姆西斯一带搭一号线去南边的赫勒万。你在纸上画好了好几个站名，上车前反而只用上了最简单的一笔：朝哪边走的箭头。", { fromYear: 1988, requires: { residence: "urban" } }),
    scene(17, 26, "weave", "布头上那道斜线", "看一位从上埃及来的织工演示时，你把两块布样摞在一起，以为花样走歪了。对方把经线一根根拨给你看：布边稍松一点，下面几行就会悄悄变样。", { requires: { route: "study" } }),
    scene(20, 45, "food", "午休时的两只碗", "和工友去摊前买科沙里饭，你伸手要把蒜醋汁倒进两只碗，对方赶紧把自己的往回拉。后来你们轮流捎午饭，叫不出彼此姓氏的摊主倒先记住了谁爱加醋。", { requires: { jobStatus: ["employed", "partTime"] } }),
    scene(24, 58, "water", "先看看渠尾", "在一次农业同行交流中，有人带来尼罗河三角洲灌渠两端的记录。渠头已经能用水时，末端那栏还是空白。你把两张纸并排摊开，先听坐在末端的人说完。", { fromYear: 2015, requires: { jobSector: "land", jobStatus: ["employed", "partTime"] } }),
    scene(26, 61, "weave", "工钱该从哪一步算", "来自上埃及的一位织工请你看一块新布。你问织了几天，对方没有立刻回答，而是先数起上机前整理、穿好经线所花的时间。你把原来随口报的日数划掉了。", { requires: { jobSector: "craft", jobStatus: ["employed", "partTime"] } }),
    scene(32, 63, "metro", "写给来开罗的人", "一个头回来开罗的人，问你赫勒万方向的一号线怎么走。你在纸上写了站名，又把对方领到能看清线路图的地方。这才想起来，纸还一直在自己手里。", { fromYear: 1988, requires: { residence: "urban" } }),
    scene(22, 79, "bread", "拿面包的那一双手", "你陪邻居去面包房，邻居掏出自家的智能卡买补贴的巴拉迪面包。柜台窄，端面包就顾不上收卡。你腾出手替对方托着刚出炉的圆饼，一路小心别把它们压扁。", { fromYear: 2015, toYear: 2026 }),
    scene(40, 72, "palm", "补一截提手", "一只用了多年的棕叶篮，篮身还好，提手先松了。摊上的人找来颜色浅些的叶条给你补。提起来试试，你决定留下这截颜色不同的地方。"),
    scene(55, 84, "music", "往后错半拍", "街坊聚会放起一段苏伊士运河地区的塞姆塞米亚琴曲。有人听过另一种弹法，示意大家把末尾那一下掌声往后挪。小小一间屋子，为这半拍热闹了好一阵。"),
    scene(60, 95, "food", "把醋另盛", "约了几个人吃科沙里饭，有人爱辣，有人只想吃洋葱，你干脆把蒜醋和辣汁另盛。吃到最后，桌上剩下好几只小碗，倒是谁都没忘记招呼身边的人。"),
    scene(68, 99, "puppet", "现在轮到台边的人了", "一场阿拉戈兹手偶戏散了，你和刚认识的人说起哪个包袱最好。对方最喜欢手偶那句回话，你却只记得台边的搭档怎样静候人群安静。两个人又从头比划了一遍。")
  ];

  const choices = [
    {
      age: 10, id: "puppet-front-row", title: "小戏台前只有一个好位置", source: "puppet",
      text: "阿拉戈兹的便携戏台搭好了。站正前方可以接台边搭档抛来的话；挪到侧面，也许能看明白那只小手偶怎样转身。开场前只够你挑一处。",
      options: [
        option("answer", "站前面替大家接一句", "要当众开口，也少看几眼手偶的动作。", { bond: 2, happiness: 1 }, 2, "听众什么时候想开口", "后来讲笑话，你看见旁边的人张嘴，就停了半拍。对方接的那句比你准备的包袱还好。"),
        option("watch", "让出前排，去侧面看", "错过和搭档对话的机会，仔细看一段表演。", { knowledge: 2 }, 2, "袜子也能转头", "你把一只旧袜子套在手上，照着那天看到的停顿转动手腕。明明没有五官，旁边的人却说它像在偷听。")
      ]
    },
    {
      age: 14, id: "secondary-path", title: "九年级结束前的两个下午", source: "secondary", category: "education", fromYear: 2021,
      text: "普通预备学校的老师讲到，九年级毕业考试关系到接下来能进普通高中还是技术中学，普高分数要求因省份和年份而异。你约了同学一起复习，家里也找到一位技术中学的在读生，愿意带你看实践课、走一趟上学的路。两边只在同样的两个下午有空。",
      options: [
        option("exam-prep", "争取普通高中，留下来复习", "把两个下午留给薄弱科目。原来答应帮家里做的事要请人顶一顶。", { knowledge: 3, bond: -1 }, 2, "那本改过两遍的习题", "十六岁再和家人谈读书还是先工作，你把那本习题翻到折角处。你能说清楚自己愿意继续读哪一门，也记得是谁替你空出了那些下午。"),
        option("technical-visit", "探访技术中学，算一算通勤", "从家门走到学校看看，把实践课、换车时间和家里的安排摆在一起。来回花费最多30记账单位。", { cash: -30, knowledge: 1, bond: 2 }, 2, "书桌上的往返路线", "十六岁谈到下一步，你拿出当年写的路线。家人原先只问一趟车要多少钱，这回又问起几点到家；你也能讲出实践课上哪件事让自己舍不得走。")
      ]
    },
    {
      age: 27, id: "two-notebooks", title: "实训生要交的那张纸", source: "training", fromYear: 2022,
      requires: { jobSector: ["tech", "craft"], jobStatus: "employed" },
      text: "来单位做双元职业教育实训的年轻人把练习单拿给你看。上面步骤都写对了，真正做起来却卡在中间。快交班了，你能陪对方重新做一次，或者一起把卡住的地方写清楚，留到下一次上课问。",
      options: [
        option("try", "收起练习单，一起重新做一回", "多花一点体力，让对方有机会亲手发现卡住的地方。", { bond: 2, health: -1 }, 1, "请你等等再说答案", "一位新人遇到难题，刚想让你直接代劳，你把位置腾出来，看着对方自己试了一遍。手指停下来的地方，和纸上圈的完全不同。"),
        option("describe", "把实操时的差别写进练习单", "保住交班时间，练习把问题说清楚。", { knowledge: 2 }, 2, "交班单上的一句追问", "后来你改写交班记录，在步骤旁留出一格，专门写实际遇到的不同之处。接班的人照着那一格，少走了一趟来回。")
      ]
    },
    {
      age: 31, id: "training-or-care", title: "下班后还要转一趟车", source: "further", category: "career", fromYear: 2022,
      requires: { jobStatus: ["employed", "partTime"] },
      text: "你问到一门面向在职人员的职业培训短课，课上练的正是最近工作里碰到的难题。培训中心在邻镇，两次上课都得换班、转车。你本来已经答应，那两个傍晚陪一位亲近的人去复诊。",
      options: [
        option("attend", "请人代陪，换班去上短课", "花最多150记账单位安排路费和交接，争取动手练习的机会。", { cash: -150, knowledge: 3, happiness: -1 }, 2, "那张折小的讲义", "一个熟人问起你遇过的那道工作难题。你从本子里抽出折成四折的讲义，用背面的例子演示了一遍。晚些时候，你也给当年替你跑腿的人捎了个口信。"),
        option("accompany", "保留班次，照约陪对方复诊", "留下这笔开销和熟悉的班次。这期短课得让过去，问题先记在本子上。", { bond: 3, happiness: 1 }, 1, "路口不必再打听", "后来对方独自复诊，回来把当初你手绘的转车路线还给你，说最有用的是你圈出的那个路口。你翻过纸，背后还记着没去成的那门课。")
      ]
    },
    {
      age: 46, id: "irrigation-notes", title: "同一条渠的两本记录", source: "water", fromYear: 2020,
      requires: { jobId: ["grower", "orchard", "irrigation", "nursery"], jobStatus: ["employed", "partTime"] },
      text: "农业同行带来尼罗河三角洲一处灌溉改造的记录。有人想听渠尾种植者讲等水的时间，也有人想把泵站设备更换前后的开支理清楚。两边同时开始讨论。",
      options: [
        option("field", "和渠尾用水的人聊一组", "记下等待给日常工作带来的麻烦，先放下设备账本。", { bond: 2, knowledge: 1 }, 2, "把最后一行也填上", "再有人拿整片地的平均数来说明情况，你会多问一句：最后一户是什么时候开始用水的？有个原本沉默的人把手举了起来。"),
        option("figures", "留下来核对泵站开支", "把精力用在设备账上，这次听不到另一组的口述。", { knowledge: 3 }, 1, "两栏费用", "后来讨论换设备，你拿出一张分了两栏的纸，把买机器的钱和往后使用的钱分别写开。同桌的人终于看明白争的是哪一笔。")
      ]
    },
    {
      age: 60, id: "canal-song", title: "散场前还能留一小会儿", source: "music",
      text: "一位来自苏伊士运河地区的乐手收起塞姆塞米亚琴。你想记住刚才的乐句，也想听他讲那把用旧木料做的琴。来接他的人已经到了，只够细问一件事。",
      options: [
        option("tune", "请他再哼一遍末句", "先用耳朵记曲调，来不及细看琴身。", { happiness: 2, bond: 1 }, 2, "少掉的一个音", "两年后你哼起那段旋律，末句卡了一下。当时也在场的人替你接上，两个人一路哼到各自的门前。"),
        option("frame", "请他翻过琴来讲讲木架", "看清三根木杆如何相接，把学曲子留到以后。", { knowledge: 2, happiness: 1 }, 3, "画纸上的三角形", "帮人整理一张乐器草图时，你画了三条相接的线，还特意用手比了比大小。隔了几年，那位乐手拿琴的样子仍在眼前。")
      ]
    }
  ];

  globalThis.CountryStories.register("EGY", { sources, scenes, choices });
})();
