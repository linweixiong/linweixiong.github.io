/* Local view of a life. A stage prop only commits a choice through the app's
   existing choice handler. Looking, replaying and touching toys never write a save. */
(() => {
  'use strict';
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const toys=[{id:'__bird',label:'逗小鸟',motif:'bird'},{id:'__bell',label:'碰风铃',motif:'bell'}];
  const page={id:'__page',label:'翻看这页',motif:'book'};
  function describe(s,context={}){
    const info=window.StageStories?.describe(s,context)||{};
    const mode=info.mode||(s.ended?'farewell':s.pending?'choice':s.age===0?'cradle':'scene');
    let items=Array.isArray(info.items)?info.items:[];
    if(s.pending&&!context.event&&!context.action){
      items=s.pending.options.map(o=>({...items.find(i=>i.id===o.id),id:o.id,
        label:items.find(i=>i.id===o.id)?.label||o.label,disabled:!!o.disabled}));
    }else if(!s.ended&&!s.pending&&s.age===0&&!context.event&&!context.action){
      items=[...items,...toys.filter(t=>!items.some(i=>i.id===t.id))];
    }else if(!s.ended&&!s.pending&&s.age>0&&!context.action&&!items.length){
      items=[page];
    }
    return {...info,mode,items};
  }
  function frame(){
    return '<figure class="stage-frame" tabindex="-1"><div class="stage-window"><canvas id="lifeScene" width="600" height="300" role="img" aria-label="人生场景"></canvas>'+
      '<div class="stage-pins"></div></div><div class="stage-pages" hidden><button type="button" data-stage-page="-1">上一组道具</button><span></span><button type="button" data-stage-page="1">下一组道具</button></div><figcaption><div class="stage-speaker"><i aria-hidden="true"></i><span></span></div>'+
      '<p class="stage-caption" aria-live="polite"></p><button type="button" class="text-btn stage-return" hidden>返回眼前场景</button>'+
      '<details class="stage-transcript" hidden><summary>这一幕的原文</summary><div></div></details></figcaption></figure>';
  }
  function mount(el,{state,model,paused,onChoice,onAction,onReview,receipt}){
    const canvas=el.querySelector('canvas'),pins=el.querySelector('.stage-pins'),caption=el.querySelector('.stage-caption');
    const speaker=el.querySelector('.stage-speaker span'),back=el.querySelector('.stage-return'),transcript=el.querySelector('.stage-transcript');
    const pager=el.querySelector('.stage-pages');
    let current=model,art=null,timer=0,preview=false,active=true,playing=null,group=0,isPaused=paused;
    function copy(m,text){
      const value=text||m.caption||m.eventTitle||'';
      caption.textContent=window.LifeDesk.moneyText(state,value);
      const name=({choice:'点道具做选择',cradle:'最初的日子',scene:'此刻',response:'你的选择',echo:'往事回响',farewell:'告别'})[m.mode]||'此刻';
      speaker.textContent=(preview&&Number.isFinite(m.eventAge)?m.eventAge+'岁 · ':'')+name;
      el.dataset.mode=m.mode;
      const ref=window.CountryStories?.references.get(m.sourceKey);
      transcript.hidden=m.mode==='choice'||!(ref||m.detail&&m.detail!==value);
      const body=transcript.querySelector('div');
      body.replaceChildren();
      if(m.detail){const p=document.createElement('p');p.textContent=window.LifeDesk.moneyText(state,m.detail);body.append(p);}
      if(ref){const a=document.createElement('a');a.href=ref.url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='背景资料 · '+ref.label;body.append(a);}
    }
    function draw(s,m,interactive=true){
      art?.destroy?.();
      // Keep touch targets separate even when a job card has many options.
      // The complete list, including disabled options, remains beside the scene.
      const all=m.items||[],groups=Math.max(1,Math.ceil(all.length/4));
      group=Math.max(0,Math.min(group,groups-1));
      const list=all.slice(group*4,group*4+4);
      pager.hidden=!interactive||groups<2;
      pager.querySelector('span').textContent=(group+1)+' / '+groups;
      pager.firstElementChild.disabled=group===0;
      pager.lastElementChild.disabled=group===groups-1;
      const config={...m,kind:m.kind||m.mode,state:s,items:list,paused:isPaused,reducedMotion:motion.matches};
      if(window.LifeStageArt)art=window.LifeStageArt.mount(canvas,config);
      else{art=null;window.LifeDesk?.drawMapScene?.(canvas,s,window.LifeKeepsakes.livedYears(s));}
      const pos=window.LifeStageArt?.points(list.length)||list.map((_,i)=>({x:list.length===1?.5:.18+.64*i/(list.length-1),y:.65}));
      pins.dataset.count=list.length;
      pins.innerHTML=interactive?list.map((item,i)=>{
        const o=s.pending?.options.find(o=>o.id===item.id);
        const label=window.LifeDesk.moneyText(s,item.label);
        return '<button type="button" class="stage-pin" data-prop="'+escape(item.id)+'" style="left:'+(pos[i].x*100)+'%;top:'+(pos[i].y*100)+
          '%" aria-label="'+escape(o?'选择：'+window.LifeDesk.moneyText(s,o.label):label)+'"'+(o?' aria-describedby="option-note-'+s.pending.options.indexOf(o)+'"':'')+(item.disabled||o?.disabled?' disabled':'')+'><span>'+escape(label)+'</span></button>';
      }).join(''):'';
      canvas.setAttribute('aria-label',m.eventTitle||m.caption||'这一年的人生场景');
    }
    function live(){
      const wasPreview=preview;
      if(playing)playing.done=true;
      clearTimeout(timer);preview=false;playing=null;back.hidden=true;group=0;
      back.textContent='返回眼前场景';
      draw(state,current);copy(current);transcript.open=false;
      if(wasPreview)onReview();
    }
    function timeResponse(){
      clearTimeout(timer);
      const r=playing;
      if(!r)return;
      if(isPaused){
        if(!r.held){r.left=Math.max(0,r.until-performance.now());r.held=true;}
      }else{
        if(r.held){r.until=performance.now()+r.left;r.held=false;}
        timer=setTimeout(()=>{if(active&&playing===r)live();},Math.max(0,r.until-performance.now()));
      }
    }
    function response(r){
      clearTimeout(timer);preview=false;playing=r;back.hidden=false;back.textContent='看眼前场景';
      group=Math.max(0,Math.floor(r.model.items.findIndex(i=>i.id===r.id)/4));
      draw(r.state,r.model,false);art?.act?.(r.id);copy(r.result,r.result.caption||r.event?.title);
      // The actual next operation is live throughout this brief visual response.
      timeResponse();
    }
    function click(e){
      if(e.target===back){live();return;}
      const turn=e.target.closest('button[data-stage-page]');
      if(turn&&!turn.disabled){group+=Number(turn.dataset.stagePage);draw(state,current);return;}
      const pin=e.target.closest('button[data-prop]');
      if(!pin||pin.disabled)return;
      const id=pin.dataset.prop;
      if(!preview&&state.pending?.options.some(o=>o.id===id)){onChoice(id,state.pending.id);return;}
      art?.act?.(id);
      if(onAction(id))return;
      const item=current.items.find(i=>i.id===id);
      if(id===page.id){
        copy(current,current.eventTitle||'你翻开了这一年的手记。');
        if(!transcript.hidden)transcript.open=true;
        return;
      }
      const action=describe(state,{action:id});
      copy(current,action.caption&&action.caption!==current.caption?action.caption:(item?.detail||item?.label));
    }
    function changeMotion(){
      if(playing)response(playing);
      else if(!preview)live();
    }
    el.addEventListener('click',click);motion.addEventListener('change',changeMotion);
    if(receipt&&!receipt.done&&(receipt.held||receipt.until>performance.now()))response(receipt);else live();
    return {
      get model(){return current},
      get reviewing(){return preview},
      setPaused(value){if(isPaused===value)return;isPaused=value;art?.setPaused?.(value);timeResponse();},
      update(next){current=next;if(!playing&&!preview)live();},
      preview(m,age){clearTimeout(timer);if(playing)playing.done=true;playing=null;preview=true;back.hidden=false;back.textContent='返回眼前场景';draw(state,{...m,eventAge:age},false);copy(m);onReview();},
      destroy(){active=false;clearTimeout(timer);art?.destroy?.();el.removeEventListener('click',click);motion.removeEventListener('change',changeMotion);}
    };
  }
  globalThis.LifeStageView=Object.freeze({describe,frame,mount});
})();
