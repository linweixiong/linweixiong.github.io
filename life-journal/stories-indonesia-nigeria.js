// 资料支持场景中的器物、技艺或当地服务。人物、对白、取舍及后续为游戏原创。
(() => {
  "use strict";

  globalThis.CountryStories.register("IDN", {
    sources: [
      {id:"idn-posyandu", label:"印度尼西亚卫生部 · Posyandu 社区保健点的称重和生长记录", url:"https://ayosehat.kemkes.go.id/manfaat-penimbangan-balita-di-posyandu"},
      {id:"idn-angklung", label:"联合国教科文组织 · 印度尼西亚昂格隆竹乐器", url:"https://ich.unesco.org/en/RL/indonesian-angklung-00393"},
      {id:"idn-batik", label:"联合国教科文组织 · 印度尼西亚蜡染", url:"https://ich.unesco.org/en/RL/indonesian-batik-00170"},
      {id:"idn-school", label:"联合国教科文组织 · 北加浪岸蜡染博物馆的学生教学项目", url:"https://ich.unesco.org/en/BSP/education-and-training-in-indonesian-batik-intangible-cultural-heritage-for-elementary-junior-senior-vocational-school-and-polytechnic-students-in-collaboration-with-the-batik-museum-in-pekalongan-00318"},
      {id:"idn-pay", label:"印度尼西亚银行 · QRIS 商户收款码", url:"https://www.bi.go.id/id/fungsi-utama/sistem-pembayaran/ritel/kanal-layanan/qris/default.aspx"},
      {id:"idn-rain", label:"印度尼西亚气象、气候和地球物理局 · 气候田间学校量雨教材", url:"https://iklim.bmkg.go.id/SLI/resource/materiartikel/30?req=710741449"},
      {id:"idn-pinisi", label:"联合国教科文组织 · 南苏拉威西 Pinisi 造船技艺", url:"https://ich.unesco.org/en/decisions/12.COM/11.B.13"},
      {id:"idn-jamu", label:"联合国教科文组织 · Jamu 草本饮品的制作和传承", url:"https://ich.unesco.org/en/RL/jamu-wellness-culture-01972"}
    ],
    scenes: [
      {minAge:0,maxAge:2,title:"秤上那只脚",text:"家人抱你去附近的 Posyandu 社区保健点称重。志愿者才要读数，你就伸腿去找抱你的人。等你安静下来，她才把这回的数字标在生长记录卡上。",source:"idn-posyandu",fromYear:2024,toYear:2026},
      {minAge:0,maxAge:4,title:"花布底下的脸",text:"姑姑举起一方爪哇蜡染布，隔着布跟你说话。你盯住她眼睛刚才在的那朵花。布垂下来了，脸却从另一边探出来。",source:"idn-batik"},
      {minAge:4,maxAge:8,title:"竹筒接的下一声",text:"来做客的邻居带着两件昂格隆竹乐器。她摇一下手上的竹架，再示意你摇另一个。你等得太久，两个人刚拼出的短调中间多了个特别长的停顿。",source:"idn-angklung"},
      {minAge:7,maxAge:12,title:"把白线留到最后",text:"亲戚从北加浪岸寄来一小方蜡染练习布，说是参加博物馆和学校合作的课时做的。你找遍了彩色的地方，最后才看清小鱼的尾巴原来是那条没上色的弯线。",source:"idn-school",fromYear:2005},
      {minAge:11,maxAge:18,title:"先找摇错的人",text:"昂格隆排练时，总有一个音早半拍。带排练的人让大家各持竹架，听见自己的音才摇。重新走了一遍，你才听出抢先的是你身后那个朋友；朋友却一直以为是你。",source:"idn-angklung"},
      {minAge:16,maxAge:30,title:"柜台上那张小立牌",text:"在一家贴着 QRIS 收款码的小店，你替家人买线。店主把被线轴遮了半张的码移过来，你用手机扫完，两人各看了一眼收款金额，这才把线轴装进袋里。",source:"idn-pay",fromYear:2020,toYear:2026},
      {minAge:19,maxAge:36,title:"船肋旁的一块木片",text:"去南苏拉威西看朋友时，他带你到熟识的造船师傅那里。你想把脚边的木片清走，学徒赶紧捡了回来，往船身一比。原来他还指着那条曲线记住刚量过的形状。",source:"idn-pinisi"},
      {minAge:28,maxAge:48,title:"空格和一个零",text:"到乡下探亲，亲戚拿出在气候田间学校学着记的雨量表。你问是不是整整三天没下雨。他指着中间的空格说，那天他去城里办事，没人量，不能替它写个零。",source:"idn-rain",fromYear:2017},
      {minAge:34,maxAge:55,title:"印花没对齐的角",text:"来往的一家爪哇蜡染作坊晾出了新布。你对着花纹看了好久，发现有一处偏开半指。师傅一眼就认出那是自己带徒弟时，两人交换铜印的地方。",source:"idn-batik"},
      {minAge:46,maxAge:68,title:"认得味道的人",text:"做 jamu 草本饮品的老相识让你蒙住眼，闻闻她刚切开的香料。你猜错了名字，却想起小时候哪家院门口总飘着同一种味道。她把刀放下，说那是她姨妈家。",source:"idn-jamu"},
      {minAge:60,maxAge:95,title:"最轻的那件乐器",text:"几个年轻人围在屋檐下排昂格隆，把最轻的一件竹乐器递给你。你好久没合奏，头一遍错过了自己的音。第二遍大家只用眼神提醒，曲子就顺当地走过去了。",source:"idn-angklung"}
    ],
    choices: [
      {age:10,id:"idn-angklung-rehearsal",title:"这遍曲子缺谁？",text:"昂格隆小组要把一首曲子从头排完。每人手上只有一个音，一个新来的孩子还找不准该摇竹架的时候。离回家只剩一遍曲子的工夫。",source:"idn-angklung",options:[
        {id:"play-part",label:"守住自己的音，请他跟着听",note:"全组能完整听一遍，初来的孩子先在旁边认旋律。",effects:{knowledge:2,happiness:1},follow:{after:2,title:"轮到你起头",text:"又有新人加入时，有人请你把当年记熟的那段起头唱一遍。大家这才知道什么时候该接自己的音。"}},
        {id:"practice-entry",label:"陪他单练进来的两拍",note:"这回先不合全曲，给下回的合奏多留一个能接上的人。",effects:{bond:3},follow:{after:2,title:"帮你接回来的两拍",text:"新曲排到一半，你手慢了。坐旁边的孩子轻轻点了两下竹架，正是当初你陪他练的暗号。"}}
      ]},
      {age:27,id:"idn-rain-record",title:"雨量筒旁边留给谁？",text:"亲戚把气候田间学校用过的雨量筒借给邻居。这一季，你们只能匀出一个早晨，把怎样记雨量的事交代清楚。",source:"idn-rain",fromYear:2017,options:[
        {id:"train-pair",label:"把两个轮班的人一起教会",note:"大家得协调时间，但一个人临时出门，另一个能接手。",effects:{bond:2,knowledge:1},follow:{after:1,title:"两种笔迹连在一起",text:"你再去探亲，邻居把记录翻给你看。家里忙的那一周，表上换过两种笔迹，一天也没落下。"}},
        {id:"make-example",label:"留一张带例子的记录表",note:"邻居今天可以照常做活，以后换了人也有样张可查。",effects:{knowledge:3},follow:{after:1,title:"夹在量杯边的样张",text:"新来帮忙的人给你看那张磨软的纸。他指着例子说，自己正靠它分清了没有下雨和没有去量。"}}
      ]},
      {age:46,id:"idn-batik-cloth",title:"该留下哪一段花？",text:"长辈带来一块穿旧的爪哇蜡染布，说想给两位晚辈留个纪念。最宽的一段花纹还很完整，但两头已经磨薄了。",source:"idn-batik",options:[
        {id:"divide-cloth",label:"用结实的部分做两只小袋",note:"两人都能随身带一件，连续的花纹会被裁开。",effects:{bond:3},follow:{after:3,title:"拼得上的两只袋",text:"吃饭时两只洗旧的小袋碰巧摆在一排。晚辈认出那道花原本连在一起，把椅子都挪了过来。"}},
        {id:"keep-pattern",label:"补好整块布，让两人轮流收着",note:"能看清花纹原来的走向，日后要记得交接保管。",effects:{knowledge:2,bond:1},follow:{after:3,title:"沿着原来的花找",text:"晚辈把补过的整块布摊在桌上，拿着纸临摹了两份。你第一次看清那道花纹是怎样从角上绕回中央的。"}}
      ]}
    ]
  });

  globalThis.CountryStories.register("NGA", {
    sources: [
      {id:"nga-birth",label:"联合国儿童基金会尼日利亚办公室 · 凯比州出生登记实地报道",url:"https://www.unicef.org/nigeria/stories/name-nation-why-birth-registration-matters-every-child"},
      {id:"nga-ayo",label:"史密森学会非洲艺术国家博物馆 · 尼日利亚约鲁巴 Ayo 棋盘",url:"https://www.si.edu/object/gameboard%3Anmafa_93-2-1"},
      {id:"nga-adire",label:"史密森学会非洲艺术国家博物馆 · 约鲁巴 Adire 靛染围布藏品",url:"https://africa.si.edu/collection/object/nmafa_2004-10-22"},
      {id:"nga-hub",label:"联合国儿童基金会 · 尼日利亚社区读写与数学学习点",url:"https://www.unicef.org/flnhub/resources/parents-on-the-frontlines-of-early-grade-reading-and-math-nigeria"},
      {id:"nga-transit",label:"拉各斯都市交通管理局 · Cowry 卡及授权充值",url:"https://www.lamata-ng.com/2024/01/12/use-authorized-bank-account-to-pay-for-transport-services/"},
      {id:"nga-film",label:"联合国教科文组织 ·《非洲电影产业》尼日利亚电影制作研究",url:"https://www.unesco.org/creativity/sites/default/files/medias/fichiers/2023/01/379165eng.pdf"},
      {id:"nga-rain",label:"尼日利亚气象局 · 季节气候预测与地方差异",url:"https://nimet.gov.ng/publication_detail?id=71"},
      {id:"nga-argungu",label:"联合国教科文组织 · 凯比州阿尔贡古渔业与文化节",url:"https://ich.unesco.org/en/RL/argungu-international-fishing-and-cultural-festival-00901"}
    ],
    scenes: [
      {minAge:0,maxAge:1,title:"收好你的那张小卡",text:"在凯比州探望家人时，长辈抱你到附近办理出生登记的基层卫生点。轮到你时你睡着了。家人反复核对名字，接过登记通知卡，把纸放进了包里最平的那一层。",source:"nga-birth",fromYear:2026,toYear:2026},
      {minAge:0,maxAge:4,title:"指尖下的一排小贝壳",text:"家里来了一位约鲁巴朋友，身上围着蓝白相间的 adire 靛染布。你去抠其中一枚白色的贝壳，怎么都抠不起来。她笑着把布翻给你看，原来贝壳是染出的花。",source:"nga-adire"},
      {minAge:4,maxAge:9,title:"最后一颗落在哪里",text:"邻居带来家里的一副约鲁巴 ayo 棋盘，两排木窝被手摸得发亮。你蹲在边上，每落一颗就跟着数一下。大人还没伸手，你先用手指护住了自己猜的那个窝。",source:"nga-ayo"},
      {minAge:6,maxAge:13,title:"今天是爸爸来带读",text:"附近一个社区学习点请家长轮流帮忙。今天带读的人念故事很快，轮到长句时却一口气不够。你们把句子拆成两半，各念一半，反而比他一个人念得整齐。",source:"nga-hub",fromYear:2024},
      {minAge:9,maxAge:17,title:"布上藏着一排字",text:"在邻居的裁缝铺，你看一位约鲁巴客人展开 adire 染布。她让你找花样里藏着的字母。你刚找到一个，她就把布转了半圈，另一排字母又冒了出来。",source:"nga-adire"},
      {minAge:14,maxAge:28,title:"倒过来拍的一顿饭",text:"朋友帮本地一支小摄制组借到饭桌，只够拍一个下午。先拍的是一家人吃完饭的镜头。等大家撤走空盘，再给演员盛满，你才弄清银幕上的饭是怎么从有变成没有的。",source:"nga-film",fromYear:1993},
      {minAge:18,maxAge:40,title:"拉各斯站台前的小卡",text:"去拉各斯办事，一个熟人陪你搭受监管的公交。快排到读卡器时，你才从包底摸出 Cowry 交通卡。返程时你换了个口袋放卡，轮到你等熟人找东西了。",source:"nga-transit",fromYear:2024,toYear:2026},
      {minAge:24,maxAge:43,title:"雨季从哪一页开始",text:"亲戚拿来一份尼日利亚气象局的季节预测，请你和他一起找自家那一带。纸上相隔不远的两个地区，雨季开始的时间竟不一样。他把先前圈错的地方擦掉了。",source:"nga-rain",fromYear:2026,toYear:2026},
      {minAge:32,maxAge:57,title:"那只鱼为什么没在照片里",text:"来自凯比州阿尔贡古的朋友给你看当地渔节的老相片。你找了好久没找着鱼，他才说这张拍的是赛舟，捕鱼在另一个项目里。船头那个人是他的小舅。",source:"nga-argungu"},
      {minAge:46,maxAge:70,title:"谁给冠军让个座",text:"一位约鲁巴老邻居常把 ayo 棋盘搁在两把椅子之间。今天他没跟你下，让新学会数棋子的小孩坐过来。等对方想下一手的时候，他在旁边憋得连茶都忘了喝。",source:"nga-ayo"},
      {minAge:63,maxAge:95,title:"片尾还有一行字",text:"家人找出一部早年的尼日利亚录像电影。片子看完，你请大家别忙着关，想看看字幕里有没有那个帮剧组借过院子的老朋友。名字没找到，院门前那棵树倒是一眼就认出来了。",source:"nga-film",fromYear:1993}
    ],
    choices: [
      {age:14,id:"nga-ayo-afternoon",title:"木盘只剩一局的时间",text:"邻居把家传的约鲁巴 ayo 棋盘借到院里。一位熟手难得来了，一个更小的孩子却一直等着学。再过一局，棋盘就得还。",source:"nga-ayo",options:[
        {id:"face-expert",label:"请熟手下一局，把思路说给大家听",note:"能见识一位好对手的走法，小孩今天要先旁观。",effects:{knowledge:3},follow:{after:2,title:"想过三次才走的棋",text:"你又摆出当年那位熟手想了很久的局面。旁边有人追问为什么不走另一手，这回你终于能答出来了。"}},
        {id:"teach-newcomer",label:"把棋盘留给孩子，自己在旁边数",note:"孩子能亲手走完一局，你错过了和熟手对弈的机会。",effects:{bond:3},follow:{after:2,title:"又借来一副棋盘",text:"当年的小孩抱着一副借来的棋盘进门，说今天可以摆两桌。他还记得当初等着唯一一张盘是什么滋味。"}}
      ]},
      {age:27,id:"nga-film-kitchen",title:"厨房还能借一个下午",text:"熟人的小摄制组正在赶一部尼日利亚家庭短片。你借来的厨房只剩一个下午能用。一场母女对话还没拍，做饭时的锅铲声和收碗声也没录。导演请你帮忙安排这半天。",source:"nga-film",fromYear:1993,options:[
        {id:"record-dialogue",label:"先给两位演员留足时间",note:"能把母女说话时的停顿演好，做饭声留给剪片时补。",effects:{bond:2,knowledge:1},follow:{after:1,title:"那句没接上的话",text:"短片放给街坊看，有人问母亲为什么隔那么久才回答。演员认出了那个沉默，是当时多拍一遍才留下的。"}},
        {id:"record-kitchen",label:"把最后一段时间留给厨房的声音",note:"演员要缩短排练，但剪片时能听见这户人家真实的厨房。",effects:{knowledge:2,happiness:1},follow:{after:1,title:"一只锅盖认出了自己",text:"放映时，厨房主人听见画外轻轻碰了两下，忽然笑起来。她说那口锅的盖子松，别人家的盖子绝不会这么响。"}}
      ]},
      {age:60,id:"nga-indigo-wrapper",title:"留给晚辈的蓝布",text:"一位约鲁巴老友想把自己的 adire 靛染布留给晚辈。上面一行弯弯的字母，他还记得布是向谁买的，却担心以后没人知道怎样读。你今天有空帮他一次。",source:"nga-adire",options:[
        {id:"write-caption",label:"记下读法和老友记得的来历",note:"后人能查到这段话，今天腾不出时间约人一起认字。",effects:{knowledge:3},follow:{after:3,title:"一张跟着布搬家的纸",text:"晚辈搬家时找出夹在蓝布里的纸条，照着你写的读音念了一遍，又在背面添上自己接手保管的日期。"}},
        {id:"gather-readers",label:"约晚辈来听本人指着布念",note:"大家可以当面追问，没赶来的人日后还得找人转述。",effects:{bond:3},follow:{after:3,title:"轮到他们指着念",text:"晚辈把蓝布摊开，带一个更小的孩子沿着那行字母念过去。念到老友爱拉长的那个音，两个人都笑了。"}}
      ]}
    ]
  });
})();
