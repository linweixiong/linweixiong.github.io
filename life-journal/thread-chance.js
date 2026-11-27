/* One chance encounter per life. Its timing and the other people's circumstances
   are seeded separately from the player's response. */
(() => {
  "use strict";
  const roll = (s,salt,limit) => LifeWorld.hash(s.seed,salt) % limit;
  const occurrence = (s,key) => s.log.find(row=>row.threadKey===key);
  const entry = (key,title,text,tone,effects={}) => ({key,title,text,tone,effects});
  const option = (id,label,note,outcome,effects={}) => ({id,label,note,outcome,effects});
  function incident(s) {
    const n=roll(s,8201,100);
    return n<13?"bag":n<26?"order":n<47?"pay":n<73?"table":"song";
  }
  function timing(s) {
    return Math.max(23+roll(s,8202,28),(s.storyFrom||0)+1);
  }
  function dayPay(s) {
    const annual=LifeFinance.current(s)?LifeFinance.baseWage(s):Life.legacyEconomy(s).wage;
    return Math.max(1,Math.round(annual/250));
  }
  const clothPrice=s=>Math.max(1,Math.round(dayPay(s)*.45));
  function firstEvent(s,id) {
    if(id==="bag") {
      const taken=Math.min(s.cash,dayPay(s)*(1+roll(s,8203,3)));
      const cash=taken>0?"装在里面的零钱也没了。":"包里没装钱。";
      return entry("chance-bag","空着手走回去","回家路上，有人拽走了你手里的布包。你站在原地，手指还弯着。"+cash+"一个刚收摊的人搬来凳子，陪你坐到腿不再抖。","loss",{cash:-taken,happiness:-3});
    }
    if(id==="order") {
      return entry("chance-order","桌角那道补了又补的口子","你把桌布翻了个面，那道旧裂口还是露在外头。集市上有人接单做整幅桌布，价钱和别处相近，你也还有几块边角料，自己慢慢缝也行。","hope");
    }
    if(id==="pay") {
      const wage=dayPay(s);
      if(roll(s,8204,5)===0) {
        return entry("chance-paid","信封上多了一笔","你帮忙布置了一场街坊聚会。领报酬时，负责人叫住你，指着纸上被漏掉的一行，把那天的工钱补给你。你已经忘了那天提早来摆过椅子，有个人还记得。","joy",{cash:wage,happiness:2});
      }
      return entry("chance-pay","少了一天的工钱","帮人布置完场地，约好的那份工钱迟迟没来。你以为大家都在等。后来两位一起干活的人来找你：场地早就结清了，领钱的人连你们的份也拿走了。那晚让你睡不着的，是你还替那人解释过好几回。","loss",{happiness:-2});
    }
    if(id==="table") {
      return entry("chance-table","多摆了两只碗","住处附近几户人家凑了一顿饭。桌子不平，有人把一本旧日历垫在桌脚。最后两个人端着碗赶来，大家挪出空当。你第一次知道，平常只跟你点头的那个人，笑起来声音这么大。","joy",{bond:2,happiness:2});
    }
    return entry("chance-song","有人接上了下一句","傍晚等雨停，你旁边的人轻轻哼起一段小调。只记得开头，反复唱了三遍。屋檐另一头忽然有人接上下半句。几个人都抬起头，谁也说不上这首歌叫什么。","joy",{happiness:2});
  }
  function card(s) {
    const id=incident(s), first=occurrence(s,"chance-"+id), choiceId="thread-chance-"+id;
    if(!first||s.decisions[choiceId]||s.age-first.age>6)return null;
    let title,text,options;
    if(id==="bag"){
      title="第二次经过那条路";text="上回被抢以后，你有一阵绕开了那条路。今天走到路口，你看见收摊时陪过你的人。";
      options=[
        option("thanks","过去道一声谢","你一直记得那张凳子。","你原本准备了一长串话，说出口只有一句「那天谢谢你」。摊主认出了你，把凳子往外踢了一点。你们坐了片刻，聊的都是天气。",{bond:2}),
        option("company","找个熟人陪你走一段","今天想有人在旁边。","你请熟人陪你走到下一个路口。一路上对方都在说晚饭吃什么，到拐弯处才问：「明天还要我来吗？」你说，到时候再看。",{happiness:2})];
    }else if(id==="order"){
      title="换块桌布，还是再缝一次";text="家里那道裂口又松了。摊上的整幅桌布要先付 "+LifeFinance.displayMoney(s,clothPrice(s))+"。做完后有人送来。";
      options=[
        option("order","下回赶集时订一块","先把这笔钱留给桌布，手头紧就缓一缓。","你记下了尺寸。家用要先留够，余下的钱才拿去赶集。"),
        option("mend","拿家里的边角料拼一块","用一个晚上，试试自己的手艺。","你选了两块颜色完全不搭的布。缝完铺开才发现，从门口看，那块歪歪斜斜的补丁很像一只卧着的猫。",{happiness:1})];
    }else if(id==="pay"){
      title="一起做过那份工的人";text="另外两个人约你碰面。他们有人想追那笔欠薪，有人得去做下一份工。跑一趟要占去半天，最后能拿到多少，谁也说不准。";
      options=[
        option("together","腾半天出来，一起去问","你愿意把当时的事当面讲清楚。","你们一起把经过说了一遍。回去时，有个人伸手帮你扶住门，小声说：「今天总算不用我一个人讲了。」",{bond:2}),
        option("statement","写下经过，请同伴捎去","把半天留给眼前的生活。","你写清自己在哪几天帮过忙，让同伴带着那页纸去。快走到家时你还在想，那天收椅子的年轻人叫什么，怎么偏偏没能写上。",{knowledge:1})];
    }else if(id==="table"){
      title="下一顿一起吃的饭";text="邻居又约起同桌吃饭。有人在列要带的东西，有个人刚搬来，站在旁边听，手里的空碗一直没放下。";
      options=[
        option("kitchen","去帮做饭的人尝咸淡","灶边少一双手。","你尝了一口，说还可以淡些。掌勺的人又给你一口，其实什么也没改。见你认真点头，对方终于憋不住笑。",{happiness:3}),
        option("seat","把身边的位子空出来","先陪新邻居坐一会儿。","你腾出半张长凳。对方坐下后，把自己带来的小菜推到桌中央。快吃完时，有人向这位新邻居讨起做法。",{bond:3})];
    }else{
      title="还记得那段旋律吗";text="又一个雨天，你发觉自己还记得屋檐下听来的旋律，最后一句却只剩几个音。";
      options=[
        option("hum","把记得的部分哼给别人听","唱错也可以接着唱。","听的人跟着你的节拍敲了两下杯沿，给结尾添了一个长音。你知道原来不是这样，可第二遍还是跟着唱了。",{happiness:2,bond:1}),
        option("write","把第一次听到它的事写下来","你想记住那天都有谁在。","你写了湿鞋子、滴水的屋檐、迟迟想不起下一句的人。写到那声合唱时，没有合适的字，你在纸上留了一小段空白。",{knowledge:2})];
    }
    return {id:choiceId,type:"choice",category:"personal",title,text,options};
  }
  function events(s) {
    if(s.age===0)return [];
    const id=incident(s), start=timing(s);
    if(s.age===start && s.age<=72)return [firstEvent(s,id)];
    const picked=occurrence(s,"thread-chance-"+id);
    if(id==="order" && picked && s.age===picked.age+1){
      if(s.decisions["thread-chance-order"]==="mend"){
        return [entry("chance-order-patch","那只趴着的猫","来吃饭的人指着桌面说，你家这只猫今天胖了。你低头一看，原来有一粒豆子正好滚到补丁旁边，成了猫爪。","joy",{happiness:2})];
      }
      const price=clothPrice(s);
      if(s.cash<price)return [entry("chance-order-wait","今年先这样用","赶集前你又算了一遍，手头的钱另有用处。你找来两枚夹子，把桌布松开的那一角夹好。这件事可以缓一缓。","hope")];
      if(roll(s,8209,2)===0)return [entry("chance-order-fraud","收据还在，布没来","你付清了桌布的钱。等过约好的日子，卖布的人亲口承认，从来就没有那批货，钱也退不出来。回到家，你最难受的那一刻，是有人兴冲冲地问你挑了什么颜色。","loss",{cash:-price,happiness:-2})];
      return [entry("chance-order-delivery","桌布长出两指","订的桌布送来了，比原来量的尺寸多了两指。你把四角抚平，头一个坐下的人分外小心，端着杯子转了半天，舍不得往上搁。","joy",{cash:-price,happiness:2})];
    }
    const fraud=occurrence(s,"chance-order-fraud");
    if(id==="order"&&fraud&&s.age===fraud.age+2)return [entry("chance-order-confide","先让你把话说完","有次饭后，你终于讲起那笔被骗走的钱。对面的人没问你怎么会上当，只问那段日子你一个人憋了多久。你把碗推开一点，头一次把整件事说完了。","hope",{bond:1})];
    if(id==="order")return [];
    if(!picked || s.age!==picked.age+2+roll(s,8206,4))return [];
    const decision=s.decisions["thread-chance-"+id];
    if(id==="bag"){
      return [decision==="thanks"?
        entry("chance-bag-after","凳子挪出来一点","过了几年，轮到你门口站着一个缓不过神的人。你没急着问出了什么事，先把自己坐着的凳子让了出来。","hope",{bond:1}):
        entry("chance-bag-after","走到第二个路口","散步时你和熟人一不留神走过了从前约好分手的路口。到了第二个路口你才发觉，刚才你们都在认真听对方讲话。","hope",{happiness:1})];
    }
    if(id==="pay"){
      if(roll(s,8207,3)!==0){
        const back=Math.max(1,Math.floor(dayPay(s)/2));
        return [entry("chance-pay-after","后来追回的一部分","隔了几年，你领回大约半天的工钱。你在领款的地方碰见了当初一起收椅子的人。这回两个人走出门时，天还是亮的。","hope",{cash:back})];
      }
      return [entry("chance-pay-after","还有人记得那一天","那笔工钱始终没能讨回来。你又遇见当天一起干活的人。对方还记得你们收完最后几把椅子、以为马上就能回家的那个傍晚。","regret")];
    }
    if(id==="table"){
      return [decision==="kitchen"?
        entry("chance-table-after","先让你尝一口","隔了几年，饭桌换了地方。掌勺的人舀出第一勺，隔着好几个人叫你的名字。你尝完，很认真地说：「淡一点。」这回两个人一起笑了。","joy",{happiness:2}):
        entry("chance-table-after","给你留的半张凳子","你有一回到得太迟，桌边已经坐满。有人起身拍了拍身边，给你挪出半张凳子。是从前端着空碗坐到你旁边的那位邻居。","joy",{bond:2})];
    }
    return [decision==="hum"?
      entry("chance-song-after","走了样的最后一音","有人干活时哼起你教过的曲子，末尾又拐了个弯。你听见那个后来才添上的长音，才敢确定这支歌经过你的手。","joy",{happiness:2}):
      entry("chance-song-after","纸上那一段空白","整理旧纸时，你认出那张记着雨天合唱的纸。最后一句已经想不起来，倒记得当时有个人唱完就低头去拧湿透的裤脚。","regret")];
  }
  globalThis.LifeChanceStory=Object.freeze({events,card});
})();
