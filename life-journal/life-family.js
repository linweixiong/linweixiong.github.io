/* 家人档案和人生画面共用的年龄、姓名与在世状态。 */
(() => {
  'use strict';
  const W=globalThis.LifeWorld;
  const hash=(s,n)=>W.hash(s.seed,n);
  function members(s){
    const place=W.place(s.region,s.birthYear);
    const names=place?.names || [s.name,'小雨','小禾','小星'];
    const used=new Set([s.name]);
    function relative(role,offset,id,job,startingAge=0,sex){
      if(s.age<startingAge||s.age+offset<0)return null;
      let idx=hash(s,id)%names.length;
      for(let n=0;n<names.length&&used.has(names[idx]);n++)idx=(idx+1)%names.length;
      let name=names[idx];
      if(s.edition==='regional-2'&&W.personalName){
        const gender=sex||(hash(s,id+35)%2?'female':'male');
        for(let n=0;n<16;n++){
          const candidate=W.personalName(s.region,gender,hash(s,id+1700*n));
          if(candidate&&!used.has(candidate)){name=candidate;break;}
        }
      }
      used.add(name);
      const baseline=Math.round((place?.lifeExp||76)+((hash(s,id+700)%25)-12));
      const end=Math.max(startingAge+offset+3,baseline);
      const a=s.age+offset;
      return {role,name,age:Math.min(a,end),living:a<end,job};
    }
    const a=21+hash(s,240)%16,b=22+hash(s,241)%17;
    const jobs=['为邻里修理器具','做仓储和清点工作','在店里照看生意','做缝补和制作工作','在学校做后勤','经营小摊','在家照料家人','做运输工作'];
    const people=[
      relative('母亲',a,244,jobs[hash(s,300)%jobs.length],0,'female'),
      relative('父亲',b,245,jobs[hash(s,301)%jobs.length],0,'male'),
      relative('祖辈',a+21+hash(s,304)%12,247,'家里的长辈')
    ];
    if(hash(s,248)%3!==0){const offset=hash(s,249)%2?3:-4;people.push(relative(offset>0?'年长的手足':'年幼的手足',offset,250,'手足'));}
    if(s.decisions?.relationship==='partner'){
      const partner=relative(s.partnerStatus==='separated'?'分居伴侣':'伴侣',Number(hash(s,305)%7)-3,251,s.partnerStatus==='separated'?'分开生活':'共同生活',25);
      if(partner&&s.partnerStatus==='widowed')partner.living=false;
      people.push(partner);
    }
    if(s.childCount>0)people.push(relative('孩子',-28,252,'家中晚辈',28));
    return people.filter(Boolean);
  }
  globalThis.LifeFamily=Object.freeze({members});
})();
