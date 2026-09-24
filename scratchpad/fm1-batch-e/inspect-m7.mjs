import fs from "node:fs";
const T=[["combined-transformations-and-reflections-in-y-equals-plus-or-minus-x",["we.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.01","we.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.02","q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0012","q.maths.m7.combined-transformations-and-reflections-in-y-equals-plus-or-minus-x.0009"]],
["inequalities-in-two-variables-and-regions",["we.maths.m7.inequalities-in-two-variables-and-regions.02"]],
["quadratic-graphs-and-intersections-with-straight-lines",["we.maths.m7.quadratic-graphs-and-intersections-with-straight-lines.03"]]];
const svgText=(s)=>s.startsWith("<svg")?s:decodeURIComponent(s.slice(s.indexOf(",")+1));
for(const [slug,ids] of T){
  const b=JSON.parse(fs.readFileSync(`packs/maths/content/m7/${slug}/bundle.json`,"utf8"));
  for(const id of ids){
    const it=[...b.questions,...b.workedExamples].find(x=>x.id===id);
    if(!it){console.log("\n### "+id+"  NOT FOUND");continue;}
    console.log("\n### "+id);
    const figs=it.figures??(it.figure?[it.figure]:[]);
    figs.forEach((f,i)=>{
      const t=svgText(f.src??"");
      console.log("  alt: "+f.alt);
      console.log("  title: "+((t.match(/<title>([^<]*)<\/title>/)??[])[1]??"(none)"));
      const texts=[...t.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map(m=>m[1]);
      console.log("  texts: "+texts.join(" | "));
      // anchors for the overlap case
      const nodes=[...t.matchAll(/<text[^>]*x='([-\d.]+)'[^>]*y='([-\d.]+)'[^>]*>([^<]*)</g)].map(m=>({x:+m[1],y:+m[2],s:m[3]}));
      const near=[];
      for(let a=0;a<nodes.length;a++)for(let c=a+1;c<nodes.length;c++)
        if(Math.abs(nodes[a].x-nodes[c].x)<12&&Math.abs(nodes[a].y-nodes[c].y)<12) near.push(`"${nodes[a].s}"@(${nodes[a].x},${nodes[a].y}) vs "${nodes[c].s}"@(${nodes[c].x},${nodes[c].y})`);
      if(near.length) console.log("  OVERLAPS: "+near.join("; "));
    });
    for(const p of it.parts??[]) console.log(`  part (${p.id}) [${p.marks}]: ${p.stem.replace(/\n/g," / ").slice(0,120)}\n      answer: ${JSON.stringify(p.answer).slice(0,130)}`);
    if(it.stem&&!it.parts) console.log("  stem: "+it.stem.replace(/\n/g," / ").slice(0,140));
    if(it.finalAnswer) console.log("  finalAnswer: "+it.finalAnswer.slice(0,110));
  }
}
