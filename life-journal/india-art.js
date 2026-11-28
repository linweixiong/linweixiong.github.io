/* Two family settings share the same decisions, but never exchange rooms, relatives or landmarks. */
(() => {
  "use strict";
  const settings=new Set(["home","school","stall","platform","carriage","work","clinic","later","lane","field","craft-stall","keepsake"]);
  const locations={
    "ind-radio-game":"home","ind-market-apprentice":"stall","ind-morning-batch":"home","ind-meal-turn":"home",
    "ind-rail-visit":"platform","ind-letter-platform":"platform","ind-stall-space":"stall",
    "ind-trip-companion":"carriage","ind-bowl-loan":"home","ind-old-measure":"later","ind-last-round":"stall"
  };
  const nursery={
    "tamil-birth-urban":[[212,103,134],[342,98,129]],
    "tamil-birth-rural":[[317,142,168],[412,133,155]],
    "punjab-birth-urban":[[76,116,145],[178,116,145]],
    "punjab-birth-rural":[[330,151,178],[512,132,159]]
  };
  const regionOf=s=>globalThis.LifeWorld?.storySetting(s)?.id||(globalThis.LifeWorld?.hash(s.seed,5801)%2?"punjab":"tamil");
  function nurseryLayout(s){return nursery[regionOf(s)+"-birth-"+(s.residence==="rural"?"rural":"urban")];}
  function nurseryPoints(s){return nurseryLayout(s).map(([x,,y])=>({x:x/600,y:y/300}));}
  function scene(s,info,card,age) {
    const birth=s.residence==="rural"?"birth-rural":"birth-urban";
    if(info.mode==="farewell")return age<2?birth:age<60?"home":"later";
    if(info.mode==="cradle"||age===0&&info.items?.some(i=>i.id==="__bird"))return birth;
    if(regionOf(s)==="tamil"){
      if(["锅边溢出的第一口","有一年你没回去"].includes(info.eventTitle))return "pongal";
      if(["给你的那个缺口","灯放在哪一格","没画完的那一笔"].includes(info.eventTitle))return "kolam";
    }else{
      if(info.eventTitle==="靠墙的一排先添")return "langar";
      if(info.eventTitle==="有人认得你的凳子")return "langar-later";
    }
    if(info.kind==="toy"&&(info.cardId==="make"||["那只轮子","玩具船的新航线","一起把轮子装回去","把它改成一艘船"].includes(info.eventTitle)))return "toy-workbench";
    const words=[info.eventTitle,info.caption,info.detail].join(" ");
    if(card==="story-chapter-song"||["你起的调","错唱的那个字","大声把结尾唱出来","悄悄教给旁边的小孩"].includes(info.eventTitle)){
      return /错唱|悄悄|教给/.test(info.eventTitle)?"song-teach":"song-lead";
    }
    if(info.mode==="echo"&&card==="ind-last-round"&&info.originOption==="draw")return "home";
    if(["ind-market-apprentice","ind-stall-space","ind-last-round"].includes(card))return "craft-stall";
    if(card==="ind-radio-game"&&info.indiaScene)return "craft-stall";
    if(card==="ind-morning-batch"&&info.mode!=="echo")return "stall";
    if(card==="ind-bowl-loan"&&info.mode!=="echo")return "toy-workbench";
    if(card==="ind-old-measure")return info.mode==="echo"&&info.originOption==="show"?"craft-stall":"keepsake";
    if(info.indiaScene==="stall"&&/茉莉|花篮|花摊|花串|绣布|布摊|绣巾|绣摊|绣样|刺绣/.test(words))return "craft-stall";
    if(info.indiaScene==="later"&&/绣|茉莉|花结|花谢/.test(words))return "keepsake";
    if(settings.has(info.indiaScene))return info.indiaScene;
    if(locations[card])return locations[card];
    if(/站台|车站|换乘|赶车|候车|站口/.test(words))return "platform";
    if(/车厢|靠窗的座|列车上/.test(words))return "carriage";
    if(/看诊|复诊|病房|医生|诊所/.test(words))return "clinic";
    if(/货摊|摊贩|收摊|摊位|看摊|市集/.test(words))return "stall";
    if(/学校|课堂|课桌|作业/.test(words))return "school";
    if(info.kind==="street"||info.kind==="doorstep")return s.residence==="rural"?"field":"lane";
    if(info.kind==="work")return /车间|手艺|工具|机械|手工|师傅|绣样|织布|锤|加工|车床|修理/.test(words)?"work":s.residence==="rural"?"field":"lane";
    return ({school:"school",health:"clinic",memory:age>=60?"later":"home"})[info.kind]||"home";
  }
  function create(s,info,art){
    const {ctx,backdrop,canPaint,box,polygon,line,ellipse,shade,sheet,wisps}=art;
    const region=regionOf(s);
    const tamil=region==="tamil",cardId=info.cardId||info.originCard||"";
    const card=cardId.replace(/^local-IND-/,""),age=info.eventAge??s.age??0;
    const room=scene(s,info,card,age),path=name=>"india-life/"+region+"-"+name,asset=path(room);
    const width=600,mid=300,baseline=247,left=192,right=408;
    const options=info.items||[],still=Boolean(info.reducedMotion);
    const isCard=Boolean(locations[card])&&info.mode!=="echo";
    function focus(key,p,side,t,train=false){
      const drift=still?0:Math.sin(t*(train?1.7:.34))*(train?1.35:.85);
      const dx=(mid-side)*.083*p+drift,zoom=1.008+.115*p;
      backdrop(key,dx,zoom);return {x:Math.round(mid*(1-zoom)+dx),y:Math.round(150*(1-zoom)),zoom};
    }
    function ticket(x,y,scale=1){
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);ctx.rotate(-.055);
      shade(0,0,34);sheet(0,0,64,23,"#dfb982");line(-21,-20,-24,-5,"#996a54");
      box(-15,-18,30,2,"#a76a4c");box(-17,-14,14,1,"#9b745b");box(2,-14,8,1,"#a3775c");
      for(let i=0;i<5;i++)box(-11+i*6,-10,3,1,"#836557");
      line(14,-22,11,-5,"#b88e67");ctx.restore();
    }
    function envelope(x,y,open=0){
      shade(x,y,35);sheet(x,y,66,28,"#d7b38d");
      if(open){sheet(x+2,y-7-open*11,52,22,"#eedcb6");for(let i=0;i<3;i++)line(x-13,y-29-open*9+i*4,x+11-i*3,y-29-open*9+i*4,"#978271");}
      polygon([[x-28,y-29],[x+36,y-33],[x+4,y-13]],"#b68b72");
      line(x-30,y-4,x-5,y-16,"#a98168");line(x+31,y-6,x+13,y-17,"#a98168");
    }
    function coins(x,y,p){
      for(let i=0;i<5;i++){
        const xx=x-12+(i%3)*11+(i===4?14*p:0),yy=y-Math.floor(i/3)*4;
        ellipse(xx,yy,6,2.8,"#846648");ellipse(xx,yy-1.5,6,2.2,"#cfac73");box(xx-3,yy-3,4,1,"#f0ce89");
      }
    }
    function flowerBasket(x,y,p){
      shade(x,y+1,34);
      const wicker=ctx.createLinearGradient(x-30,0,x+30,0);
      wicker.addColorStop(0,"#73513e");wicker.addColorStop(.34,"#b18b5b");wicker.addColorStop(1,"#76543d");
      polygon([[x-31,y-23],[x+30,y-24],[x+24,y-6],[x+15,y-1],[x-14,y],[x-24,y-4]],wicker);
      for(let j=0;j<5;j++){
        const edge=27-j,yy=y-19+j*3;
        line(x-edge,yy,x,yy+3,"#78543d");line(x,yy+3,x+edge,yy-1,"#825b40");
        for(let i=-edge+2;i<edge;i+=5){const row=yy+Math.round(2*(1-Math.abs(i)/edge));
          line(x+i,row,x+i+3,row+(j%2?1:-1),i%3?"#bf9968":"#a78055");}
      }
      ellipse(x,y-23,31,7,"#c49d6a");ellipse(x,y-24,28,5,"#74573f");
      for(let i=0;i<14;i++){
        const xx=x-21+(i*13)%43,yy=y-24-(i*5)%7;
        ellipse(xx,yy,3,2,"#ede1b8");box(xx-2,yy-2,2,1,"#fff0d1");
      }
      line(x+16,y-21,x+34+16*p,y-7,"#98734b");
      for(let i=0;i<2+Math.round(5*p);i++)ellipse(x+31+4*i,y-7-i%2,3,2,"#efdfb6");
    }
    function embroideredCloth(x,y,p){
      shade(x,y,37);sheet(x,y,70+18*p,29,"#b5554a");const l=x-23-6*p;
      for(let j=0;j<2;j++)for(let k=0;k<5+Math.round(p);k++){
        const a=l+8*k+j*2,b=y-10-j*10;line(a-3,b,a,b-3,"#f1b764",2);line(a,b-3,a+3,b,"#f0ce83",2);
        line(a-3,b,a,b+3,"#ab7882");line(a,b+3,a+3,b,"#eb9962");
      }
      line(x-27,y-5,x+31,y-7,"#df955d");line(x-26,y-7,x+33,y-9,"#e9be7d");
    }
    function vessel(x,y,metal="steel",lid=0){
      const brass=metal==="brass";
      shade(x,y,29);
      const edge=brass?"#b99a57":"#a5aba4",dark=brass?"#76563a":"#59616a";
      polygon([[x-28,y-23],[x+28,y-23],[x+23,y-7],[x+14,y-2],[x-13,y],[x-23,y-5]],dark);
      polygon([[x-25,y-20],[x-11,y-18],[x-10,y-4],[x-20,y-7]],brass?"#c09959":"#b5b6a7");
      polygon([[x+5,y-19],[x+23,y-23],[x+19,y-9],[x+6,y-4]],brass?"#b18445":"#92978e");
      ellipse(x,y-23,28,6,edge);ellipse(x,y-23,24,4,brass?"#916f45":"#777b74");
      if(lid){
        ellipse(x+lid*24,y-24+lid*18,28,5,edge);ellipse(x+lid*24,y-26+lid*18,19,3,brass?"#deba78":"#cfd0bf");
        box(x-3+lid*24,y-29+lid*18,7,3,dark);
      }
    }
    function bread(x,y,p){
      ellipse(x,y,31,7,"#8d6749");ellipse(x,y-3,32,7,"#d6b37a");ellipse(x,y-5,29,6,"#dfc18a");
      for(let i=0;i<10;i++){const xx=x-21+(i*11)%43;box(xx,y-7+i%3,3,1,"#b88753");}
      if(p>.2){const xx=x+28*p;ellipse(xx,y+4,10,4,"#a78158");ellipse(xx,y+2,10,3,"#e5c58c");}
    }
    function tamarindRice(x,y,p){
      ellipse(x,y-1,23,5.5,"#9d9e8d");ellipse(x,y-4,21,5,"#c4af72");
      for(let i=0;i<28;i++){const xx=x-15+((i*11)%30),yy=y-6+((i*3)%5);
        box(xx-3*p,yy,2,1,i%6===0?"#856138":i%7===0?"#64734a":"#e2b85f");}
    }
    function map(x,y,p){
      sheet(x,y,78,39,"#e5cd9d");
      const knots=[[-23,-9],[-15,-21],[-5,-18],[6,-29],[11,-22],[24,-27]];
      for(let i=0;i<5;i++){
        const q=Math.max(0,Math.min(1,p*5-i)),[a,b]=knots[i],[c,d]=knots[i+1];
        if(q){line(x+a,y+b,x+a+(c-a)*q,y+b+(d-b)*q,"#617b77",2);ellipse(x+a,y+b,1.5,1.5,"#9b634a");}
      }
      line(x+35,y-33,x+48,y-11,"#5f534b",3);line(x+35,y-32,x+46,y-12,"#cb9c59");
    }
    function crate(x,y,p){
      x-=34*p;
      shade(x,y,34);
      polygon([[x-28,y-22],[x-17,y-29],[x+30,y-28],[x+25,y-22]],"#c19258");
      polygon([[x-28,y-22],[x+25,y-22],[x+23,y-3],[x-25,y]],"#89613e");
      for(let i=0;i<3;i++)line(x-24,y-4-i*6,x+22,y-6-i*6,"#ab7e50",2);
      box(x-17,y-21,3,19,"#c99a62");box(x+13,y-21,3,18,"#b98f5b");
    }
    // The player's travelling trunk sits in the near foreground. Leave the platform floor visible at both sides.
    function travellingTrunk(){
      const lid=ctx.createLinearGradient(0,198,0,282);
      lid.addColorStop(0,"#787966");lid.addColorStop(.32,"#8b8873");lid.addColorStop(.9,"#60675e");
      polygon([[121,207],[489,201],[528,268],[83,276]],lid);
      polygon([[83,276],[528,268],[524,300],[86,300]],"#4c514e");
      for(let i=0;i<172;i++){
        const x=127+(i*79)%360,y=209+(i*47)%56;
        box(x,y,1+(i%5),1,i%2?"#5c5b5069":"#c3ae8466");
      }
      line(120,207,488,201,"#aba185",2);line(84,275,528,267,"#b8aa87",2);
      line(83,278,526,270,"#403f3e",3);line(84,282,525,274,"#716e60",2);
      for(const [back,front] of [[157,130],[455,484]]){
        polygon([[back,207],[back+10,206],[front+14,272],[front,273]],"#705445");
        polygon([[front,275],[front+14,275],[front+13,300],[front-1,300]],"#5e463c");
        line(back+2,208,front+2,270,"#ad8560");line(back+8,209,front+12,269,"#8c694e");
        box(front+2,277,10,7,"#ac875c");box(front+4,279,6,3,"#675448");
      }
      for(const xx of [225,369]){box(xx,274,14,15,"#8c7959");box(xx+2,277,10,5,"#454a48");line(xx+2,274,xx+11,274,"#c3ac77");}
      line(278,288,279,295,"#998064",3);line(322,288,320,295,"#998064",3);
      line(279,296,320,295,"#332f31",4);line(280,295,319,294,"#826959",2);
    }
    function inserts(option,p,t){
      const at=id=>option===id?p:0;
      switch(card){
        case "ind-market-apprentice":
          (tamil?flowerBasket:embroideredCloth)(left,baseline,at("weave"));coins(right,baseline,at("sell"));break;
        case "ind-letter-platform":
          travellingTrunk();envelope(left+at("send")*30,baseline-at("send")*3);ticket(right,baseline,.94);break;
        case "ind-rail-visit":
          travellingTrunk();ticket(left-18*at("visit"),baseline);if(at("visit")>.3)ticket(left+22,baseline-6,.74);
          envelope(right,baseline,at("direct"));break;
        case "ind-stall-space":
          crate(right,baseline,at("goods"));
          if(at("shade")){
            const q=at("shade");ctx.save();ctx.globalAlpha=q*.27;
            polygon([[0,208],[153+80*q,205],[127+70*q,300],[0,300]],"#343445");ctx.restore();
            ellipse(left,baseline,8,2,"#826953");
            polygon([[left-7,baseline-13],[left+7,baseline-13],[left+5,baseline],[left-5,baseline]],"#b7afa0");
            ellipse(left,baseline-13,7,2,"#d8c7aa");ellipse(left,baseline-13,5,1,"#9e8060");
          }
          break;
        case "ind-trip-companion":
          travellingTrunk();ticket(left-14*at("window"),baseline,.8);vessel(right,baseline,"steel",.02+.98*at("meal"));
          if(at("meal")>.15)(tamil?tamarindRice:bread)(right-37,baseline+3,at("meal"));break;
        case "ind-last-round":
          if(at("draw")||!option){map(right,baseline,at("draw"));}break;
        case "ind-old-measure":
          if(tamil&&at("show")<=.6){
            ctx.save();ctx.translate(125+12*at("keep"),287);ctx.scale(1.6,1.3);flowerBasket(0,0,at("keep")*.25);ctx.restore();
          }else if(at("show")>.6)(tamil?flowerBasket:embroideredCloth)(mid,baseline,at("show"));break;
        case "ind-bowl-loan":
          vessel(mid+45*at("table")-32*at("lend"),baseline,"brass");map(left,baseline,0);
          if(at("lend"))for(let j=0;j<3;j++)line(left-22,baseline-26+j*6,left-22+at("lend")*(38-j*3),baseline-27+j*6,"#8f7361");
          break;
        case "ind-morning-batch":
          // The original painting already has an idli steamer and its hot tray on the left.
          wisps(50,242,t,.18+at("steam")*.20);break;
        case "ind-meal-turn":
          bread(left,baseline,at("early"));sheet(right,baseline,64,34);
          for(let j=0;j<5;j++){line(right-16+j*7,baseline-30,right-19+j*7,baseline-7,"#ad9880");if(at("swap")*5>j)box(right-17+j*7,baseline-14-(j%2)*7,4,3,"#9c6958");}
          break;
      }
    }
    function draw(t,v,action){
      const remembered=info.mode==="response"?info.originOption:"";
      const option=action||remembered||"",p=action?v:remembered?1:0;
      const i=options.findIndex(o=>o.id===option);
      let side=mid;
      if(options.length>1&&i>=0)side=90+420*i/(options.length-1);
      else if(option)side=info.motif==="hand"||info.motif==="letter"?390:202;
      const followShot={
        "story-chapter-song":["whisper","song-teach"],"ind-morning-batch":["train","platform"],
        "ind-rail-visit":["direct","carriage"],"ind-old-measure":["show","craft-stall"],"ind-last-round":["draw","toy-workbench"]
      }[card];
      if(!option&&info.mode==="choice"&&followShot&&canPaint(asset))canPaint(path(followShot[1]));
      const location=followShot&&option===followShot[0]&&p>.45?followShot[1]:room;
      const changed=location!==room&&canPaint(path(location)),key=changed?path(location):asset;
      const travel=key.endsWith("-carriage");
      const camera=focus(key,p,side,t,travel);
      if(room==="kolam"&&["灯放在哪一格","没画完的那一笔"].includes(info.eventTitle)){
        ctx.fillStyle="rgba(38,37,67,.30)";ctx.fillRect(0,0,width,300);
        if(info.eventTitle==="灯放在哪一格"){
          ctx.save();ctx.translate(camera.x,camera.y);ctx.scale(camera.zoom,camera.zoom);
          for(const [x,y] of [[444,229],[479,217],[500,234]]){
            const glow=.9+(still?0:Math.sin(t*4+x)*.09);
            const light=ctx.createRadialGradient(x,y,1,x,y,13*glow);
            light.addColorStop(0,"rgba(255,183,71,.4)");light.addColorStop(1,"rgba(250,165,71,0)");
            ctx.fillStyle=light;ctx.fillRect(x-14,y-14,28,28);ellipse(x,y-1,1,2.6*glow,"#ffd88c");
          }
          ctx.restore();
        }
      }
      if(info.mode==="farewell"){
        const fade=still?1:Math.min(1,t/2);
        ctx.fillStyle="rgba(45,32,47,"+(.07+.12*fade)+")";ctx.fillRect(0,0,width,300);return;
      }
      if(isCard&&!(card==="ind-morning-batch"&&changed))inserts(option,p,t);
    }
    function nurseryShot(t,v,action,elapsed,prop){
      backdrop(asset);
      const layout=nurseryLayout(s);
      function bracket(x,y,top,end){
        line(x,y,x,top,"#644735",4);line(x-1,y,x-1,top,"#a07b53",1);
        line(x,top,end,top,"#795b41",3);line(x,top-1,end,top-1,"#ae8b62",1);
      }
      if(!tamil&&s.residence==="rural"){bracket(305,223,151,332);bracket(546,136,132,510);}
      else if(!tamil)bracket(244,207,116,74);
      layout.forEach(([x,top,y],i)=>{
        const chosen=action===(i?"__bell":"__bird"),size=i?24:29;
        const swing=still?0:Math.sin(t*1.45+i)*.045;
        const angle=swing+(chosen?(still?(i?.23:-.27):Math.sin(elapsed*8)*Math.exp(-1.2*elapsed)*.32):0);
        const length=y-top-3,px=x+Math.sin(angle)*length,py=top+Math.cos(angle)*length;
        line(x,top,px,py,"#937754");prop(i?"bell":"bird",px,py+size*.46,size,angle*.66);
      });
    }
    return {asset,draw,nurseryShot};
  }
  function sceneLabel(s,info){
    const labels={home:"家里",lane:"街巷",field:"村路",school:"学校",stall:"街市",work:"工作间",
      platform:"车站",carriage:"车厢",clinic:"诊所",later:"老屋","birth-urban":"城里的家","birth-rural":"村里的家",
      "song-lead":"家门边","song-teach":"家门边","toy-workbench":"家里",keepsake:"家里","craft-stall":regionOf(s)==="punjab"?"布摊":"花摊",
      pongal:"丰收节的院子",kolam:"门前","langar":"谒师所公共厨房","langar-later":"谒师所公共厨房"};
    const id=(info.cardId||info.originCard||"").replace(/^local-IND-/,"");
    const place=scene(s,info,id,info.eventAge??s.age??0);
    return [globalThis.LifeWorld?.storySetting(s)?.label,labels[place]].filter(Boolean).join(" · ");
  }
  globalThis.IndiaStage=Object.freeze({create,sceneLabel,nurseryPoints});
})();
