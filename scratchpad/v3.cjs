const fs=require('fs'),path=require('path');
const root='public/content';const files=[];
for(const s of fs.readdirSync(root)) for(const f of fs.readdirSync(path.join(root,s))) if(f.endsWith('.json')) files.push(path.join(root,s,f));
const wc=s=>(s||'').split(/\s+/).filter(Boolean).length;
let blocks=[],words=[],gates=[],figs=[],callKind={},firstVisWords=[],firstVisIdx=[],longestRun=[],runOver150=0,runOver120=0;
let secondBlockCallout=0,titleRepeat=0,promptsTail=0,hookExam=0,whyNotes=0,inExamHeading=0,sheetWords=[],traps=0,mustBe=[],insightFindings=0,examCallouts=0,videoBlocks=0,simBlocks=0,notesNoVideo=0,videoFollowedByGate=0,videoTotal=0,recapAny=0;
let headingCount={};
for(const p of files){
  const b=JSON.parse(fs.readFileSync(p,'utf8'));
  const nb=b.noteBlocks||[];
  blocks.push(nb.length);
  const w=nb.filter(x=>x.type==='p'||x.type==='callout').reduce((a,x)=>a+wc(x.md||x.text||''),0);
  words.push(w);
  const g=nb.filter(x=>x.type==='gate').length; gates.push(g);
  figs.push(nb.filter(x=>x.type==='figure'||x.type==='photo').length);
  for(const x of nb) if(x.type==='callout') callKind[x.kind]=(callKind[x.kind]||0)+1;
  // first visual
  let acc=0,fv=null,fvi=null;
  nb.forEach((x,i)=>{ if(fv===null){ if(x.type==='figure'||x.type==='photo'||x.type==='sim'){fv=acc;fvi=i;} else acc+=wc(x.md||x.text||''); }});
  if(fv!==null){firstVisWords.push(fv);firstVisIdx.push(fvi);}
  // longest run between gates
  let run=0,maxRun=0;
  for(const x of nb){ if(x.type==='gate'){maxRun=Math.max(maxRun,run);run=0;} else run+=wc(x.md||x.text||''); }
  maxRun=Math.max(maxRun,run); longestRun.push(maxRun); if(maxRun>150)runOver150++; if(maxRun>120)runOver120++;
  if(nb[1]&&nb[1].type==='callout') secondBlockCallout++;
  if(nb[0]&&nb[0].type==='h'&&b.topic&&(b.topic.title||'').toLowerCase().startsWith((nb[0].text||'').toLowerCase())) titleRepeat++;
  const pIdx=nb.map((x,i)=>x.type==='prompt'?i:-1).filter(i=>i>=0);
  if(pIdx.length&&pIdx[pIdx.length-1]===nb.length-1&&pIdx.length===(pIdx[pIdx.length-1]-pIdx[0]+1)) promptsTail++;
  const hook=nb.find(x=>x.type==='p'); if(hook&&/\b\d+[- ]mark|marks|Summer 20|November 20|Q\d|examiner|report\b/i.test(hook.md||'')) hookExam++;
  if(nb.some(x=>x.type==='callout'&&x.kind==='why')) whyNotes++;
  if(nb.some(x=>x.type==='h'&&/^in the exam$/i.test(x.text||''))) inExamHeading++;
  for(const x of nb) if(x.type==='h') headingCount[x.text]=(headingCount[x.text]||0)+1;
  const sh=b.note&&b.note.sheet;
  if(sh){ sheetWords.push(wc([...(sh.mustBeAbleTo||[]),sh.howExamined||'',...(sh.traps||[])].join(' '))); traps+=(sh.traps||[]).length; mustBe.push((sh.mustBeAbleTo||[]).length); }
  insightFindings+=((b.insight&&b.insight.findings)||[]).length;
  examCallouts+=nb.filter(x=>x.type==='callout'&&x.kind==='examiner').length;
  const vb=nb.filter(x=>x.type==='video').length; videoBlocks+=vb; if(vb===0)notesNoVideo++;
  simBlocks+=nb.filter(x=>x.type==='sim').length;
  nb.forEach((x,i)=>{ if(x.type==='video'){videoTotal++; if(nb[i+1]&&nb[i+1].type==='gate')videoFollowedByGate++;}});
  if(nb.some(x=>x.type==='recap')) recapAny++;
}
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[Math.floor(s.length/2)]};
const mean=a=>(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1);
console.log('notes',files.length,'blocks med',med(blocks),'words med',med(words),'mean',mean(words),'gates med',med(gates),'mean',mean(gates),'figs med',med(figs));
console.log('firstVisualWords med',med(firstVisWords),'mean',mean(firstVisWords),'max',Math.max(...firstVisWords),'over150:',firstVisWords.filter(x=>x>150).length,'firstVisIdx med',med(firstVisIdx));
console.log('longestRun mean',mean(longestRun),'over150',runOver150,'over120',runOver120,'max',Math.max(...longestRun));
console.log('callouts',callKind);
console.log('secondBlockIsCallout',secondBlockCallout,'titleRepeatingH',titleRepeat,'promptsContiguousTail',promptsTail);
console.log('hookMentionsExam',hookExam,'notesWithWhyCallout',whyNotes,'inExamHeading',inExamHeading);
console.log('sheetWords med',med(sheetWords),'mean',mean(sheetWords),'max',Math.max(...sheetWords),'traps total',traps,'mustBeAbleTo med',med(mustBe),'max',Math.max(...mustBe));
console.log('insightFindings',insightFindings,'examinerCallouts',examCallouts,'sum with traps',traps+insightFindings+examCallouts);
console.log('videoBlocks',videoBlocks,'notesWithNoVideo',notesNoVideo,'videoFollowedByGate',videoFollowedByGate+'/'+videoTotal,'simBlocks',simBlocks,'recapBlocks',recapAny);
console.log('topHeadings',Object.entries(headingCount).sort((a,b)=>b[1]-a[1]).slice(0,8));
