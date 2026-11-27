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
})();
