/* A household story follows one remembered person through their actual lifetime. */
(() => {
  'use strict';
  const roles={mother:'母亲',father:'父亲',elder:'祖辈',older:'年长的手足',younger:'年幼的手足',partner:'伴侣'};
  const hash=(s,n)=>globalThis.LifeWorld.hash(s.seed,n);
  const inWindow=(age,start,width)=>age>=start&&age<start+width;
  const family=s=>globalThis.LifeFamily.members(s);
  const name=p=>(p.role==='祖辈'?'家里的长辈':p.role)+p.name;
  const has=(s,key)=>s.log.some(e=>e.threadKey===key);
  const event=(key,title,text,tone,effects)=>({key,title,text,tone,effects});

  // The loss and the later recollection refer to the object introduced in childhood.
  const objects=[
    {
      id:'button',lessonTitle:'先缝袋子上的扣子',
      lesson:p=>p+'没有把自己的衣服递给你。练手的是个旧布袋，扣子缝歪了也能装东西。你咬着嘴唇穿过最后一个孔，把袋口扣了又解，试了好几次。',
      adultLesson:p=>'你带去的袋子掉了一粒扣子。'+p+'拿出针线，让你先在针脚下垫一根细线，缝好再抽掉。原来稍微留一点松，扣眼才容易套进去。',
      joyTitle:'一粒扣子，两种用法',
      joy:p=>'旧布袋的扣子又松了。这回是你给'+p+'看怎样缝。缝到底才发现袋口给缝死了。你俩轮流伸手进去，谁也掏不到里面那点零钱。',
      lossTitle:'装针的那块布',loss:p=>p+'去世了。整理东西时，你解开一小块叠好的布，针别在里面，旁边拴着两粒旧扣子。你照原来的折痕把它包好。',
      echoTitle:'衣襟上的旧扣子',echo:p=>'衣襟掉了一粒扣子。那块折好的布里，正好有一粒差不多大的。你缝得慢，想起和'+p+'凑在一起给袋子缝扣子的样子。'
    },
    {
      id:'cloth',lessonTitle:'打一个能解开的结',
      lesson:p=>p+'拿一块方布包起小碗，留一个布角在外头，让你提着走几步。你打的头一个结怎么也解不开。第二回轻轻一抽，碗稳稳落回桌上。',
      adultLesson:p=>'要把一只装着东西的碗带走，手上偏偏没有盖。'+p+'摊开一块布教你，两角打结，留一小截在外面。你试着提起来走了几步，里面竟一点也没洒。',
      joyTitle:'碗底藏着什么',
      joy:p=>'你用布包住一件东西，请'+p+'隔着布猜。对方摸了半天，郑重其事地说是块石头。你一扯布角，露出一只倒扣的碗，两个人都笑出了声。',
      lossTitle:'方布晾干以后',loss:p=>p+'去世后，你收起晾干的衣物，最后剩下一块洗薄了的方布。你顺手把对角打成活结，手指停了一下，又慢慢把结解开。',
      echoTitle:'把东西稳稳送到',echo:p=>'要送出去的小碗没有盖。你翻出一块布，包好后特意把一个角留在外头。提起来时，你想起'+p+'当年让你先走几步试试。'
    },
    {
      id:'rhythm',lessonTitle:'别急，还有一下',
      lesson:p=>p+'拿指节在桌上一轻一重地敲，让你背过身学。你每次都抢最后一下。等到两个人终于敲齐了，对方悄悄加上一拍，你又上了当。',
      adultLesson:p=>'等人时，'+p+'随手在桌上敲了几下。你学了一遍，总早半拍。对方把动作慢下来，等到你跟上时，又悄悄添了第三下。',
      joyTitle:'隔着门也认得出来',
      joy:p=>'门外有人敲了一轻一重两下。你忍着没开，等那多出来的第三拍。门一开，'+p+'还举着手，你俩连招呼都没打就笑了。',
      lossTitle:'安静下来的桌子',loss:p=>p+'去世了。那天桌边挤了许多人。等他们散去，你坐回去，在桌沿上敲了两下，第三下轻轻落在自己的膝盖上。',
      echoTitle:'第三拍留给自己',echo:p=>'有人在附近一下一下修东西。你本来正出神，不知不觉用指尖补了个拍子，忽然又听清了'+p+'当年敲桌子的轻重。'
    }
  ];

  function remembered(s,members){
    const entry=s.log.find(e=>e.threadKey?.startsWith('home-lesson-'));
    if(!entry)return null;
    const [, ,objectId,roleId]=entry.threadKey.split('-');
    const object=objects.find(o=>o.id===objectId),person=members.find(p=>p.role===roles[roleId]||(roleId==='partner'&&p.role==='分居伴侣'));
    return object&&person?{entry,object,person}:null;
  }
  function firstLesson(s,members){
    const people=Object.entries(roles).filter(([,role])=>members.some(p=>p.role===role&&p.living&&
      (!role.endsWith('手足')||(s.age>=18&&p.age>=16))));
    if(!people.length)return [];
    const [id,role]=people[hash(s,4823)%people.length];
    const teacher=members.find(p=>p.role===role),object=objects[hash(s,4824)%objects.length];
    const tell=s.age>=18?object.adultLesson:object.lesson;
    return [event('home-lesson-'+object.id+'-'+id,object.lessonTitle,tell(name(teacher)),'joy',{knowledge:1,bond:1})];
  }
  function sharedEvening(s,members){
    const child=members.find(p=>p.role==='孩子'&&p.living&&p.age>=4);
    const partner=members.find(p=>p.role==='伴侣'&&p.living);
    const sibling=members.find(p=>p.role.endsWith('手足')&&p.living);
    if(child&&child.age<=12)return event('home-evening','有人偷偷改了规矩','孩子'+child.name+'要和你比谁先笑。你抿紧嘴，眼看要赢，对面忽然宣布，大人得闭着眼。你刚说出“凭什么”，就已经输了。','joy',{happiness:2,bond:1});
    if(child)return event('home-evening','盘底剩着的两块','孩子'+child.name+'来看你。盘里剩了两块果子，你们同时伸手，都想把大块推过去。两个人推来推去，最后干脆把两块全分成了小块。','joy',{happiness:2,bond:1});
    if(partner)return event('home-evening','歪向一边的桌子','伴侣'+partner.name+'扶着桌沿，你蹲下来垫短的那条腿。刚要起身，桌面又晃起来。你抬头才发现，对方在用手指偷偷压另一头。','joy',{happiness:2,bond:1});
    if(sibling)return event('home-evening','只许比画','你和'+name(sibling)+'重逢时，比赛只用手势猜东西。你假装裤脚被门夹住，对方猜是条鱼，竟比你原先想的还像。','joy',{happiness:2,bond:1});
    return event('home-evening','给自己留的那一口','切开熟透的果子，你照旧把最好的一块搁到碗边。这一回，你搬了把椅子，慢慢坐下，专心把它吃掉。','joy',{happiness:2});
  }
  function eveningEcho(evening){
    const details={
      '有人偷偷改了规矩':['这局谁赢了','听见有人问小时候玩什么，你学了一遍那次憋笑的规矩。自己这次学得格外认真，说到大人必须闭眼，到底还是先笑了。'],
      '盘底剩着的两块':['这回一开始就切开','再摆果盘时，你先把大小不一的几块拆开分好。盘底空下来的地方，让你想起上次两只手推来推去的样子。'],
      '歪向一边的桌子':['桌下的小木片','桌腿边那片垫子挪了位。你蹲下把它塞好，抬头时还记得，有人曾经故意压着桌子另一头，害你怎么垫也垫不平。'],
      '只许比画':['原先是要比画什么','想到和手足比画的那条鱼，你站起来，试着再做一次被门夹住裤脚的动作。这回自己也觉得像鱼了。'],
      '给自己留的那一口':['把椅子留在窗边','屋里腾出一小块地方，你把椅子挪到能坐得舒服的位置。上回在碗边给自己留了那一口，今天你坐稳了才动勺子。']
    };
    const row=details[evening.title];
    return row?[event('home-evening-echo',row[0],row[1],'hope',{happiness:1})]:[];
  }
  function events(s){
    if(!s||s.version===1||s.ended||s.age<6)return [];
    const members=family(s),memory=remembered(s,members);
    const introduction=Math.max(6+hash(s,4822)%3,s.storyFrom||0);
    if(!memory&&inWindow(s.age,introduction,3)){
      const lesson=firstLesson(s,members);
      if(lesson.length)return lesson;
    }
    if(memory){
      const {object,person,entry}=memory;
      const lossKey='home-loss-'+object.id;
      const partner=person.role==='伴侣'||person.role==='分居伴侣';
      // The engine records widowhood itself. Keep that single entry as the source.
      const loss=partner?s.log.find(e=>e.age>=entry.age&&e.kind==='milestone'&&e.title==='共同生活的人'):s.log.find(e=>e.threadKey===lossKey);
      if(!partner&&!person.living&&!loss){
        const last=family({...s,age:s.age-1}).find(p=>p.role===person.role&&p.name===person.name);
        if(last?.living)return [event(lossKey,object.lossTitle,object.loss(name(person)),'loss',{happiness:-2})];
      }
      if(loss&&inWindow(s.age,loss.age+3+hash(s,4825)%4,3)&&!has(s,'home-echo-'+object.id)){
        const text=partner&&object.id==='button'?'衣襟松了一粒扣子。你把针线摊开，照着'+name(person)+'教过的办法，在针脚底下给扣眼留一点松。':object.echo(name(person));
        return [event('home-echo-'+object.id,object.echoTitle,text,'hope',{happiness:1})];
      }
      if(person.living&&person.role!=='分居伴侣'&&inWindow(s.age,entry.age+6+hash(s,4826)%4,3)&&!has(s,'home-game-'+object.id)){
        return [event('home-game-'+object.id,object.joyTitle,object.joy(name(person)),'joy',{happiness:2})];
      }
    }
    const evening=s.log.find(e=>e.threadKey==='home-evening');
    if(inWindow(s.age,Math.max(35+hash(s,4827)%8,s.storyFrom||0),3)&&!evening)return [sharedEvening(s,members)];
    if(evening&&!memory&&inWindow(s.age,evening.age+2,3)&&!has(s,'home-evening-echo'))return eveningEcho(evening);
    return [];
  }

  function option(id,label,note,outcome,effects,after,title,text){
    return {id,label,note,outcome,effects,follow:{after,title,text}};
  }
  function choice(s,id,title,text,options,tone){
    const key='thread-home-'+id;
    if(Object.hasOwn(s.decisions||{},key))return null;
    return {id:key,type:'choice',category:'family',title,text,options,tone};
  }
  function earlyCard(s,p){
    return choice(s,'afternoon','还要等一会儿',
      name(p)+'在找一件一直舍不得扔的旧东西，说等找着了就讲它的来历。门外的同伴已经喊了你两回。这一下午只剩这么一小段。',
      [option('stay','坐下帮忙翻找','今晚能听到来历，同伴那边要自己解释。','你蹲下来一起找。听完故事再跑出门，外边已经散场了。',{bond:2,happiness:-1},4,'记得从哪儿讲起','轮到你向别人讲一件旧东西的来历。你先讲它从哪双手来，再讲它值不值得留下。'),
       option('go','先去赴同伴的约','你保住了约定，也要接受故事可能会落下一段。','你在门外应了声，转身把盒盖轻轻放在椅子上。那天下午，伙伴替你留着位置。',{happiness:2,bond:-1},3,'后来没听全的故事','一说到那件旧东西，你只记得盒盖搁在椅子上的样子。有些细节后来再问，听到的已经是好几种说法。')],'hope');
  }
  function careCard(s,p){
    if(hash(s,4841)%2===0)return choice(s,'care','只剩半天的空当',
      name(p)+'这几天手不方便，想有人陪着把要用的东西挪到低处。你原本答应今天替另一位熟人照看摊上的物件。两边都在等答复。',
      [option('visit','亲自过去，把半天腾出来','推掉原来的约定，陪家人把东西逐样放好。','你先去说明缘由，再赶回去。家人指着架子说，不用全拿下来，只要常用的那几样。',{bond:3,happiness:-1},3,'低处的杯子','给常来的客人收拾桌面时，你下意识把杯子放在伸手可及的地方。挪东西的那个下午，让你记住了这个高度。'),
       option('arrange','找人搭把手，自己守约','先找两边都信任的人过去，再按时赴约。','你托到人，也守了约。很久以后，你才知道那天家人其实还有一句闲话想当面讲。',{bond:-1,knowledge:2},2,'开口再多问一句','又有人请你帮个忙。这回你除了问要办什么，还问：“想要人帮你做，还是想找人坐一会儿？”')],'regret');
    return choice(s,'care','要带走哪段时间',
      name(p)+'请你陪着走一趟熟悉的路，看看以前常去的地方。偏巧那一天，你也终于有了完整的时间来做自己的事。',
      [option('walk','把这一天留给同行','自己的计划要往后挪，路上可以慢慢停。','你们走走停停。快到目的地时，家人已经讲完想讲的事，两个人索性掉头往回。',{bond:3,happiness:-1},3,'原来不必走到头','后来你陪人出门，走到一半听见对方说累，便寻了个地方坐下。那条没有走完的路，教会了你这件小事。'),
       option('half','只同行一段，留半天给自己','说清自己能陪多久，请对方先挑最想走的一段。','到岔口你们彼此挥手。你办成了原先的事，后来却总猜不出另一条路上有什么。',{happiness:2,bond:1},4,'在岔路口停一下','再经过分路的地方，你停了几步。那个给自己留下半天的决定至今说得通，没能一起走的那段路也一直记得。')],'hope');
  }
  function laterCard(s,memory){
    const keepsake=memory.object.id==='button'?'包着针和旧扣子的那小块布':'那块能包住一只碗的方布';
    return choice(s,'keepsake','旧物该放在哪里',
      '整理抽屉时，你又摸到'+keepsake+'，想起'+name(memory.person)+'教你时手上的动作。来探望你的人听得入神，说如果你愿意，也可以交给自己保管。',
      [option('keep','讲给对方听，把东西留在身边','你愿意分享它的来历，还想自己收着。','你把东西放在两个人中间，讲完以后收回抽屉。对方记住了你讲到一半笑起来的地方。',{happiness:2},3,'抽屉熟悉的声音','你听见抽屉轻响，顺手摸到了那个熟悉的位置。如今有人也知道，为什么你会把一件小东西收这么久。'),
       option('pass','亲手交出去，让对方保管','东西此后不在手边，故事有了另一位讲述者。','你松开手，让对方接过去。回家时手上很轻，那天晚上却几次走到抽屉前。',{bond:3,happiness:-1},3,'不用翻抽屉了','聊到一件舍不得的物件时，你把双手摊开，只用话就讲清了它是什么模样。那件东西已经在别人的手里了。')],'hope');
  }
  function card(s){
    if(!s||s.version===1||s.ended||s.age<11)return null;
    const early=inWindow(s.age,11+hash(s,4830)%3,7);
    const care=inWindow(s.age,31+hash(s,4831)%8,10);
    const late=inWindow(s.age,62+hash(s,4832)%7,9);
    if(!(early||care||late))return null;
    const members=family(s),memory=remembered(s,members);
    if(early&&memory?.person.living)return earlyCard(s,memory.person);
    if(care){
      const p=memory?.person.living&&memory.person.role!=='分居伴侣'?memory.person:members.find(m=>m.living&&Object.values(roles).includes(m.role));
      if(p)return careCard(s,p);
    }
    if(late&&memory&&memory.object.id!=='rhythm'){
      const loss=s.log.find(e=>e.threadKey==='home-loss-'+memory.object.id);
      if(loss&&s.age>loss.age+6)return laterCard(s,memory);
    }
    return null;
  }
  globalThis.LifeHomeStory=Object.freeze({events,card});
})();
