const fs=require('fs'),path=require('path');
const root='public/content';
const PLOT_AUTO=new Set(JSON.parse(process.env.PA));
const files=[];
for(const s of fs.readdirSync(root)) for(const f of fs.readdirSync(path.join(root,s))) if(f.endsWith('.json')) files.push({subj:s,p:path.join(root,s,f)});
const auto=sp=>['numeric','algebraic','mcq','text','equation','order'].includes(sp.kind)||(sp.kind==='graph'&&PLOT_AUTO.has(sp.expect.plot));
let self=0,selfM=0,tot=0,totM=0,bySubj={},byKind={},byTopic={},autoMulti=0,autoMultiMethod=0,allOrNothing=0,multiNumAlg=0;
let notAutoSpec=0;
for(const {subj,p} of files){
  const b=JSON.parse(fs.readFileSync(p,'utf8'));
  bySubj[subj]=bySubj[subj]||{s:0,sm:0,t:0,tm:0};
  const key=path.basename(p,'.json'); byTopic[key]={s:0,t:0};
  for(const q of (b.questions||[])) for(const pt of (q.parts||[])){
    tot++;totM+=pt.marks;bySubj[subj].t++;bySubj[subj].tm+=pt.marks;byTopic[key].t++;
    const a=auto(pt.answer)&&!(pt.answer.kind==='text'&&pt.marks>=2);
    if(!auto(pt.answer)) notAutoSpec++;
    if(!a){self++;selfM+=pt.marks;bySubj[subj].s++;bySubj[subj].sm+=pt.marks;byTopic[key].s++;byKind[pt.answer.kind]=(byKind[pt.answer.kind]||0)+1;}
    else if(pt.marks>=2){autoMulti++; for(const m of (pt.scheme||[])) if(['M','MA','MW','W','P'].includes(m.code)) autoMultiMethod+=m.marks;}
    if(pt.marks>=2&&['numeric','algebraic','equation'].includes(pt.answer.kind)){multiNumAlg++; if(!(pt.commonErrors||[]).some(c=>c.marksTypicallyEarned>0)) allOrNothing++;}
  }
}
console.log('total',tot,totM,'self',self,(100*self/tot).toFixed(1)+'%',selfM,(100*selfM/totM).toFixed(1)+'%');
console.log('notAutoMarkableBySpec',notAutoSpec);
console.log('selfByKind',byKind);
console.log('bySubj',bySubj);
console.log('topics with >=1 self:',Object.values(byTopic).filter(v=>v.s>0).length,'over half:',Object.values(byTopic).filter(v=>v.s/v.t>0.5).length);
console.log('worst:',Object.entries(byTopic).map(([k,v])=>[k,v.s,v.t,(v.s/v.t)]).sort((a,b)=>b[3]-a[3]).slice(0,10));
console.log('autoMulti',autoMulti,'methodMarksInThem',autoMultiMethod);
console.log('multiNumAlgEqn',multiNumAlg,'strictAllOrNothing',allOrNothing);
