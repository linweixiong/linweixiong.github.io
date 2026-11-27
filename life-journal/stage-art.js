/* A scene is a view of a saved moment. Its local clock and props never advance a life. */
(() => {
  "use strict";
  const W=600,H=300, assetRoot="./assets/life-stage/", images=new Map();
  const motifs=["bird","bell","hand","chair","ball","wheel","boat","book","pencil","bag","bowl","key","ticket","clock","tool","leaf","letter","cloth","lamp","coin"];
  const countries=new Set(["CHN","FRA","EGY","IND","IDN","NGA","BRA","PAK","BGD","JPN","DEU","MEX"]);
  function points(n) {
    return Array.from({length:n},(_,i)=>({x:n===1?.5:n===2?[.32,.68][i]:.18+.64*i/(n-1),y:.65}));
  }
  function image(key) {
    if (!images.has(key)) {
      const img=new Image();img.decoding="async";img.src=assetRoot+key+".webp";images.set(key,img);
    }
    return images.get(key);
  }
  const ready=img=>img.complete&&img.naturalWidth>0;
  const limit=t=>Math.max(0,Math.min(1,t)), smooth=t=>{t=limit(t);return t*t*(3-2*t)};
  const mix=(a,b,v)=>a+(b-a)*v, beat=(x)=>Math.sin(Math.PI*limit(x));
  function mount(canvas,info) {
    const ctx=canvas.getContext("2d");if(!ctx)return {act(){},destroy(){},setPaused(){}};
    canvas.width=W;canvas.height=H;ctx.imageSmoothingEnabled=false;
    const s=info.state||{},items=info.items||[],pins=points(items.length);
    const age=info.eventAge??s.age??0, country=({chengdu:"CHN",lyon:"FRA"})[s.region]||s.region;
    const title=info.eventTitle||"",card=info.cardId||info.originCard||"";
    const baby=info.kind==="cradle",toy=info.kind==="toy"&&(card==="make"||["那只轮子","玩具船的新航线","一起把轮子装回去","把它改成一艘船"].includes(title));
    const kitchen=country==="CHN"&&card==="local-CHN-cd-noodle-shift"&&info.kind==="kitchen";
    const light=country==="FRA"&&card==="local-FRA-ly-window-answer";
    const livedPlace=["response","choice"].includes(info.mode);
    const firstVisit=livedPlace&&card==="temper";
    const court=livedPlace&&country==="CHN"&&["local-CHN-cd-cooks-seat","local-CHN-cd-second-voice"].includes(card);
    const localCrafts={
      "local-JPN-kite-tail":"kite","local-MEX-paper-cover":"cover","local-IND-ind-radio-game":"radio",
      "local-IDN-idn-angklung-rehearsal":"bamboo","local-NGA-nga-ayo-afternoon":"board","local-EGY-puppet-front-row":"puppet"
    };
    const craft=livedPlace&&localCrafts[card];
    const closeStall=livedPlace&&card==="local-CHN-cd-stall", kickabout=livedPlace&&card==="local-DEU-de-short-game";
    const memoryToy=toy&&info.mode==="echo",savedToy=toy&&["echo","response"].includes(info.mode);
    const finished=info.kind==="farewell",obj=info.motif||"book";
    let active="",elapsed=0,clock=0,last=null,request=0,dead=false,paused=Boolean(info.paused);
    let visible=!document.hidden,onscreen=true,needsFrame=true;
    const reduced=Boolean(info.reducedMotion), watched=new Set();
    const recent=info.originOption||"";
    function background(){
      if(baby||finished&&age<2)return country==="CHN"?"cd-cradle":"cradle";
      if(toy)return "desk";
      if(kitchen)return "stall";
      if(light){
        if(info.mode==="echo")return recent==="up"?"window-shut":"window-lit";
        return active==="up"||recent==="up"?"window-close":active==="across"||recent==="across"?"FRA":"window-lit";
      }
      if(info.threadKey?.startsWith("home-lesson-button")||info.threadKey?.startsWith("home-echo-button"))return "sewing";
      if(finished||info.kind==="memory")return "memory";
      const b={doorstep:"doorstep",toy:"desk",school:"classroom",work:"workshop",table:"table",kitchen:"table",health:"health",home:"table"};
      if(info.kind==="street")return s.residence==="rural"?"lane":countries.has(country)?country:"lane";
      return b[info.kind]||"memory";
    }
    function resource(key){
      const img=image(key);
      if(!ready(img)&&!watched.has(img)){watched.add(img);img.addEventListener("load",loaded); }
      return img;
    }
    function loaded(){if(!dead){needsFrame=true;schedule()}}
    function box(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
    function polygon(pts,col){ctx.fillStyle=col;ctx.beginPath();pts.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.closePath();ctx.fill()}
    function line(x,y,X,Y,col,w=1){ctx.strokeStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(Math.round(x),Math.round(y));ctx.lineTo(Math.round(X),Math.round(Y));ctx.stroke()}
    function ellipse(x,y,rx,ry,col){ctx.beginPath();ctx.fillStyle=col;ctx.ellipse(Math.round(x),Math.round(y),rx,ry,0,0,2*Math.PI);ctx.fill()}
    function shade(x,y,r){ellipse(x,y,r,Math.max(2,r*.12),"rgba(47,30,34,.28)")}
    function sprite(atlas,index,cols,side,x,y,size,angle=0,opacity=1){
      const img=resource(atlas);if(!ready(img)||opacity<=0)return;
      ctx.save();ctx.globalAlpha*=opacity;ctx.translate(Math.round(x),Math.round(y));if(angle)ctx.rotate(angle);
      ctx.drawImage(img,index%cols*side,Math.floor(index/cols)*side,side,side,-size/2,-size,size,size);ctx.restore()
    }
    function prop(kind,x,y,size,angle=0,opacity=1){
      const index=motifs.indexOf(kind);if(index<0)return;
      if(baby&&index<=1)sprite("mobile",index,2,108,x,y,size,angle,opacity);
      else sprite("props",index,5,108,x,y,size,angle,opacity);
    }
    function backdrop(key,dx=0,zoom=1){
      const img=resource(key);
      if(ready(img)){
        ctx.drawImage(img,Math.round((W-W*zoom)/2+dx),Math.round((H-H*zoom)/2),Math.ceil(W*zoom),Math.ceil(H*zoom));
      }else{
        const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,"#28283d");g.addColorStop(1,"#735641");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      }
    }
    function wisps(x,y,t,strength=.42){
      for(let k=0;k<3;k++){
        const phase=(t*.32+k/3)%1;let xx=x+(k-1)*7,yy=y-phase*18;
        for(let j=1;j<=9;j++){const X=x+(k-1)*7+Math.sin(t*1.9+j*.48+k)*3,Y=y-phase*18-j*2;
          line(xx,yy,X,Y,"rgba(255,229,189,"+(1-phase)*strength+")",1.5);xx=X;yy=Y}
      }
    }
    function cradle(t,v){
      const angles=[-.04*Math.sin(t*1.7),.025*Math.sin(t*2+.6)];
      const chosen=active==="__bird"?0:active==="__bell"?1:-1;
      if(chosen>=0)angles[chosen]+=reduced?(chosen===0?-.23:.19):Math.sin(elapsed*(chosen===0?7:13))*.29*Math.exp(-1.45*elapsed);
      const look=chosen<0?0:(chosen===0?1:-1)*7*v;
      backdrop(background(),look,1.04);
      for(let i=0;i<2;i++){
        const pos=points(2)[i],x=pos.x*W+look,anchor=pos.y*H-31,angle=angles[i];
        const reach=anchor+10,px=x+Math.sin(angle)*reach,py=-10+Math.cos(angle)*reach;
        line(x,-10,px,py,"#674644",2);line(x+1,-10,px+1,py,"#c69478");
        const scale=i===0?65:58;
        prop(i===0?"bird":"bell",px,py+scale*.79,scale,angle*.7);
      }
    }
    function chassis(x,base,green=false){
      const outline="#483341",wood=green?"#82a391":"#b76e48";
      shade(x,base+1,40);polygon([[x-34,base-15],[x-29,base-22],[x+26,base-22],[x+34,base-15],[x+28,base-8],[x-27,base-8]],outline);
      polygon([[x-32,base-16],[x-27,base-21],[x+25,base-21],[x+31,base-16]],"#edc284");
      polygon([[x-31,base-15],[x+31,base-15],[x+26,base-10],[x-26,base-10]],wood);
      line(x-23,base-18,x+17,base-18,"#a27355");line(x-16,base-13,x+13,base-13,"#e8ab70");
    }
    function workshop(t,v){
      backdrop("desk");
      ctx.save();ctx.translate(300,240);ctx.scale(1.33,1.33);ctx.translate(-300,-240);
      const choice=savedToy?(obj==="wheel"?"repair":"story"):active;
      const p=savedToy?1:v,boat=choice==="story",repair=choice==="repair",base=242;
      if(memoryToy){
        const help=active==="__page"?v:0;
        if(boat){shade(259,base,40);prop("boat",259,base+2,92);const xx=363-53*help+4*Math.sin(t*.8);
          shade(xx,base+9,21);prop("boat",xx,base+11,50);}
        else {chassis(302,base,true);prop("wheel",282,base+3,22);prop("wheel",mix(364,324,help),base+3,22);
          polygon([[197+22*help,237],[217+22*help,235],[213,300],[163,300]],"#485467");prop("hand",230+22*help,base-6,55,-.13);}
        ctx.restore();
        return;
      }
      const roll=repair?smooth((p-.6)/.4):0,x=289+roll*57;
      const wheelX=repair?mix(217,x+23,smooth(p/.59)):mix(217,165,boat?p:0);
      if(boat&&p>.22){
        // The loose wheel is laid flat on the table; it no longer stands on its rim.
        const flatten=smooth((p-.22)/.58);ctx.save();ctx.translate(wheelX,base+1);ctx.scale(1,1-flatten*.63);prop("wheel",0,1,35);ctx.restore();
      }else{shade(wheelX,base+1,13);prop("wheel",wheelX,base+3,32)}
      if(!boat||p<.88){
        ctx.save();ctx.globalAlpha=boat?1-smooth((p-.25)/.63):1;chassis(x,base);prop("wheel",x-21,base+3,24);ctx.restore();
      }
      if(boat&&p>.2){shade(x,base+1,35);prop("boat",x,base+3,91,0,smooth((p-.2)/.68))}
      if(!boat||p<.55){
        const xx=boat?mix(381,322,p*1.7):381;
        polygon([[xx-23,216],[xx+4,197],[xx+23,216],[xx,225]],"#a37966");polygon([[xx-23,215],[xx+4,196],[xx+22,213],[xx,221]],"#f3dcb8");line(xx+4,197,xx,220,"#bb9789");}
      ctx.restore();
    }
    function person(frame,x,floor,size,alpha=1){sprite("cast",frame,3,196,x,floor,size,0,alpha)}
    function bowl(x,y,full){if(full){prop("bowl",x,y,46);return}
      shade(x,y,17);polygon([[x-20,y-12],[x+20,y-12],[x+14,y-4],[x+5,y],[x-6,y],[x-15,y-5]],"#c6c7b3");
      ellipse(x,y-12,20,5,"#eee0b9");ellipse(x,y-12,16,3,"#a49384");line(x-14,y-6,x-5,y-2,"#78949b");
      for(let i=0;i<4;i++){const q=x-12+i*7;box(q,y-8+i%2,2,2,"#64838a");box(q+2,y-9+i%2,1,2,"#7b9694");}
      line(x-5,y,x+6,y,"#887d72");}
    function noodle(t,v){
      backdrop("stall");const option=active||recent,passed=info.mode==="response"||info.mode==="echo";
      const p=passed?1:v,hands=option==="hands",groups=option==="change";
      const progress=smooth((p-.12)/.80), seated=hands&&p>.55||groups&&p>.30;
      person(5,mix(465,515,groups?progress:0),198,82);
      person(groups&&p>.52?4:3,mix(420,389,groups?progress:0),201,groups&&p>.52?83:110);
      person(seated?2:1,mix(320,339,progress),202,seated?94:121);
      // Foreground counter clips the figures at the same physical line as the painted set.
      const bg=resource("stall");if(ready(bg))ctx.drawImage(bg,0,Math.round(bg.naturalHeight*.683),bg.naturalWidth,bg.naturalHeight-Math.round(bg.naturalHeight*.683),0,205,W,95);
      const pot=194;shade(pot,249,38);polygon([[pot-33,210],[pot+31,210],[pot+27,240],[pot+15,247],[pot-23,245],[pot-30,237]],"#50505a");
      const metal=ctx.createLinearGradient(pot-32,0,pot+30,0);
      for(const [at,col] of [[0,"#474149"],[.17,"#67636b"],[.31,"#a69a8b"],[.4,"#77747a"],[.66,"#66585a"],[.87,"#887968"],[1,"#463d48"]])metal.addColorStop(at,col);
      polygon([[pot-32,211],[pot+30,211],[pot+26,239],[pot+15,245],[pot-20,244],[pot-29,237]],metal);
      for(let k=0;k<54;k++){const xx=pot-25+(k*29)%50,yy=217+(k*13)%23;box(xx,yy,1+k%4,1,k%2?"#86787275":"#58545b88");}
      line(pot-24,238,pot-15,242,"#b2a79a");line(pot-15,243,pot+12,244,"#88807b");
      ellipse(pot,210,33,7,"#d1b99b");ellipse(pot,210,29,5,"#a77d55");ellipse(pot,209,22,3,"#be9364");
      for(let k=0;k<7;k++){const xx=pot-18+k*6;line(xx,209+k%2,xx+3,208+k%2,"#d7b382");}
      box(pot-40,217,10,4,"#645659");box(pot+29,216,10,4,"#514951");wisps(pot,205,t);
      const counting=items.some(item=>item.id==="hands"&&item.label.includes("报"));
      const scoop=hands&&!counting?beat(p):0,sx=pot+4+scoop*35,sy=209-scoop*25;
      line(sx,sy,sx+17,sy-28,"#493d48",4);line(sx+1,sy-1,sx+18,sy-28,"#c19975",2);ellipse(sx,sy,8,3,"#b7aaa1");
      if(scoop>.4){for(let i=0;i<4;i++)line(sx-3+i*2,sy,sx-4+i*2,sy+5+Math.round(scoop*7),"#edd59e");}
      const bx=mix(382,hands?314:355,p);bowl(433+(groups?p*28:0),241,false);bowl(431+(groups?p*28:0),236,false);
      if(hands&&p>.48){bowl(bx,238,true);wisps(bx,215,t,.23)}else bowl(bx,238,false);
      if(hands&&counting){for(let j=0;j<3;j++){const put=smooth((p-j*.19)/.45);if(put>0)bowl(mix(434,369+j*25,put),238+j*3,false);}}
    }
    function streetSill(){
      polygon([[0,226],[600,221],[600,300],[0,300]],"#604c4e");polygon([[0,226],[600,221],[600,242],[0,249]],"#8c7470");
      line(0,249,600,242,"#c09a7a",2);line(215,225,224,246,"#705a59");line(476,223,482,243,"#715c59");
    }
    function openBook(x,y,v){
      const spread=20+v*20;
      polygon([[x-spread,y-9],[x-3,y-5],[x,y-2],[x+4,y-6],[x+spread,y-11],[x+spread-3,y-29],[x+5,y-25],[x,y-21],[x-6,y-26],[x-spread+2,y-29]],"#f0d9ad");
      line(x,y-21,x,y-2,"#b99a79");for(let k=0;k<3;k++){line(x-spread+6,y-23+k*4,x-6,y-20+k*4,"#c1aa89");line(x+5,y-19+k*4,x+spread-7,y-23+k*4,"#c1aa89")}
    }
    function token(kind,x,y,size,p,t,selected){
      if(!motifs.includes(kind))kind="book";
      const lift=beat(p), scale=size;
      const displacement=selected&&["ticket","key","bag","tool","cloth","boat","ball","chair","bowl","wheel"].includes(kind)?p*(kind==="chair"?-28:20):0;
      const xx=x+displacement,yy=y-(kind==="leaf"||kind==="bird"?Math.sin(t*1.3)*1.7:0);
      if(kind==="chair"){
        prop("chair",xx,328,size*1.77,-.025*p);return;
      }
      shade(xx,yy-1,scale*.32);
      if(selected&&kind==="book"&&p>.15){openBook(x,y,p);return}
      if(selected&&kind==="letter"&&p>.08){
        prop("letter",x,y,size,-.03);
        polygon([[x-19,y-18],[x+18,y-18],[x+16,y-19-25*p],[x-20,y-19-25*p]],"#f1d8a9");
        for(let j=0;j<3&&p>.45;j++)line(x-13,y-15-22*p+j*4,x+9-j*3,y-17-22*p+j*4,"#b8a28f");
        return;
      }
      if(kind==="hand"){
        // Extend the cuff to the near edge so a hand never floats by itself.
        const hy=y-lift*8;polygon([[x-30,hy-16],[x-12,hy-4],[x-23,300],[x-70,300]],"#494051");
        polygon([[x-29,hy-14],[x-24,hy-11],[x-47,300],[x-62,300]],"#5b5267");
        line(x-29,hy-9,x-16,hy-3,"#857786",2);
        prop(kind,x,hy,size,selected?-.13*p:0);return;
      }
      if(selected&&p>.08&&kind==="pencil"){
        const l=x-23,r=x+24;
        polygon([[l,y-2],[r,y-3],[r+6,y-23],[l+7,y-24]],"#f2dcaf");
        for(let j=0;j<3;j++){const ink=limit(p*3-j);if(ink>0)line(l+9,y-18+j*4,l+9+27*ink,y-18+j*4,"#71636d");}
        prop(kind,l+13+p*25,y-11,scale*.8,-.38);return;
      }
      if(selected&&p>.08&&kind==="cloth"){
        const spread=p*29;polygon([[xx-15-spread,yy-4],[xx+14+spread,yy-4],[xx+21+spread,yy-21],[xx-7-spread,yy-26]],"#688993");
        for(let n=0;n<5;n++)line(xx-8-spread,yy-23+n*4,xx+15+spread,yy-19+n*3,"#88a4a0");
        prop(kind,xx,yy-1,scale*.75,-.08*p);return;
      }
      const turn=["key","tool","pencil","bell","wheel","ball"].includes(kind)?lift*.22+(selected?.17*p:0):0;
      prop(kind,xx,yy-lift*(selected?8:0),scale,turn);
      if(kind==="bowl")wisps(xx,yy-size*.64,t,selected?.35:.19);
      if(kind==="lamp"){
        const g=ctx.createRadialGradient(xx,yy-size*.57,1,xx,yy-size*.57,25+10*p);
        g.addColorStop(0,"rgba(255,193,94,.31)");g.addColorStop(1,"rgba(255,184,87,0)");ctx.fillStyle=g;ctx.fillRect(xx-40,yy-size-12,80,85);
      }
      if(selected&&kind==="coin"&&p>.12){for(let i=0;i<3;i++){const slide=limit(p*3-i);if(slide)ellipse(x+14+slide*(11+i*8),y-1-i%2,6,2,"#dca25f");}}
      if(selected&&kind==="clock"&&p>.05){const cx=xx,cy=yy-size*.46;line(cx,cy,cx+Math.sin(p*2.2)*11,cy-Math.cos(p*2.2)*11,"#e9c798",2);}
    }
    function river(t,p){
      backdrop(background());
      if(info.mode==="echo"&&recent==="up"){
        // The neighbors moved. This window must not appear to signal back.
        box(319,82,18,36,"#403847");for(let i=0;i<9;i++)line(319,83+i*4,336,83+i*4,"#55484b");
        wisps(165,244,t,.12);return;
      }
      if(info.mode==="echo"){for(let i=0;i<3;i++){const x=321+i*7;box(x,108,3,4,"#ffcc7e");}return;}
      if(active==="up"||recent==="up")return;
      if(active==="across"||recent==="across"){
        streetSill();for(let i=0;i<3;i++)if(p>i*.22){box(350+i*13,210,6,9,"#c9754c");box(352+i*13,205,2,5,"#ffdc90");}return;
      }
      if(items.length){prop("lamp",192,225,52);prop("lamp",408,225,52);}
    }
    function ordinary(t,v){
      const key=background();backdrop(key);
      if(info.kind==="street"||key==="doorstep")streetSill();
      if(finished){
        if(age<2){line(242,0,242,103,"#ba9373");prop("bird",242,145,48);}
        else if(age<6)prop("ball",287,251,53);
        else {
          const settle=reduced?1:smooth(t/2.7);
          openBook(290,251,.6+.30*settle);
          const fold=Math.sin(settle*Math.PI);
          if(fold>.02)polygon([[290,245],[288,228],[289+27*fold,215],[292+18*fold,239]],"#eed5a9");
        }
        const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,"rgba(64,47,62,.02)");g.addColorStop(1,"rgba(29,27,51,.24)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);return;
      }
      if(key==="sewing"&&!info.cardId&&!active)return;
      const list=items.length?items:[{id:"",motif:obj}];const pos=points(list.length);
      list.forEach((item,i)=>{
        const choice=active&&active===item.id;
        let motif=item.motif||obj;if(item.id==="__page"&&info.motif&&!choice)motif=info.motif;
        // The existing receipt can be replayed with no props array.
        if(!items.length&&info.mode==="response"&&info.originOption)motif=obj;
        const size=list.length>2?60:76;
        const x=pos[i].x*W,y=pos[i].y*H+size*.55;
        ctx.save();
        if(active&&!choice&&items.length>1)ctx.globalAlpha=1-v*.56;
        token(motif,x,y,size,choice?v:0,t,Boolean(choice));ctx.restore();
      });
      if(info.kind==="memory"&&info.tone==="失去"){
        const g=ctx.createLinearGradient(0,0,W,0);g.addColorStop(0,"rgba(47,40,67,.16)");g.addColorStop(1,"rgba(47,40,67,0)");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
      }
    }
    function courtyard(t,v){
      const kitchenSide=card==="local-CHN-cd-cooks-seat";
      const option=recent||active, p=recent?1:v;
      const left=option==="stove"||option==="listen";
      const tilt=(left?1:-1)*35*p, zoom=1+.18*p;
      ctx.save();ctx.translate(300+tilt,149+(kitchenSide?0:-5)*p);ctx.scale(zoom,zoom);ctx.translate(-300,-149);
      backdrop(kitchenSide?"opera-cook":"opera-chorus");
      if(kitchenSide&&left)wisps(65,238,t,.29*p);
      if(kitchenSide&&option==="table"&&p>.28){
        const y=299-24*p;
        polygon([[388,y-14],[463,y-20],[468,y+2],[389,y+8]],"#e8c898");
        for(let i=0;i<3;i++)line(402,y-10+i*4,442-i*3,y-13+i*4,"#8d7768");
        if(p>.65)line(402,y-1,432,y-5,"#935c50",2);
      }
      ctx.restore();
    }
    function doorway(t,v){
      const option=recent||active,p=recent?1:v,reach=option==="wave";
      const zoom=1+p*(reach?.12:.22);
      backdrop("greeting",(reach?1:-1)*p*(reach?24:47),zoom);
    }
    function dailyPlace(t,v){
      const option=recent||active,p=recent?1:v;
      if(closeStall){
        const leave=option==="walk"?p:0;
        backdrop("stall",-22*leave,1+.12*leave);
        person(5,427+leave*75,203,83);
        for(let i=0;i<3;i++){const stack=option==="bowls"?smooth((p-i*.21)/.53):0;
          bowl(mix(180+i*64,198,stack),242-4*i*stack,false);}
      }else{
        backdrop("pitch");
        const x=option==="wide"?mix(360,472,p):option==="short"?mix(360,208,p):360;
        const y=244-(option?beat(p)*14:0);
        shade(x,244,22);ellipse(x,y-2,22,4,"#49494a");
        polygon([[x-15,y-3],[x-15,y-11],[x-9,y-18],[x+2,y-19],[x+11,y-13],[x+15,y-4]],"#9d6254");
        polygon([[x-13,y-9],[x-7,y-16],[x+1,y-17],[x-2,y-4],[x-14,y-3]],"#b87b61");
        polygon([[x-14,y-3],[x+12,y-7],[x+26,y-3],[x+20,y],[x-12,y]],"#79544f");
        line(x-11,y-4,x+9,y-7,"#d09671");
      }
    }
    function sheet(x,y,w,h,color="#eddbb4"){
      polygon([[x-w/2,y],[x+w/2,y-3],[x+w/2+8,y-h-4],[x-w/2+11,y-h]],"#765b50");
      polygon([[x-w/2,y-2],[x+w/2,y-5],[x+w/2+7,y-h-4],[x-w/2+11,y-h-1]],color);
      for(let k=0;k<13;k++)box(x-w*.31+(k*13)%(w*.65),y-7-(k*11)%(h-7),1+k%3,1,"#937a5729");
    }
    function foldedKite(x,y,scale,fish){
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
      if(fish){
        polygon([[-52,-6],[-27,-3],[-7,-18],[20,-15],[42,-3],[45,4],[16,13],[-10,11],[-30,4],[-55,15]],"#c67958");
        polygon([[-45,0],[-27,1],[-2,-13],[18,-10],[38,-1],[35,3],[8,7],[-11,7],[-27,2],[-47,11]],"#dfae78");
        for(let i=0;i<5;i++)line(-15+i*8,-4,-10+i*8,4,"#a86858",2);
        ellipse(29,-2,2,2,"#433842");line(-29,2,36,0,"#997653");
      }else{
        polygon([[-26,-5],[-2,-25],[28,-9],[0,15]],"#c58c66");
        polygon([[-25,-5],[-2,-24],[0,13]],"#e7bc82");
        polygon([[-2,-24],[27,-9],[0,13]],"#96a4a2");
        line(-25,-5,26,-9,"#80685b");line(-2,-24,0,15,"#705b56");line(0,15,8,22,"#b68c6e");
      }
      ctx.restore();
    }
    function bamboo(x,y,shake){
      ctx.save();ctx.translate(x+shake,y);shade(0,0,47);
      for(let j=0;j<2;j++){box(-36+j*69,-86,5,86,"#845c36");box(-35+j*69,-85,2,83,"#d5b17b");}
      for(const yy of [-78,-11]){box(-38,yy,77,5,"#bc935b");box(-38,yy+4,77,2,"#654c3b");}
      for(let n=0;n<3;n++){const x=-24+n*17,h=59-n*8+shake*.4;box(x,-h,11,h-12,"#ad7946");
        box(x+2,-h+2,3,h-15,"#edd09a");box(x+6,-h+2,2,h-16,"#be935b");box(x,-h,10,4,"#614d43");
        line(x+1,-h-2,x+5,-78,"#a98d75");box(x,-24+n,10,2,"#846948");}
      ctx.restore();
    }
    function localObjects(t,v){
      const option=recent||active,p=recent?1:v;
      backdrop(craft==="cover"||craft==="kite"||craft==="bamboo"?"desk":craft==="radio"||craft==="board"?"table":"workshop");
      if(craft==="kite"){
        if(!p||p<1){ctx.save();ctx.globalAlpha=1-p;sheet(288,244,182,51);line(186,225,373,208,"#b68c60",2);ctx.restore();}
        if(p>0){ctx.save();ctx.globalAlpha=p;
          if(option==="one")foldedKite(292,226-15*p,1.42,true);
          else{foldedKite(237-12*p,227-8*p,1,false);foldedKite(323+18*p,223-13*p,1.08,false);}
          ctx.restore();}
      }else if(craft==="cover"){
        sheet(254,244,132,51,"#cca678");prop("book",355,249,80);
        if(option==="cover-one"&&p){sheet(305+37*p,242,65,43,"#c39061");line(288+37*p,202,282+37*p,237,"#a67c5c",2);}
        if(option==="corner-pieces")for(let i=0;i<4;i++){const x=228+26*i*p,y=240-i%2*16*p;
          polygon([[x-9,y-3],[x+10,y-6],[x+12,y-23]],"#e4c79e");line(x-8,y-4,x+10,y-17,"#a88362");}
      }else if(craft==="radio"){
        const x=365,y=183,paperX=193;shade(x+38,y+58,49);box(x,y,88,55,"#573e3b");box(x+3,y+3,82,49,"#ae7952");box(x+7,y+8,44,34,"#554548");
        for(let i=0;i<6;i++)for(let j=0;j<5;j++)box(x+10+i*6,y+11+j*6,3,2,"#97795c");
        box(x+55,y+8,26,8,"#e1c19a");box(x+65,y+8,2,8,"#a15d49");for(const n of [61,76]){ellipse(x+n,y+32,7,7,"#483e43");ellipse(x+n-1,y+30,4,4,"#a6937a");}
        line(x+11,y-1,x+43,y-42,"#c3b7a2",2);sheet(paperX,243,88,38);
        if(option==="map"){for(let n=0;n<4;n++){const a=limit(p*4-n);if(a)line(paperX-28+n*13,231-n%2*12,paperX-28+n*13+13*a,231-n%2*12+(n%2?12:-12)*a,"#677c80",2);}}
        if(option==="voices"&&p)for(let n=0;n<3;n++){const xx=x+74+n*9;line(xx,176-n*6,xx+4,170-n*7,"#e4c89a",2);}
      }else if(craft==="bamboo"){
        bamboo(213,246,option==="play-part"?Math.sin(t*8)*5+p*6:0);
        bamboo(385-25*(option==="practice-entry"?p:0),244,option==="practice-entry"?Math.sin(t*6)*3+p*4:0);
      }else if(craft==="board"){
        const xx=300+(option==="teach-newcomer"?p*35:0);
        shade(xx,241,96);polygon([[xx-99,195],[xx+89,193],[xx+99,236],[xx-101,243]],"#654b42");
        polygon([[xx-95,194],[xx+87,192],[xx+95,231],[xx-98,238]],"#b98758");
        for(let row=0;row<2;row++)for(let col=0;col<6;col++){const x=xx-76+30*col,y=204+row*17-col/2;
          ellipse(x,y,12,6,"#694d40");ellipse(x+1,y+1,10,4,"#83634d");
          const n=option==="face-expert"&&p>.52&&row===0?(col===1?0:col===2?4:3):3;
          for(let j=0;j<n;j++)ellipse(x-5+(j%3)*4,y+1-Math.floor(j/3)*3,2,1.5,"#e4c99e");}
      }else{
        const shift=(option==="watch"?-25:option==="answer"?12:0)*p;
        box(207+shift,134,181,103,"#6f4845");box(216+shift,142,163,78,"#342e39");
        for(let i=0;i<7;i++){box(210+shift+i*3,139,4,68-i*4,i%2?"#ae6553":"#914c48");box(365+shift+i*3,139,4,46+i*3,i%2?"#ac6251":"#8b4a48");}
        box(206+shift,221,184,11,"#b98b61");
        const x=293+shift+(option==="answer"?12*p:0),y=214+(option==="answer"?Math.sin(t*3)*2:0);
        polygon([[x-11,y],[x-6,y-27],[x+6,y-27],[x+15,y]],"#be8057");
        ellipse(x,y-32,8,8,"#c89b6d");polygon([[x-7,y-37],[x-4,y-48],[x+9,y-36]],"#934b41");box(x+4,y-34,2,2,"#493e40");
      }
    }
    function draw(){
      needsFrame=false;const v=active?smooth(elapsed/1.05):0;
      ctx.clearRect(0,0,W,H);
      if(baby)cradle(clock,v);else if(toy)workshop(clock,v);else if(kitchen)noodle(clock,v);else if(light)river(clock,v);
      else if(firstVisit)doorway(clock,v);else if(court)courtyard(clock,v);else if(closeStall||kickabout)dailyPlace(clock,v);
      else if(craft)localObjects(reduced||paused?0:clock,v);else ordinary(clock,v);
    }
    function schedule(){if(!dead&&visible&&onscreen&&!request)request=requestAnimationFrame(frame)}
    function frame(now){
      request=0;if(dead||!visible||!onscreen)return;
      const dt=last===null?0:Math.min(.08,(now-last)/1000);
      if(!reduced&&!paused && (last===null||dt>=1/25)){
        clock+=dt;if(active)elapsed+=dt;needsFrame=true;last=now;
      }
      if(needsFrame)draw();
      if(!reduced&&!paused)schedule();
    }
    function sync(){visible=!document.hidden;last=null;if(visible)schedule();else if(request){cancelAnimationFrame(request);request=0}}
    const observer=typeof IntersectionObserver==="function"?new IntersectionObserver(entries=>{
      onscreen=entries[0].isIntersecting;last=null;if(onscreen)schedule();
    }):null;
    observer?.observe(canvas);document.addEventListener("visibilitychange",sync);
    draw();schedule();
    return {
      act(id){if(dead)return;active=id;elapsed=(reduced||paused)?1.1:0;needsFrame=true;draw();schedule();},
      setPaused(value){if(paused===Boolean(value))return;paused=Boolean(value);last=null;schedule();},
      destroy(){dead=true;if(request)cancelAnimationFrame(request);observer?.disconnect();document.removeEventListener("visibilitychange",sync);for(const img of watched)img.removeEventListener("load",loaded);}
    };
  }
  globalThis.LifeStageArt=Object.freeze({mount,points});
})();
