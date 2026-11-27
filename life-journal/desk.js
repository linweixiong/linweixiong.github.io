/* Family, companions, life map and notes use the same age as the annual clock. */
(() => {
  'use strict';
  const W=globalThis.LifeWorld;
  function financialIdentity(s){
    return {version:s.version,region:s.region,birthYear:s.birthYear,month:s.month,edition:s.edition,countrySetVersion:s.countrySetVersion,
      ...(s.origin?{origin:{incomeGroup:s.origin.incomeGroup??null}}:{})};
  }
  function currencyLabel(s){
    const info=LifeFinance.displayInfo(s);
    if(!info.available)return '旧账点 · 折算资料不足';
    return info.unit+'（'+info.code+'）'+(info.legacy?' · 旧账折算':'');
  }
  function money(s,n){
    if(!Number.isFinite(n))return '—';
    return LifeFinance.displayMoney(s,n);
  }
  function moneyText(s,value){
    return LifeFinance.displayText(s,String(value??''));
  }
  function endAge(s){
    if(!s.ending)return s.age+'岁';
    const {years,months}=s.ending;
    if(!years)return months?months+'个月':'未满1个月';
    return years+'岁'+(months?months+'个月':'');
  }
  function lastYear(s){
    return s.ending?s.birthYear+s.ending.years+Math.floor(((s.month||1)-1+s.ending.months)/12):s.birthYear+s.age;
  }
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const memory=new Map(), panels=new Map();
  const hash=(s,n)=>W.hash(s.seed,n);
  const key=s=>'life-desk.v2.'+[s.version,s.seed,s.region,s.family,s.birthYear,s.birthMode||''].join('.');
  function read(s){
    const k=key(s);
    try{const raw=localStorage.getItem(k);if(raw)return JSON.parse(raw);}catch{}
    return memory.get(k)||{notes:[],stars:[]};
  }
  function write(s,edit){
    const k=key(s),data=read(s);edit(data);memory.set(k,data);
    try{localStorage.setItem(k,JSON.stringify(data));return true;}catch{return false;}
  }
  function writeNote(s,text){
    if(!s||!text.trim())return false;
    return write(s,d=>{d.notes??=[];d.notes.push({age:LifeKeepsakes.livedYears(s),text:text.trim().slice(0,1200)});});
  }
  const section=(id,title,body,opened=false)=>'<details class="desk-card" data-section="'+id+'"'+(opened?' open':'')+'><summary>'+esc(title)+'</summary><div class="desk-body">'+body+'</div></details>';
  function familyBox(s){
    const members=globalThis.LifeFamily.members(familyAt(s,LifeKeepsakes.livedYears(s)));
    const items=members.map(p=>'<li><span>'+esc(p.role)+'</span><div><strong>'+esc(p.name)+'</strong> · '+p.age+'岁<small>'+esc(p.living?p.job:'已离世，留在记忆中')+'</small></div></li>').join('');
    const facts=(s.facts||[]).filter(f=>f.category==='family').slice(-2);
    return '<ul class="desk-family">'+items+'</ul><p class="desk-caption">'+esc(s.household||'与家人生活')+'</p>'+facts.map(f=>'<p class="desk-sub"><b>'+f.age+'岁</b>　'+esc(moneyText(s,f.text))+'</p>').join('');
  }
  let peerKey='', peers=[];
  function peersAt(s){
    const k=key(s),lived=LifeKeepsakes.livedYears(s);
    if(k!==peerKey||peers.some(p=>p.age>lived)){
      peerKey=k;
      peers=[1,2,3,4].map(i=>Life.create({seed:hash(s,960+i),birthMode:s.birthMode||'newborn',birthYear:s.birthYear,countrySetVersion:s.countrySetVersion||1}));
    }
    for(let i=0;i<4;i++){
      let p=peers[i],limit=400;
      while(!p.ended&&p.age<lived&&--limit){
        if(p.pending){
          const options=p.pending.options.filter(o=>o.enabled!==false&&!o.disabled);
          if(!options.length)break;
          const which=W.hash(p.seed,400+p.age)%options.length;
          p=Life.choose(p,options[which].id);
        }else p=Life.advance(p);
      }
      peers[i]=p;
    }
    return peers;
  }
  function peerBox(s){
    return '<ol class="desk-peers">'+peersAt(s).map(p=>{
      const place=W.place(p.region,p.birthYear),last=(p.memories||[]).filter(x=>x.age>0).at(-1);
      return '<li><div><strong>'+esc(p.name)+'</strong><small>'+esc(place?.country||p.region)+'</small></div><div>'+esc(p.ended?'已告别 · '+p.age+'岁':p.stage)+'<small>'+esc(p.ended||!last?p.career:last.title)+'</small></div></li>';
    }).join('')+'</ol>';
  }
  let wallet, walletState, walletActions, walletDate, walletReturn, walletPage='ledger', walletReceipt='';
  const walletPages={ledger:'年度收支',spend:'生活消费',invest:'储蓄与基金',home:'住房'};
  function account(s){
    return Life.finance?.(s)||{cash:s.cash,savings:s.savings,fundUnits:s.assets?.fundUnits,
      netWorth:null,lastYear:s.annualAccounts?.at(-1)||s.ledger?.at(-1),transactions:[]};
  }
  function amountPair(label,value){
    return '<div><dt>'+esc(label)+'</dt><dd>'+esc(value)+'</dd></div>';
  }
  const familyPays=(s,f)=>f.familySupport||(s.edition!=='regional-2'&&s.age<16);
  const paidExpenses=row=>Number.isFinite(row.paid)?row.paid:Math.max(0,row.cost-(row.shortfall||0));
  function overview(s,f){
    const owned=familyPays(s,f)?'家庭财务':'财务概览';
    const info=LifeFinance.displayInfo(s);
    const basis='<div class="money-context"><span>'+esc(info.available&&info.year?info.year+'年价格基准':'')+'</span>'+
      '<details><summary>金额怎么算</summary><p>'+esc(info.basis)+'</p><a href="./world-sources.html#accounts" target="_blank" rel="noopener">查看工资和生活支出的资料</a></details></div>';
    return '<section class="money-overview"><div class="money-total"><div><p>'+owned+' · '+esc(currencyLabel(s))+'</p><h2 id="walletTitle">净资产</h2></div><strong>'+esc(money(s,f.netWorth))+'</strong></div>'+
      '<dl class="money-balances">'+amountPair('现金',money(s,f.cash))+amountPair('存款',money(s,f.savings))+
      amountPair('基金估值',money(s,f.fundValue))+amountPair('住房估值',money(s,f.homeValue))+'</dl>'+
      (familyPays(s,f)?'<p class="money-basis">日常开支由家里安排，个人工资尚未入账。</p>':'')+basis+'</section>';
  }
  function yearRange(s,age){
    const month=s.month?s.month+'月':'';
    return (s.birthYear+age-1)+'年'+month+'—'+(s.birthYear+age)+'年'+month;
  }
  function annualPage(s,f){
    const row=f.lastYear;
    let contents='';
    if(row){
      const paid=paidExpenses(row);
      const foodLabel=s.countrySetVersion===2 && s.region==='MEX'?'食品、饮料及烟草':'餐食';
      const travelLabel=s.countrySetVersion===2 && ['JPN','MEX'].includes(s.region)?'交通与通信':'交通';
      const lines=[[foodLabel,row.food],['居住',row.housing],[travelLabel,row.transport],['其他开支',row.other]].filter(([,n])=>Number.isFinite(n));
      contents='<p class="money-period">'+esc(yearRange(s,row.age))+'</p><dl class="cash-flow">'+
        amountPair('实际收入',money(s,row.income))+amountPair('实际支出',money(s,paid))+
        amountPair('收支结余',money(s,row.income-paid))+'</dl><p class="money-period">以上为年度生活结算。年内另行办理的交易见下方。</p>'+
        (lines.length?'<h4 class="money-subtitle">应付费用构成</h4><dl class="money-lines">'+lines.map(([l,n])=>amountPair(l,money(s,n))).join('')+'</dl>':'')+
        (row.shortfall>0?'<p class="money-period">其中 '+esc(money(s,row.shortfall))+' 未能支付。</p>':'')+
        (row.drawFromSavings>0?'<p class="money-period">为支付开支，从存款转回 '+esc(money(s,row.drawFromSavings))+'。</p>':'');
    }else{
      contents='<p class="money-empty">'+(s.age===0?'出生后的第一个年度还未结束。':familyPays(s,f)?'目前由家庭承担生活开支，还没有个人收入与支出年账。':'这份人生尚无可查的年度收支记录。')+'</p>';
    }
    const all=[...(f.transactions||[])].reverse();
    const tx=t=>{
      const sale=Number.isFinite(t.realizedGain)?'<small>原值 '+esc(money(s,t.principal))+' · 费用 '+esc(money(s,t.fee))+
        ' · 已实现损益 '+esc(money(s,t.realizedGain))+'</small>':'';
      return '<li><span>'+esc(t.age)+'岁 · '+esc(t.label)+sale+'</span><strong>'+
        (t.kind==='arrangement'?'无现金变动':esc((t.cashDelta>0?'+':'')+money(s,t.cashDelta)))+'</strong></li>';
    };
    return '<h3>上一年度收支</h3>'+contents+'<h3>个人交易记录</h3>'+
      (all.length?'<p class="money-period">金额为每笔交易带来的现金变动。</p>':'')+
      (all.length?'<ul class="money-history">'+all.slice(0,5).map(tx).join('')+'</ul>'+
        (all.length>5?'<details class="more-transactions"><summary>更早的 '+(all.length-5)+' 笔</summary><ul class="money-history">'+all.slice(5).map(tx).join('')+'</ul></details>':''):
        '<p class="money-empty">还没有可查的交易。</p>');
  }
  function tradeGroup(id){
    if(['deposit','withdraw','buyfund','sellfund'].includes(id))return 'invest';
    return ['buyhome','sellhome'].includes(id)?'home':'spend';
  }
  function tradePage(s,f,page){
    const opts=(Life.shopOptions?.(s)||[]).filter(o=>tradeGroup(o.id)===page);
    const details=page==='invest'?'<dl class="cash-flow">'+amountPair('存款余额',money(s,f.savings))+
      amountPair('基金持有',Number.isFinite(f.fundUnits)?f.fundUnits+' 份':'—')+
      amountPair('本年每份估值',money(s,f.fundPrice))+'</dl>':page==='home'?'<dl class="cash-flow">'+
      amountPair('目前居所',s.housing||'旧档未记录')+amountPair('自有住房估值',money(s,f.homeValue))+'</dl>':'';
    const rows=opts.map(o=>{
      const enabled=!s.ended&&o.enabled!==false&&!o.disabled;
      const price=o.credit>0?'现金到账 +'+money(s,o.credit):o.cost>0?'现金支出 '+money(s,o.cost):'无现金支出';
      return '<li><div><h4>'+esc(o.label)+'</h4><p>'+esc(moneyText(s,o.note))+'</p></div>'+
        '<div><strong>'+esc(price)+'</strong><button type="button" data-desk-buy="'+esc(o.id)+'" aria-label="'+esc(o.label)+'"'+
        (enabled?'':' disabled')+'>'+(!enabled?'不可办理':page==='spend'?(o.cost>0?'购买':'选择'):'办理')+'</button></div></li>';
    }).join('');
    return '<h3>'+walletPages[page]+'</h3>'+details+(rows?'<ul class="money-trades">'+rows+'</ul>':
      '<p class="money-empty">'+(s.ended?'这段人生已结束。':s.version===1?'旧版人生未记录这类交易。':
        page==='invest'?'20岁起可办理储蓄和基金交易。':page==='home'?'26岁起可办理住房交易。':'这个年龄还没有可自行购买的项目。')+'</p>');
  }
  function paintWallet(restoreFocus){
    const s=walletState, f=account(s);
    const scroll=wallet.querySelector('.wallet-scroll')?.scrollTop||0;
    const d=walletDate||{year:s.birthYear+s.age,month:s.month||1};
    wallet.innerHTML='<div class="wallet-head"><p>'+esc(s.name)+' · '+d.year+'年'+d.month+'月</p>'+
      '<button type="button" class="wallet-close" data-wallet-close aria-label="关闭财务">关闭</button></div>'+
      '<div class="wallet-scroll">'+overview(s,f)+'<nav class="wallet-tabs" aria-label="财务分类">'+Object.entries(walletPages).map(([id,label])=>
        '<button type="button" data-wallet-page="'+id+'" aria-pressed="'+(walletPage===id)+'">'+label+'</button>').join('')+'</nav>'+
      '<div role="status" class="wallet-receipt">'+esc(walletReceipt)+'</div><section class="wallet-content">'+
      (walletPage==='ledger'?annualPage(s,f):tradePage(s,f,walletPage))+'</section></div>';
    wallet.querySelector('.wallet-scroll').scrollTop=scroll;
    if(restoreFocus)wallet.querySelector(restoreFocus)?.focus({preventScroll:true});
  }
  function closeFinance(){if(wallet?.open)wallet.close();}
  function openFinance(s,date){
    if(!wallet){
      wallet=document.createElement('dialog');
      wallet.className='wallet'; wallet.setAttribute('aria-label','消费与财务');
      document.body.append(wallet);
      wallet.addEventListener('close',()=>{const target=walletReturn?.isConnected?walletReturn:document.querySelector('.finance-launch');target?.focus({preventScroll:true});});
      wallet.addEventListener('click',e=>{
        const b=e.target.closest('button');if(!b)return;
        if(b.hasAttribute('data-wallet-close')){closeFinance();return;}
        if(b.dataset.walletPage){
          walletPage=b.dataset.walletPage;walletReceipt='';paintWallet('[data-wallet-page="'+walletPage+'"]');
          const viewport=wallet.querySelector('.wallet-scroll');
          viewport.scrollTop=Math.min(viewport.scrollTop,wallet.querySelector('.money-overview').offsetHeight);
          return;
        }
        const id=b.dataset.deskBuy;
        if(id&&!b.disabled){
          const old=walletState.cash;
          const picked=Life.shopOptions(walletState).find(o=>o.id===id&&o.enabled!==false&&!o.disabled);
          if(!picked)return;
          const ok=walletActions?.buy(id);
          walletReceipt=ok?'已办理「'+picked.label+'」。'+(old===walletState.cash?'现金余额 '+money(walletState,old):
            '现金由 '+money(walletState,old)+' 变为 '+money(walletState,walletState.cash))+'。':'未能办理，请查看当前余额后重试。';
          paintWallet('[data-wallet-page="'+walletPage+'"]');
        }
      });
    }
    walletReturn=document.activeElement; walletState=s; walletDate=date; walletPage='ledger'; walletReceipt='';
    paintWallet();wallet.showModal();wallet.querySelector('.wallet-close').focus();
  }
  function balanceCard(s){
    const f=account(s), row=f.lastYear;
    return '<section class="pane balance-card"><h2>'+ (familyPays(s,f)?'家庭财务':'财务')+'</h2><p class="balance-currency">'+esc(currencyLabel(s))+'</p><dl>'+
      amountPair('净资产',money(s,f.netWorth))+amountPair('上一年收入',row?money(s,row.income):familyPays(s,f)?'尚无工资':'尚无记录')+
      (row?amountPair('上一年支出',money(s,paidExpenses(row))):'')+
      '</dl><button type="button" data-action="finance" class="secondary">打开收支与资产</button></section>';
  }
  const eventId=(e,i)=>[e.age,e.title,e.text].join('|');
  function mapBox(s,year){
    const memoir=read(s),starred=new Set(memoir.stars||[]);
    const lived=LifeKeepsakes.livedYears(s);
    const anchors=new Set(s.memories.map(m=>Math.min(m.age,lived)));
    const dots=Array.from({length:Math.max(90,lived+1)},(_,a)=>a>lived?
      '<span class="unlived" aria-hidden="true"></span>':
      '<button type="button" data-desk-age="'+a+'" title="'+a+'岁" aria-label="查看'+a+'岁" aria-pressed="'+(year===a)+'" class="'+(anchors.has(a)?'milestone ':'')+(a===lived?'today':'')+'">'+a+'</button>').join('');
    const entries=LifeKeepsakes.visibleLog(s).filter(e=>(e.kind==='ending'?lived:e.age)===year).map((e,i)=>{
      const id=eventId(e,i),yes=starred.has(id);
      return '<li><button type="button" class="desk-star" data-desk-star="'+esc(id)+'" aria-label="'+(yes?'取消标星':'标记')+esc(e.title)+'" aria-pressed="'+yes+'">'+(yes?'★':'☆')+'</button><div><strong>'+esc(e.title)+'</strong><p>'+esc(moneyText(s,e.text))+'</p></div></li>';
    }).join('');
    const start=s.birthYear+year,end=s.ending&&year===lived?lastYear(s):start;
    return '<div class="desk-grid">'+dots+'</div><p class="desk-caption">每格一年，选中已度过的年龄可翻阅。紫色格记录重要时刻。</p><h3>'+year+'岁 · '+start+(end>start?'–'+end:'')+'年</h3><canvas data-desk-map-scene width="320" height="104" role="img"></canvas><ul class="desk-records">'+entries+'</ul>';
  }
  function notebook(s){
    const data=read(s),notes=(data.notes||[]).filter(n=>n.age<=s.age),stars=new Set(data.stars||[]);
    const selected=LifeKeepsakes.visibleLog(s).filter((e,i)=>stars.has(eventId(e,i)));
    return '<form class="desk-note"><label>'+(s.ended?'为这段人生留一句话':'给'+s.age+'岁的自己留一句话')+'<textarea maxlength="1200" rows="2" placeholder="你会怎样记住这一年？"></textarea></label><button type="submit">记下</button><span role="status"></span></form>'+
      notes.slice().reverse().map(n=>'<p class="desk-sub"><b>'+Math.min(n.age,LifeKeepsakes.livedYears(s))+'岁手记</b>　'+esc(n.text)+'</p>').join('')+
      selected.map(e=>'<p class="desk-sub"><b>★ '+(e.kind==='ending'?esc(endAge(s)):e.age+'岁')+'</b>　'+esc(e.title)+'</p>').join('');
  }
  function survival(s){
      const p=W.place(s.region,s.version===1?2026:s.birthYear);if(!p)return '';
    const historic=s.birthYear!==2026&&s.version===2;
    const pts=[[0,100],[1,p.infantMortality==null?null:100-p.infantMortality/10],[5,p.under5==null?null:100-p.under5/10],[65,p.survive65m],[65,p.survive65f],[60,p.survive60]];
    const cells=pts.map(([age,val],i)=>typeof val!=='number'?'':'<tr><th>'+age+'岁'+(i===3?'（男）':i===4?'（女）':'')+'</th><td><span class="percent"><i style="width:'+Math.min(100,Math.max(0,val))+'%"></i></span></td><td>'+val.toFixed(1)+'%</td></tr>').join('');
    return '<table class="desk-survival"><caption>'+esc(p.country)+' · 每百名新生儿存活至该年龄的估计比例</caption><tbody>'+cells+'</tbody></table><p class="desk-caption">'+(historic?'联合国世界人口展望，'+s.birthYear+'年'+(s.birthYear>=2024?'中位推算':'估计')+'。':'世界银行 WDI，2023年。')+'对应出生时的时期指标。<a href="./world-sources.html" target="_blank" rel="noopener noreferrer">数据与模型说明</a></p>';
  }
  const archiveKey='rensheng-shouji.lives.v2',legacyKey='rensheng-shouji.legacy-backup';
  let recentLives=[],cachedLegacy='';
  function getArchive(){
    try{const x=JSON.parse(localStorage.getItem(archiveKey)||'null');if(Array.isArray(x))return x;}catch{}
    return recentLives;
  }
  function archive(s){
    if(!s.ended)return;
    const id=[s.seed,s.region,s.birthYear,s.age,JSON.stringify(s.decisions)].join('/');
    const list=getArchive();if(list.some(x=>x.id===id))return;
    const record={id,name:s.name,region:W.place(s.region,s.birthYear)?.country||s.region,born:s.birthYear,age:s.age,ageLabel:endAge(s),lastYear:lastYear(s),
      career:s.job?.title||s.career,household:s.household,financialIdentity:financialIdentity(s),memories:s.memories.map(m=>({age:m.age,title:m.title,text:m.text}))};
    recentLives=[record,...list].slice(0,10);
    try{localStorage.setItem(archiveKey,JSON.stringify(recentLives));}catch{}
  }
  function backupLegacy(raw){
    if(typeof raw!=='string')return false;
    try{if(JSON.parse(raw)?.state?.version!==1)return false;cachedLegacy=raw;localStorage.setItem(legacyKey,raw);return true;}catch{return false;}
  }
  function mountHistory(el,actions={}){
    if(!el)return;
    let old=cachedLegacy;try{old=localStorage.getItem(legacyKey)||old;}catch{}
    const rows=getArchive();
    if(!rows.length&&!old){el.replaceChildren();return;}
    const restore=old?'<button type="button" class="secondary" data-old-save>恢复备份的旧版人生</button>':'';
    el.innerHTML=section('archive','过往人生',rows.map(r=>{
      const id=r.financialIdentity||{};
      return '<details><summary>'+esc(r.name)+' · '+esc(r.region)+' · '+esc(r.ageLabel||r.age+'岁')+'</summary><p>'+
        esc(r.born)+' — '+esc(r.lastYear??r.born+r.age)+'　'+esc(r.career)+'</p><p class="desk-caption">'+esc(currencyLabel(id))+'</p>'+
        r.memories.map((m,i)=>'<p class="desk-sub"><b>'+esc(i===r.memories.length-1&&r.ageLabel?r.ageLabel:m.age+'岁')+'　'+esc(m.title)+'</b>　'+esc(moneyText(id,m.text))+'</p>').join('')+'</details>';
    }).join('')+restore);
    el.querySelector('[data-old-save]')?.addEventListener('click',()=>actions.restoreLegacy?.(old));
  }
  function downloadCard(s){
    const canvas=document.createElement('canvas');canvas.width=960;canvas.height=1104;
    const c=canvas.getContext('2d');if(!c)return;
    const place=W.place(s.region,s.birthYear);
    function box(x,y,w,h,tone){c.fillStyle=tone;c.fillRect(x,y,w,h);}
    function label(text,x,y,font,color,maxWidth){
      c.fillStyle=color;c.font=font;c.fillText(text,x,y,maxWidth);
    }
    function paragraph(text,x,y,width){
      c.font='23px sans-serif';c.fillStyle='#cdcad6';
      const chars=Array.from(String(text??''));
      let row=0,buffer='';
      for(const ch of chars){
        if(c.measureText(buffer+ch).width>width){
          if(row===1){
            while(buffer&&c.measureText(buffer+'…').width>width)buffer=buffer.slice(0,-1);
            c.fillText(buffer+'…',x,y+32);return;
          }
          c.fillText(buffer,x,y);row++;buffer='';
        }
        buffer+=ch;
      }
      if(buffer)c.fillText(buffer,x,y+row*32);
    }
    function star(x,y,tone){
      box(x-3,y,7,1,tone);box(x,y-3,1,7,tone);box(x-1,y-1,3,3,tone);
    }
    box(0,0,960,1104,'#17172b');box(0,0,960,208,'#202037');
    for(let i=0;i<56;i++){
      const x=385+hash(s,3100+i)%535,y=14+hash(s,3200+i)%149;
      if(i%11===0)star(x,y,'#a598ac');else box(x,y,2,2,'#675d7b');
    }
    star(51,55,'#efbc82');label('忽然而已',72,63,'bold 25px sans-serif','#ffe1a5',200);
    label('人生纪念卡',739,62,'24px sans-serif','#c2b4c8',172);
    label(s.name,44,139,'bold 59px serif','#fff1d7',859);
    label([place?.label||place?.country||s.region,s.birthYear+' — '+lastYear(s),endAge(s)].join('　·　'),
      48,181,'24px sans-serif','#e2c1a6',863);
    const scene=document.createElement('canvas');scene.width=320;scene.height=104;
    const picturedAge=s.ending?Math.min(s.age,s.ending.years):s.age;
    drawMapScene(scene,s,picturedAge);
    c.imageSmoothingEnabled=false;c.drawImage(scene,0,208,960,312);
    box(0,206,960,2,'#9b7684');box(0,520,960,3,'#b48b78');

    const memories=(s.memories||[]).filter(m=>m.age>0&&m.age<s.age);
    const pool=memories.length?memories:(s.log||[]).filter(m=>m.kind==='birth'||m.kind==='ending');
    const personal=globalThis.LifeKeepsakes.cardEntries(s);
    const selection=personal.length?personal:[...new Set([pool[0],pool[Math.floor(pool.length/2)],pool.at(-1)])].filter(Boolean);
    label('记忆里的时刻',47,576,'bold 29px serif','#f2dfc6',715);
    const step=143,top=636;
    if(selection.length>1)box(60,top-12,2,(selection.length-1)*step,'#725567');
    selection.forEach((m,i)=>{
      const y=top+i*step;
      box(54,y-16,14,14,'#302638');box(57,y-13,8,8,'#dca46c');
      label(m.kind==='ending'?endAge(s):m.age===0?'出生那年':m.age+'岁',86,y,'bold 22px sans-serif','#e6af80',95);
      label(m.title,183,y,'bold 28px serif','#f5e8d9',725);
      paragraph(moneyText(s,m.text),183,y+39,713);
    });
    box(48,1044,864,1,'#5b4c62');
    label('忽然而已　·　'+(place?.country||s.region),48,1080,'20px sans-serif','#b5a6b7',645);
    star(904,1070,'#dba778');
    canvas.toBlob(blob=>{
      if(!blob)return;
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='忽然而已-'+s.name+'.png';a.click();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
    },'image/png');
  }
  function mount(el,s,actions={}){
    if(!el||!s)return;
    if(wallet?.open&&walletState&&key(s)!==key(walletState))closeFinance();
    walletState=s;walletDate=actions.date;walletActions=actions;
    if(wallet?.open)paintWallet();
    if(s.ended)archive(s);
    const k=key(s);let config=panels.get(k);if(!config){config={open:new Set(['family','peers']),year:null};panels.set(k,config);}
    const draw=()=>{
      const lived=LifeKeepsakes.livedYears(s),y=Math.min(lived,config.year??lived);
      const sections=[['family','家人与生活',()=>familyBox(s)],['peers','与你同一刻出生的人',()=>peerBox(s)],['map','人生地图',()=>mapBox(s,y)],['journal','我的手记与收藏',()=>notebook(s)],['survival','出生地的存活数据',()=>survival(s)]];
      el.innerHTML=(s.ended?'<button type="button" class="secondary" data-card-save>保存人生纪念卡</button>':'')+sections.map(([id,title,body])=>section(id,title,config.open.has(id)?body():'',config.open.has(id))).join('');
      const paintMap=()=>{
        const canvas=el.querySelector('[data-desk-map-scene]');
        if(canvas)drawMapScene(canvas,s,y);
      };
      paintMap();
      for(const [id,,body] of sections){
        const details=el.querySelector('[data-section="'+id+'"]');
        details.addEventListener('toggle',()=>{
          if(details.open){config.open.add(id);const dest=details.querySelector('.desk-body');if(!dest.innerHTML){dest.innerHTML=body();if(id==='map')paintMap();}}
          else config.open.delete(id);
        });
      }
    };
    draw();
    el.onclick=e=>{
      const target=e.target.closest('button');if(!target||!el.contains(target))return;
      if(target.hasAttribute('data-card-save')){downloadCard(s);return;}
      if(target.dataset.deskAge!==undefined){config.year=Number(target.dataset.deskAge);draw();el.querySelector('[data-desk-age="'+config.year+'"]')?.focus({preventScroll:true});}
      if(target.dataset.deskStar!==undefined){const id=target.dataset.deskStar;write(s,d=>{const a=new Set(d.stars||[]);if(a.has(id))a.delete(id);else a.add(id);d.stars=[...a]});draw();}
    };
    el.onsubmit=e=>{
      if(!e.target.matches('.desk-note'))return;e.preventDefault();const text=e.target.querySelector('textarea').value.trim();if(!text)return;
      const persisted=writeNote(s,text);draw();const status=el.querySelector('.desk-note [role="status"]');if(status)status.textContent=persisted?'已记下':'已记在当前窗口';
    };
  }
  // Each backdrop combines a local landscape motif with a fictional neighbourhood.
  // Chengdu plain, Lyon hills, Bali terraces, Carioca mountain silhouettes: UNESCO WHC 1001, 872, 1194, 1100.
  // River and field layouts: FAO, Nile Valley, Indus basin and Bangladesh floodplain; urban ferry landings: LASWA.
  const landforms = {
    CHN: {ridge:[53,47,36,43,34,45,49,43,48,52], roof:'eave', bank:'canal', wall:'#8b647b'},
    FRA: {ridge:[39,34,39,49,55,53,45,34,37,43], roof:'chimney', bank:'arches', wall:'#aa7889'},
    EGY: {ridge:[50,48,46,46,42,43,48,49,49,50], roof:'terrace', bank:'sail', wall:'#b48570'},
    IND: {ridge:[51,50,50,51,50,47,50,51,49,51], roof:'terrace', bank:'canal', wall:'#a07383'},
    IDN: {ridge:[49,46,38,24,27,38,46,43,36,45], roof:'gable', bank:'terraces', wall:'#816a86'},
    NGA: {ridge:[51,52,51,51,50,50,52,50,51,50], roof:'hip', bank:'landing', wall:'#966c75'},
    BRA: {ridge:[42,48,44,35,33,42,45,24,32,45], roof:'tile', bank:'slope', wall:'#b0767c'},
    PAK: {ridge:[48,46,49,47,48,45,46,50,48,49], roof:'parapet', bank:'canal', wall:'#a96e70'},
    BGD: {ridge:[53,53,52,53,52,51,52,53,53,52], roof:'gable', bank:'boat', wall:'#8c7383'},
    JPN: {ridge:[47,43,41,44,48,50,52,53,53,53], roof:'tile', bank:'canal', wall:'#887b87'},
    DEU: {ridge:[47,48,46,45,47,44,44,46,47,47], roof:'gable', bank:'lane', wall:'#9b717a'},
    MEX: {ridge:[49,46,42,39,43,40,36,39,44,48], roof:'terrace', bank:'lane', wall:'#aa786e'},
    other: {ridge:[47,43,47,49,44,41,48,46,47,50], roof:'hip', bank:'lane', wall:'#967487'}
  };
  const dusk = {ink:'#14162b', outline:'#242039', near:'#33263f', distant:'#65527b',
    leaf:'#263843', leafLight:'#3e5960', trim:'#b17b83', gold:'#e4a16d', light:'#ffdc97'};

  // All scenery is drawn on a 320 × 104 integer grid. Larger exports scale this finished raster.
  function pixelBrush(ctx){
    function rect(x,y,w,h,color){
      ctx.fillStyle=color;
      ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));
    }
    function line(x1,y1,x2,y2,color){
      x1=Math.round(x1); y1=Math.round(y1); x2=Math.round(x2); y2=Math.round(y2);
      const dx=Math.abs(x2-x1),dy=-Math.abs(y2-y1),sx=x1<x2?1:-1,sy=y1<y2?1:-1;
      let err=dx+dy;
      for(;;){
        rect(x1,y1,1,1,color);
        if(x1===x2&&y1===y2)break;
        const twice=2*err;
        if(twice>=dy){err+=dy;x1+=sx;}
        if(twice<=dx){err+=dx;y1+=sy;}
      }
    }
    function ellipse(cx,cy,rx,ry,color){
      for(let row=-ry;row<=ry;row++){
        const half=Math.round(rx*Math.sqrt(Math.max(0,1-row*row/(ry*ry))));
        rect(cx-half,cy+row,half*2+1,1,color);
      }
    }
    function polygon(points,color){
      const ys=points.map(p=>p[1]);
      for(let y=Math.min(...ys);y<Math.max(...ys);y++){
        const edges=[];
        for(let i=0;i<points.length;i++){
          const [x1,y1]=points[i],[x2,y2]=points[(i+1)%points.length], scan=y+.5;
          if((y1<=scan&&scan<y2)||(y2<=scan&&scan<y1))edges.push(x1+(scan-y1)*(x2-x1)/(y2-y1));
        }
        edges.sort((a,b)=>a-b);
        for(let i=1;i<edges.length;i+=2)rect(Math.ceil(edges[i-1]),y,Math.ceil(edges[i])-Math.ceil(edges[i-1]),1,color);
      }
    }
    return {rect,line,ellipse,polygon};
  }

  function paintSky(b,rand,age){
    const {rect,ellipse}=b;
    const colors=['#10142e','#171c40','#23234f','#342957','#4c3268','#6b3d75','#8d4a7f','#ad5786','#d07089'];
    const stops=[0,9,18,25,32,39,45,51,58,74];
    for(let j=0;j<colors.length;j++){
      rect(0,stops[j],320,stops[j+1]-stops[j],colors[j]);
      if(j>0)for(let x=(j%2)*2;x<320;x+=4)rect(x,stops[j],1,1,colors[j-1]);
    }
    const mx=144+rand(201,109),my=10+rand(202,9);
    for(let i=0;i<110;i++){
      const x=rand(2100+i,320),y=rand(2400+i,51);
      if(Math.hypot(x-mx,y-my)<12)continue;
      const tone=['#7875a7','#aba9c8','#b8c8da','#f3cda0'][rand(2600+i,4)];
      rect(x,y,1,1,tone);
      if(i%23===0&&y<35){rect(x-1,y,3,1,'#c6b7af');rect(x,y-1,1,3,'#dabfb0');rect(x,y,1,1,'#ffe0ad');}
    }
    const phase=rand(290,4), skyUnder=colors[stops.findIndex(y=>y>my)-1];
    ellipse(mx,my,6,6,'#d9a27e');ellipse(mx-1,my-1,5,5,'#ffe1a3');
    if(phase!==0)ellipse(mx+2+phase,my-2,5,5,skyUnder);
    else{rect(mx-3,my,3,1,'#eabe91');rect(mx+1,my+2,2,2,'#eabe91');}
    for(let i=0;i<8;i++){
      const x=rand(310+i+Math.floor(age/8),320)-10,y=20+rand(325+i,28),w=14+rand(340+i,30);
      rect(x,y,w,1,'#76517f');rect(x+4,y-1,Math.max(2,w-14),1,'#65477a');
      if(i%2===0)rect(x+w-7,y+2,13,1,'#aa6a90');
    }
  }

  function ridge(b,profile,rand){
    const peaks=profile.map((v,i)=>v+rand(411+i,5)-2),points=[];
    for(let x=0;x<=320;x+=4){
      const u=x*(peaks.length-1)/320,i=Math.min(peaks.length-2,Math.floor(u)),f=u-i;
      const ease=f*f*(3-2*f);
      points.push([x,Math.round(peaks[i]+(peaks[i+1]-peaks[i])*ease)]);
    }
    const silhouette=(pts,color)=>b.polygon([...pts,[320,64],[0,64]],color);
    silhouette(points.map(([x,y])=>[x,y-2]), '#b47a9a');
    silhouette(points,'#6c4c7f');
    silhouette(points.map(([x,y])=>[x,Math.min(57,y+6+Math.round(2*Math.sin(x*.07)))]),'#433758');
  }

  function tree(b,x,y,height,id,rand,foreground=false){
    const {rect,line,ellipse}=b,wide=Math.max(4,Math.floor(height*.38)),cy=y-Math.round(height*.72);
    const trunk=foreground?'#13182c':'#352a45', shadow=foreground?'#182736':'#25404b';
    rect(x-1,cy,foreground?4:2,y-cy,trunk);line(x,cy+7,x-wide+1,cy-1,trunk);
    line(x+1,cy+4,x+wide-1,cy-5,trunk);
    for(let i=0;i<7;i++){
      const dx=(i-3)*Math.floor(wide/3),dy=Math.floor(Math.abs(i-3)*1.2)-rand(483+id+i,3);
      const rx=Math.max(3,Math.round(wide*.57)),ry=Math.max(3,Math.round(wide*.5));
      ellipse(x+dx,cy+dy,rx,ry,shadow);
      ellipse(x+dx-1,cy+dy-2,Math.max(2,rx-1),Math.max(2,ry-2),foreground?'#2a464b':'#415d60');
      for(let j=0;j<3;j++)rect(x+dx-rx+1+rand(534+id+i*4+j,rx+1),cy+dy-ry+j,2,1,foreground?'#547276':'#7b8d85');
    }
    rect(x-1,cy+6,1,Math.max(2,y-cy-5),'#70545a');
  }

  function roof(b,x,y,w,kind,near){
    const {rect,line,polygon}=b,edge=near?'#c48791':'#987394',tile=near?'#4e3452':'#563e61';
    if(['terrace','parapet'].includes(kind)){
      rect(x-1,y-3,w+2,3,tile);rect(x-1,y-3,w+2,1,edge);
      rect(x+3,y-5,2,3,tile);rect(x+w-4,y-5,2,3,tile);
      if(kind==='parapet')for(let p=4;p<w-3;p+=7)rect(x+p,y-3,3,1,'#4a394f');
    }else{
      const rise=near?9:5, inset=kind==='gable'?Math.floor(w*.5):Math.floor(w*.24);
      polygon([[x-3,y],[x+inset,y-rise],[x+w-inset,y-rise],[x+w+4,y+1],[x+w+4,y+3],[x-3,y+3]],tile);
      line(x+inset,y-rise,x+w-inset,y-rise,edge);line(x+w-inset,y-rise,x+w+3,y,edge);
      if(kind==='eave'){rect(x-5,y-1,5,2,tile);rect(x+w+1,y-1,5,2,tile);rect(x+inset-1,y-rise-1,3,1,edge);}
      if(kind==='chimney'){rect(x+w-10,y-rise-3,3,7,tile);rect(x+w-11,y-rise-4,5,1,edge);}
      if(near){
        const rib=kind==='gable'?'#775d7a':'#885e74';
        for(let t=8;t<w-3;t+=kind==='tile'?4:6)line(x+t,y-4,x+t-3,y,rib);
        if(kind==='tile'||kind==='eave')for(let p=x+1;p<x+w;p+=3)rect(p,y+1,2,1,'#a46d79');
      }
    }
    rect(x-2,y+2,w+4,2,'#25223b');
  }

  function building(b,x,ground,w,h,kind,id,rand,wall,near=false){
    const {rect,line}=b,y=ground-h;
    rect(x,y,w,h,near?wall:['#755d80','#695376','#775775'][rand(661+id,3)]);
    rect(x+w-5,y,5,h,near?'#503955':'#473c5f');
    if(near){
      rect(x+1,y+3,2,h-3,'#926d79');rect(x,y+h-3,w,3,'#4d3b50');
      for(let i=0;i<17;i++)rect(x+2+rand(689+i,w-5),y+5+rand(710+i,h-8),2,1,'#896b79');
    }
    const step=near?12:6,windowW=near?7:3,windowH=near?8:3;
    let n=0;
    for(let wy=y+6;wy+windowH<ground-(near?11:1);wy+=near?11:6){
      for(let wx=x+3;wx+windowW<x+w-4;wx+=step){
        const lit=rand(701+id*37+n++,5)>1;
        rect(wx-1,wy-1,windowW+2,windowH+2,near?'#332b46':'#493a59');
        rect(wx,wy,windowW,windowH,lit?(rand(756+n+id,3)?'#eaac67':'#ffd185'):'#313552');
        if(near&&lit){
          rect(wx+1,wy,2,windowH-1,'#ffe3a2');rect(wx+3,wy,1,windowH,'#8d645e');
          rect(wx,wy+3,windowW,1,'#896269');rect(wx-2,wy+windowH,windowW+4,1,'#4a3b4d');
        }
      }
    }
    if(near){
      const door=x+Math.floor(w*.62);
      rect(door-2,ground-14,12,14,'#473649');rect(door,ground-13,8,13,'#bd724b');
      rect(door+1,ground-12,5,12,'#ffd47d');rect(door+5,ground-12,2,11,'#75515b');
      rect(door-4,ground,15,1,'#e4aa81');rect(door-6,ground+1,20,1,'#bd8a76');
      for(let i=0;i<3;i++){rect(x+4+i*5,ground-7,3,5,'#655365');rect(x+5+i*5,ground-6,1,3,'#ab8084');}
      if(['terrace','parapet'].includes(kind)){
        rect(x+6,y-7,15,5,'#796477');rect(x+5,y-8,17,1,'#c4978c');
        line(x+24,y-6,x+32,y-3,'#4a394e');line(x+32,y-3,x+w-6,y-6,'#4a394e');
        rect(x+28,y-4,3,4,'#cea087');rect(x+35,y-3,4,3,'#788d91');
      }
    }
    roof(b,x,y,w,kind,near);
  }

  function drawBank(b,style,urban,rand){
    const {rect,line,polygon,ellipse}=b;
    const water=urban?!['slope','lane','terraces'].includes(style):['arches','boat','sail','landing'].includes(style);
    rect(0,64,320,15,water?'#3d416c':'#2b4a4c');
    if(water){
      rect(0,65,320,2,'#7b6784');rect(0,72,320,3,'#323d63');
      for(let i=0;i<54;i++){
        const x=rand(1100+i,320),y=67+rand(1180+i,9);
        rect(x,y,2+rand(1240+i,7),1,['#66668e','#a280a5','#548589','#c48c87'][i%4]);
      }
      for(let i=0;i<6;i++){
        const x=85+rand(1295+i,191),y=67+rand(1280+i,3);
        rect(x,y,2,1,'#f3bc86');rect(x-1,y+2,4,1,'#c98f80');rect(x+2,y+4,2,1,'#928598');
      }
    }else{
      for(let row=0;row<4;row++){
        const y=64+row*3,styleStep=style==='terraces'?5:2;
        for(let i=0;i<7;i++){
          const x=i*52-row*14;line(x,y,x+43,y-styleStep,'#5d827d');
          if(!urban)line(x+10,y+1,x+39,y-styleStep+2,'#416561');
        }
      }
    }
    if(style==='arches'&&urban){
      for(let i=0;i<6;i++){
        const x=133+i*15;
        rect(x,59,15,6,'#524055');rect(x,63,3,5,'#51415a');rect(x+2,65,2,2,'#6f5567');
        rect(x+5,63,7,2,'#8b7182');rect(x+6,62,5,1,'#8b7182');
      }
      rect(132,58,92,1,'#d29b88');rect(134,56,88,1,'#87677c');
      for(let x=135;x<224;x+=6)rect(x,56,1,2,'#865f73');
    }else if(['boat','landing','sail'].includes(style)){
      const x=176+rand(1320,48);
      polygon([[x-3,69],[x+24,69],[x+19,73],[x+2,72]],'#352c44');
      rect(x,69,21,1,'#b88980');
      if(style==='sail'){
        line(x+11,69,x+13,52,'#42364e');
        polygon([[x+12,53],[x+11,67],[x-1,67]],'#e5bb9d');
        line(x+11,66,x+1,67,'#a78287');
      }else{
        rect(x+4,66,11,3,'#7b6979');rect(x+5,65,9,1,'#c09687');rect(x+7,67,3,2,'#e5b384');
      }
      if(style==='landing'){rect(109,65,36,2,'#48354c');for(let j=0;j<4;j++)rect(112+8*j,67,2,5,'#4b4058');}
    }else if(style==='canal'){
      polygon([[210,63],[219,63],[190,69],[212,71],[192,76],[161,76],[196,71],[173,69]],'#90a0a0');
    }
  }

  function familyAt(s,year){
    if(year===s.age)return s;
    const choices=(s.actions||[]).filter(a=>a.type==='choose'&&a.age<=year);
    const chose=(age,id)=>choices.some(a=>a.age===age&&a.id===id);
    let partnerStatus='none';
    if(chose(25,'partner')){
      partnerStatus=chose(34,'separate')?'separated':'together';
      if(partnerStatus==='together'&&Number.isFinite(s.partnerEndAge)&&year>=s.partnerEndAge)partnerStatus='widowed';
    }
    return {...s,age:year,ended:false,ending:null,partnerStatus,childCount:chose(28,'parent')?1:0,
      decisions:{relationship:partnerStatus==='none'?undefined:'partner',household:chose(28,'alone')?'alone':undefined}};
  }

  function figure(b,x,y,person,rand){
    const {rect,line}=b, id=person.slot,age=person.age;
    const adult=age>=15,elder=age>=67,h=age<3?8:age<7?11:age<12?14:adult?(elder?18:20):17;
    const head=adult?5:4,top=y-h,skin=['#e1ad8b','#bc886f','#cd9879','#af7863'][rand(1560+id,4)];
    const coat=person.role==='本人'?'#d4a264':['#649294','#b17786','#726e99','#a5856f','#81a29a'][rand(1600+id,5)];
    const hair=elder?'#b4a9a4':['#3c2c3a','#55404a','#392d3d'][rand(1590+id,3)];
    const legs=adult?6:Math.max(2,Math.floor(h/4)),torso=Math.max(3,h-head-legs);
    rect(x-1,y-1,9,1,'#483648');
    rect(x+1,top,head,head,hair);rect(x+2,top+1,head-1,head-1,skin);
    rect(x+1,top,head,1,hair);rect(x+head+1,top+2,1,1,skin);
    rect(x+1,top+1,2,1,hair);rect(x+head,top+2,1,1,'#594452');
    if(adult){rect(x+2,top+head,head-2,1,skin);rect(x+2,top+head+1,2,1,'#d5a18f');}
    rect(x+2,top+head,3,1,skin);rect(x+1,top+head+1,head,torso,dusk.outline);
    rect(x,top+head+1,head+2,torso-1,coat);rect(x+1,top+head+1,1,torso-1,'#edba92');
    rect(x+head+1,top+head+3,1,Math.max(1,torso-3),'#765966');rect(x+head+1,top+head+torso-1,1,2,skin);
    rect(x+1,y-legs,2,legs-1,'#3d4052');rect(x+head-1,y-legs,2,legs-1,'#34384a');
    rect(x+1,y-1,3,1,'#201f30');rect(x+head-1,y-1,3,1,'#201f30');
    if(age>=4&&age<=14){rect(x-2,top+head+2,3,4,'#8e6471');rect(x-2,top+head+2,2,1,'#d6a286');}
    if(person.bundle){
      line(x+3,top+head+3,x+7,top+head+6,skin);
      rect(x+5,top+head+3,6,4,'#8e7588');rect(x+5,top+head+3,5,3,'#eed1ac');
      rect(x+5,top+head+2,3,2,'#c19079');rect(x+8,top+head+5,4,2,'#baa0a4');
    }
  }

  function walkResidents(b,s,rand){
    const relatives=globalThis.LifeFamily.members(s).filter(p=>p.living&&p.role!=='分居伴侣');
    const roles=['本人','母亲','父亲','祖辈','年长的手足','年幼的手足','伴侣','孩子'];
    // In adulthood show the people explicitly recorded as part of this family.
    const close=relatives.filter(p=>s.age<25||p.role==='伴侣'||p.role==='孩子');
    const group=[{age:s.age,role:'本人'},...close].map(p=>({...p,slot:roles.indexOf(p.role)}));
    for(const infant of [...group]){
      if(infant.age>=2)continue;
      const holder=group.find(other=>other.age>=16&&!other.bundle);
      if(holder){holder.bundle=true;group.splice(group.indexOf(infant),1);}
    }
    const start=157-Math.floor(group.length*6);
    group.forEach((p,i)=>figure(b,start+15*i+rand(1640+p.slot,3),95+rand(1660+p.slot,2),p,rand));
    return [...new Set(['本人',...close.map(p=>p.role)])];
  }

  function facade(b,iso,x,y,w,h,urban){
    const {rect,line,polygon}=b, top=y-h;
    function awning(ax,ay,aw,base,stripe){
      polygon([[ax+3,ay-4],[ax+aw-1,ay-4],[ax+aw+3,ay+1],[ax,ay+1]],base);
      for(let j=3;j<aw-1;j+=5){
        line(ax+j+1,ay-4,ax+j-1,ay,stripe);rect(ax+j-1,ay+1,3,1,stripe);
      }
      rect(ax-1,ay,aw+4,1,'#b48177');rect(ax+1,ay+2,1,6,'#39293e');rect(ax+aw,ay+2,1,6,'#39293e');
    }
    function planter(px,py){
      rect(px,py,7,2,'#b07767');rect(px+1,py+2,5,2,'#614357');
      for(let j=0;j<4;j++){rect(px+j*2-1,py-2-j%2,2,3,'#537d72');if(j%2===0)rect(px+j*2,py-3,1,1,'#e7aa90');}
    }
    if(iso==='CHN'){
      // The warm open bay and side counter face the street like a neighbourhood teahouse.
      rect(x+3,y-14,23,12,'#413047');rect(x+5,y-12,18,7,'#db965d');
      for(let j=0;j<4;j++)rect(x+6+j*5,y-11,2,5,j%2?'#ffe495':'#f6c178');
      rect(x+2,y-6,25,2,'#73475a');rect(x+3,y-5,24,1,'#e2aa75');
      rect(x+2,top+2,1,7,'#593348');rect(x,top+8,5,4,'#f2aa6d');rect(x+1,top+8,2,4,'#ffe6a1');
      rect(x+2,top+12,1,2,'#b87c61');
    }else if(iso==='FRA'){
      awning(x+1,y-12,23,'#945c75','#dfac8d');
      for(let j=0;j<3;j++){rect(x+3+j*7,y-10,4,3,'#eeb779');rect(x+4+j*7,y-10,1,3,'#ffdc99');}
      planter(x+5,top+15);
      rect(x+w-12,top+7,3,7,'#526879');rect(x+w-4,top+7,2,7,'#526879');
    }else if(iso==='EGY'){
      // A shaded balcony and its screen give the flat facade a deep second plane.
      rect(x-1,top+4,w-10,11,'#654558');
      for(let j=3;j<w-13;j+=7){
        rect(x+j,top+5,4,7,'#e0a269');rect(x+j+1,top+6,2,5,'#ffdb83');
        rect(x+j-1,top+5,1,8,'#aa765d');
      }
      rect(x-2,top+12,w-7,2,'#b57663');
      for(let j=0;j<w-8;j+=4)rect(x+j,top+10,1,4,'#6f4555');
      rect(x-2,top+14,w-7,2,'#4c334c');planter(x+w-10,y-2);
    }else if(iso==='IND'){
      awning(x+2,y-11,20,'#915b6a','#dfa359');rect(x+4,y-6,16,3,'#755064');
      for(let j=0;j<4;j++)rect(x+5+j*4,y-8,3,2,['#dbac63','#b26e66','#84895e','#e7ae76'][j]);
      const cordY=top+5;line(x+w-17,cordY,x+w-3,cordY+2,'#463447');
      rect(x+w-14,cordY+1,4,4,'#9e7990');rect(x+w-9,cordY+2,3,4,'#689592');
    }else if(iso==='IDN'){
      rect(x+1,y-13,26,10,'#4c3f56');line(x,y-14,x+28,y-13,'#b28c80');
      for(let j=1;j<5;j++){
        const sx=x+j*5;
        rect(sx,y-12,4,6+j%2,'#708988');rect(sx+1,y-10,2,1,'#d5bd92');rect(sx+2,y-7,1,1,'#b89688');
      }
      rect(x,y-3,28,1,'#a57d72');planter(x+w+1,y);
    }else if(iso==='NGA'){
      awning(x-2,y-11,24,'#4c7779','#76aaaa');
      rect(x+1,y-5,21,4,'#694853');
      for(let j=0;j<4;j++)rect(x+3+j*5,y-7,3,2,j%2?'#f2ac62':'#bb8064');
      rect(x+w-9,top+5,4,8,'#4b636d');rect(x+w-8,top+7,2,1,'#87a7a7');
    }else if(iso==='BRA'){
      rect(x-1,y-15,29,2,'#d39c85');rect(x-1,y-13,29,1,'#67485a');
      rect(x+1,y-12,2,12,'#ac7c78');rect(x+24,y-12,2,12,'#866071');
      planter(x+7,y-5);planter(x+15,y-6);
      for(let j=1;j<=3;j++)rect(x+3+j*5,top+7,2,7,'#5a7780');
    }else if(iso==='PAK'){
      rect(x,y-14,25,12,'#493545');
      for(let j=0;j<3;j++){
        const ax=x+2+j*8;
        rect(ax,y-12,5,9,'#d59269');rect(ax+1,y-13,3,10,'#efb774');rect(ax+1,y-11,2,6,'#ffe2a1');
      }
      rect(x-2,y-15,29,2,'#805060');
      for(let j=0;j<8;j++)rect(x+2+j*3,top+4,1,1,'#d79e83');
    }else if(iso==='BGD'){
      rect(x+2,y-13,22,10,'#504154');rect(x+3,y-11,18,7,'#9f897e');
      for(let j=0;j<9;j++)rect(x+4+j*2,y-11,1,8,j%3?'#c79c83':'#638f91');
      rect(x+1,y-4,23,2,'#4b354b');line(x+2,y-13,x+22,y-13,'#e3b482');
      if(urban)planter(x+w+2,y);
    }
    if(!urban){
      rect(x+w+4,y-3,7,4,'#5c4a53');rect(x+w+4,y-3,7,1,'#c89a73');
      rect(x+w+11,y-2,6,3,'#6f535b');rect(x+w+11,y-2,6,1,'#b9886c');
    }
  }

  function foreground(b,iso,style,urban,rand){
    const {rect,line,polygon,ellipse}=b;
    polygon([[0,74],[70,72],[103,77],[155,80],[218,76],[320,69],[320,104],[0,104]],'#25384a');
    if(urban){
      polygon([[0,89],[93,81],[176,85],[320,75],[320,104],[0,104]],'#534153');
      for(let i=0;i<62;i++){
        const x=rand(1700+i,320),y=85+rand(1790+i,19);
        rect(x,y,2+rand(1850+i,11),1,i%3?'#70566c':'#382e47');
      }
      for(let j=0;j<4;j++){
        const x=j*63+32;
        line(x,96,x+15,96,'#524354');line(x+15,96,x+19,94,'#524354');
      }
    }else{
      polygon([[0,85],[76,79],[145,84],[226,81],[320,74],[320,79],[235,86],[200,91],[155,93],[79,101],[58,104],[0,104]],'#664855');
      polygon([[0,91],[70,83],[138,86],[169,86],[111,90],[45,99],[0,100]],'#886272');
      for(let i=0;i<68;i++){
        const x=rand(1900+i,320),y=87+rand(1980+i,18);
        rect(x,y,2,1,i%3?'#465b60':'#73575f');
      }
    }

    const faceWidth=urban?45+rand(820,12):38+rand(820,12);
    const fx=5+rand(821,22),height=urban?30+rand(822,6):21+rand(822,3);
    building(b,fx,85,faceWidth,height,style.roof,70,rand,style.wall,true);
    const door=fx+Math.floor(faceWidth*.62);
    polygon([[door-2,87],[door+9,87],[door+24,92],[door+20,93],[door+7,92]],'#bf8966');
    // The edge of the image belongs to a lived-in street or garden: baskets, plants, shutters.
    rect(fx+faceWidth+5,80,8,5,'#815a62');rect(fx+faceWidth+4,79,10,2,'#c18a71');
    for(let j=0;j<4;j++)line(fx+faceWidth+8,79,fx+faceWidth+4+j*3,75-j%2,'#69837d');
    facade(b,iso,fx,85,faceWidth,height,urban);
    // A quiet bench and lamplight occupy the near bank; keep the centre readable for the figures.
    const benchX=205+rand(2021,14);
    rect(benchX,85,16,2,'#bf8c7e');rect(benchX,89,17,2,'#684d5b');
    for(const dx of [2,13]){rect(benchX+dx,86,1,4,'#534554');rect(benchX+dx,91,2,3,dusk.outline);}
    if(urban){
      const lx=benchX+24;
      rect(lx,63,2,25,'#373044');rect(lx-1,87,4,2,'#4c3d4c');
      rect(lx-3,61,8,1,'#9c767a');rect(lx-2,62,6,4,'#d99d70');rect(lx-1,62,4,3,'#ffe3aa');
      rect(lx-3,66,8,1,'#705468');rect(lx,60,2,1,'#c09788');
    }else{
      for(let i=0;i<8;i++){
        const x=85+i*11,y=79+Math.round(Math.sin(i*.65)*1.6);
        rect(x,y-4,2,7,'#544553');line(x,y-2,x+11,y-1,'#96747a');
      }
    }
    tree(b,289+rand(2065,23),92,35+rand(2066,8),92,rand,true);
    for(let i=0;i<12;i++){
      const x=i<7?260+i*11:i*9-95,y=99+rand(2080+i,7);
      ellipse(x,y,8+rand(2110+i,7),3+rand(2140+i,4),'#141e31');
      line(x-3,y-3,x-6,y-7,'#345254');line(x-2,y-1,x+2,y-7,'#294648');
      if(i%3===1)rect(x+2,y-7,2,1,'#c19983');
    }
  }

  function overhangingLeaves(b,rand){
    const {rect,line,ellipse}=b,flip=rand(2206,2)===1;
    const x=n=>flip?320-n:n;
    const reach=29+rand(2207,27);
    line(x(0),9,x(reach),1,'#1c192c');line(x(0),8,x(reach-8),2,'#1a192e');
    line(x(5),11,x(21),3,'#342941');line(x(17),5,x(29),9,'#30283e');
    for(let i=0;i<17;i++){
      const dx=rand(2230+i,reach),y=rand(2250+i,7)-1+Math.round((1-dx/reach)*5);
      ellipse(x(dx),y,3+rand(2270+i,5),2+rand(2290+i,3),'#171b30');
      rect(x(dx),y+2,3,1,i%3===0?'#494052':'#323346');
      if(i%3===0){line(x(dx),y+2,x(dx-1),y+5,'#303044');rect(x(dx-2),y+5,2,1,'#625368');}
    }
  }

  function drawScene(canvas,s){
    if(!canvas||!s||canvas.width<1||canvas.height<1)return;
    const c=canvas.getContext('2d');if(!c)return;
    const surface=canvas.width===320&&canvas.height===104?canvas:document.createElement('canvas');
    if(surface!==canvas){surface.width=320;surface.height=104;}
    const b=pixelBrush(surface.getContext('2d'));
    const place=W.place(s.region,s.birthYear),iso=place?.iso||s.region,style=landforms[iso]||landforms.other;
    const locationKey=Array.from(iso||'').reduce((acc,letter)=>acc*31+letter.charCodeAt(0),0);
    const sceneSeed=W.hash(s.seed,locationKey);
    const rand=(salt,m)=>W.hash(sceneSeed,salt)%m;
    const urban=s.residence?s.residence==='urban':rand(235,3)!==0;
    const tamil=iso==='IND'&&W.storySetting?.(s)?.id==='tamil';
    const profile=tamil?[46,44,40,42,47,52,48,42,44,49]:style.ridge;
    paintSky(b,rand,s.age);ridge(b,profile,rand);
    if(urban){
      // A second, cooler row sets off the warm windows in the nearest streets.
      const modern=(s.birthYear+s.age>=1960)&&['EGY','BRA','NGA','IND','BGD'].includes(iso);
      for(let i=0;i<26;i++){
        const x=i*13-5+rand(850+i,4),h=4+rand(890+i,12)+(modern&&i%5===0?6+rand(900+i,9):0);
        b.rect(x,61-h,9+rand(940+i,7),h,'#4d4067');
        if(i%3===0)for(let j=2;j<h-2;j+=4){b.rect(x+3,61-h+j,2,1,'#d3a586');b.rect(x+7,61-h+j,1,1,'#8a88a2');}
      }
      let x=-5,id=0;
      while(x<320){
        const width=11+rand(980+id,14),h=7+rand(1020+id,13);
        building(b,x,64,width,h,style.roof,id,rand,style.wall);
        x+=width+rand(1045+id,5);id++;
      }
    }else{
      b.rect(0,58,320,9,'#3b425b');
      for(let i=0;i<14;i++)tree(b,i*25+rand(920+i,12),65,6+rand(941+i,5),i*8,rand);
      for(let i=0;i<5;i++)building(b,12+i*69+rand(971+i,14),66,11+rand(981+i,8),8+rand(991+i,4),style.roof,i,rand,style.wall);
    }
    drawBank(b,style.bank,urban,rand);
    foreground(b,iso,style,urban,rand);
    const present=walkResidents(b,s,rand);
    overhangingLeaves(b,rand);
    if(surface!==canvas){
      c.save();c.imageSmoothingEnabled=false;c.drawImage(surface,0,0,canvas.width,canvas.height);c.restore();
    }
    canvas.setAttribute('aria-label',(place?.label||place?.country||'出生地')+(urban?'街区':'乡野')+
      '的星夜插画，'+s.age+'岁。画中人物：'+present.join('、')+'。');
  }

  function drawMapScene(canvas,s,year){
    if(!canvas||!s)return;
    const lived=LifeKeepsakes.livedYears(s),age=Math.min(lived,Math.max(0,Math.floor(Number.isFinite(year)?year:lived)));
    drawScene(canvas,familyAt(s,age));
  }
  globalThis.LifeDesk=Object.freeze({mount,writeNote,drawScene,drawMapScene,backupLegacy,mountHistory,openFinance,closeFinance,balanceCard,money,moneyText,currencyLabel,financialIdentity});
})();
