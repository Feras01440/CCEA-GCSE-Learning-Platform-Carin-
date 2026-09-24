import { chromium } from "playwright";
import path from "node:path";
import url from "node:url";

const DIR = path.resolve("docs/design/art-direction/mockups");
const pages = ["today", "today-first", "topic", "practice"];
const viewports = [
  { name: "phone", width: 390, height: 844 },
  { name: "desktop", width: 1280, height: 800 },
];

const AUDIT = `
(() => {
  const srgb=(c)=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
  const lum=(r)=>0.2126*srgb(r[0])+0.7152*srgb(r[1])+0.0722*srgb(r[2]);
  const parse=(s)=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;
    const p=m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
    return {rgb:[p[0],p[1],p[2]],a:p.length>3?p[3]:1};};
  const over=(f,b)=>f.a>=1?f.rgb:f.rgb.map((c,i)=>c*f.a+b[i]*(1-f.a));
  const ratio=(a,b)=>{const l1=lum(a),l2=lum(b);const[hi,lo]=l1>l2?[l1,l2]:[l2,l1];return (hi+0.05)/(lo+0.05);};
  function bgOf(el){let n=el,bg=[255,255,255];
    while(n&&n!==document.documentElement.parentNode){const c=parse(getComputedStyle(n).backgroundColor);
      if(c&&c.a>0){bg=over(c,bg);break;}n=n.parentElement;}return bg;}

  const textFails=[],tapFails=[],tinyFails=[],figFails=[];
  const seen=new Set();
  let accentFilled=0, sticky=0, stickyH=0;
  const accent=getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
  const accentRGB=(()=>{const d=document.createElement("div");d.style.color="var(--accent)";
    document.body.appendChild(d);const c=getComputedStyle(d).color;d.remove();return c;})();

  for(const el of document.querySelectorAll("*")){
    const cs=getComputedStyle(el);
    if(cs.display==="none"||cs.visibility==="hidden"||Number(cs.opacity)===0)continue;
    const r=el.getBoundingClientRect();
    if(r.width===0||r.height===0)continue;
    const inView=r.top<window.innerHeight&&r.bottom>0;

    if(cs.position==="sticky"||cs.position==="fixed"){sticky++;stickyH+=Math.round(r.height);}

    const own=Array.from(el.childNodes).filter(n=>n.nodeType===3&&n.textContent.trim()).map(n=>n.textContent.trim()).join(" ");
    if(own){
      const fg=parse(cs.color);
      const px=parseFloat(cs.fontSize);
      // 3. TYPE FLOOR: no text node under 13 px
      if(px<12.99) tinyFails.push({tag:el.tagName,text:own.slice(0,32),px});
      if(fg){
        const bg=bgOf(el);
        const cr=ratio(over(fg,bg),bg);
        const bold=Number(cs.fontWeight)>=700;
        const large=px>=24||(px>=18.66&&bold);
        const need=large?3:4.5;
        if(cr<need-0.02){
          const k=el.tagName+"|"+own.slice(0,40)+"|"+cs.color;
          if(!seen.has(k)){seen.add(k);textFails.push({tag:el.tagName,text:own.slice(0,44),px,color:cs.color,ratio:Math.round(cr*100)/100,need});}
        }
      }
    }

    const interactive=el.matches("a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]");
    if(interactive){
      const h=Math.round(r.height),w=Math.round(r.width);
      if(h<44||w<24) tapFails.push({tag:el.tagName,text:(el.innerText||el.getAttribute("aria-label")||el.placeholder||"").trim().slice(0,32),w,h});
      // 5. ONE ACCENT-FILLED CONTROL
      if(inView&&cs.backgroundColor===accentRGB) accentFilled++;
    }
  }

  // 1. FIGURE TEXT: fontSize * clientWidth / viewBoxWidth >= 13
  for(const svg of document.querySelectorAll("svg[viewBox]")){
    const r=svg.getBoundingClientRect();
    if(r.width===0)continue;
    const vb=svg.getAttribute("viewBox").split(/[\s,]+/).map(Number);
    const scale=r.width/vb[2];
    for(const t of svg.querySelectorAll("text")){
      const fs=parseFloat(getComputedStyle(t).fontSize);
      const rendered=fs*scale;
      if(rendered<12.99) figFails.push({text:(t.textContent||"").slice(0,20),fs,scale:Math.round(scale*100)/100,rendered:Math.round(rendered*10)/10});
    }
  }

  const doc=document.documentElement;
  return {textFails,tapFails,tinyFails,figFails,accentFilled,sticky,stickyH,
    hScroll: doc.scrollWidth>doc.clientWidth+1};
})()
`;

const browser = await chromium.launch();
let bad = 0;
for (const p of pages) {
  for (const v of viewports) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, isMobile: v.width < 500 });
    const page = await ctx.newPage();
    await page.goto(url.pathToFileURL(path.join(DIR, p + ".html")).href, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(800);
    const r = await page.evaluate(AUDIT);
    const issues = r.textFails.length + r.tapFails.length + r.tinyFails.length + r.figFails.length
      + (r.hScroll ? 1 : 0) + (v.width < 500 && r.accentFilled > 1 ? 1 : 0);
    bad += issues;
    console.log(`\n=== ${p} @ ${v.name} ===`);
    console.log(`  contrast ${r.textFails.length} | tap ${r.tapFails.length} | under-13px ${r.tinyFails.length} | figure-text ${r.figFails.length} | accent-filled controls ${r.accentFilled} | sticky ${r.sticky} (${r.stickyH}px) | h-scroll ${r.hScroll}`);
    for (const f of r.textFails) console.log(`  CONTRAST ${f.ratio}:1 (need ${f.need}) ${f.px}px "${f.text}"`);
    for (const f of r.tapFails) console.log(`  TAP ${f.w}x${f.h} <${f.tag}> "${f.text}"`);
    for (const f of r.tinyFails) console.log(`  TINY ${f.px}px <${f.tag}> "${f.text}"`);
    for (const f of r.figFails) console.log(`  FIGURE ${f.rendered}px (fs ${f.fs} x scale ${f.scale}) "${f.text}"`);
    await ctx.close();
  }
}
await browser.close();
console.log(bad === 0 ? "\nALL CLEAR" : `\n${bad} issue(s)`);
