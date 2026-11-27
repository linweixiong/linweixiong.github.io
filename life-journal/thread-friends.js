/* 一个名字跟随一生。每条回忆都以本局日志里已发生的相识、约定或赠予为起点。 */
(function installFriendStory(root) {
  "use strict";

  const places = {
    chengdu: { names:["唐晓竹","许沅","宋小川","徐秋宁","林素安"],
      urban:"卖青菜的摊子背后，两只空筐之间刚好够两个小孩蹲下。", rural:"刚放过水的菜地还带着泥，田埂上倒有一小块干燥平地。"},
    lyon: { names:["Manon","Noé","Lucie","Basile","Élodie"],
      urban:"沿河的菜摊收了一半，大人在挑菜，两个孩子坐在空木箱上等。", rural:"赶集的人还在谈价钱，你在装水果的空箱旁边找了块阴凉。"},
    EGY: { names:["穆娜","谢里夫","塔里克","哈南","法蒂玛"],
      urban:"面包铺外轮候的人往前挪了挪，门旁的石阶上腾出两个孩子的位置。", rural:"灌溉渠边的人正收拾工具，树荫下摆着一壶给大家喝的水。"},
    IND: { names:["卡维娅","米拉","阿莎","阿贾伊","维韦克"],
      urban:"街边修鞋的人还差几针，你在门前等，另一个小孩也在等。", rural:"一户人家在院里拣豆子，大人们把空出来的一小块地方留给你们玩。"},
    IDN: { names:["莉娅","哈迪","妮莎","桑蒂","阿妮塔"],
      urban:"邻人刚把一幅晾晒的花布挪到檐下。你蹲下来，布的另一边也露出一双脚。", rural:"雨点敲得屋檐很响，几个大人在等雨小，屋檐内侧还空着一条干地。"},
    NGA: { names:["阿约","哈利玛","恩凯奇","阿米努","阿德奥拉"],
      urban:"裁缝铺里还在量布，两个陪大人来等活的孩子被让到了门边的长凳。", rural:"集上卖粮的人把空袋叠在一处。你跟大人来得早，在旁边找了块地方坐下。"},
    BRA: { names:["海伦娜","蒂亚戈","贝娅特丽丝","费利佩","伊莎贝拉"],
      urban:"街口有人来买面包，大人在门里说起了话，你坐在门前一级矮台阶上。", rural:"赶集的人忙着把水果分筐，屋前树荫里的旧凳子暂时给小孩坐。"},
    PAK: { names:["扎拉","阿迪尔","法拉","阿西姆","玛希拉"],
      urban:"缝衣铺还在给一件上衣收边，来取衣的大人叫你在铺子门前等一等。", rural:"有人去看田间轮到哪块地进水，带小孩的人都在渠边树荫下等。"},
    BGD: { names:["鲁娜","法尔汉","鲁贝尔","莎米玛","法丽达"],
      urban:"市集布铺把新织的布搭在门边。大人取布时怕你们压到穗子，把几只空凳往里挪了挪。", rural:"雨停后，屋前只剩一块晒干的地。你刚蹲下，就有人挪过来分这一半。"}
  };
  const punjabNames = ["哈尔普里特","古尔普里特","阿曼迪普","吉兰迪普","曼普里特"];
  const tamilNames = ["卡维娅","卡文","蕾瓦蒂","森蒂尔","米拉"];
  const fallback = {names:["那位朋友"],urban:"大人们在街边办事，你坐在门前等。",rural:"树荫里留着一块空地，几个孩子都在那里等人。"};

  const id = name => "thread-friend-" + name;
  const eventKey = name => "friend-" + name;
  const roll = (s, channel, total) => root.LifeWorld.hash(s.seed, 7300 + channel) % total;
  const logged = (s, name) => s.log.find(e => e.threadKey === eventKey(name));
  const choice = (s, name) => s.decisions?.[id(name)];
  const inWindow = (s, from, to) => s.age >= from && s.age <= to;

  function locality(s) {
    if (s.countrySetVersion===2 && newPlaces[s.region]) return newPlaces[s.region];
    const location=root.LifeWorld.place(s.region,s.birthYear);
    const place = places[location?.region||s.region] || (location?.names?.length&&!location.usingNickname?
      {...fallback,names:location.names}:fallback);
    if (s.region !== "IND") return place;
    const setting = root.LifeWorld.storySetting?.(s)?.id;
    if (setting === "punjab") return {...place,names:punjabNames,
      rural:"大人在渠边看田里进水，孩子们蹲在离水远一点的树荫底下。"};
    if (setting === "tamil") return {...place,names:tamilNames,
      urban:"有人在店前洒过水，门边留下干燥的一小块，正容得下两个孩子。"};
    return place;
  }

  const newPlaces = {
    JPN:{names:["优","圭","真琴","明","薰"],urban:"放学路上的小店刚把空箱收进门，你们在屋檐下互相抖落伞上的水。",rural:"雨后田边的小路还黏着泥，你们各找了一根树枝，慢慢刮掉鞋底的土。"},
    DEU:{names:["Alex","Kim","Toni","Luca","Robin"],urban:"街角面包店前停着两辆自行车，你帮一个孩子扶住车把，等对方把松开的鞋带系好。",rural:"镇边的小路起了风，你们追着一张掉出来的纸，直到它挂在篱笆上。"},
    MEX:{names:["Mar","Luz","Álex","Dani","Cruz"],urban:"市场的摊主正在给秤盘擦水，你和另一个孩子蹲下来，捡起一颗滚到桌下的青柠。",rural:"赶集回来的大人坐在门口歇脚，你们拿装豆子的空袋折起了小船。"}
  };

  function firstMeeting(s, prefix="friend-met-") {
    const row = s.log.find(e => e.threadKey?.startsWith(prefix));
    if (!row) return null;
    const index = Number(row.threadKey.slice(prefix.length));
    return Number.isInteger(index) ? {age:row.age,name:locality(s).names[index]} : null;
  }

  function nameIndex(s, names) {
    const people = root.LifeFamily?.members?.(s) || [];
    const used = new Set([s.name,...people.map(p => p.name)]);
    const start = roll(s, 1, names.length);
    for (let i=0; i<names.length; i++) {
      const index = (i + start) % names.length;
      if (!used.has(names[index])) return index;
    }
    return -1;
  }

  function event(key,title,text,tone,effects) {
    return {key:eventKey(key),title,text,tone,effects};
  }
  function option(name,label,note,outcome,effects) {
    return {id:"friend-"+name,label,note,outcome,effects};
  }
  function question(name,title,text,options) {
    const tone=name==="farewell"?"loss":["game","legacy","gift"].includes(name)?"joy":"hope";
    return {id:id(name),category:"personal",type:"choice",tone,title,text,options};
  }
  function ageChosen(s, name) {
    const selected=choice(s,name);
    return selected ? s.actions?.find(a=>a.type==="choose" && a.id===selected)?.age : undefined;
  }
  function reached(s, name, delay) {
    const age=ageChosen(s,name);
    return Number.isInteger(age) && s.age===age+delay;
  }

  // 三个相识场景各有一件后来能再次拿起来的东西：布球、两拍停顿、画在地上的路。
  const games = [
    {
      opening:n=>"一个叫"+n+"的孩子把旧布团成的球推给你。球滚得歪，你们一人挪一次屁股，最后竟坐到了一处。",
      again:n=>n+"远远把布球举过头，你就知道是来找你的。今天球卡在一个角落，两个人同时跪下去够，反而碰了个头。",
      title:"这只球往哪边滚",
      prompt:n=>n+"带来的布球一放手就歪，偏偏每次歪向同一边。你们找了块空地，还有一会儿才需要回去。",
      a:["把开口拆一小段，重新塞好","拿出这回玩的时间修球。","你们把挤作一团的布条摊开重卷。球滚得比刚才直多了，两个人只来得及各踢一脚。"],
      b:["顺着它的弯路摆两个球门","用现成的东西发明玩法。","你们拿鞋尖划出两个球门，让布球绕一个弯进去。有个经过的大人试了一脚，球当场拐回到自己脚下。"],
      laterA:n=>"后来有只球松开了口，"+n+"负责扶住，你负责把布理匀。旁边的人忙了一圈才发现你俩早已把它补好。",
      laterB:n=>"又有人来玩布球，你和"+n+"把故意摆歪的球门指给人看。头一个踢进去的竟是今天才来的那个。",
      object:"一只布球",
      make:"你把一截磨软的布卷成拳头大的球，又把接缝藏进去。来串门的年轻人掂了掂，说想带回去给几个孩子玩。",
      give:"你把球放进对方手里，又叮嘱了一句，玩松了只要拆开最后那一针。",
      keep:"你把这只舍不得送的球收回来，另外拆开一小段布，把卷法慢慢做给对方看。",
      trace:"有人带来那只布球给你看。外面已经补过两块颜色不同的布，顺着针脚摸进去，里面还是你当初打的结。",
      method:"来学卷球的人带回一只自己做的新球。你当初留的那只只够一手握住，这只大得要两只手捧。"
    },
    {
      opening:n=>"你用两根手指敲出两下，一个叫"+n+"的孩子在另一头回了两下。你故意多等一会儿，那边先憋不住笑了。",
      again:n=>"你在人堆旁边轻敲两下，里面有人停一拍才回两下。没看见脸你就猜是"+n+"，转过去果然猜中了。",
      title:"那一拍要不要等",
      prompt:n=>n+"把你们敲着玩的两拍编长了。新来的人跟不上，总是提早拍手，反倒听出另一种有趣的拍子。",
      a:["放慢，教会旁边的人","你们得把熟练的那段重来。","你把每一拍敲在对方张开的手心里。第三个人好不容易跟上，轮到你自己提前了一拍。"],
      b:["留住错的那拍，编成另一段","和朋友试一次新节奏。","你们把快出来的那拍留在中间，谁在那儿笑了谁就得重来。来来回回笑得最多的恰是你。"],
      laterA:n=>"在一阵听不清说话的热闹里，"+n+"和当年学拍子的那个人隔开一段，照样把同一段节奏敲到了最后。",
      laterB:n=>n+"又敲了一遍你们错出来的拍子。你们分开各敲一半，旁边两个人直问到底是谁在抢拍。",
      object:"一张拍子纸",
      make:"旁边一个常带人做游戏的年轻人想学你手上那段拍子。你用长短不一的小线把节奏写了下来，停顿处特意留了一个空格。",
      give:"你把原稿折起来递过去。对方照着敲，到那个空格时真的停了一拍。",
      keep:"你把纸夹回自己的本子，拉过一只空凳子给对方坐。你们面对面敲了好几回，敲到不看纸也能接下去。",
      trace:"多年后那张拍子纸回到你眼前。原来的小线下面多画了一只手，是学的人特意标给后来人的停顿。",
      method:"以前坐下来跟你学拍子的那个人领人敲了一段。你闭着眼听，到了你当初特意留下的空拍，四下里真的一点声响都没有。"
    },
    {
      opening:n=>"一个叫"+n+"的孩子用指头在地上画路。你把弯道加得太长，原本只去门口的小人，得绕过两个膝盖才能到家。",
      again:n=>n+"用一块小石头当作家门，等你画路过来。你们画到碰着别人的鞋尖，只得客客气气问能不能从门前经过。",
      title:"路画到边上了",
      prompt:n=>"你和"+n+"画的小路到了地面上过不去的一道坎。一个过来看的孩子指了指背后：你们把回去的路也堵死了。",
      a:["一起沿路找，补一条回家的小道","让没玩过的人也能走回来。","你们顺着线一步步走，退到最早的拐角加画了一条岔路。第一个试走的人果真又回到了出发的地方。"],
      b:["把那道坎当河，另画一座桥","把路接到另一侧。","你负责画两头，朋友负责画桥面。有人故意在桥上停着不走，说还没看够你们画在水里的鱼。"],
      laterA:n=>n+"把你领到一张新画的图前。以前你们一起补过回路，这一回纸上的路也留了回去的岔口。",
      laterB:n=>n+"照你们的老规矩画了一座特别宽的桥。先前在桥上不肯走的人又来了，这回干脆说要在这里摆个摊。",
      object:"一幅手画的路图",
      make:"有个年轻人来问附近几处拐弯怎么认。你坐下来画了张图，那道最容易走错的弯旁边，你特意留白，好让对方写自己的记号。",
      give:"你把那张图交给对方。还没出门，对方就把认得的一处墙角添了上去。",
      keep:"你想留着这第一张草图，只好再走一趟给对方看。到了那个拐弯，对方自己选了一眼就能认出来的标记。",
      trace:"你画过的路图又被人摊开。原来留白的地方添过又擦，连你记得的老墙角也划掉了，可你当年画歪的那个弯还在。",
      method:"当年来问路的人现在也带别人走。对方挑来当记号的墙角已经变了，重新指路时，还是先把人领到真正的拐弯处。"
    }
  ];

  const beginnings = [
    ["挨着你睡着的人","有人用手背轻轻碰你的脸，看你睡熟了没有。过了一会儿，是来照看你的人先打起了瞌睡，手还松松地搭在旁边。"],
    ["给你编两句","哄你的人一时想不起歌的后半段，把眼前看见的东西随口编进去。旁边的人听出了破绽，一边忍笑一边接着哼。"],
    ["一手托着你","抱你的人正要接别人递来的东西，伸到一半又把手收回来。那件东西被搁在一旁，两只手重新把你托得稳稳当当。"],
    ["这声是你打的","屋子里响起一声小小的嗝。大人们互相看了一眼才找到是你，低下头的时候，一个个都笑着。"]
  ];

  function turning(s) {
    return ["moved","hours","near"].map(key=>logged(s,key)).find(Boolean);
  }
  const firstResults = ["visit-kept","visit-missed","reply","no-reply"];
  const secondResults = ["found","not-found","door-open"];
  function activeFriend(s) {
    return !logged(s,"death") && ["visit-kept","reply","found","door-open"].some(key=>logged(s,key));
  }
  function hasResult(s, names) {
    return names.some(key=>logged(s,key));
  }

  function newNeighbourEvents(s) {
    if(!(s.storyFrom>0) || s.age<Math.max(18,s.storyFrom))return [];
    const met=firstMeeting(s,"friend-new-face-");
    if(!met){
      const place=locality(s),i=nameIndex(s,place.names);
      if(i<0)return [];
      const n=place.names[i],where=s.residence==="rural"?"院门外":"街边的一处台阶旁";
      const greeting=place===fallback?"。你们还没问起彼此的名字，身边的人便来催了。":"：「我叫"+n+"。」";
      return [event("new-face-"+i,"衣角上缺了一颗扣子",where+"，有人蹲着找刚掉下的一颗扣子。你从这边恰好看见它靠在墙脚，伸手指了指。那人把扣子攥进掌心，腾出另一只手同你打招呼"+greeting,"hope",{bond:1})];
    }
    if(!reached(s,"neighbour",2+roll(s,23,2)))return [];
    const gift=choice(s,"neighbour")==="friend-thread",close=roll(s,24,4)!==0;
    const key=gift?(close?"patched":"thread-message"):(close?"second-seat":"missed-seat");
    if(logged(s,key))return [];
    if(gift&&close)return [event(key,"那截线缝过两次",met.name+"又碰见你，指着袖口给你看。你送去的那截线缝好了原来的木扣，还剩一点，正好替另一只袖口也加固了两针。","joy",{happiness:2,bond:1})];
    if(gift)return [event(key,"线头用到了别处","有人替"+met.name+"带来一句谢意。对方离开这边去照顾亲人，临走才发现随身的布袋开了个口，你送的那卷线恰好派上用场。","hope",{bond:2})];
    if(close)return [event(key,"两个位置都有人坐",met.name+"记得你们约下的那段时间，而且记得哪边的位置你坐着更舒服。你们挨着坐下，说起初次相遇时那颗躲在墙脚的扣子。","joy",{happiness:2,bond:2})];
    return [event(key,"先把话捎到","原本说要来碰面的"+met.name+"没来成，倒特意托人留了话，说家里临时有事。你留给对方的位置空着，那句招呼却已经送到了。","regret",{happiness:-1})];
  }

  function newNeighbourCard(s) {
    const met=firstMeeting(s,"friend-new-face-");
    if(!met || choice(s,"neighbour") || !inWindow(s,met.age+1,met.age+12))return null;
    return question("neighbour","认出你的人先抬起了手","你再次见到"+met.name+"，对方先跟你打招呼。那颗找回来的木扣已经穿了线，松松地挂在衣边。你们都是顺路经过，今天还能停一小会儿。",[
      option("thread","把随身带的一截结实线送出去","留点能用上的东西给这个新朋友。","你从口袋里翻出卷在纸片上的一截线，连纸带线递给"+met.name+"。对方没说客气话，先把线头挨着袖子比了比颜色，再收进口袋。",{bond:2}),
      option("sit","约一回能坐下来说话的时间","给下一次见面留个位子。","你们讲明白哪个时辰通常方便。"+met.name+"把那处能坐下歇一会儿的地方指给你看，你也抬起手，指着同一个地方。",{happiness:1,bond:1})
    ]);
  }

  function events(s) {
    if(!s || s.ended || !Array.isArray(s.log)) return [];
    const entries=[];
    function add(key,title,text,tone,effects) {
      if(!logged(s,key)) entries.push(event(key,title,text,tone,effects));
    }
    if(s.age===0){
      const [title,text]=beginnings[roll(s,2,beginnings.length)];
      add("welcome",title,text,"joy",{happiness:1});
      return entries;
    }
    if(s.age===1+roll(s,18,2)){
      if(roll(s,19,2)===0) add("two-bites","分给你的一点","旁边一个孩子看你眼巴巴地望着，把手里的软面饼掰开一点，先递给照料你的人。你接过小块咬了一口，两个人同时鼓着腮看对方。","joy",{happiness:1});
      else add("two-waves","你也会招手","有人带着另一个小孩经过，两个大人还在客气地告别，你们已经挥了好几轮手。对方走出一段又回过头，你等到的正是这一下。","joy",{happiness:1});
    }
    const game=games[roll(s,3,games.length)],met=firstMeeting(s);
    if(!met){
      if(s.age===3+roll(s,4,3)){
        const local=locality(s),index=nameIndex(s,local.names);
        if(index!==-1){
          const firstWords=game.opening(local.names[index]).replace("一个叫那位朋友的孩子","一个还没来得及问名字的孩子");
          add("met-"+index,"第一次有人等你来玩",local[s.residence==="rural"?"rural":"urban"]+firstWords,"hope",{bond:1});
        }
      }
      return [...entries,...newNeighbourEvents(s)];
    }
    const n=met.name;
    if(s.age===met.age+1) add("next-game","隔着老远就认出来",game.again(n),"joy",{happiness:2});
    if(reached(s,"game",2)){
      const learned=choice(s,"game")==="friend-practice";
      add("our-game",learned?"这回不必从头教了":"还是你们那套玩法",(learned?game.laterA:game.laterB)(n),"joy",{bond:2});
    }
    if(s.age===15+roll(s,5,3)){
      const fate=roll(s,6,6);
      if(fate<3)add("moved","那一处快要腾空",n+"家要搬走。你经过常见面的地方，才发现对方站在那儿不是等人玩，是在等最后一趟来取东西的人。","loss",{happiness:-1});
      else if(fate<5)add("hours","能碰面的时辰变了",n+"近来得在别的时辰帮家里做事。你们去同一处找过对方，两次都只听到一句「刚走」。","regret",{happiness:-1});
      else add("near","还能见面的小地方",n+"把常坐的地方擦出一块干净地。你们已经长得肩并肩有些挤，坐下来又谁都不肯先让。","joy",{bond:1});
    }
    if(reached(s,"contact",1+roll(s,7,3))){
      const went=choice(s,"contact")==="friend-visit", moved=Boolean(logged(s,"moved"));
      const good=roll(s,8,6)<(moved?3:4);
      if(went&&good)add("visit-kept","约定的地方真有人",n+"比你先到。你赶得直喘，还没想好开场白，对方先问：「饿不饿？我带了能分着吃的。」两人一边咬一边把漏掉的近况慢慢补上。","joy",{happiness:3,bond:2});
      else if(went)add("visit-missed","等过的人","你在约好的地方等了很久。几天后有人捎话，"+n+"临时陪家里人去了别处，也曾赶回来找过你。再往下问，传话的人只知道这些。","regret",{happiness:-2});
      else if(good)add("reply","口信真的到了",n+"托人捎来回复，连你留话时顺嘴说的一件小事也问到了。你把那段话复述了两遍，想清楚下回该给对方讲什么。","joy",{bond:3});
      else add("no-reply","传话的人没遇见", "替你捎话的人特意来说明，跑了两回都没碰着"+n+"。你本来以为对方听了没回，直到这时才知道，话还在半路。","regret",{happiness:-1});
    }
    if(s.age===32+roll(s,9,3)&&hasResult(s,firstResults)){
      if(activeFriend(s))add("adult-joy","吃得差不多才想起正事",n+"跟你相约说件事，见了面先吃东西。等碗盘见底，原本打算商量什么，两个人竟同时给忘了。你们把最后一口让来让去，忽然一起记了起来。","joy",{happiness:3});
      else if(roll(s,10,4)!==0)add("lead","有个人知道新的去处","一个见过你们小时候一起玩的人来办事，闲谈中提到"+n+"，还知道一个能去打听的地方。你问了两遍，把拐弯的方向记清了。","hope",{happiness:1});
      else add("old-place","原处已经换了人","你经过小时候碰见"+n+"的地方，向如今在那里的人打听了一声。没人认得这个名字。你道了谢，带着原来那点消息走了。","regret",{happiness:-1});
    }
    if(reached(s,"lead",1+roll(s,11,2))){
      const personal=choice(s,"lead")==="friend-seek",found=roll(s,12,5)<3;
      if(personal&&found)add("found","一开口就认出来", "你按记下的方向找去，先认出了"+n+"说话的声音。对方请你坐，第一句话是问你渴不渴。原来准备好那段客气话，谁也没用上。","joy",{happiness:4,bond:3});
      else if(!personal&&found)add("door-open","由对方找上门",n+"接到了你留的消息，过了一阵亲自来找你。你们各自记得最后见的是哪一天，说出来却足足差了一年。","joy",{happiness:3,bond:2});
      else if(personal)add("not-found","走对了路，晚了一步","你找到了有人认识"+n+"的地方，对方却已经离开许久，没留下新去处。你把记下的路线折好，这趟至少不必再猜自己是哪一处走错。","loss",{happiness:-2});
      else add("not-found","一句没追问的话","带话的人后来又来过，只说留话已经放下。"+n+"没有来找你。你没再去问，没有谁能替对方说出原因。","regret",{happiness:-1});
    }
    if(s.age===44+roll(s,13,4)&&activeFriend(s)){
      add("fun-mid","一人挑一样",n+"和你约好见面时各带一样自己爱吃的东西，拆开一看，两份几乎一样。你们盲尝了半天，谁都没能挑回自己的那份。","joy",{happiness:3});
    }
    if(choice(s,"gift")&&reached(s,"gift",2)){
      const given=choice(s,"gift")==="friend-give";
      add("gift-news",given?"有人已经用上了":"对方有了自己的做法",given?
        "来取过"+game.object+"的年轻人又碰见你，学着别人第一次接过它的样子演给你看。讲到一半，演的人自己笑得没能演下去。":
        "那个向你学过做法的年轻人特地来问一个细节。你听完才发现，对方已经试出了自己的办法，这回倒是你想听听经过。","joy",{bond:2});
    }
    const lossAge=50+roll(s,14,15);
    if(s.age>=lossAge && s.age<=lossAge+2 && roll(s,15,6)===0 && activeFriend(s) &&
       !s.log.some(e=>e.age===s.age && (e.kind==="loss"||e.tone==="loss"||e.title==="共同生活的人"))){
      add("death","这封问候没能当面说","有个你们都认识的人带来消息，"+n+"生了一场病，前些天去世了。你还有件平常的小事想跟对方讲，话已经在心里排好了，却没了这次见面。","loss",{happiness:-3});
    }
    const death=logged(s,"death");
    if(death && s.age===death.age+2)
      add("remember","说到那个名字的时候","有人问你"+n+"小时候是什么样的人。你先讲了你们认识那天的小事；讲完才发觉，自己说到有趣的地方还是笑了一声。","hope",{happiness:1});
    if(s.age===68+roll(s,16,6)&&choice(s,"gift")){
      const given=choice(s,"gift")==="friend-give";
      add(given?"returned":"learned",given?"你当年送出去的东西":"那件事还有人会",given?game.trace:game.method,"joy",{happiness:3,bond:2});
    }
    if(s.age===76+roll(s,17,5)){
      if(activeFriend(s))add("old-friends","这次把时间留长一点",n+"托人约你坐一会儿。你们一边说眼下的琐事，一边拿记不清的旧事互相打趣，直到送人出门，又在门口站着说了一阵。","joy",{bond:2,happiness:2});
      else if(logged(s,"old-place")||logged(s,"not-found"))add("unknown","还留着一个空白","有人问起你小时候一起玩的"+n+"后来怎样。你把知道的那一小段说完，停了停，只能接一句：「再往后，我就不知道了。」","regret");
    }
    return entries;
  }

  function card(s) {
    if(!s || s.ended || !Array.isArray(s.log))return null;
    const met=firstMeeting(s);
    if(!met?.name)return newNeighbourCard(s);
    const n=met.name,game=games[roll(s,3,games.length)];
    if(!choice(s,"game") && inWindow(s,Math.max(6,met.age+1),12)){
      const a=game.a,b=game.b;
      return question("game",game.title,game.prompt(n),[
        option("practice",a[0],a[1],a[2],{knowledge:2,bond:1}),
        option("invent",b[0],b[1],b[2],{happiness:3})
      ]);
    }
    if(!choice(s,"contact") && inWindow(s,17+roll(s,20,2),27) && turning(s)){
      const moved=logged(s,"moved"),busy=logged(s,"hours");
      const intro=moved?"搬家以后，你跟"+n+"很难碰面。一个两边都认识的人要往那片地方去，问你有什么想捎过去。":
        busy?"总碰不上"+n+"，你知道有个人时常能见到对方。趁那人还在跟前，你想好要传的究竟是一个日子，还是一句话。":
        "你和"+n+"还住得不算远，却越来越难像小时候那样随时坐一会儿。两家都认识的人正好要过去，问你可有什么话要带。";
      return question("contact",moved?"趁有人能捎话":busy?"这次别再走岔":"要不要专门见一面",intro,[
        option("visit","捎上想见面的日子和地点","把以后能腾出来的一天留给见面。","你把自己能到的时辰讲清，又把地方说了一遍。捎话的人复述给你听，还真纠正了刚才听错的一个弯。",{bond:2}),
        option("message","捎一句近况，留个能回信的地方","先让对方听见你的消息。","你没让来回传话的人背一大段，只讲了一件最近真正让你开心的事，再说明回话可以交给谁。",{happiness:1,bond:1})
      ]);
    }
    if(!choice(s,"lead") && logged(s,"lead") && inWindow(s,32,41)){
      return question("lead","知道方向以后", "问到的地方得专门跑一趟。你可以自己去打听"+n+"，也可以只托人留下能找到你的去处，由对方决定要不要见面。",[
        option("seek","把路线问细，腾时间去找","亲自去一趟，也可能白跑。","你把哪一段得步行、到了先问谁都弄清楚了。下一个空出来的日子，你没有再答应别的约。",{knowledge:2,happiness:1}),
        option("leave-word","留下自己的消息，让对方作主","给以后留个开口，也留出距离。","你请人捎去自己的近况，交代清楚不用催着回话。说到你平日在哪里能碰见，倒比讲从前的事容易多了。",{bond:2})
      ]);
    }
    if(!choice(s,"gift") && inWindow(s,44,57)){
      return question("gift","这件东西可不可以带走",game.make,[
        option("give","把"+game.object.slice(2)+"送给对方","让这件东西跟着另一个人往下用。",game.give,{bond:3,happiness:1}),
        option("show","留下原件，另教一遍","保存自己的这一份，也让对方学会。",game.keep,{knowledge:2,bond:1})
      ]);
    }
    const death=logged(s,"death");
    if(death && !choice(s,"farewell") && inWindow(s,death.age+2,death.age+9)){
      return question("farewell","记得对方的人也在这里","一个也认识"+n+"的人留下来坐了一阵。你们以前总是先谈近况，如今两个人都停在开头，不知道由谁先说。",[
        option("tell","先讲你们怎样认识","把自己知道的那一段留给对方。","你说起小时候碰面的地方。那人没有打断，听到最后才说，原来朋友早年也有这么皮的时候。",{bond:3}),
        option("listen","请对方讲一个你没听过的片段","听听这个朋友在别处的样子。","对方讲了一回出门走错路的事，讲到朋友的口头禅，两个人竟一起把那半句接了下去。",{happiness:1,bond:2})
      ]);
    }
    const returned=logged(s,"returned"), learned=logged(s,"learned");
    if((returned||learned) && !choice(s,"legacy") && inWindow(s,68,82)){
      const context=returned?"早年领走"+game.object+"的人问起，你愿不愿同后来用它的人坐一会儿。对方说，东西已经传过几双手，有些用法连最初做它的人都没见过。":
        "跟你学过做法的那个人又带了一位初学者过来。你们都能把这件事从头示范一遍，只是彼此的习惯已经有些不同。";
      return question("legacy","今天由谁起头",context,[
        {...option("begin","自己先做，再请新人试试","把最早的做法示范给大家。","你照着自己的习惯开头，到了最容易出错的地方便停一下。接手的人试第二次时，你把伸出去的手收了回来。",{knowledge:2,bond:2}),
          follow:{after:2,title:"那个故意停一下的地方",text:"有个来学过的人特地告诉你，前阵子轮到自己教别人，也在你当初停下的那个地方等了一会儿。"}},
        {...option("watch","让后来的人带头，你坐下来听","看看这件事在别人手里变成什么样。","你挪到旁边坐下。才演到一半你就笑了起来，原来有一步已经被改得这么顺手，怪不得他们一直想请你来。",{happiness:3,bond:1}),
          follow:{after:1,title:"这一回轮到你问",text:"当时那位做示范的人后来又来了一趟。你把自己没看清的一步问明白，这次是对方慢下来等你。"}}
      ]);
    }
    return null;
  }

  root.LifeFriendStory=Object.freeze({events,card});
})(globalThis);
