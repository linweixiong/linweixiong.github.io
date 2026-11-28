/* Two family settings share the same decisions, but never exchange rooms, relatives or landmarks. */
(() => {
  "use strict";
  const nursery={
    "tamil-birth-urban":[[212,103,134],[342,98,129]],
    "tamil-birth-rural":[[317,142,168],[412,133,155]],
    "punjab-birth-urban":[[76,116,145],[178,116,145]],
    "punjab-birth-rural":[[330,151,178],[512,132,159]]
  };
  const regionOf=s=>globalThis.LifeWorld?.storySetting(s)?.id||(globalThis.LifeWorld?.hash(s.seed,5801)%2?"punjab":"tamil");
  function nurseryLayout(s){return nursery[regionOf(s)+"-birth-"+(s.residence==="rural"?"rural":"urban")];}
  function nurseryPoints(s){return nurseryLayout(s).map(([x,,y])=>({x:x/600,y:y/300}));}
  function resolve(s,info){return globalThis.IndiaDirection?.resolve(s,info,regionOf(s))||null;}
  function choicePoints(s,info){
    if(info.mode!=="choice"||info.items?.length!==2)return null;
    const card=info.cardId?.replace(/^local-IND-/,"");
    const anchors={
      "ind-trip-companion":{window:.76,meal:.28},
      "ind-radio-game":{map:.27,voices:.69},
      "ind-stall-space":{shade:.23,goods:.78}
    }[card];
    return anchors?info.items.map(o=>({x:anchors[o.id],y:.65})):null;
  }
  function create(s,info,art){
    const shot=resolve(s,info);
    if(!shot)return null;
    const {ctx,backdrop,canPaint,box,polygon,line,ellipse,shade,sheet,wisps}=art;
    const region=regionOf(s),tamil=region==="tamil",card=shot.card;
    const asset=shot.asset,path=name=>IndiaDirection.asset(region,name);
    const mid=300,baseline=247,left=192,right=408;
    const options=info.items||[],still=Boolean(info.reducedMotion);
    function focus(key,p,side,t){
      const zoom=1.008+.17*p;
      const margin=(zoom-1)*300;
      const drift=still?0:Math.sin(t*.34)*.7;
      const offset=Math.min(margin,Math.max(-margin,(300-side)*.22*p+drift));
      backdrop(key,offset,zoom);
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
    function vessel(x,y,metal="steel",lid=0){
      const brass=metal==="brass";
      shade(x,y,29);
      const edge=brass?"#b99a57":"#a5aba4",dark=brass?"#76563a":"#59616a";
      polygon([[x-28,y-23],[x+28,y-23],[x+23,y-7],[x+14,y-2],[x-13,y],[x-23,y-5]],dark);
      polygon([[x-25,y-20],[x-11,y-18],[x-10,y-4],[x-20,y-7]],brass?"#c09959":"#b5b6a7");
      polygon([[x+5,y-19],[x+23,y-23],[x+19,y-9],[x+6,y-4]],brass?"#b18445":"#92978e");
      ellipse(x,y-23,28,6,edge);ellipse(x,y-23,24,4,brass?"#916f45":"#777b74");
      if(brass)for(let row=0;row<3;row++)for(let col=0;col<8-row;col++){
        const xx=x-19+col*5+row*1.5,yy=y-17+row*4+(col%3);
        line(xx,yy,xx+2,yy-1,col%2?"#b38a4f":"#b9955e");
      }
      if(lid){
        ellipse(x+lid*24,y-24+lid*18,28,5,edge);ellipse(x+lid*24,y-26+lid*18,19,3,brass?"#deba78":"#cfd0bf");
        box(x-3+lid*24,y-29+lid*18,7,3,dark);
      }
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
    function roster(x,y,p){
      sheet(x,y,118,57,"#ddc294");
      for(let j=0;j<6;j++)line(x-45,y-49+j*7,x+46,y-51+j*7,"#9b8c76");
      for(let i=0;i<6;i++){
        line(x-42+i*15,y-50,x-44+i*15,y-9,"#a48b70");
        if(i<1+Math.ceil(p*5))box(x-36+i*15,y-36+i%2*8,5,4,"#916454");
      }
    }
    function drawing(x,y,p){
      sheet(x,y,126,58,"#ddc397");
      const offset=x-41;
      for(let i=0;i<17;i++){
        const xx=offset+i*5,yy=y-20-Math.sin(i*.18)*10;
        line(xx,yy,xx+5,y-20-Math.sin((i+1)*.18)*10,"#8b6c55",2);
      }
      for(let i=0;i<5;i++){
        const xx=offset+10+i*16,yy=y-35-Math.sin(i)*2;
        line(xx,yy+5,xx,yy-5,"#86735b");ellipse(xx,yy-6,3.8,5,"#818970");
      }
    }
    function paperText(x,y){
      sheet(x,y,98,49,"#dec395");
      for(let j=0;j<5;j++)for(let i=0;i<4;i++){
        const n=(j*11+i*7)%9;line(x-35+i*17,y-39+j*5,x-25+i*17+n/3,y-40+j*5,"#94816a");
      }
    }
    function closeup(insert,p){
      ctx.save();ctx.translate(300,240);ctx.scale(1.65,1.65);ctx.translate(-300,-240);
      if(insert==="brass"||insert==="reflection")vessel(mid,baseline,"brass");
      if(insert==="map")map(mid,baseline,.71+.25*p);
      if(insert==="envelope")envelope(mid,baseline,.65);
      if(insert==="reply")paperText(mid,baseline);
      if(insert==="roster")roster(mid,baseline,1);
      if(insert==="trees")drawing(mid,baseline,p);
      ctx.restore();
    }
    function draw(t,v,action){
      const remembered=info.mode==="response"?info.originOption:"";
      const option=action||remembered||"",p=action?v:remembered?1:0;
      const index=options.findIndex(o=>o.id===option);
      const marks=choicePoints(s,info);
      let side=marks&&index>=0?600*marks[index].x:index<0?mid:index?435:165;
      if(option==="guide"||option==="weave")side=305;
      const to=shot.cuts?.[option];
      if(!option&&info.mode==="choice"&&shot.cuts&&canPaint(asset)){
        for(const alternate of Object.values(shot.cuts))canPaint(path(alternate));
      }
      const changed=to&&p>.43&&canPaint(path(to));
      const key=changed?path(to):asset;
      focus(key,p,side,t);
      if(shot.insert)closeup(shot.insert,p);
      if(shot.insert==="reflection"){
        const sway=still?0:Math.sin(t*.53),x=381+14*sway,y=92-5*sway;
        ctx.save();ctx.strokeStyle="rgba(255,224,145,.66)";ctx.lineWidth=3;
        ctx.beginPath();ctx.ellipse(x,y,17,6,-.48,-1.3,.88);ctx.stroke();ctx.restore();
      }
      if(card==="ind-letter-platform"||card==="ind-rail-visit"){
        if(!changed){
          travellingTrunk();
          if(card==="ind-letter-platform"){envelope(left+(option==="send"?23*p:0),baseline,.18);ticket(right,baseline,.94);}
          else{ticket(left,baseline);envelope(right,baseline,option==="direct"?p:0);}
        }
      }else if(card==="ind-bowl-loan"){
        vessel(mid+(option==="table"?26:-16)*p,baseline,"brass");
        if(option==="lend"&&p>.15)paperText(left,baseline);
      }else if(card==="ind-radio-game"&&option==="map"&&p>.35){
        // The close shot has wrapping paper at the lower left. Let the actual
        // stations appear on that paper, in the same camera space as the image.
        const zoom=1.008+.17*p,dx=(300-side)*.22*p;
        ctx.save();ctx.translate(300*(1-zoom)+dx,150*(1-zoom));ctx.scale(zoom,zoom);
        const points=[[88,243],[102,247],[119,235],[138,237],[150,229]];
        points.slice(0,Math.ceil((p-.35)/.65*4)).forEach(([x,y],i)=>{line(x,y,...points[i+1],"#677475",2);ellipse(x,y,2,2,"#695a4e");});
        ctx.restore();
      }else if(card==="ind-morning-batch"&&!changed){
        wisps(109,68,t,.23);
      }else if(card==="ind-meal-turn"&&changed){
        closeup("roster",p);
      }else if(card==="ind-last-round"&&option==="draw"&&changed){
        closeup("map",p);
      }
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
    return [globalThis.LifeWorld?.storySetting(s)?.label,resolve(s,info)?.place].filter(Boolean).join(" · ");
  }
  globalThis.IndiaStage=Object.freeze({create,resolve,sceneLabel,nurseryPoints,choicePoints});
})();
