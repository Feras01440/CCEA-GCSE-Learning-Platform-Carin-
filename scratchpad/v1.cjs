const fs=require('fs'),path=require('path');
const root='public/content';
const files=[];
for(const s of fs.readdirSync(root)) for(const f of fs.readdirSync(path.join(root,s))) if(f.endsWith('.json')) files.push({subj:s,p:path.join(root,s,f)});
console.log('bundle files:',files.length);
let parts=0,marks=0,selfParts=0,selfMarks=0,bySubj={};
let preDist={},preTotal=0;
let textGE2=0,textGE2WithGroups=0,textGE2Exact=0;
let kindCount={};
let selfKindCount={};
let textLong=0,textLongMarks=0,indic=0,indicWithKw=0;
let autoMulti=0,methodMarks=0,schemeCodes={};
let reqWorking=0;
let we=0,weSteps=0,weStepsWithInput=0,weStepsEq=0;
// crude isAutoMarkable replica later; first read spec-map
for(const {subj,p} of files){
  const b=JSON.parse(fs.readFileSync(p,'utf8'));
  bySubj[subj]=bySubj[subj]||{parts:0,marks:0,selfParts:0,selfMarks:0};
  const pre=(b.diagnostics||[]).filter(d=>d.when!=='post').flatMap(d=>d.items||[]);
  preDist[pre.length]=(preDist[pre.length]||0)+1; preTotal+=pre.length;
  for(const q of (b.questions||[])) for(const pt of (q.parts||[])){
    parts++; marks+=pt.marks; bySubj[subj].parts++; bySubj[subj].marks+=pt.marks;
    const k=pt.answer.kind; kindCount[k]=(kindCount[k]||0)+1;
    if(k==='text'&&pt.marks>=2){textGE2++; const g=pt.answer.keyWords||pt.answer.keywordGroups||null; if(g&&g.length){textGE2WithGroups++; const sum=g.reduce((a,x)=>a+(x.marks||0),0); if(sum===pt.marks)textGE2Exact++;}}
    if(k==='text-long'){textLong++;textLongMarks+=pt.marks; for(const band of (pt.answer.bands||[])){} const ip=pt.answer.indicative||pt.answer.indicativeContent||[]; indic+=ip.length; for(const i of ip) if(i.keyWords&&i.keyWords.length) indicWithKw++;}
    if(pt.requiresWorking) reqWorking++;
    for(const m of (pt.scheme||[])) schemeCodes[m.code]=(schemeCodes[m.code]||0)+m.marks;
  }
  for(const w of (b.workedExamples||[])){we++; for(const st of (w.steps||[])){weSteps++; if(st.input)weStepsWithInput++; if((st.working||'').includes('='))weStepsEq++;}}
}
console.log('parts',parts,'marks',marks);
console.log('preDist',preDist,'preTotal',preTotal,'mean',(preTotal/files.length).toFixed(2));
console.log('answer kinds',kindCount);
console.log('textGE2',textGE2,'withGroups',textGE2WithGroups,'exactSum',textGE2Exact);
console.log('textLong',textLong,'marks',textLongMarks,'indicative',indic,'withKw',indicWithKw);
console.log('requiresWorking',reqWorking);
console.log('schemeCodes',schemeCodes);
console.log('workedExamples',we,'steps',weSteps,'withInput',weStepsWithInput,'eqInWorking',weStepsEq);
console.log('bySubj',bySubj);
