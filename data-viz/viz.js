/* Data Visualization subject: a small SVG chart engine shared by every lab on this page.
   chart(el, spec) draws column, bar, stacked, 100% stacked, line, area, combo, pie, donut, scatter,
   histogram, lollipop and dot charts; bullet() and spark() draw bullet graphs and sparklines.
   Exposed as window.DVZ. */
(function(){
"use strict";
const NS="http://www.w3.org/2000/svg";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* categorical palette tuned for the dark page; light palette mirrors Excel's default Office theme */
const PAL=["#5B9BE6","#F2A54A","#4FC3A1","#E8697D","#A58BE8","#D9C155","#7FC6E8","#C77DBB","#9AA9BD","#8FD694","#F28E5B","#6C8EDB","#E0A3C8","#B5D86B","#5EC4C9","#D98C8C","#B9A3F0"];
const EXCEL=["#4472C4","#ED7D31","#A5A5A5","#FFC000","#5B9BD5","#70AD47","#264478","#9E480E","#636363","#997300"];
const THEMES={
 dark:{bg:"transparent",fg:"#E7EBF3",muted:"#97A3BA",dim:"#6C7A94",grid:"#2A3852",gridHeavy:"#56688C",axis:"#3A4A66",gray:"#46536B",font:"IBM Plex Sans, system-ui, sans-serif"},
 light:{bg:"#FFFFFF",fg:"#262626",muted:"#595959",dim:"#7F7F7F",grid:"#E6E6E6",gridHeavy:"#A6A6A6",axis:"#BFBFBF",gray:"#C9CDD3",font:"Calibri, Carlito, Arial, sans-serif"}};
/* number formatting */
const fmtN=(v,d)=>{if(v==null||isNaN(v))return"";const a=Math.abs(v);if(d!=null)return v.toLocaleString(undefined,{maximumFractionDigits:d,minimumFractionDigits:d});if(a>=1e6)return(v/1e6).toFixed(a>=1e7?0:1)+"M";if(a>=1e4)return(v/1e3).toFixed(a>=1e5?0:1)+"k";if(Number.isInteger(v))return v.toLocaleString();return v.toLocaleString(undefined,{maximumFractionDigits:a<10?2:1})};
/* "nice" axis ticks */
function ticks(lo,hi,n){if(lo===hi){hi=lo+1}const span=hi-lo,step0=span/Math.max(1,n),mag=Math.pow(10,Math.floor(Math.log10(step0))),err=step0/mag,step=(err>=7.5?10:err>=3.5?5:err>=1.5?2:1)*mag;const a=Math.floor(lo/step)*step,b=Math.ceil(hi/step)*step,out=[];for(let v=a;v<=b+step*1e-9;v+=step)out.push(+v.toFixed(10));return out}
const textW=(s,fs)=>String(s).length*fs*.56;

/* colour-vision-deficiency simulation (Machado et al. 2009, severity 1.0, applied in linear RGB) */
const CVD={
 protan:[0.152286,1.052583,-0.204868,0.114503,0.786281,0.099216,-0.003882,-0.048116,1.051998],
 deutan:[0.367322,0.860646,-0.227968,0.280085,0.672501,0.047413,-0.011820,0.042940,0.968881],
 tritan:[1.255528,-0.076749,-0.178779,-0.078411,0.930809,0.147602,0.004733,0.691367,0.303900],
 mono:[0.2126,0.7152,0.0722,0.2126,0.7152,0.0722,0.2126,0.7152,0.0722]};
(function defs(){if(document.getElementById("dv-cvd-defs"))return;const s=document.createElementNS(NS,"svg");s.id="dv-cvd-defs";s.setAttribute("width","0");s.setAttribute("height","0");s.setAttribute("aria-hidden","true");s.style.position="absolute";
 s.innerHTML="<defs>"+Object.entries(CVD).map(([k,m])=>`<filter id="cvd-${k}" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="${m.slice(0,3).join(" ")} 0 0 ${m.slice(3,6).join(" ")} 0 0 ${m.slice(6,9).join(" ")} 0 0 0 0 0 1 0"/></filter>`).join("")+"</defs>";document.body.appendChild(s)})();
const lin=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)},unlin=c=>{c=c<=.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-.055;return Math.round(Math.max(0,Math.min(1,c))*255)};
function hexRgb(h){h=h.replace("#","");if(h.length===3)h=h.split("").map(x=>x+x).join("");const n=parseInt(h,16);return[(n>>16)&255,(n>>8)&255,n&255]}
const rgbHex=a=>"#"+a.map(x=>x.toString(16).padStart(2,"0")).join("").toUpperCase();
function simulate(hex,kind){if(!kind||kind==="none"||!CVD[kind])return hex.toUpperCase();const m=CVD[kind],[r,g,b]=hexRgb(hex).map(lin);return rgbHex([0,3,6].map(i=>unlin(m[i]*r+m[i+1]*g+m[i+2]*b)))}
/* CIE76 colour difference, good enough to rank "how distinguishable" two swatches are */
function lab(hex){const[r,g,b]=hexRgb(hex).map(lin);let x=(r*.4124+g*.3576+b*.1805)/.95047,y=r*.2126+g*.7152+b*.0722,z=(r*.0193+g*.1192+b*.9505)/1.08883;const f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116;x=f(x);y=f(y);z=f(z);return[116*y-16,500*(x-y),200*(y-z)]}
const dE=(a,b)=>{const p=lab(a),q=lab(b);return Math.hypot(p[0]-q[0],p[1]-q[1],p[2]-q[2])};
const luminance=hex=>{const[r,g,b]=hexRgb(hex).map(lin);return .2126*r+.7152*g+.0722*b};
const mix=(a,b,t)=>{const p=hexRgb(a),q=hexRgb(b);return rgbHex(p.map((v,i)=>Math.round(v+(q[i]-v)*t)))};
/* sequential and diverging ramps */
const seqRamp=(t,lo="#16324F",hi="#6FB7F2")=>mix(lo,hi,Math.max(0,Math.min(1,t)));
const divRamp=(t,neg="#E0644F",mid="#3A4558",pos="#4F93E0")=>t<0?mix(mid,neg,Math.min(1,-t)):mix(mid,pos,Math.min(1,t));

/* ---------------- the chart ---------------- */
function chart(el,spec){
 const api={el,spec,update(s){api.spec=Object.assign({},api.spec,s);draw()},set(s){api.spec=s;draw()}};
 let w0=0;
 function draw(){const s=api.spec,T=THEMES[s.theme||"dark"],W=Math.max(240,el.clientWidth||600),H=s.h||Math.round(Math.min(360,Math.max(220,W*.52)));w0=W;
  const fs=s.fs||(W<420?10.5:12),pal=s.colors||(s.theme==="light"?EXCEL:PAL);
  let out=`<svg xmlns="${NS}" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" role="img" aria-label="${esc(s.title||s.aria||"Chart")}" style="font-family:${T.font};display:block;${s.cvd&&s.cvd!=="none"?`filter:url(#cvd-${s.cvd})`:""}">`;
  if(s.bg==="gradient"){const gid=api.gid||(api.gid="g"+Math.random().toString(36).slice(2,8));out+=`<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DCE6F2"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient></defs><rect x=".5" y=".5" width="${W-1}" height="${H-1}" fill="url(#${gid})" stroke="#7F7F7F"/>`}
  else if(s.theme==="light"||s.bgFill)out+=`<rect x=".5" y=".5" width="${W-1}" height="${H-1}" fill="${s.bgFill||T.bg}" ${s.border?`stroke="${T.gridHeavy}"`:""}/>`;
  let top=10;if(s.title){out+=`<text x="${s.titleAlign==="center"?W/2:12}" y="${top+fs*1.3}" text-anchor="${s.titleAlign==="center"?"middle":"start"}" fill="${T.fg}" font-size="${fs*1.3}" font-weight="${s.titleWeight||700}">${esc(s.title)}</text>`;top+=fs*1.9}
  if(s.sub){out+=`<text x="${s.titleAlign==="center"?W/2:12}" y="${top+fs}" text-anchor="${s.titleAlign==="center"?"middle":"start"}" fill="${T.muted}" font-size="${fs}">${esc(s.sub)}</text>`;top+=fs*1.6}
  const type=s.type||"column";
  if(type==="pie"||type==="donut"){out+=drawPie(s,T,W,H,top,fs,pal);el.innerHTML=out+"</svg>";bindTips();return}
  /* legend */
  const series=(s.series||[]).filter(x=>!x.hidden);
  let legH=0,legW=0;const legend=s.legend||(series.length>1?"bottom":"none");
  if(legend==="right"){legW=Math.min(150,Math.max(...series.map(x=>textW(x.name,fs)))+28)}
  if(legend==="bottom"||legend==="top")legH=fs*2;
  if(legend==="top"){out+=legendRow(series,pal,T,fs,12,top+fs*.9,W,s);top+=legH}
  const horiz=type==="bar"||type==="stackedbar"||type==="dot";
  const cats=s.cats||[];
  /* value extent */
  let vals=[];const stacked=/stacked/.test(type);
  if(type==="scatter"){vals=(s.points||[]).map(p=>p.y)}
  else if(type==="histogram"){}
  else if(stacked){cats.forEach((c,i)=>{let p=0,n=0;series.forEach(x=>{const v=+x.values[i]||0;if(v>=0)p+=v;else n+=v});vals.push(p,n)});if(type==="stacked100")vals=[0,100]}
  else series.forEach(x=>{if(x.axis!==2)vals.push(...x.values.filter(v=>v!=null))});
  let hist=null;if(type==="histogram"){const v=s.values||[],lo=s.binStart??Math.min(...v),bw=s.binWidth||((Math.max(...v)-lo)/(s.bins||10))||1,n=Math.max(1,Math.ceil((Math.max(...v)-lo)/bw+1e-9));hist=Array.from({length:n},(_,i)=>({a:lo+i*bw,b:lo+(i+1)*bw,c:0}));v.forEach(x=>{let i=Math.floor((x-lo)/bw);if(i>=n)i=n-1;if(i>=0)hist[i].c++});vals=hist.map(h=>h.c)}
  let vmin=Math.min(0,...vals),vmax=Math.max(0,...vals);if(type==="line"||type==="area"||type==="scatter"||type==="dot"){if(!s.zero){vmin=Math.min(...vals);vmax=Math.max(...vals)}}
  if(s.labels&&horiz){const sp=vmax-vmin;if(vmin<0)vmin-=sp*.2;vmax+=sp*.08}
  if(s.yMin!=null)vmin=s.yMin;if(s.yMax!=null)vmax=s.yMax;
  const yt=ticks(vmin,vmax,s.nTicks||(H<240?4:5)),y0=yt[0],y1=yt[yt.length-1];
  /* secondary axis for combo */
  const sec=series.filter(x=>x.axis===2);let st2=null;if(sec.length){const v2=sec.flatMap(x=>x.values.filter(v=>v!=null));st2=ticks(Math.min(0,...v2),Math.max(...v2),s.nTicks||5)}
  const fmt=s.fmt||fmtN,fmt2=s.fmt2||fmt;
  /* margins */
  const valLabW=Math.max(...yt.map(v=>textW(fmt(v),fs)))+10;
  const catLabW=horiz?Math.min(W*.34,Math.max(...cats.map(c=>textW(c,fs)),20)+10):0;
  let ml=(horiz?catLabW:(s.hideY?8:valLabW))+(s.yTitle?fs*1.6:0)+6,mr=12+(horiz||type==="scatter"?textW(fmt(yt[yt.length-1]),fs)/2:0)+legW+(st2?Math.max(...st2.map(v=>textW(fmt2(v),fs)))+10:0)+(legend==="direct"?Math.max(...series.map(x=>textW(x.name,fs)))+12:0),mb=(horiz?fs*1.8:fs*2)+(s.xTitle?fs*1.6:0)+(legend==="bottom"?legH:0),mt=top+(s.labels?fs:4);
  if(type==="scatter"){const xs=(s.points||[]).map(p=>p.x);api.xt=ticks(s.xMin??Math.min(...xs),s.xMax??Math.max(...xs),5)}
  /* rotate crowded category labels */
  const pw=W-ml-mr;let rot=false;if(!horiz&&type!=="scatter"&&type!=="histogram"&&cats.length){const per=pw/cats.length;if(Math.max(...cats.map(c=>textW(c,fs)))>per*.95){rot=true;mb+=Math.min(70,Math.max(...cats.map(c=>textW(c,fs)))*.7)}}
  const ph=H-mt-mb;
  const Y=v=>mt+ph-(v-y0)/(y1-y0||1)*ph,X=v=>ml+(v-y0)/(y1-y0||1)*pw;
  const Y2=st2?(v=>mt+ph-(v-st2[0])/(st2[st2.length-1]-st2[0]||1)*ph):null;
  const grid=s.grid==null?"muted":s.grid;
  const ctx={W,H,ml,mr,mt,mb,pw,ph,Y,X,T,fs,cats,pal};api.ctx=ctx;
  /* gridlines + value axis */
  yt.forEach(v=>{if(horiz){const x=X(v);if(grid!=="none")out+=`<line x1="${x}" x2="${x}" y1="${mt}" y2="${mt+ph}" stroke="${grid==="heavy"?T.gridHeavy:T.grid}" stroke-width="${grid==="heavy"?1:1}" ${grid==="dashed"?'stroke-dasharray="3 3"':""}/>`;if(!s.hideY)out+=`<text x="${x}" y="${mt+ph+fs*1.3}" text-anchor="middle" fill="${T.muted}" font-size="${fs}">${esc(fmt(v))}</text>`}
   else{const y=Y(v);if(grid!=="none")out+=`<line x1="${ml}" x2="${ml+pw}" y1="${y}" y2="${y}" stroke="${grid==="heavy"?T.gridHeavy:T.grid}" ${grid==="dashed"?'stroke-dasharray="3 3"':""}/>`;if(!s.hideY)out+=`<text x="${ml-6}" y="${y+fs*.35}" text-anchor="end" fill="${T.muted}" font-size="${fs}">${esc(fmt(v))}</text>`}});
  if(st2)st2.forEach(v=>{out+=`<text x="${ml+pw+6}" y="${Y2(v)+fs*.35}" fill="${T.muted}" font-size="${fs}">${esc(fmt2(v))}</text>`});
  if(s.yTitle)out+=`<text transform="translate(${fs},${mt+ph/2}) rotate(-90)" text-anchor="middle" fill="${T.muted}" font-size="${fs}">${esc(s.yTitle)}</text>`;
  if(s.xTitle)out+=`<text x="${ml+pw/2}" y="${H-(legend==="bottom"?legH:0)-fs*.4}" text-anchor="middle" fill="${T.muted}" font-size="${fs}">${esc(s.xTitle)}</text>`;
  /* zero / baseline */
  if(type!=="scatter"){if(horiz)out+=`<line x1="${X(Math.max(y0,Math.min(0,y1)))}" x2="${X(Math.max(y0,Math.min(0,y1)))}" y1="${mt}" y2="${mt+ph}" stroke="${T.axis}"/>`;else out+=`<line x1="${ml}" x2="${ml+pw}" y1="${Y(Math.max(y0,Math.min(0,y1)))}" y2="${Y(Math.max(y0,Math.min(0,y1)))}" stroke="${T.axis}"/>`}
  /* colour of a mark */
  const col=(si,ci,v)=>{const x=series[si];if(s.colorFn)return s.colorFn(si,ci,v);if(s.highlight!=null){const hit=typeof s.highlight==="function"?s.highlight(ci,si,v):(series.length>1?si===s.highlight:ci===s.highlight);return hit?(s.hiColor||x&&x.color||pal[0]):(s.dimColor||T.gray)}return x&&x.color||pal[si%pal.length]};
  const band=(n)=>{const step=(horiz?ph:pw)/Math.max(1,n),pad=s.gap!=null?s.gap:(n>14?.18:.3);return{step,bw:step*(1-pad),off:step*pad/2}};
  const lab=(x,y,t,anchor,color)=>`<text x="${x}" y="${y}" text-anchor="${anchor||"middle"}" fill="${color||T.fg}" font-size="${fs*.92}" font-weight="600">${esc(t)}</text>`;
  const tip=(t)=>`<title>${esc(t)}</title>`;
  if(type==="column"||type==="lollipop"||type==="combo"||type==="histogram"){
   const bars=type==="histogram"?[{name:s.seriesName||"Count",values:hist.map(h=>h.c)}]:series.filter(x=>type!=="combo"||x.type!=="line");const n=type==="histogram"?hist.length:cats.length;const b=band(n);const k=bars.length,sub=b.bw/k;
   bars.forEach((x,si0)=>{const si=series.indexOf(x);x.values.forEach((v,ci)=>{if(v==null)return;const xx=ml+ci*b.step+(type==="histogram"?b.step*.02:b.off)+si0*sub,yv=Y(Math.max(v,0)),hgt=Math.abs(Y(v)-Y(0)),bw=type==="histogram"?b.step*.96:sub;const c=col(si<0?si0:si,ci,v);
     const name=type==="histogram"?`${fmt(hist[ci].a)}–${fmt(hist[ci].b)}`:cats[ci];
     if(type==="lollipop"){const cx=xx+bw/2;out+=`<g class="mk" data-i="${ci}"><line x1="${cx}" x2="${cx}" y1="${Y(0)}" y2="${Y(v)}" stroke="${c}" stroke-width="2"/><circle cx="${cx}" cy="${Y(v)}" r="${Math.max(4,Math.min(7,bw*.18))}" fill="${c}"/>${tip(`${name}: ${fmt(v)}`)}</g>`}
     else out+=`<rect class="mk" data-i="${ci}" x="${xx}" y="${v>=0?yv:Y(0)}" width="${Math.max(1,bw-(k>1?1:0))}" height="${Math.max(0,hgt)}" fill="${c}" ${s.barStroke?`stroke="${s.barStroke}"`:""} rx="${s.theme==="light"?0:1.5}">${tip(`${name}${k>1?" · "+x.name:""}: ${fmt(v)}`)}</rect>`;
     if(s.labels&&(s.labelFilter?s.labelFilter(ci,si0,v):true))out+=lab(xx+bw/2,(v>=0?Y(v)-5:Y(v)+fs+2),(s.labelFmt||fmt)(v),"middle",s.labelColor);})});
   if(type==="combo")series.forEach((x,si)=>{if(x.type!=="line")return;const YY=x.axis===2&&Y2?Y2:Y;const pts=x.values.map((v,ci)=>v==null?null:[ml+ci*b.step+b.step/2,YY(v)]);out+=path(pts,x.color||pal[si%pal.length],s.lineW||2.5);if(s.markers!==false)pts.forEach((p,ci)=>{if(p)out+=`<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="${x.color||pal[si%pal.length]}"><title>${esc(cats[ci]+" · "+x.name+": "+fmt2(x.values[ci]))}</title></circle>`});if(s.labels)pts.forEach((p,ci)=>{if(p)out+=lab(p[0],p[1]-8,(x.axis===2?fmt2:fmt)(x.values[ci]),"middle",x.color||pal[si%pal.length])})});
   if(type==="histogram")hist.forEach((h,ci)=>{if(ci%Math.ceil(hist.length/8)===0||ci===hist.length-1){}});
   /* category labels */
   if(type==="histogram"){const ed=[...hist.map(h=>h.a),hist[hist.length-1].b];const every=Math.ceil(ed.length/9);ed.forEach((e,i)=>{if(i%every&&i!==ed.length-1)return;out+=`<text x="${ml+i*b.step}" y="${mt+ph+fs*1.3}" text-anchor="middle" fill="${T.muted}" font-size="${fs}">${esc(fmt(e))}</text>`})}
   else out+=catLabels(cats,i=>ml+i*b.step+b.step/2,mt+ph,rot,T,fs,s);
  }
  else if(type==="stacked"||type==="stacked100"){const b=band(cats.length);cats.forEach((c,ci)=>{let p=0,n=0;const tot=series.reduce((a,x)=>a+Math.abs(+x.values[ci]||0),0)||1;series.forEach((x,si)=>{let v=+x.values[ci]||0;if(type==="stacked100")v=v/tot*100;const base=v>=0?p:n;const yA=Y(base),yB=Y(base+v);if(v>=0)p+=v;else n+=v;out+=`<rect class="mk" data-i="${ci}" x="${ml+ci*b.step+b.off}" y="${Math.min(yA,yB)}" width="${b.bw}" height="${Math.abs(yA-yB)}" fill="${col(si,ci,v)}" stroke="${s.theme==="light"?"#fff":"#0D131E"}" stroke-width=".6">${tip(`${c} · ${x.name}: ${type==="stacked100"?v.toFixed(1)+"%":fmt(v)}`)}</rect>`;if(s.labels&&Math.abs(yA-yB)>fs*1.2)out+=lab(ml+ci*b.step+b.step/2,(yA+yB)/2+fs*.35,type==="stacked100"?Math.round(v)+"%":fmt(v),"middle","#0B111C")})});out+=catLabels(cats,i=>ml+i*b.step+b.step/2,mt+ph,rot,T,fs,s)}
  else if(type==="bar"||type==="stackedbar"||type==="dot"){const b=band(cats.length),k=type==="bar"?series.length:1,sub=b.bw/k;
   cats.forEach((c,ci)=>{const yy=mt+ci*b.step;out+=`<text x="${ml-8}" y="${yy+b.step/2+fs*.35}" text-anchor="end" fill="${s.highlight===ci?T.fg:T.muted}" font-size="${fs}" ${s.highlight===ci?'font-weight="700"':""}>${esc(trunc(c,catLabW,fs))}</text>`;
    if(type==="stackedbar"){let p=0;series.forEach((x,si)=>{const v=+x.values[ci]||0;out+=`<rect class="mk" data-i="${ci}" x="${X(p)}" y="${yy+b.off}" width="${Math.abs(X(p+v)-X(p))}" height="${b.bw}" fill="${col(si,ci,v)}" stroke="#0D131E" stroke-width=".6">${tip(`${c} · ${x.name}: ${fmt(v)}`)}</rect>`;p+=v})}
    else if(type==="dot"){series.forEach((x,si)=>{const v=x.values[ci];if(v==null)return;out+=`<line x1="${ml}" x2="${ml+pw}" y1="${yy+b.step/2}" y2="${yy+b.step/2}" stroke="${T.grid}" stroke-dasharray="2 3"/><circle class="mk" data-i="${ci}" cx="${X(v)}" cy="${yy+b.step/2}" r="5.5" fill="${col(si,ci,v)}">${tip(`${c}: ${fmt(v)}`)}</circle>`})}
    else series.forEach((x,si)=>{const v=x.values[ci];if(v==null)return;const x0=X(Math.max(y0,Math.min(0,y1)));out+=`<rect class="mk" data-i="${ci}" x="${Math.min(X(v),x0)}" y="${yy+b.off+si*sub}" width="${Math.abs(X(v)-x0)}" height="${Math.max(1,sub-(k>1?1:0))}" fill="${col(si,ci,v)}" rx="1.5">${tip(`${c}${k>1?" · "+x.name:""}: ${fmt(v)}`)}</rect>`;if(s.labels)out+=`<text x="${v>=0?X(v)+5:X(v)-5}" y="${yy+b.off+si*sub+sub/2+fs*.35}" text-anchor="${v>=0?"start":"end"}" fill="${s.labelColor||T.fg}" font-size="${fs*.9}" font-weight="600">${esc((s.labelFmt||fmt)(v))}</text>`})})}
  else if(type==="line"||type==="area"||type==="stackedarea"){const step=pw/Math.max(1,cats.length-1),xs=i=>cats.length===1?ml+pw/2:ml+i*step;let acc=cats.map(()=>0);
   series.forEach((x,si)=>{const c=col(si,0,0);let pts=x.values.map((v,ci)=>v==null?null:[xs(ci),Y(type==="stackedarea"?acc[ci]+v:v)]);
    if(type!=="line"){const base=cats.map((_,ci)=>[xs(ci),Y(type==="stackedarea"?acc[ci]:Math.max(y0,0))]);const poly=pts.filter(Boolean).map(p=>p.join(",")).join(" ")+" "+base.slice().reverse().map(p=>p.join(",")).join(" ");out+=`<polygon points="${poly}" fill="${c}" fill-opacity="${type==="stackedarea"?.85:.25}"/>`}
    out+=path(pts,c,s.highlight!=null&&s.highlight!==si?1.5:(s.lineW||2.4),x.dash);
    if(s.markers)pts.forEach((p,ci)=>{if(p)out+=marker(p,c,si,s.markerSize||4)});
    pts.forEach((p,ci)=>{if(p)out+=`<circle class="hit" cx="${p[0]}" cy="${p[1]}" r="9" fill="transparent">${tip(`${cats[ci]}${series.length>1?" · "+x.name:""}: ${fmt(x.values[ci])}`)}</circle>`});
    if(s.labels)pts.forEach((p,ci)=>{if(p&&(!s.labelFilter||s.labelFilter(ci,si,x.values[ci])))out+=lab(p[0],p[1]-8,(s.labelFmt||fmt)(x.values[ci]),"middle",c)});
    if(legend==="direct"){const li=x.values.length-1-[...x.values].reverse().findIndex(v=>v!=null);const p=pts[li];if(p)x._ly=p[1]}
    if(type==="stackedarea")acc=acc.map((a,ci)=>a+(+x.values[ci]||0))});
   if(legend==="direct"){const L=series.map((x,si)=>({x,si,y:x._ly})).filter(o=>o.y!=null).sort((a,b)=>a.y-b.y);for(let i=1;i<L.length;i++)if(L[i].y-L[i-1].y<fs*1.15)L[i].y=L[i-1].y+fs*1.15;L.forEach(o=>{out+=`<text x="${ml+pw+8}" y="${o.y+fs*.35}" fill="${col(o.si,0,0)}" font-size="${fs}" font-weight="600">${esc(o.x.name)}</text>`})}
   out+=catLabels(cats,xs,mt+ph,rot,T,fs,s)}
  else if(type==="scatter"){const xt=api.xt,x0=xt[0],x1=xt[xt.length-1],XX=v=>ml+(v-x0)/(x1-x0||1)*pw;
   xt.forEach(v=>{if(grid!=="none")out+=`<line x1="${XX(v)}" x2="${XX(v)}" y1="${mt}" y2="${mt+ph}" stroke="${T.grid}"/>`;out+=`<text x="${XX(v)}" y="${mt+ph+fs*1.3}" text-anchor="middle" fill="${T.muted}" font-size="${fs}">${esc((s.fmtX||fmtN)(v))}</text>`});
   out+=`<line x1="${ml}" x2="${ml+pw}" y1="${mt+ph}" y2="${mt+ph}" stroke="${T.axis}"/>`;
   if(s.trend){const P=s.trend===true?s.points:s.points.filter(s.trend);const n=P.length,mx=P.reduce((a,p)=>a+p.x,0)/n,my=P.reduce((a,p)=>a+p.y,0)/n,b=P.reduce((a,p)=>a+(p.x-mx)*(p.y-my),0)/(P.reduce((a,p)=>a+(p.x-mx)**2,0)||1),a=my-b*mx;out+=`<line x1="${XX(x0)}" x2="${XX(x1)}" y1="${Y(a+b*x0)}" y2="${Y(a+b*x1)}" stroke="${T.muted}" stroke-dasharray="5 4"/>`}
   (s.points||[]).forEach((p,i)=>{const c=p.color||(s.colorFn?s.colorFn(p,i):pal[0]);out+=`<circle class="mk" data-i="${i}" cx="${XX(p.x)}" cy="${Y(p.y)}" r="${p.r||s.r||4.5}" fill="${c}" fill-opacity="${s.opacity||.85}" stroke="${s.theme==="light"?"#fff":"#0D131E"}" stroke-width=".7">${tip(p.label||`${fmtN(p.x)}, ${fmt(p.y)}`)}</circle>`;if(p.text)out+=`<text x="${XX(p.x)+8}" y="${Y(p.y)+4}" fill="${c}" font-size="${fs*.9}" font-weight="600">${esc(p.text)}</text>`})}
  if(legend==="bottom")out+=legendRow(series.length?series:[],pal,T,fs,ml,H-fs*.6,W,s);
  if(legend==="right")series.forEach((x,si)=>{const y=mt+si*fs*1.6+fs;out+=`<rect x="${W-legW}" y="${y-fs*.8}" width="${fs*.9}" height="${fs*.9}" fill="${col(si,0,0)}"/><text x="${W-legW+fs*1.3}" y="${y}" fill="${T.muted}" font-size="${fs}">${esc(x.name)}</text>`});
  if(s.annotate)s.annotate.forEach(a=>{const b=band(cats.length);const cx=horiz?X(a.v):(type==="line"?ml+a.i*(pw/Math.max(1,cats.length-1)):ml+a.i*b.step+b.step/2),cy=horiz?mt+a.i*b.step+b.step/2:Y(a.v);out+=`<g class="ann"><line x1="${cx}" y1="${cy-6}" x2="${cx+(a.dx||0)}" y2="${cy-(a.dy||28)}" stroke="${a.color||T.fg}" stroke-width="1"/><text x="${cx+(a.dx||0)}" y="${cy-(a.dy||28)-5}" text-anchor="${a.anchor||"middle"}" fill="${a.color||T.fg}" font-size="${fs*.95}" font-weight="600">${esc(a.text)}</text></g>`});
  if(s.extra)out+=s.extra(ctx);
  el.innerHTML=out+"</svg>";bindTips()}
 function bindTips(){const s=api.spec;if(!s.onClick)return;el.querySelectorAll(".mk").forEach(m=>{m.style.cursor="pointer";m.addEventListener("click",()=>s.onClick(+m.dataset.i))})}
 function path(pts,c,w,dash){let d="",pen=false;pts.forEach(p=>{if(!p){pen=false;return}d+=(pen?"L":"M")+p[0].toFixed(1)+","+p[1].toFixed(1);pen=true});return`<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${dash?`stroke-dasharray="${dash}"`:""}/>`}
 function marker(p,c,si,r){const shapes=["circle","square","tri","diamond"];const sh=api.spec.markerShapes?shapes[si%4]:"circle";if(sh==="square")return`<rect x="${p[0]-r}" y="${p[1]-r}" width="${r*2}" height="${r*2}" fill="${c}"/>`;if(sh==="tri")return`<polygon points="${p[0]},${p[1]-r*1.2} ${p[0]+r*1.1},${p[1]+r*.8} ${p[0]-r*1.1},${p[1]+r*.8}" fill="${c}"/>`;if(sh==="diamond")return`<polygon points="${p[0]},${p[1]-r*1.3} ${p[0]+r*1.1},${p[1]} ${p[0]},${p[1]+r*1.3} ${p[0]-r*1.1},${p[1]}" fill="${c}"/>`;return`<circle cx="${p[0]}" cy="${p[1]}" r="${r}" fill="${c}"/>`}
 function trunc(t,w,fs){t=String(t);const max=Math.floor(w/(fs*.56));return t.length>max?t.slice(0,Math.max(3,max-1))+"…":t}
 function catLabels(cats,xf,y,rot,T,fs,s){const every=s.labelEvery||Math.max(1,Math.ceil(cats.length/(s.maxLabels||(rot?12:40))));return cats.map((c,i)=>i%every?"":rot?`<text transform="translate(${xf(i)+fs*.3},${y+8}) rotate(-40)" text-anchor="end" fill="${s.highlight===i?T.fg:T.muted}" font-size="${fs}">${esc(c)}</text>`:`<text x="${xf(i)}" y="${y+fs*1.35}" text-anchor="middle" fill="${s.highlight===i?T.fg:T.muted}" font-size="${fs}" ${s.highlight===i?'font-weight="700"':""}>${esc(c)}</text>`).join("")}
 function legendRow(series,pal,T,fs,x,y,W,s){let o="",cx=x;series.forEach((ser,si)=>{const c=s.highlight!=null&&s.highlight!==si?T.gray:(ser.color||pal[si%pal.length]);const t=esc(ser.name),w=textW(ser.name,fs)+fs*2.2;if(cx+w>W-8){cx=x;y+=fs*1.4}o+=`<rect x="${cx}" y="${y-fs*.8}" width="${fs*.9}" height="${fs*.9}" rx="2" fill="${c}"/><text x="${cx+fs*1.3}" y="${y}" fill="${T.muted}" font-size="${fs}">${t}</text>`;cx+=w});return o}
 function drawPie(s,T,W,H,top,fs,pal){const vals=s.values||[],cats=s.cats||[],tot=vals.reduce((a,b)=>a+Math.max(0,b),0)||1;const legW=s.legend==="none"||s.labels==="outside"?0:Math.min(W*.42,Math.max(...cats.map(c=>textW(c,fs)))+fs*5);const R=Math.max(40,Math.min((W-legW)/2-20,(H-top)/2-14)),cx=(W-legW)/2,cy=top+(H-top)/2;let a=-Math.PI/2,o="";
  vals.forEach((v,i)=>{const f=Math.max(0,v)/tot,b=a+f*Math.PI*2,large=f>.5?1:0,c=s.highlight!=null?(i===s.highlight?pal[0]:T.gray):(s.colorFn?s.colorFn(i):pal[i%pal.length]);const p=(r,t)=>[cx+r*Math.cos(t),cy+r*Math.sin(t)];const[x0,y0]=p(R,a),[x1,y1]=p(R,b);
   if(f>=.9999)o+=`<circle cx="${cx}" cy="${cy}" r="${R}" fill="${c}"><title>${esc(cats[i]+": "+(s.fmt||fmtN)(v))}</title></circle>`;
   else o+=`<path class="mk" data-i="${i}" d="M${cx},${cy}L${x0},${y0}A${R},${R} 0 ${large} 1 ${x1},${y1}Z" fill="${c}" stroke="${s.theme==="light"?"#fff":"#0D131E"}" stroke-width="1.2"><title>${esc(cats[i]+": "+(s.fmt||fmtN)(v)+" ("+(f*100).toFixed(1)+"%)")}</title></path>`;
   if(s.labels&&f>.035){const[lx,ly]=p(s.type==="donut"?R*.78:R*.64,(a+b)/2);o+=`<text x="${lx}" y="${ly+fs*.35}" text-anchor="middle" fill="#0B111C" font-size="${fs*.9}" font-weight="700">${s.labels==="value"?esc((s.fmt||fmtN)(v)):Math.round(f*100)+"%"}</text>`}
   a=b});
  if(s.type==="donut")o+=`<circle cx="${cx}" cy="${cy}" r="${R*.55}" fill="${s.theme==="light"?"#fff":(s.hole||"#121A28")}"/>`+(s.center?`<text x="${cx}" y="${cy+fs*.4}" text-anchor="middle" fill="${T.fg}" font-size="${fs*1.3}" font-weight="700">${esc(s.center)}</text>`:"");
  if(legW)cats.forEach((c,i)=>{const y=cy-cats.length*fs*.8+i*fs*1.6+fs;o+=`<rect x="${W-legW+4}" y="${y-fs*.8}" width="${fs*.9}" height="${fs*.9}" fill="${s.highlight!=null?(i===s.highlight?pal[0]:T.gray):(s.colorFn?s.colorFn(i):pal[i%pal.length])}"/><text x="${W-legW+fs*1.6}" y="${y}" fill="${T.muted}" font-size="${fs}">${esc(c)}</text>`});
  return o}
 draw();
 new ResizeObserver(()=>{if(Math.abs((el.clientWidth||0)-w0)>4)draw()}).observe(el);
 return api}

/* bullet graph: qualitative bands, a bar for the actual value and a tick for the target */
function bullet(o){const W=o.w||320,H=o.h||38,T=THEMES[o.theme||"dark"],max=o.max,X=v=>8+Math.max(0,Math.min(1,v/max))*(W-16),bands=o.bands||[];
 const shades=o.theme==="light"?["#BDBDBD","#D9D9D9","#F0F0F0"]:["#3A4558","#2C3648","#222B3A"];
 let s=`<svg viewBox="0 0 ${W} ${H+(o.axis?16:0)}" width="100%" height="${H+(o.axis?16:0)}" role="img" aria-label="${esc(o.label||"Bullet graph")}">`;
 let prev=0;bands.forEach((b,i)=>{s+=`<rect x="${X(prev)}" y="0" width="${X(b)-X(prev)}" height="${H}" fill="${shades[i%3]}"/>`;prev=b});
 s+=`<rect x="${X(0)}" y="${H*.36}" width="${X(o.value)-X(0)}" height="${H*.28}" fill="${o.color||(o.theme==="light"?"#262626":"#E7EBF3")}"/>`;
 if(o.target!=null)s+=`<rect x="${X(o.target)-1.5}" y="${H*.16}" width="3" height="${H*.68}" fill="${o.targetColor||"#F5B83D"}"/>`;
 if(o.axis)ticks(0,max,o.nt||6).forEach(v=>{if(v>max)return;s+=`<text x="${X(v)}" y="${H+13}" text-anchor="middle" font-size="10" fill="${T.muted}">${esc((o.fmt||fmtN)(v))}</text>`});
 return s+"</svg>"}
/* sparkline */
function spark(vals,o){o=o||{};const W=o.w||110,H=o.h||26,mn=Math.min(...vals),mx=Math.max(...vals),X=i=>2+i/(vals.length-1)*(W-6),Y=v=>H-3-(v-mn)/(mx-mn||1)*(H-6);
 const d=vals.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+","+Y(v).toFixed(1)).join("");const li=vals.length-1;
 return`<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true">${o.band?`<rect x="0" y="${Y(o.band[1])}" width="${W}" height="${Math.abs(Y(o.band[0])-Y(o.band[1]))}" fill="${o.bandColor||"#2A3852"}"/>`:""}<path d="${d}" fill="none" stroke="${o.color||"#97A3BA"}" stroke-width="${o.sw||1.4}"/><circle cx="${X(li)}" cy="${Y(vals[li])}" r="2.2" fill="${o.end||o.color||"#E7EBF3"}"/></svg>`}

/* small data helpers */
function groupSum(rows,key,val,agg){const m=new Map();rows.forEach(r=>{const k=typeof key==="function"?key(r):r[key];const v=typeof val==="function"?val(r):r[val];if(!m.has(k))m.set(k,{s:0,n:0,mx:-Infinity,mn:Infinity});const o=m.get(k);o.s+=+v||0;o.n++;o.mx=Math.max(o.mx,+v);o.mn=Math.min(o.mn,+v)});return[...m.entries()].map(([k,o])=>[k,agg==="count"?o.n:agg==="avg"?o.s/o.n:agg==="max"?o.mx:agg==="min"?o.mn:o.s])}

window.DVZ={chart,bullet,spark,PAL,EXCEL,THEMES,fmtN,ticks,simulate,dE,luminance,mix,hexRgb,rgbHex,seqRamp,divRamp,groupSum,esc};
})();
