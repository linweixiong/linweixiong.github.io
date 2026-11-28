/* Seven saved moments in one Dhaka household. The stage only reads the journal. */
(() => {
  "use strict";
  const base="bangladesh-door/",card="local-BGD-bd-dhaka-door-panel",source="BGD/bd-dhaka-panel";
  const titles={
    "门响一声，她就知道":"intro","手伸向车尾那扇门":"street-echo","门外那个背书包的人":"inside-echo",
    "抬门以前，先停一下":"street-later","把凳子转半圈":"inside-later"
  };
  function shot(info){
    const s=info?.state;
    if(!s||s.region!=="BGD"||info.sourceKey!==source)return null;
    const age=info.eventAge??s.age,mode=info.mode;
    let beat;
    if(age===9&&mode==="choice"&&info.cardId===card)beat="choose";
    else if(age===9&&mode==="response"&&info.originCard===card&&["inside","street"].includes(info.originOption))beat=info.originOption;
    else{
      beat=titles[info.eventTitle];
      if(!((age===8&&mode==="scene"&&beat==="intro")||(age===11&&mode==="echo"&&["inside-echo","street-echo"].includes(beat))
        ||(age===18&&mode==="scene"&&["inside-later","street-later"].includes(beat))))return null;
    }
    const girl=s.sex==="female",studio=girl?"studio-girl":"studio-boy",child=girl?"figure-girl":"figure-boy";
    const stand=girl?"sit-girl-start":"sit-start",seated=girl?"sit-girl-end":"sit-end";
    const bag=girl?"schoolbag-girl":"schoolbag",turnStool=girl?"turn-stool-girl":"turn-stool",cousin=girl?"cousin-girl":"cousin";
    const keys={
      intro:[studio,"room"],choose:["commission","alley","room"],
      street:["alley","street-paint","turn-side","turn-bend","turn-back","door-board"],
      inside:["inside-paint",child,stand,seated],
      "street-echo":["turn-side","turn-bend","turn-back","reach"],
      "inside-echo":["notebook","folded-slip",bag],
      "street-later":["new-lift","new-push"],"inside-later":[turnStool,cousin]
    }[beat];
    return {beat,asset:base+keys[0],preload:keys.map(k=>base+k),studio,child,stand,seated,bag,turnStool,cousin};
  }
  function points(info){
    if(info?.cardId!==card||info.mode!=="choice"||info.items?.length!==2)return null;
    return info.items.map(item=>({x:item.id==="inside"?.825:.175,y:.80}));
  }
  const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
  const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
  function image(resource,name){
    const img=resource(base+name);
    return img?.complete&&img.naturalWidth>0?img:null;
  }
  function paint(ctx,shot,clock,elapsed,reduced,resource){
    const t=Number.isFinite(elapsed)?elapsed:clock;
    let visible=shot.asset;
    function full(name){
      const bitmap=image(resource,name);
      if(bitmap){ctx.drawImage(bitmap,0,0,600,300);visible=base+name;}
      return bitmap;
    }
    function insert(name,x,y,w,h){
      const bitmap=image(resource,name);
      if(!bitmap)return;
      ctx.fillStyle="#2a2023";ctx.fillRect(x-3,y-3,w+6,h+6);
      ctx.fillStyle="#c59b68";ctx.fillRect(x-1,y-1,w+2,h+2);
      ctx.drawImage(bitmap,x,y,w,h);
    }
    function paintedChild(progress,x=296,y=199,h=66){
      const child=image(resource,shot.child);
      if(!child||progress<=0)return;
      const w=Math.round(h*child.naturalWidth/child.naturalHeight);
      // The tiny figure is painted onto the panel's alley, from the top of its head
      // down to its shoes, with its face turned toward the observer in the room.
      ctx.save();ctx.beginPath();ctx.rect(x-w/2,y-h,w,Math.ceil(h*progress));ctx.clip();
      ctx.drawImage(child,Math.round(x-w/2),y-h,w,h);ctx.restore();
    }
    function littlePanel(){
      const rect={x:8,y:164,w:160,h:80};
      insert("inside-paint",rect.x,rect.y,rect.w,rect.h);
      ctx.save();ctx.translate(rect.x,rect.y);ctx.scale(rect.w/600,rect.h/300);paintedChild(1);ctx.restore();
    }
    function latch(bitmap,progress){
      if(!bitmap)return;
      if(progress<=0)return;
      const pulse=Math.sin(Math.PI*progress),slide=6*pulse+4*progress;
      ctx.save();ctx.scale(600/840,300/420);
      // Expose only the gaps between the two fixed sleeves. All four screws and
      // both mount plates remain precisely where the carpenter fixed them.
      ctx.beginPath();
      for(const [x,w] of [[642,18],[671,39],[725,20]])ctx.rect(x,180,w,15);
      ctx.clip();
      for(const [x,w] of [[642,18],[671,39],[725,20]])ctx.drawImage(bitmap,x,163,w,15,x,180,w,15);
      ctx.translate(652+slide,184+1.8*pulse);ctx.rotate(.022*pulse+.009*progress);
      ctx.drawImage(bitmap,674,183,35,9,0,0,82,9);ctx.restore();
    }
    function releaseSketch(p){
      const paper=image(resource,"folded-slip");
      if(!paper)return;
      // Only this transparent scrap moves. The underlying desk has no baked paper.
      ctx.save();ctx.translate(450-109*p,242+15*p+7*Math.sin(Math.PI*p));
      ctx.rotate(-.23*p);ctx.scale(1+.14*p,1+.14*p);
      ctx.shadowColor="rgba(45,30,26,.45)";ctx.shadowBlur=1;ctx.shadowOffsetY=1+2*Math.sin(Math.PI*p);
      ctx.drawImage(paper,-41,-24,80,53);ctx.restore();
    }
    ctx.save();
    if(shot.beat==="intro"){
      if(reduced){const bmp=full("room");latch(bmp,1);insert(shot.studio,9,10,186,93);}
      else if(t<1.22)full(shot.studio);
      else{const bmp=full("room");latch(bmp,smooth((t-1.38)/.65));}
    }else if(shot.beat==="choose"){
      full("commission");
      // Two possible camera positions. Keep the still-blank metal plate and both
      // people visible above the thumbnails until the player makes the choice.
      insert("alley",9,203,183,88);insert("room",408,203,183,88);
    }else if(shot.beat==="street"){
      if(reduced){full("door-board");insert("street-paint",9,9,169,85);}
      else if(t<.38)full("alley");
      else if(t<1.49)full("street-paint");
      else full(t<1.95?"turn-side":t<2.36?"turn-bend":t<2.94?"turn-back":"door-board");
    }else if(shot.beat==="inside"){
      if(reduced){full(shot.seated);littlePanel();}
      else if(t<1.58){
        full("inside-paint");paintedChild(smooth((t-.20)/.86));
      }else if(t<2.04)full(shot.stand);
      else{full(shot.seated);littlePanel();}
    }else if(shot.beat==="street-echo"){
      if(reduced||t>=1.60)full("reach");
      else full(t<.52?"turn-side":t<.98?"turn-bend":"turn-back");
    }else if(shot.beat==="inside-echo"){
      if(reduced||t>=1.67)full(shot.bag);
      else{full("notebook");releaseSketch(smooth((t-.14)/1.03));}
    }else if(shot.beat==="street-later"){
      full(reduced||t>=1.15?"new-push":"new-lift");
    }else if(shot.beat==="inside-later"){
      full(reduced||t>1.23?shot.cousin:shot.turnStool);
    }
    ctx.restore();
    return visible;
  }
  globalThis.BangladeshDoorArt=Object.freeze({shot,paint,points});
})();
