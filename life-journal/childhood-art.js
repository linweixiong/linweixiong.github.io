/* Shared childhood choices and their recorded consequences. The set, cast and action
   belong to an individual story; neither a clock nor the renderer can choose for a player. */
(() => {
  "use strict";
  const root=globalThis, chapterPrefix="story-chapter-";
  const cores={
    temper:[2,{wave:"先挥挥手",watch:"靠在熟悉的人身边看看"}],
    interest:[7,{team:"加入跑动的队伍",sketch:"坐下学画身影"}],
    childhood:[8,{family:"陪家人一起去",explore:"去附近观察"},{family:"你还记得怎么挑",explore:"观察簿的第一页"}],
    friend:[10,{invite:"邀请对方一起走",listen:"留下听听发生了什么"}],
    club:[12,{organise:"召集几个人分工",design:"先做个小样"}],
    self:[14,{talk:"向信任的人说出来",retry:"把没弄懂的地方圈起来"}],
    training:[15,{workshop:"去工作现场",reading:"借学习资料来读"}]
  };
  const chapterIds=new Set(["box","tower","song","lost","rules","market","relay","quiz","team-list","secret","repair","notice"]);
  const moments={
    "谁在说话":[0,"baby-left"],"回答的声音":[6,"quiet-answer"],
    "讲故事的人忘词了":[8,"story-circle"],"教会另一个人":[10,"knot-show"],
    "都叫汪汪":[1,"imitate-bird"],"都叫我的":[2,"name-shoe"],"今天有两个昨天":[3,"two-yesterdays"]
  };
  const games=[
    ["clothball",/布球|旧布团成的球|这只球|重卷|球.{0,3}松开了口|开口拆一小段|顺着它的弯路|把布理匀|球卡在|球门/],
    ["rhythm",/拍子|节奏|放慢，教会旁边的人|两拍|一拍|敲.{0,5}两下/],
    ["road",/小道|岔路|回路|画路|画的小路|画在地上|用指头在地上画|另画一座桥|桥面|一座.{0,3}桥|画路过来/]
  ];
  function gameKey(info){
    const words=[info.eventTitle,info.detail,info.caption].join(" ");
    return games.find(([,rx])=>rx.test(words))?.[0];
  }
  function resolve(state,info){
    const id=info.cardId||info.originCard||"",title=info.eventTitle||"",age=info.eventAge??state.age;
    const mode=info.mode,key=info.threadKey||"",previous=info.originOption;
    if(!["choice","response","echo","scene"].includes(mode))return null;
    if(id.startsWith("local-")||info.sourceKey?.includes("/"))return null;
    const live=mode==="choice",direct=mode==="response",echo=mode==="echo";
    if(mode==="scene"&&moments[title]?.[0]===age)return {key:"year",plate:moments[title][1]};
    if(mode==="scene"&&key==="friend-two-waves"&&age>=1&&age<=2)return {key:"year",plate:"two-waves"};
    if(live||id){
      if(id in cores)return {key:id,option:live?"":previous||state.decisions?.[id]};
      if(id.startsWith(chapterPrefix)&&chapterIds.has(id.slice(chapterPrefix.length)))
        return {key:id.slice(chapterPrefix.length),option:live?"":previous||state.decisions?.[id]};
    }
    if(id==="thread-home-afternoon"||key==="thread-home-afternoon"||key==="thread-home-afternoon-echo"){
      return {key:"afternoon",option:live?"":state.decisions?.["thread-home-afternoon"]||
        (/坐下|从哪儿/.test(title)?"stay":"go")};
    }
    if(id==="thread-friend-game"||key==="thread-friend-game"||["friend-next-game","friend-our-game"].includes(key)||key.startsWith("friend-met-")){
      const earliest=state.log?.find(row=>row.threadKey?.startsWith("friend-met-"));
      const game=gameKey(info)||(earliest&&gameKey({detail:earliest.text}));if(!game)return null;
      const option=live||key.startsWith("friend-met-")||key==="friend-next-game"?"":state.decisions?.["thread-friend-game"]||
        (/拆一小段|放慢|补一条|不必从头教/.test(title)?"friend-practice":"friend-invent");
      return {key:game,option,phase:key.startsWith("friend-met-")?"met":key==="friend-next-game"?"next":key==="friend-our-game"?"echo":""};
    }
    // Older records only carry the text of the choice. Require the event kind and age,
    // and never match a similarly named scene from a different country or chapter.
    if(!direct&&!echo)return null;
    for(const [name,[start,choices,follow]] of Object.entries(cores)){
      const labels=direct&&age===start?choices:echo&&name==="childhood"&&age===14?follow:null;
      const found=Object.entries(labels||{}).find(([,label])=>label===title);
      if(found)return {key:name,option:found[0]};
    }
    for(const card of root.LifeChapters?.choiceStories||[]){
      const name=card.id.replace(/^chapter-/,"");
      if(!chapterIds.has(name))continue;
      const opt=card.options.find(o=>direct?
        age===card.minAge&&o.label===title:
        o.follow&&age===card.minAge+o.follow.after&&o.follow.title===title);
      if(opt)return {key:name,option:opt.id};
    }
    return null;
  }
  const palette={ink:"#443442",deep:"#57404a",rust:"#aa6849",gold:"#d39b61",light:"#ebc18c",paper:"#e4cba2",pale:"#f2dbad",blue:"#6a8b90",sage:"#93a08a"};
  const bounded=x=>Math.max(0,Math.min(1,x)),mix=(a,b,p)=>a+(b-a)*p;
  const faces={small:0,walking:1,sitting:2,teen:3,running:4,waiting:5};
  const assets={temper:"childhood/temper-wait",song:"childhood/song-wait",yard:"childhood/court",actors:"childhood/cast"};
  function create(state,info,g){
    const scene=resolve(state,info);if(!scene)return null;
    const {key,option}=scene;
    const region=state.region==="IND"&&root.LifeWorld?.storySetting(state)?.id;
    if(state.region==="IND"&&["song","temper"].includes(key))return null;
    const {ctx,backdrop,box,polygon,line,ellipse,shade}=g,P=palette,echo=info.mode==="echo",replay=!!option;
    const paper="#edd6a8",ink="#66545b";
    let cast;
    const outdoor=new Set(["interest","friend","rules","relay","team-list","clothball","rhythm","road","lost"]);
    const set=key==="year"?"childhood/"+scene.plate:assets[key]||(outdoor.has(key)?assets.yard:"desk");
    function actor(style,x,floor,height,flip=false){
      cast=cast||g.resource?.(assets.actors);
      if(!cast?.naturalWidth)return;
      // All cropped poses are padded onto identically sized cells, with the soles on
      // the same baseline. A horizontal mirror turns the entire body, including eyes.
      const tile=faces[style],side=cast.naturalWidth/3,w=height;
      shade(x,floor,w*(style==="sitting"?.21:.135));
      ctx.save();ctx.translate(Math.round(x),Math.round(floor));if(flip)ctx.scale(-1,1);
      ctx.drawImage(cast,(tile%3)*side,Math.floor(tile/3)*side,side,side,-w/2,-height,w,height);ctx.restore();
    }
    function stroked(points,color,width=2){
      for(let i=1;i<points.length;i++)line(...points[i-1],...points[i],color,width);
    }
    function hardback(x,y,w=83,h=61,turn=0){
      ctx.save();ctx.translate(x,y);ctx.rotate(turn);
      shade(0,3,w*.62);polygon([[-w/2,-h],[w/2,-h+2],[w/2+7,-5],[2,2],[-w/2-4,-4]],"#584850");
      polygon([[-w/2+3,-h+4],[-5,-h+6],[0,-h+10],[0,-2],[-w/2,-8]],"#e1c395");
      polygon([[1,-h+10],[7,-h+7],[w/2-2,-h+3],[w/2+3,-9],[1,-3]],paper);
      line(0,-h+10,0,-2,"#9c7d63",2);
      ctx.restore();
    }
    function pencil(x,y,angle=0){
      ctx.save();ctx.translate(x,y);ctx.rotate(angle);
      polygon([[0,0],[6,-2],[52,-38],[48,-42],[2,-7]],"#9c644b");
      line(6,-7,46,-37,"#edb367",3);polygon([[0,0],[3,-8],[7,-3]],"#e0be8a");box(0,-2,2,2,ink);ctx.restore();
    }
    function sketch(x,y,w,p,shape="person"){
      const paths=shape==="person"?[[[2,4],[6,0],[11,1],[14,5],[11,10],[5,10],[2,4]],[[8,11],[9,23],[17,30]],[[9,23],[3,33]],[[8,12],[0,17]],[[9,13],[18,9]]]:
        shape==="route"?[[[0,25],[7,25],[7,12],[19,12],[19,5],[28,5]],[[8,23],[15,29],[24,25],[24,13]]]:
        [[[0,3],[9,3],[15,5],[29,4]],[[0,11],[5,11],[7,14],[20,12],[29,13]],[[0,22],[13,21],[19,23],[26,22]]];
      const total=paths.reduce((sum,r)=>sum+r.length-1,0);let n=Math.ceil(total*bounded(p));
      for(const row of paths){for(let i=1;i<row.length&&n>0;i++,n--){const a=row[i-1],b=row[i];line(x+a[0]*w,y+a[1]*w,x+b[0]*w,y+b[1]*w,"#716162",Math.max(1,w*1.6))}}
    }
    function cube(x,y,w,h,color=P.rust,top=P.gold){
      const d=Math.round(w*.18);shade(x+w*.53,y+2,w*.63);
      polygon([[x,y-h],[x+w,y-h],[x+w,y],[x,y]],color);
      polygon([[x,y-h],[x+d,y-h-d],[x+w+d,y-h-d],[x+w,y-h]],top);
      polygon([[x+w,y-h],[x+w+d,y-h-d],[x+w+d,y-d],[x+w,y]],"#664955");
      line(x+2,y-1,x+w-1,y-1,"#805749");line(x+4,y-h+3,x+w-4,y-h+3,top,1);
    }
    function chalk(x,y,x2,y2,col="#edc793"){
      line(x,y,x2,y2,"rgba(70,49,48,.4)",5);line(x,y-1,x2,y2-1,col,3);
    }
    function ball(x,y,r=15,rag=false){
      shade(x,y+2,r*.95);ellipse(x,y-r,r,r,"#664552");ellipse(x-1,y-r-2,r-2,r-2,rag?"#b98370":"#bf9468");
      stroked([[x-r+2,y-r-3],[x-3,y-r+1],[x+4,y-r],[x+r-2,y-r+3]],rag?"#795661":"#8e6756",2);
      if(rag)stroked([[x-2,y-2*r+2],[x+4,y-r-4],[x+3,y-r+4],[x+7,y-3]],"#e9b99a",2);
      ellipse(x-r*.35,y-r*1.42,Math.max(2,r*.22),Math.max(1,r*.12),"#e7bd8e");
    }
    function clothBag(x,y,size=1){
      ctx.save();ctx.translate(x,y);ctx.scale(size,size);shade(0,2,43);
      polygon([[-25,-69],[18,-69],[15,-56],[31,-25],[31,-12],[22,-3],[-8,1],[-34,-6],[-37,-20],[-18,-55]],"#81515c");
      polygon([[-22,-64],[15,-65],[9,-53],[24,-30],[20,-12],[7,-7],[-21,-10],[-30,-22],[-13,-54]],"#b77970");
      stroked([[-19,-56],[-3,-53],[14,-55],[27,-51]],"#e3b276",3);
      for(let i=0;i<5;i++){const a=i*1.256;ellipse(Math.cos(a)*8-2,Math.sin(a)*7-27,5,3,i===3?"#e8be7d":"#cf9c66")}
      box(-4,-29,5,5,"#754a4e");ctx.restore();
    }
    function localGoods(x,y){
      if(!region)return false;
      if(region==="tamil"){
        shade(x,y,49);polygon([[x-48,y-24],[x+46,y-24],[x+36,y-4],[x+15,y],[x-31,y-2]],"#9e7049");
        for(let row=0;row<3;row++)for(let j=0;j<13-row;j++){
          const xx=x-39+j*6+row*3,yy=y-24-row*5+(j%2)*2;
          ellipse(xx,yy,5,3,"#f1d9a7");box(xx,yy-2,2,2,"#fff0ce");
        }
        for(let i=0;i<4;i++)line(x-39+i*3,y-21+i*4,x+36-i*2,y-21+i*4,"#d5a36b");
      }else{
        polygon([[x-38,y-30],[x+35,y-33],[x+47,y-5],[x-34,y+1]],"#934951");
        for(let i=0;i<8;i++){
          const xx=x-29+i*9;stroked([[xx,y-20],[xx+4,y-25],[xx+8,y-20],[xx+4,y-15],[xx,y-20]],"#e5ac65",2);
          line(xx,y-10,xx+4,y-5,"#d4b377",2);
        }
      }
      return true;
    }
    function berries(x,y){
      if(localGoods(x,y))return;
      for(let i=0;i<5;i++){const xx=x+(i-2)*10,yy=y-(i%2)*6;ellipse(xx,yy-7,9,8,i%2?"#bb7c54":"#bd975f");line(xx,yy-15,xx+2,yy-19,"#6f7151",2)}
    }
    function bag(x,y){shade(x,y,33);polygon([[x-28,y-45],[x+28,y-45],[x+31,y-4],[x+17,y+1],[x-25,y]],"#ac895b");
      stroked([[x-15,y-43],[x-15,y-58],[x-10,y-65],[x+10,y-65],[x+15,y-58],[x+15,y-43]],"#c2a375",4);
      line(x-23,y-39,x-18,y-4,"#ceb47d",2);line(x+23,y-38,x+19,y-4,"#84694c",2);}
    function basket(x,y,r){
      shade(x,y,r);polygon([[x-r,y-r*.74],[x+r,y-r*.74],[x+r*.7,y-2],[x+r*.52,y+1],[x-r*.62,y]],"#926443");
      for(let row=0;row<5;row++){
        const yy=y-r*.65+row*r*.13,wide=r*(.93-row*.064);
        line(x-wide,yy,x+wide,yy+1,row%2?"#ba8551":"#cca065",2);
        for(let j=-4;j<=4;j++)line(x+j*wide/5,yy-2,x+j*wide/5-2,yy+2,"#73533f",1);
      }
      ellipse(x,y-r*.74,r,r*.22,"#d0a26a");ellipse(x,y-r*.74,r-4,r*.15,"#59473d");
      line(x-r*.52,y-r*.8,x+r*.56,y-r*.8,"#8d6d4a",1);
    }
    function crate(x,y,w){
      const h=w*.67;
      polygon([[x,y-h],[x+w*.17,y-h-9],[x+w*1.1,y-h-9],[x+w,y-h+3]],"#865f4a");
      for(let i=0;i<3;i++){
        const yy=y-h+i*h/3;
        polygon([[x,yy],[x+w,yy+2],[x+w,yy+h*.27],[x,yy+h*.27]],i%2?"#b28b62":"#9e7453");
        line(x+4,yy+2,x+w-4,yy+4,"#d3ad77");
      }
      for(const xx of [x+3,x+w-8]){box(xx,y-h,5,h,"#8c6a4e");box(xx+1,y-h+5,2,2,"#493c3c");box(xx+1,y-7,2,2,"#493c3c")}
    }
    function leaves(x,y){
      for(let i=0;i<8;i++){
        const dx=x+(i%4)*9,dy=y+(i%3)*4;
        polygon([[dx,dy],[dx-6,dy-11],[dx-3,dy-17],[dx+1,dy-12],[dx+3,dy-20],[dx+8,dy-17],[dx+8,dy-8],[dx+4,dy]],i%2?"#586548":"#76805b");
        line(dx+2,dy,dx+3,dy-11,"#abad78");
      }
    }
    function puddle(x,y,size){
      polygon([[x-size,y+2],[x-size*.65,y-3],[x-size*.3,y-4],[x-size*.16,y-7],[x+size*.65,y-6],[x+size,y-3],[x+size*.56,y+1],[x+size*.09,y+3]],"#706e76");
      line(x-size*.72,y,x-size*.25,y-1,"#a39a94",2);line(x+size*.04,y-4,x+size*.64,y-4,"#bbad9c",1);
    }
    function drape(x,bottom,pattern=false){
      const y=bottom-83;
      polygon([[x,y],[x+48,y+4],[x+45,bottom-5],[x+31,bottom],[x+18,bottom-5],[x+5,bottom-2]],pattern?"#856077":"#9b6c5e");
      for(let i=0;i<5;i++){
        line(x+5+i*9,y+3,x+7+i*8,bottom-5,i%2?"#ab7e75":"#664e62",2);
        if(pattern)for(let j=0;j<6;j++){
          const xx=x+4+i*9,yy=y+11+j*11;polygon([[xx,yy],[xx+3,yy-3],[xx+5,yy],[xx+3,yy+3]],"#cfaa82");
        }
      }
      for(let i=0;i<11;i++)line(x+5+i*4,bottom-4,x+5+i*4,bottom+1+i%3,"#cfaa82",1);
    }
    function bicycle(x,y,scale){
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
      for(const xx of [-26,30]){
        ellipse(xx,-16,15,15,"#4b3e44");ellipse(xx,-16,12,12,"#927e72");
        for(let i=0;i<8;i++)line(xx,-16,xx+Math.cos(i*.785)*12,-16+Math.sin(i*.785)*12,"#b6a698",1);
      }
      stroked([[-26,-16],[-11,-39],[1,-16],[-26,-16],[17,-34],[1,-16]],"#735851",3);
      line(16,-43,30,-16,"#b7a18b",3);line(13,-44,19,-44,"#4c4147",3);line(-17,-40,-6,-40,"#56464a",3);ctx.restore();
    }
    function localGround(){
      // The first sentence is the actual, save-specific location. The next cut shows
      // the play action but keeps its concrete foreground props inside the frame.
      const words=(info.detail||"").split("。")[0];
      if(/两只空筐/.test(words)){basket(19,278,43);basket(579,272,41);leaves(4,224)}
      else if(/空木箱|装水果的空箱|水果分筐/.test(words)){crate(-10,277,64);crate(555,265,60);
        if(/菜摊/.test(words))leaves(548,218);else berries(566,219)}
      else if(/修鞋/.test(words)){
        cube(-11,269,82,11);polygon([[0,252],[2,234],[16,230],[25,239],[38,242],[54,243],[61,250],[61,254],[4,256]],"#634645");
        line(1,255,58,253,"#c39973",3);for(let j=0;j<3;j++)line(15+j*4,236+j,21+j*4,235+j,"#c99b76",2);
        line(50,239,70,225,"#c7b9a5");stroked([[70,225],[74,230],[69,236],[62,238]],"#af845d");
      }else if(/渠边|灌溉渠/.test(words)){
        polygon([[0,223],[21,233],[47,246],[77,266],[95,275],[120,300],[0,300]],"#677b75");
        stroked([[0,218],[20,227],[53,244],[80,265],[102,277],[131,300]],"#847756",7);
        line(5,255,27,259,"#a4aa8d",2);line(27,274,60,282,"#9d9b82",2);
        if(/水壶|一壶/.test(words)){ellipse(38,223,14,15,"#ab7d62");box(29,201,16,9,"#a07a60");ellipse(37,202,10,3,"#d1a87e")}
      }else if(/田埂|刮掉鞋底/.test(words)){
        puddle(19,267,64);puddle(575,255,37);if(/树枝/.test(words)){line(545,274,586,252,"#8c6f57",3);line(565,265,565,256,"#8c6f57",2)}
        else leaves(1,255);
      }else if(/抖落伞/.test(words)){
        stroked([[7,259],[53,213],[59,213],[60,217]],"#715a55",3);
        polygon([[10,255],[29,218],[47,213],[49,216],[14,254]],"#84758a");puddle(35,277,51);
      }else if(/自行车/.test(words)){bicycle(12,266,1.15);bicycle(590,268,.93)}
      else if(/纸.*篱笆/.test(words)){for(let i=0;i<3;i++)box(6+i*17,139+i*4,7,74,"#886c52");
        line(1,171,66,181,"#ad8d68",5);page(37,199,26,24,-.14)}
      else if(/青柠/.test(words)){for(let i=0;i<3;i++)ellipse(35+i*11,261-i%2*3,8,7,i%2?"#8d9c64":"#9aab65");
        ellipse(572,233,30,5,"#938d81");line(572,230,572,205,"#b5a891",3)}
      else if(/空袋折起了小船/.test(words)){polygon([[15,249],[37,236],[53,249],[72,242],[58,257],[30,260]],"#b69e78");line(18,249,55,253,"#dcbd91",2)}
      else if(/拣豆子|空袋叠/.test(words)){for(let i=0;i<3;i++)polygon([[2,264-i*6],[58,259-i*6],[69,264-i*6],[14,270-i*6]],i%2?"#ad9671":"#8c7b60");
        for(let i=0;i<11;i++)ellipse(7+(i*13)%61,272-(i%3)*4,3,2,"#c5aa79")}
      else if(/花布|新织的布|裁缝铺|缝衣铺/.test(words)){drape(0,135,/花布|新织/.test(words));drape(565,108,/花布|新织/.test(words))}
      else if(/洒过水|干燥的一小块|雨点|雨停后/.test(words)){puddle(15,267,64);puddle(587,267,50)}
      else if(/面包/.test(words)){for(let i=0;i<3;i++){const x=10+i*14,y=239-i%2*4;
        ellipse(x,y,12,7,"#b88558");line(x-5,y-3,x,y-5,"#ebbd7e",2)}crate(-12,276,70)}
    }
    function woodenCase(x,y,open=0){
      cube(x,y,80,54,"#9c6353","#d19972");box(x+27,y-37,36,19,"#533741");
      line(x+27,y-36,x+62,y-36,"#6f4750",3);
      if(open){const ly=y-65-open*16;cube(x+4,ly,81,5,"#9d6b56","#d7ad7b")}
    }
    function page(x,y,w,h,turn=0){
      ctx.save();ctx.translate(x,y);ctx.rotate(turn);polygon([[-w/2,-h],[w/2,-h+1],[w/2+4,0],[-w/2+2,1]],paper);
      line(-w/2+5,-h+3,w/2-4,-h+4,"#f3dbb3");ctx.restore();
    }
    function singing(t,p,choice){
      const name=key==="temper"?(choice==="wave"?"wave":choice==="watch"?"watch":"wait"):
        echo?(choice==="whisper"?"mistake":"chorus"):choice==="loud"?"lead":choice==="whisper"?"teach":"wait";
      const from="childhood/"+key+"-wait",to="childhood/"+key+"-"+name;
      transition(from,to,t,replay?1:p);
    }
    function transition(from,to,t,p){
      const x=Math.sin(t*.68)*.8,zoom=1.008+p*.012;
      if(from===to||p>=1){backdrop(to,x,zoom);return}
      backdrop(from,x,1.008);
      if(p>0&&g.canPaint?.(to)){
        ctx.save();ctx.globalAlpha*=bounded(p*1.5);backdrop(to,x,zoom);ctx.restore();
      }
    }
    function boxes(t,p,c){
      woodenCase(244,235);
      if(c==="touch"){
        if(p>.28){const x=mix(287,399,p),y=mix(212,235,p);polygon([[x-17,y-11],[x+10,y-16],[x+17,y-11],[x+9,y-7],[x+13,y-3],[x-12,y+1]],P.gold);line(x-12,y-1,x+5,y-5,P.light,2)}
      }else if(c==="hint"){
        const xx=378;for(let i=0;i<2;i++){const x=xx+i*20-Math.sin(t*4+i)*p*4;ellipse(x,226,9,5,"#cbc0aa");line(x+7,223,x+30,199-i*2,"#c5b99f",4)}
      }
    }
    function towers(t,p,c){
      if(region)localGoods(451,198);
      const colors=[["#a16b53","#d09b66"],["#72817b","#a1ac91"],["#aa725a","#e1ac79"]];
      for(let j=0;j<2;j++)for(let i=0;i<3;i++){
        const w=39-i*4+(echo&&c==="top"&&i===0?15:0), x=231+j*88-w/2+(c==="top"&&j===0&&echo?i*2:0);
        cube(x,239-i*19,w,17,...colors[(i+j)%3]);
      }
      const landing=c==="top"?215:244,toY=c==="top"?180:179;
      if(c==="join"){cube(mix(303,landing,p),mix(254,toY,p)-Math.sin(p*Math.PI)*28,mix(40,66,p),12,P.gold,P.light)}
      else cube(mix(303,landing,p),mix(254,toY,p)-Math.sin(p*Math.PI)*30,32,16,P.gold,P.light);
    }
    function figureStudy(t,p,c){
      const running=c==="team",stride=running?p*45:0,sw=Math.sin(t*2);
      actor("running",266+stride,210+sw*1.4,126);actor("walking",394,201,116,true);
      actor("sitting",154,236,102);hardback(170,234,38,26,-.08);
      if(c==="sketch"){sketch(160,212,.45,p);pencil(176+p*3,222,-.2)}
      else if(running){ball(284+Math.sin(p*Math.PI)*31+stride,224-16*Math.sin(p*Math.PI),9)}
      if(region){localGoods(481,209);polygon([[245,202],[251,206],[279,181],[284,172],[278,169]],"#a87f55")}
    }
    function errands(t,p,c){
      berries(227,220);bag(mix(324,c==="family"?250:324,p),240);
      hardback(c==="explore"?403-34*p:403,242,72,45);if(c==="explore"||echo)sketch(410-34*p,209,.7,p,"route");
      if(c==="explore")pencil(419-35*p,227,-.16);
    }
    function friends(t,p,c){
      const walking=c==="invite",listening=c==="listen",gap=listening?47*p:0,step=walking?p*68:0;
      actor(listening?"sitting":"walking",203+gap+step,231,129-(listening?24:0));
      actor("waiting",374-gap+step*(walking?.56:0),230,125,!walking);
    }
    function bagLost(t,p,c){
      if(echo){
        if(c==="wait"){clothBag(296,245,1.56);return}
        clothBag(263,236,.92);chalk(334,238,384,223);chalk(384,223,409,227);return;
      }
      clothBag(296,230,.79);if(c==="wait")actor("sitting",223,229,111);
      if(c==="notice"){const dx=306+p*40;actor("waiting",dx+42,215,115,true)}
    }
    function boundary(t,p,c){
      chalk(180,261,371,131);const x=c==="replay"?287+128*p:287,y=191+(c==="replay"?Math.sin(p*Math.PI)*-29:0);
      if(c==="draw"){chalk(233,224,233+62*p,224-42*p,"#e9cc93");chalk(336,166,336+32*p,166-18*p)}
      actor("walking",155,210,119);actor("waiting",425,201,114,true);ball(x,y,14);
    }
    function snack(x,y,p){
      for(let i=0;i<2;i++){const off=i?(10+13*p):(-12-13*p);const xx=x+off;
        shade(xx,y+1,18);polygon([[xx-14,y-1],[xx-18,y-12],[xx-5,y-22],[xx+10,y-19],[xx+17,y-12],[xx+13,y-4]],"#a66c4b");
        polygon([[xx-14,y-10],[xx-9,y-16],[xx-2,y-18],[xx+10,y-15],[xx+13,y-12],[xx+5,y-10],[xx-2,y-6]],"#dfae72");
        for(let j=0;j<5;j++)box(xx-8+(j*5)%17,y-7-(j*7)%10,2,2,"#9a684c");}
    }
    function market(t,p,c){
      if(echo&&c==="sketch"){
        hardback(306,246,181,94);sketch(235,164,1.6,1);sketch(323,169,1.55,1);
        ellipse(266,185,9,5,"#967b6d");pencil(370,219);return;
      }
      hardback(391,234,85,60);snack(221,230,c==="share"?p:0);
      for(let i=0;i<3;i++){const x=287+i*10+(c==="share"?-20:c==="sketch"?23:0)*p;ellipse(x,250-i%2*3,7,3,"#ba965c");line(x-3,249-i%2*3,x+3,249-i%2*3,"#ead094",1)}
      if(c==="sketch"){sketch(396,185,.91,p);pencil(418,223)}
    }
    function relay(t,p,c){
      chalk(126,260,201,195);chalk(201,195,291,164);chalk(291,164,386,154);
      if(c==="bend"){actor("running",214+139*p,218-42*p,125-10*p);actor("waiting",425,192,111,true);}
      else{actor("running",195+p*28,229,137);actor("walking",343-p*52,222,135,true);}
      if(c!=="bend"){const x=237+p*25,y=174+p*9;
        line(x,y,x+25,y-3,echo?"#80694e":"#654858",echo?3:7);
        if(echo)line(x+16,y-2,x+21,y-9,"#8c7358",2);else line(x+1,y-1,x+24,y-4,"#e6b677",3)}
    }
    function quiz(t,p,c){
      const shift=c==="exchange"?82*p:0;
      page(227+shift,235,117,76,-.03);page(389-shift,218,113,75,.03);
      sketch(188+shift,170,1.6,1,"writing");sketch(351-shift,157,1.5,1,"writing");
      if(c==="ask"||c==="exchange"){line(196+shift,209,196+shift+62*p,208,"#a96e5c",3);pencil(245+shift,224)}
    }
    function teamList(t,p,c){
      actor("waiting",199,217,126);actor("walking",c==="trial"?315-70*p:318,228,128,true);
      actor("running",c==="trial"?379+32*p:390+33*p,215,125,c==="double");
      if(c==="double")actor("sitting",450+12*p,229,99,true);ball(286+16*p,224,9);
    }
    function secrets(t,p,c){
      // The person whose confidence is at stake is absent. Only the people present
      // in this moment appear. The close shot stays on two listeners in the recall.
      const number=echo?2:3;
      for(let i=0;i<number;i++){
        actor(["teen","waiting","walking"][i],198+i*91+(i===0&&c==="change"?p*15:0),227+(i%2)*8,144-(i%2)*9,i>0);
      }
    }
    function bits(x,y,amount){
      const parts=[[-22,-7,8],[5,-17,4],[22,-2,6],[-10,3,4]];
      for(const [dx,dy,r] of parts){const xx=x+dx*amount,yy=y+dy*amount;ellipse(xx,yy,r,r*.63,"#9b8b76");ellipse(xx-1,yy-1,Math.max(1,r-2),Math.max(1,r*.6-2),"#d2baa0");box(xx-1,yy-2,3,2,"#635960")}
    }
    function repair(t,p,c){
      if(echo){
        cube(260,234,81,42,"#7d7871","#aba594");ellipse(330,215,8,6,"#594c50");bits(329,216,.37);
        if(c==="learn"){line(326,212,344,204,"#cbb497",3);line(344,204,351,205,"#8c755f",2)}return;
      }
      cube(235,228,57,27,"#7d7871","#aba594");bits(328+(c==="tell"?26:-22)*p,226,c==="learn"?1-p*.73:1);
      if(c==="learn"){const x=357-p*32;line(x,208,x+50,166,"#615458",7);line(x,207,x+24,187,"#b9ac96",3);line(x+24,186,x+51,165,"#aa7859",10)}
    }
    function notice(t,p,c){
      const lead=c==="stage",queue=c==="queue";
      actor("teen",lead?247+54*p:218,234,151);
      actor("waiting",queue?365-24*p:395,218,125,true);
      if(queue){page(300,221,47,38);sketch(286,187,.71,p,"writing");pencil(306,214);
        if(echo){page(348,233,27,18,-.08);page(329,242,27,18,.12)}}
      else if(lead){page(311+18*p,178,31,19,-.07)}
    }
    function club(t,p,c){
      const x=c==="design"?300:222;hardback(x,238,87,54);
      if(c==="organise"){for(let i=0;i<3;i++){page(310+i*37+p*6*i,223+i%2*12,26,27);line(301+i*37+p*6*i,212+i%2*12,315+i*37+p*6*i,212+i%2*12,ink)}}
      else{cube(364-p*20,231,27,15,P.blue,P.sage);cube(395-p*35,231-14*p,21,14,P.gold,P.light)}
    }
    function self(t,p,c){
      if(c==="talk"){actor("teen",274,236,173);return}
      page(295,240,130,83,-.01);sketch(251,171,1.7,1,"writing");pencil(333,217);
      if(c==="retry"){ctx.save();ctx.strokeStyle="#a56853";ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(283,207,28,8,-.09,0,Math.PI*2*bounded(p));ctx.stroke();ctx.restore()}
    }
    function training(t,p,c){
      if(c==="workshop"){cube(203,229,53,21);cube(284,229,29,19,P.blue,P.sage);cube(322,226,20,19,P.gold,P.light);cube(371,229,40,19,P.gold,P.light);cube(378,208,21,13,P.blue,P.sage)}
      else{hardback(309,237,c==="reading"?137:99,c==="reading"?85:62);sketch(c==="reading"?317:315,c==="reading"?161:184,1.4,c==="reading"?1:.62,"writing");if(c==="reading")pencil(365,221)}
    }
    function afternoon(t,p,c){
      woodenCase(244,236,c==="stay"?p:0);
      if(c==="go"){cube(361,241,66,10,"#855a4e",P.gold);cube(365,227-10*p,55,6,P.rust,P.light)}
      else if(c==="stay"){page(364,234,40,30,-.13);bits(326,236,1)}
    }
    const shows={box:boxes,tower:towers,interest:figureStudy,childhood:errands,friend:friends,lost:bagLost,rules:boundary,
      market,relay,quiz,"team-list":teamList,secret:secrets,repair,notice,club,self,training,afternoon};
    const firstFriends=games.some(([name])=>name===key);
    if(!shows[key]&&key!=="temper"&&key!=="song"&&key!=="year"&&!firstFriends)return null;
    return {
      asset:set,
      draw(t,progress,active){
        const c=option||active||"",p=replay?1:bounded(progress);
        if(key==="temper"||key==="song"){singing(t,p,c);return}
        if(key==="year"){
          const alt={"baby-left":"baby-right","knot-show":"knot-tied"}[scene.plate];
          if(!alt){backdrop(set,Math.sin(t*.45)*1.2,1.012);return}
          const forward=scene.plate==="baby-left"?Math.floor(t/4)%2===0:true,step=scene.plate==="baby-left"?t%4:t;
          transition(forward?set:"childhood/"+alt,forward?"childhood/"+alt:set,t,bounded((step-1.7)/.65));return;
        }
        if(firstFriends){
          const branch=c==="friend-practice"?"practice":c==="friend-invent"?"invent":"before";
          const variant=scene.phase==="echo"?"echo-"+branch:scene.phase||branch;
          const stem="childhood/"+key+"-";transition(stem+"before",stem+variant,t,scene.phase||replay?1:p);
          if(scene.phase==="met")localGround();
          return;
        }
        const env=key==="training"&&c==="workshop"?"workshop":
          key==="secret"||key==="notice"||key==="self"&&c==="talk"?assets.yard:set;
        backdrop(env,0,env===assets.yard?1.04:1.16);
        const scale=env===assets.yard?1.32:key==="box"||key==="repair"?1.95:1.58;
        ctx.save();ctx.translate(300,174);ctx.scale(scale,scale);ctx.translate(-300,-193);
        shows[key](t,p,c);ctx.restore();
      }
    };
  }
  root.ChildhoodArt=Object.freeze({create});
})();
