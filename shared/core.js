/* notewithliqi · shared engine for every subject page.
   Loaded after the subject's data.js (which defines SUBJ, QZ, QCH, GL and optional CM/CE/CMC, DR_*),
   and before its labs.js (which builds the subject's own visuals and calls NL.start). */
(function(){
"use strict";
const S=window.SUBJ||(typeof SUBJ!=="undefined"?SUBJ:{});
const K=n=>(S.keys&&S.keys[n])||(S.prefix||"nl-")+n;
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const reduced=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
const CH=[...document.querySelectorAll("section.chapter[data-ch]")].map(el=>({n:+el.dataset.ch,name:el.dataset.name,el}));
const store={get(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};

const sleep=ms=>new Promise(r=>setTimeout(r,reduced?Math.min(ms,250):ms));

let qi=0,score=0,answered=false,order=[],missed=[],qf=0;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function startQuiz(){[...$("#quiz-f").children].forEach(b=>b.classList.toggle("on",+b.dataset.v===qf));order=shuffle(QZ.map((q,i)=>i).filter(i=>!qf||QCH[i]===qf)).slice(0,20).map(i=>{const q=QZ[i];const opts=shuffle(q[1].map((o,j)=>[o,j===q[2]]));return[q[0],opts.map(o=>o[0]),opts.findIndex(o=>o[1]),q[3]]});qi=0;score=0;missed=[];drawQ()}
function drawQ(){const box=$("#quiz-box");const QZS=order;
 if(qi>=QZS.length){box.innerHTML=`<div class="q-text">You scored ${score} / ${QZS.length}</div><p class="q-exp">${score>=QZS.length*.85?"Strong. Revisit any you missed below.":score>=QZS.length*.6?(S.quizTip||"Good base. Revisit the labs and exam tips, then try again."):"Work through the labs, exam tips and slide notes, then retry."}</p>${missed.length?`<span class="kicker" style="font-family:var(--f-mono);font-size:.7rem;color:var(--rose);text-transform:uppercase;letter-spacing:.08em">Review what you missed</span><ul class="q-review">${missed.map(m=>`<li><b>${esc(m[0])}</b>Answer: ${esc(m[1])}. ${esc(m[2])}</li>`).join("")}</ul>`:""}<div class="controls"><button class="btn primary" id="q-restart">New attempt</button></div>`;$("#q-restart").onclick=startQuiz;return}
 const q=QZS[qi];answered=false;
 box.innerHTML=`<div class="q-meta"><span>Question ${qi+1} of ${QZS.length}</span><span>Score ${score}</span></div><div class="q-prog"><i style="width:${qi/QZS.length*100}%"></i></div><div class="q-text">${esc(q[0])}</div><div class="q-opts">${q[1].map((o,i)=>`<button type="button" data-i="${i}">${esc(o)}</button>`).join("")}</div><p class="q-exp" id="q-exp"></p><div class="controls"><button class="btn primary" id="q-next" disabled>Next question</button></div>`;
 box.querySelectorAll(".q-opts button").forEach(b=>b.onclick=()=>{if(answered)return;answered=true;const i=+b.dataset.i;if(i===q[2])score++;else missed.push([q[0],q[1][q[2]],q[3]]);box.querySelectorAll(".q-opts button").forEach((x,j)=>{if(j===q[2])x.classList.add("right");else if(j===i)x.classList.add("wrong")});$("#q-exp").textContent=(i===q[2]?"Correct. ":"Not quite. ")+q[3];$("#q-next").disabled=false;$("#q-next").focus()});
 $("#q-next").onclick=()=>{qi++;drawQ()}}
[["All chapters",0],...CH.map(c=>["Chapter "+c.n,c.n])].forEach(([t,v])=>{const n=QZ.filter((q,i)=>!v||QCH[i]===v).length;const b=document.createElement("button");b.className="btn";b.type="button";b.textContent=`${t} · ${n} in bank`;b.dataset.v=v;b.onclick=()=>{qf=v;startQuiz()};$("#quiz-f").appendChild(b)});
startQuiz();


let gf=0,gview="list",fcPool=[],fcQueue=[],fcCur=null;const gfEl=$("#gloss-f");
[["All",0],...CH.map(c=>["Chapter "+c.n,c.n])].forEach(([t,v])=>{const b=document.createElement("button");b.className="btn";b.type="button";b.textContent=t;b.dataset.v=v;b.onclick=()=>{gf=v;drawGloss()};gfEl.appendChild(b)});
function glossRows(){const q=$("#gloss-q").value.trim().toLowerCase();return GL.filter(g=>(!gf||g[1]===gf)&&(!q||g[0].toLowerCase().includes(q)||g[2].toLowerCase().includes(q))).sort((a,b)=>a[0].localeCompare(b[0]))}
/* spaced repetition (Leitner boxes 1-5): right answers move a card up a box and push its next review further away */
const BOX_DAYS=[0,0,1,3,7,16],DAY=864e5;
let srs=store.get(K("srs"))||{};const saveSrs=()=>store.set(K("srs"),srs);
function buildQueue(rows){const now=Date.now(),all=$("#fc-all").checked,due=[],fresh=[],later=[];
 rows.forEach(g=>{const r=srs[g[0]];if(!r)fresh.push(g);else if(r.due<=now)due.push(g);else later.push(g)});
 due.sort((a,b)=>srs[a[0]].box-srs[b[0]].box||srs[a[0]].due-srs[b[0]].due);
 return[...due,...shuffle(fresh),...(all?later.sort((a,b)=>srs[a[0]].due-srs[b[0]].due):[])]}
function drawGloss(){[...gfEl.children].forEach(b=>b.classList.toggle("on",+b.dataset.v===gf));const rows=glossRows();
 $("#gloss").innerHTML=rows.map(g=>`<div><dt>${esc(g[0])}<span>CH ${g[1]}</span></dt><dd>${esc(g[2])}</dd></div>`).join("");
 $("#gloss").hidden=gview!=="list";$("#fc").hidden=gview!=="cards";$("#gloss-empty").hidden=rows.length>0;
 fcPool=rows;fcQueue=buildQueue(rows);drawCard()}
const fmtDue=t=>{const d=Math.ceil((t-Date.now())/DAY);return d<=1?"tomorrow":`in ${d} days`};
function drawStats(){const now=Date.now();let due=0,fresh=0,m=0;const bx=[0,0,0,0,0];
 fcPool.forEach(g=>{const r=srs[g[0]];if(!r)fresh++;else{if(r.due<=now)due++;bx[r.box-1]++;if(r.box>=5)m++}});const mx=Math.max(1,...bx);
 $("#fc-stats").innerHTML=`<span><b>${due}</b> due</span><span><b>${fresh}</b> new</span><span><b>${m}</b> mastered</span><span class="fc-boxes" title="Cards in boxes 1 to 5 (box 5 = mastered)">${bx.map((n,i)=>`<i style="height:${Math.max(2,n/mx*28)}px" title="Box ${i+1}: ${n}"></i>`).join("")}</span>`}
function drawCard(){const c=$("#fc-card");c.classList.remove("flip");drawStats();fcCur=fcQueue[0]||null;
 $("#fc-again").disabled=$("#fc-good").disabled=true;const done=!fcCur;c.hidden=done;$("#fc-rate").hidden=done;$("#fc-done").hidden=!done;
 if(done){const now=Date.now(),nx=fcPool.map(g=>srs[g[0]]).filter(r=>r&&r.due>now).map(r=>r.due).sort((a,b)=>a-b)[0];
  $("#fc-done").innerHTML=fcPool.length?`<b style="font-family:var(--f-display);font-size:var(--s2);color:var(--fg)">All caught up</b><span>${nx?`Your next card is due ${fmtDue(nx)}. `:""}Tick "Include cards that aren't due yet" to keep practising.</span>`:"<span>No cards match this filter.</span>";return}
 const r=srs[fcCur[0]];$("#fc-term").textContent=fcCur[0];$("#fc-ch").textContent=`Chapter ${fcCur[1]} · ${r?"Box "+r.box:"New card"}`;$("#fc-def").textContent=fcCur[2];$("#fc-pos").textContent=`${fcQueue.length} in this session · did you remember it?`}
function rate(ok){if(!fcCur)return;const t=fcCur[0],r=srs[t],now=Date.now();fcQueue.shift();
 if(ok){const box=Math.min(5,(r?r.box:1)+1);srs[t]={box,due:now+BOX_DAYS[box]*DAY}}
 else{srs[t]={box:1,due:now};fcQueue.splice(Math.min(3,fcQueue.length),0,fcCur)}
 saveSrs();drawCard()}
$("#fc-card").onclick=()=>{const f=$("#fc-card").classList.toggle("flip");if(f){$("#fc-again").disabled=$("#fc-good").disabled=false}};
$("#fc-again").onclick=()=>rate(false);$("#fc-good").onclick=()=>rate(true);
$("#fc-skip").onclick=()=>{if(fcQueue.length>1){fcQueue.push(fcQueue.shift());drawCard()}};
$("#fc-all").addEventListener("change",drawGloss);
$("#gloss-v").querySelectorAll("button").forEach(b=>b.onclick=()=>{gview=b.dataset.v;$("#gloss-v").querySelectorAll("button").forEach(x=>x.setAttribute("aria-pressed",x===b));drawGloss()});
$("#gloss-q").addEventListener("input",drawGloss);drawGloss();


/* ---------- sidebar, top nav, progress, scrollspy ---------- */
const topics=[...document.querySelectorAll("article.topic")].filter(a=>a.querySelector(".tnum"));
let learned=new Set(store.get(K("learned"))||[]);
const side=$("#side-nav");const sgs={};
const chName=n=>{const c=CH.find(x=>String(x.n)===String(n));return c?c.name:""};
topics.forEach(t=>{const n=t.querySelector(".tnum").textContent.trim();if(!t.id)t.id="t-"+n.replace(".","-");const h=t.querySelector("h3").textContent;
 const ch=n.split(".")[0];t.dataset.ch=ch;
 if(!sgs[ch]){side.insertAdjacentHTML("beforeend",`<a class="sh" href="#ch${ch}" data-g="ch${ch}">Chapter ${ch} · ${esc(chName(ch))}</a><div class="sg" data-g="ch${ch}"></div>`);sgs[ch]=side.querySelector(`.sg[data-g="ch${ch}"]`)}
 sgs[ch].insertAdjacentHTML("beforeend",`<a href="#${t.id}" data-t="${t.id}"><span class="n">${n}</span><span>${esc(h)}</span></a>`);
 const b=document.createElement("button");b.type="button";b.className="mark";b.dataset.t=t.id;b.onclick=()=>{learned.has(t.id)?learned.delete(t.id):learned.add(t.id);store.set(K("learned"),[...learned]);syncLearned()};t.querySelector(".topic-head").appendChild(b)});
const XP=(S.pages||[]).filter(p=>document.querySelector(`[data-view="${p.v}"]`));
XP.forEach(p=>{const items=[...document.querySelectorAll(`[data-view="${p.v}"] [data-side][id]`)];side.insertAdjacentHTML("beforeend",`<a class="sh" href="#${p.v}" data-g="${p.v}">${esc(p.label)}</a><div class="sg" data-g="${p.v}">${items.map(el=>`<a href="#${el.id}"><span class="n">${esc(el.dataset.n||"·")}</span><span>${esc(el.dataset.side)}</span></a>`).join("")}</div>`)});
side.insertAdjacentHTML("beforeend",`<a class="sh" href="#practice" data-g="practice">Practice</a><div class="sg" data-g="practice">${(S.practice||[]).map(([h,n,l])=>`<a href="${h}"><span class="n">${n}</span><span>${l}</span></a>`).join("")}</div>`);
/* top nav: one link per chapter page (new chapters appear automatically) + Practice */
const topnav=$("#topnav");
topnav.innerHTML=CH.map(c=>`<a href="#ch${c.n}" data-nav="ch${c.n}" title="Chapter ${c.n} · ${esc(c.name)}"><span>Chapter ${c.n}</span><i class="np"><b style="width:0"></b></i></a>`).join("")+XP.map(p=>`<a href="#${p.v}" data-nav="${p.v}" title="${esc(p.label)}"><span>${esc(p.nav||p.label)}</span><i class="np" style="visibility:hidden"><b></b></i></a>`).join("")+`<a href="#practice" data-nav="practice"><span>Practice</span><i class="np" style="visibility:hidden"><b></b></i></a>`;
CH.forEach(c=>{c.el.querySelector(".ch-head").insertAdjacentHTML("beforeend",`<div class="ch-prog"><span class="cp-t"></span><span class="ptrack"><i style="width:0"></i></span></div>`)});
/* home page chapter cards */
$("#home-toc").innerHTML=CH.map(c=>`<a href="#ch${c.n}" data-toc="${c.n}"><b>Chapter ${c.n} · ${esc(c.el.dataset.title||c.name)}</b><small>${esc(c.el.dataset.sub||"")}</small><span class="tp"><span><i style="width:0"></i></span><em class="tpn" style="font-style:normal"></em></span><span class="go">Open chapter →</span></a>`).join("")+XP.map(p=>`<a href="#${p.v}" class="xp"><b>${esc(p.label)}</b><small>${esc(p.sub||"")}</small><span class="go">Open →</span></a>`).join("")+`<a href="#practice"><b>Practice</b><small>${S.practiceBlurb?S.practiceBlurb(QZ.length):`Glossary &amp; flashcards, ${QZ.length}-question quiz`}</small><span class="go">Open practice →</span></a>`;
/* previous / next chapter links */
const PAGES=[...CH.map(c=>({v:"ch"+c.n,label:`Chapter ${c.n} · ${c.name}`})),...XP.map(p=>({v:p.v,label:p.label})),{v:"practice",label:"Practice"}];
PAGES.forEach((pg,i)=>{const el=document.querySelectorAll(`[data-view="${pg.v}"]`);const host=el[el.length-1];const pv=PAGES[i-1],nx=PAGES[i+1];
 host.insertAdjacentHTML("beforeend",`<nav class="pager" aria-label="Chapter pages">${pv?`<a href="#${pv.v}"><small>← Previous</small><b>${esc(pv.label)}</b></a>`:`<a href="#home"><small>← Back to</small><b>Home</b></a>`}${nx?`<a class="next" href="#${nx.v}"><small>Next →</small><b>${esc(nx.label)}</b></a>`:""}</nav>`)});
function syncLearned(){topics.forEach(t=>{const on=learned.has(t.id);t.classList.toggle("done",on);const b=t.querySelector(".mark");b.setAttribute("aria-pressed",on);b.textContent=on?"Learned ✓":"Mark learned";const a=side.querySelector(`a[data-t="${t.id}"]`);a&&a.classList.toggle("done",on)});
 const k=topics.filter(t=>learned.has(t.id)).length;$("#prog-num").textContent=`${k} of ${topics.length} topics learned`;$("#prog-bar").style.width=(k/topics.length*100)+"%";
 CH.forEach(c=>{const ts=topics.filter(t=>t.dataset.ch===String(c.n)),d=ts.filter(t=>learned.has(t.id)).length,pct=ts.length?d/ts.length*100:0;
  const nb=topnav.querySelector(`[data-nav="ch${c.n}"] .np b`);if(nb)nb.style.width=pct+"%";const cp=c.el.querySelector(".ch-prog");cp.querySelector(".cp-t").textContent=`${d} / ${ts.length} learned`;cp.querySelector("i").style.width=pct+"%";
  const tc=$(`#home-toc [data-toc="${c.n}"]`);if(tc){tc.querySelector(".tp i").style.width=pct+"%";tc.querySelector(".tpn").textContent=`${d}/${ts.length}`}})}
$("#prog-reset").onclick=()=>{learned=new Set();store.set(K("learned"),[]);syncLearned()};
syncLearned();
const spy=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting){side.querySelectorAll(".sg a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")==="#"+e.target.id))}})},{rootMargin:"-30% 0px -60% 0px"});
topics.forEach(t=>spy.observe(t));(S.practice||[]).map(p=>document.getElementById(p[0].slice(1))).filter(Boolean).forEach(el=>spy.observe(el));
/* router: home, one page per chapter, practice */
const VIEWS=["home",...PAGES.map(p=>p.v)];const baseTitle=document.title;
function resolve(){const id=decodeURIComponent(location.hash.slice(1));if(!id||id==="home")return{v:"home"};if(VIEWS.includes(id))return{v:id};
 const el=document.getElementById(id);const host=el&&el.closest("[data-view]");return host?{v:host.dataset.view,el}:{v:"home"}}
let curView=null,bgSet=null;
const jump=f=>{const h=document.documentElement;h.style.scrollBehavior="auto";f();h.style.scrollBehavior=""};
function route(){const r=resolve(),v=r.v,changed=v!==curView;curView=v;bgSet&&bgSet(v);
 document.querySelectorAll("[data-view]").forEach(s=>s.hidden=s.dataset.view!==v);
 topnav.querySelectorAll("a").forEach(a=>a.classList.toggle("active",a.dataset.nav===v));
 side.querySelectorAll(".sg").forEach(g=>g.hidden=g.dataset.g!==v);side.querySelectorAll(".sh").forEach(g=>g.classList.toggle("cur",g.dataset.g===v));
 const pg=PAGES.find(p=>p.v===v);document.title=pg?`${pg.label} · ${baseTitle}`:baseTitle;
 if(v!=="home")store.set(K("last"),location.hash);else drawResume();
 document.body.classList.remove("side-open");syncSideBtn();
 const target=r.el&&r.el.id!==v?r.el:null;
 requestAnimationFrame(()=>{if(target){if(changed)jump(()=>target.scrollIntoView());else target.scrollIntoView({behavior:reduced?"auto":"smooth"})}else if(changed){jump(()=>window.scrollTo(0,0));setTimeout(()=>{if(!userMoved&&curView===v)jump(()=>window.scrollTo(0,0))},60)}onScroll()});userMoved=false;if(target){[350,900,1800].forEach(ms=>setTimeout(()=>{if(!userMoved&&curView===v)jump(()=>target.scrollIntoView())},ms))}}
let userMoved=false;["wheel","touchstart","keydown"].forEach(ev=>window.addEventListener(ev,()=>{userMoved=true},{passive:true}));
function drawResume(){const h=store.get(K("last")),el=$("#resume");if(!h||h==="#home"){el.hidden=true;return}const id=h.slice(1),t=document.getElementById(id);if(!t){el.hidden=true;return}
 const tp=t.matches("article.topic")?t:t.closest("article.topic");const host=t.closest("[data-view]");const pg=PAGES.find(p=>p.v===(host&&host.dataset.view));
 const what=tp?`${tp.querySelector(".tnum").textContent} ${tp.querySelector("h3").textContent}`:(pg?pg.label:"");
 el.innerHTML=`<a href="${esc(h)}">Continue where you left off <small>${esc(what)}</small></a>`;el.hidden=false}
/* remember the topic being read, so "Continue" returns to it */
const readSpy=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting&&curView!=="home")store.set(K("last"),"#"+e.target.id)})},{rootMargin:"-40% 0px -55% 0px"});
topics.forEach(t=>readSpy.observe(t));
/* sidebar toggle: hide on desktop, drawer on narrow screens */
const sideBtn=$("#side-btn"),wide=()=>window.matchMedia("(min-width:1100px)").matches;
function syncSideBtn(){sideBtn.setAttribute("aria-expanded",wide()?!document.body.classList.contains("side-hidden"):document.body.classList.contains("side-open"))}
if(store.get(K("side-hidden")))document.body.classList.add("side-hidden");
sideBtn.onclick=()=>{if(wide()){const h=document.body.classList.toggle("side-hidden");store.set(K("side-hidden"),h)}else document.body.classList.toggle("side-open");syncSideBtn()};
$("#scrim").onclick=()=>{document.body.classList.remove("side-open");syncSideBtn()};
side.addEventListener("click",e=>{if(e.target.closest("a")&&!wide()){document.body.classList.remove("side-open");syncSideBtn()}});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&document.body.classList.contains("side-open")){document.body.classList.remove("side-open");syncSideBtn();sideBtn.focus()}});
window.addEventListener("resize",syncSideBtn);syncSideBtn();
const rb=$("#readbar"),totop=$("#totop");const onScroll=()=>{const h=document.documentElement;const max=h.scrollHeight-h.clientHeight;rb.style.width=(max>0?h.scrollTop/max*100:0)+"%";totop.hidden=h.scrollTop<900};window.addEventListener("scroll",onScroll,{passive:true});onScroll();
totop.onclick=()=>window.scrollTo({top:0,behavior:reduced?"auto":"smooth"});
window.addEventListener("hashchange",route);route();


/* ---------- recall mode: blur key definitions until tapped ---------- */
const rc=$("#recall");rc.checked=!!store.get(K("recall"));document.body.classList.toggle("recall",rc.checked);
rc.addEventListener("change",()=>{document.body.classList.toggle("recall",rc.checked);store.set(K("recall"),rc.checked);document.querySelectorAll(".def.shown,.gloss dd.shown").forEach(e=>e.classList.remove("shown"))});
document.addEventListener("click",e=>{if(!document.body.classList.contains("recall"))return;const d=e.target.closest(".def:not(.shown),.gloss dd:not(.shown)");if(d){d.classList.add("shown");e.preventDefault()}},true);

/* ---------- check yourself: 3 retrieval questions at the end of each chapter ---------- */
CH.forEach(c=>{const ids=QZ.map((q,i)=>i).filter(i=>QCH[i]===c.n);const pager=c.el.querySelector(".pager");if(!ids.length||!pager)return;
 const box=document.createElement("div");box.className="cy";pager.before(box);
 const draw=()=>{const pick=shuffle(ids).slice(0,3);
  box.innerHTML=`<div class="cy-head"><h3>Check yourself</h3><span style="font-family:var(--f-mono);font-size:.72rem;color:var(--muted)">${pick.length} questions from Chapter ${c.n} · answer before scrolling back up</span></div>`+pick.map(i=>{const q=QZ[i],opts=shuffle(q[1].map((o,j)=>[o,j===q[2]]));return`<div class="cy-q"><b>${esc(q[0])}</b><div class="cy-o">${opts.map(o=>`<button type="button" data-ok="${o[1]?1:0}">${esc(o[0])}</button>`).join("")}</div><p class="cy-e" hidden data-x="${esc(q[3])}"></p></div>`}).join("")+`<div class="controls"><button class="btn" type="button" data-act="new">New questions</button><a class="btn ghost" href="#quiz" data-act="quiz" style="text-decoration:none">Full Chapter ${c.n} quiz →</a></div>`};
 box.addEventListener("click",e=>{const b=e.target.closest(".cy-o button");
  if(b){const q=b.closest(".cy-q");if(q.dataset.done)return;q.dataset.done=1;const ok=b.dataset.ok==="1";q.querySelectorAll(".cy-o button").forEach(x=>{if(x.dataset.ok==="1")x.classList.add("right");else if(x===b)x.classList.add("wrong")});const ex=q.querySelector(".cy-e");ex.textContent=(ok?"Correct. ":"Not quite. ")+ex.dataset.x;ex.hidden=false;return}
  const a=e.target.closest("[data-act]");if(!a)return;if(a.dataset.act==="new")draw();else{qf=c.n;startQuiz()}});
 draw()});


if($("#exam-box")){
/* ---------- timed exam: equal questions per chapter, no feedback until submit ---------- */
const EXB=$("#exam-box");let EXS=null;
function examHome(){clearInterval(EXS&&EXS.tm);EXS=null;const last=store.get(K("exam-last"));
 EXB.innerHTML=`<div class="topic-head"><h3>Timed exam</h3></div><p class="sub">Mixed questions from every chapter, the same number from each, against the clock. You get no feedback until you submit, like the real exam. Then you see a score for each chapter, so you know what to revise next.</p>${last?`<p class="sub">Last attempt: <b style="color:var(--fg)">${last.pct}%</b> · ${esc(last.when)} · weakest: ${esc(last.weak)}</p>`:""}<div class="exam-modes"><button type="button" data-n="${CH.length*5}" data-m="15"><b>Short exam</b><small>${CH.length*5} questions · 15 minutes</small></button><button type="button" data-n="${CH.length*10}" data-m="30"><b>Full exam</b><small>${CH.length*10} questions · 30 minutes</small></button></div>`;
 EXB.querySelectorAll(".exam-modes button").forEach(b=>b.onclick=()=>examStart(+b.dataset.n,+b.dataset.m))}
function examStart(n,min){const per=Math.max(1,Math.round(n/CH.length));let ids=[];CH.forEach(c=>{ids=ids.concat(shuffle(QZ.map((q,i)=>i).filter(i=>QCH[i]===c.n)).slice(0,per))});
 const qs=shuffle(ids).map(i=>{const q=QZ[i],o=shuffle(q[1].map((t,j)=>[t,j===q[2]]));return{i,ch:QCH[i],q:q[0],opts:o.map(x=>x[0]),ans:o.findIndex(x=>x[1]),exp:q[3]}});
 EXS={qs,pick:qs.map(()=>-1),cur:0,end:Date.now()+min*60000,confirm:false};EXS.tm=setInterval(examTick,1000);examDraw()}
function examTick(){if(!EXS)return;const left=Math.max(0,EXS.end-Date.now()),c=EXB.querySelector(".exam-clock");if(c){c.textContent=`${String(Math.floor(left/60000)).padStart(2,"0")}:${String(Math.floor(left/1000)%60).padStart(2,"0")}`;c.classList.toggle("low",left<60000)}if(!left)examSubmit()}
function examDraw(){const E=EXS,q=E.qs[E.cur],un=E.pick.filter(p=>p<0).length;
 EXB.innerHTML=`<div class="exam-top"><span style="font-family:var(--f-mono);font-size:.78rem;color:var(--muted)">Question ${E.cur+1} of ${E.qs.length} · Chapter ${q.ch}</span><span class="exam-clock" aria-live="off"></span></div>
 <div class="exam-dots">${E.qs.map((x,i)=>`<button type="button" data-g="${i}" class="${E.pick[i]>=0?"ans":""} ${i===E.cur?"cur":""}" aria-label="Question ${i+1}${E.pick[i]>=0?", answered":""}">${i+1}</button>`).join("")}</div>
 <div class="q-text">${esc(q.q)}</div><div class="exam-opts">${q.opts.map((o,j)=>`<button type="button" data-o="${j}" class="${E.pick[E.cur]===j?"pick":""}">${esc(o)}</button>`).join("")}</div>
 <div class="controls"><button class="btn" type="button" data-a="prev" ${E.cur?"":"disabled"}>Back</button><button class="btn" type="button" data-a="next" ${E.cur<E.qs.length-1?"":"disabled"}>Next</button><button class="btn primary" type="button" data-a="submit">${E.confirm&&un?`${un} unanswered. Submit anyway?`:"Submit exam"}</button><button class="btn ghost" type="button" data-a="quit">Quit</button></div>`;examTick()}
EXB.addEventListener("click",e=>{if(!EXS)return;const E=EXS,o=e.target.closest("[data-o]"),g=e.target.closest("[data-g]"),a=e.target.closest("[data-a]");
 if(o){E.pick[E.cur]=+o.dataset.o;E.confirm=false;if(E.cur<E.qs.length-1)E.cur++;examDraw();return}
 if(g){E.cur=+g.dataset.g;examDraw();return}
 if(!a)return;const act=a.dataset.a;
 if(act==="prev"&&E.cur){E.cur--;examDraw()}else if(act==="next"&&E.cur<E.qs.length-1){E.cur++;examDraw()}
 else if(act==="submit"){if(E.pick.some(p=>p<0)&&!E.confirm){E.confirm=true;examDraw()}else examSubmit()}else if(act==="quit")examHome()});
function examSubmit(){const E=EXS;if(!E)return;clearInterval(E.tm);EXS=null;const ok=E.qs.filter((q,i)=>E.pick[i]===q.ans).length,pct=Math.round(ok/E.qs.length*100);
 const per=CH.map(c=>{const qs=E.qs.map((q,i)=>[q,i]).filter(([q])=>q.ch===c.n),r=qs.filter(([q,i])=>E.pick[i]===q.ans).length;return{c,r,t:qs.length,p:qs.length?Math.round(r/qs.length*100):0}});
 const weak=[...per].sort((a,b)=>a.p-b.p)[0],wrong=E.qs.map((q,i)=>[q,i]).filter(([q,i])=>E.pick[i]!==q.ans);
 store.set(K("exam-last"),{pct,when:new Date().toLocaleDateString(undefined,{day:"numeric",month:"short"}),weak:`Chapter ${weak.c.n} · ${weak.c.name}`});
 EXB.innerHTML=`<div class="exam-top"><div><div class="exam-score">${pct}%</div><span style="color:var(--muted)">${ok} of ${E.qs.length} correct</span></div><a class="btn primary" href="#ch${weak.c.n}" style="text-decoration:none">Revise Chapter ${weak.c.n} · ${esc(weak.c.name)} →</a></div>
 <div class="bars">${per.map(x=>`<div class="bar"><span class="name">Chapter ${x.c.n} · ${esc(x.c.name)}</span><div class="track"><div class="fill" style="width:${x.p}%;background:${x.p<50?"var(--rose)":x.p<75?"var(--amber)":"var(--teal)"}"></div></div><span class="v">${x.r}/${x.t}</span></div>`).join("")}</div>
 ${wrong.length?`<span class="kicker" style="font-family:var(--f-mono);font-size:.7rem;color:var(--rose);text-transform:uppercase;letter-spacing:.08em">Review what you missed</span><ul class="q-review">${wrong.map(([q,i])=>`<li><b>${esc(q.q)}</b>${E.pick[i]<0?"Not answered":"You chose: "+esc(q.opts[E.pick[i]])}. Answer: ${esc(q.opts[q.ans])}. ${esc(q.exp)}</li>`).join("")}</ul>`:`<p class="sub">A perfect score.</p>`}
 <div class="controls"><button class="btn" type="button" id="exam-again">Back to exam options</button></div>`;$("#exam-again").onclick=examHome}
examHome();

}

if($("#cmap")&&typeof CM!=="undefined"){
const cmEl=$("#cmap"),cmAt=k=>CM.find(n=>n.k===k);
cmEl.innerHTML=`<svg viewBox="0 0 1000 540" aria-hidden="true">${CE.map(([a,b,l],i)=>{const A=cmAt(a),B=cmAt(b);return`<line data-e="${i}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/><text data-e="${i}" x="${Math.round(A.x+(B.x-A.x)*.42)}" y="${Math.round(A.y+(B.y-A.y)*.42-8)}" text-anchor="middle">${esc(l)}</text>`}).join("")}</svg>`+CM.map(n=>`<button type="button" data-k="${n.k}" style="left:${n.x/10}%;top:${n.y/5.4}%;background:${CMC[n.c]}"><small>Chapter ${n.c}</small>${esc(n.t)}</button>`).join("");
function cmPick(k){const n=cmAt(k),links=CE.map((e,i)=>[e,i]).filter(([e])=>e[0]===k||e[1]===k),near=new Set([k,...links.map(([e])=>e[0]===k?e[1]:e[0])]);
 cmEl.querySelectorAll("button").forEach(b=>{b.classList.toggle("on",b.dataset.k===k);b.classList.toggle("dim",!near.has(b.dataset.k))});
 cmEl.querySelectorAll("[data-e]").forEach(x=>x.classList.toggle("on",links.some(([,i])=>i===+x.dataset.e)));
 $("#cmap-info").innerHTML=`<span class="kicker">Chapter ${n.c} · ${esc(chName(n.c))}</span><h4>${esc(n.t)}</h4><p>${esc(n.d)}</p><p><b style="color:var(--fg)">Connects to:</b> ${links.map(([e])=>{const o=cmAt(e[0]===k?e[1]:e[0]);return`${esc(o.t)} <span style="color:var(--dim)">(${esc(e[2])})</span>`}).join(" · ")}</p><a class="btn primary" href="${n.href}" style="text-decoration:none;justify-self:start">Open this topic →</a>`}
cmEl.addEventListener("click",e=>{const b=e.target.closest("[data-k]");if(b)cmPick(b.dataset.k)});cmPick(S.cmapStart&&cmAt(S.cmapStart)?S.cmapStart:CM[0].k);

}

/* ---------- first-time hints on the first lab you reach ---------- */
if(!store.get(K("coach"))){const coachIO=new IntersectionObserver(es=>{const hit=es.find(e=>e.isIntersecting&&e.intersectionRatio>=.6);if(!hit)return;coachIO.disconnect();const stg=hit.target;
  const c=document.createElement("div");c.className="coach";c.setAttribute("role","note");c.innerHTML=`<b>New here? Three moves</b><ul><li>Drag the model to rotate it</li><li>Tap any block to read about it</li><li>Use the buttons at the top right to switch 2D / 3D (where offered) or go full screen</li></ul><div class="controls"><button class="btn primary" type="button">Got it</button></div>`;
  stg.appendChild(c);const done=()=>{c.remove();store.set(K("coach"),1)};c.querySelector("button").onclick=done;stg.addEventListener("pointerdown",e=>{if(!c.contains(e.target))setTimeout(done,1200)},{once:true})},{threshold:[.6]});
 document.querySelectorAll(".stage").forEach(x=>coachIO.observe(x))}


if($("#drill")&&typeof DR_MCQ!=="undefined"){
/* ---------- state ---------- */
let drAns=store.get(K("ans"))||{};
DR_MCQ.forEach((m,i)=>{m.id=i;let seed=(i+1)*9301+49297;const rnd=()=>(seed=(seed*9301+49297)%233280)/233280;const ord=m.o.map((_,k)=>k);for(let k=ord.length-1;k>0;k--){const j=Math.floor(rnd()*(k+1));[ord[k],ord[j]]=[ord[j],ord[k]]}m.o=ord.map(k=>m.o[k]);m.a=ord.indexOf(m.a)});
const drTopics=[...new Set(DR_MCQ.map(m=>m.t))];
let drPool=[],drIdx=0,drOnlyWrong=false,drRetry=null,drResetArmed=false,drVis=false;
const drFill=(sel,list)=>{sel.innerHTML='<option value="all">All topics</option>'+list.map(t=>`<option>${esc(t)}</option>`).join("")};
drFill($("#dr-topic"),drTopics);drFill($("#dr-dtopic"),[...new Set(DR_DESC.map(d=>d.t))]);
function drBuild(){const t=$("#dr-topic").value;drPool=DR_MCQ.filter(m=>t==="all"||m.t===t);if(drOnlyWrong&&drRetry)drPool=drPool.filter(m=>drRetry.has(m.id));
 if($("#dr-order").value==="rnd"){for(let i=drPool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[drPool[i],drPool[j]]=[drPool[j],drPool[i]]}}
 drIdx=0;const fo=drPool.findIndex(m=>!drAns[m.id]);if(fo>0&&!drOnlyWrong)drIdx=fo;drRender()}
function drStats(){const neg=parseFloat($("#dr-neg").value);let c=0,w=0,sk=0;drPool.forEach(m=>{const a=drAns[m.id];if(!a)return;if(a.pick===-1)sk++;else if(a.pick===m.a)c++;else w++});
 $("#dr-s-c").textContent=c;$("#dr-s-w").textContent=w;$("#dr-s-s").textContent=sk;$("#dr-s-l").textContent=drPool.length-c-w-sk;$("#dr-s-score").textContent=(Math.round((c-w*neg)*100)/100)+" / "+drPool.length;
 const n=c+w,acc=$("#dr-s-acc");if(n){const pc=Math.round(c/n*100);acc.textContent=pc+"%";acc.style.color=pc>=75?"var(--teal)":pc>=50?"var(--amber)":"var(--rose)";$("#dr-s-accn").textContent=`${c} of ${n} answered`}else{acc.textContent="–";acc.style.color="";$("#dr-s-accn").textContent="no answers yet"}}
function drRender(){const card=$("#dr-card");
 if(!drPool.length){card.innerHTML=`<div class="dr-done"><h3>Nothing here</h3><p class="sub">${drOnlyWrong?"No wrong answers in this topic. Nice.":"No questions match this filter."}</p><button class="btn primary" type="button" id="dr-all">Show all questions</button></div>`;$("#dr-all").onclick=()=>{drOnlyWrong=false;drRetry=null;$("#dr-wrong").textContent="Retry my wrong ones";$("#dr-topic").value="all";drBuild()};$("#dr-dots").innerHTML="";drStats();return}
 const m=drPool[drIdx],a=drAns[m.id],K="ABCD";
 card.innerHTML=`<div class="dr-meta"><span>Question ${drIdx+1} of ${drPool.length}${drOnlyWrong?" · wrong ones":""}</span><span class="dr-chip">Chapter ${DR_CH(m.t)} · ${esc(m.t)}</span></div>
 <div class="dr-q">${m.q}</div>
 <div class="dr-opts">${m.o.map((o,i)=>{let cl="";if(a){if(i===m.a)cl="right";else if(i===a.pick)cl="wrong"}return`<button type="button" class="dr-opt ${cl}" data-i="${i}" ${a?"disabled":""}><span class="k">${K[i]}</span><span>${o}</span></button>`}).join("")}</div>
 ${a?`<div class="dr-exp ${a.pick===-1?"skip":""}"><b>${a.pick===-1?"Skipped. Answer: "+K[m.a]:a.pick===m.a?"Correct":"Wrong. Answer: "+K[m.a]}</b>${m.e}</div>`:""}
 <div class="dr-nav"><div class="grp"><button class="btn" type="button" id="dr-prev">← Prev</button>${a?"":`<button class="btn" type="button" id="dr-skip">Skip (S)</button>`}</div><div class="grp">${a?`<button class="btn" type="button" id="dr-redo">Try again</button>`:""}<button class="btn primary" type="button" id="dr-next">Next →</button></div></div>`;
 card.querySelectorAll(".dr-opt").forEach(b=>b.onclick=()=>drPick(+b.dataset.i));
 $("#dr-prev").onclick=()=>drGo(-1);$("#dr-next").onclick=()=>drGo(1);
 if($("#dr-skip"))$("#dr-skip").onclick=()=>drPick(-1);
 if($("#dr-redo"))$("#dr-redo").onclick=()=>{delete drAns[m.id];store.set(K("ans"),drAns);drRender()};
 $("#dr-dots").innerHTML=drPool.map((q,i)=>{const x=drAns[q.id];let c="";if(x)c=x.pick===-1?"s":x.pick===q.a?"c":"w";return`<button type="button" class="${c} ${i===drIdx?"cur":""}" data-i="${i}" aria-label="Question ${i+1}">${i+1}</button>`}).join("");
 drStats()}
$("#dr-dots").addEventListener("click",e=>{const d=e.target.closest("[data-i]");if(d){drIdx=+d.dataset.i;drRender()}});
function drPick(i){const m=drPool[drIdx];if(!m||drAns[m.id])return;drAns[m.id]={pick:i};store.set(K("ans"),drAns);drRender()}
function drGo(d){drIdx=Math.max(0,Math.min(drPool.length-1,drIdx+d));drRender();const c=$("#dr-card"),r=c.getBoundingClientRect();if(r.top<70||r.top>innerHeight*.5)window.scrollTo({top:scrollY+r.top-90,behavior:reduced?"auto":"smooth"})}
$("#dr-topic").onchange=drBuild;$("#dr-order").onchange=drBuild;$("#dr-neg").onchange=drStats;
$("#dr-wrong").onclick=()=>{if(!drOnlyWrong){const ids=DR_MCQ.filter(m=>drAns[m.id]&&drAns[m.id].pick!==-1&&drAns[m.id].pick!==m.a).map(m=>m.id);drRetry=new Set(ids);ids.forEach(id=>delete drAns[id]);store.set(K("ans"),drAns);drOnlyWrong=true}else{drOnlyWrong=false;drRetry=null}$("#dr-wrong").textContent=drOnlyWrong?"Show all questions":"Retry my wrong ones";drBuild()};
$("#dr-reset").onclick=()=>{if(!drResetArmed){drResetArmed=true;$("#dr-reset").textContent="Click again to reset";setTimeout(()=>{drResetArmed=false;$("#dr-reset").textContent="Reset"},3000);return}drAns={};store.set(K("ans"),drAns);drResetArmed=false;$("#dr-reset").textContent="Reset";drOnlyWrong=false;drRetry=null;$("#dr-wrong").textContent="Retry my wrong ones";drBuild()};
new IntersectionObserver(es=>{drVis=es.some(e=>e.isIntersecting)}).observe($("#dr-mcq"));
document.addEventListener("keydown",e=>{if(!drVis||$("#dr-mcq").hidden||!$("#cmdk").hidden||e.ctrlKey||e.metaKey||e.altKey)return;const tg=e.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(tg))return;const k=e.key.toLowerCase();
 if(k.length===1&&"abcd".includes(k)){const i="abcd".indexOf(k);if(drPool[drIdx]&&i<drPool[drIdx].o.length)drPick(i)}
 else if(k==="s")drPick(-1);else if(k==="arrowright"||(k==="enter"&&tg!=="BUTTON")){e.preventDefault();drGo(1)}else if(k==="arrowleft"){e.preventDefault();drGo(-1)}});
let drGot=store.get(K("got"))||{};
function drRenderDesc(){const t=$("#dr-dtopic").value,list=DR_DESC.map((d,i)=>({...d,i})).filter(d=>t==="all"||d.t===t);
 $("#dr-list").innerHTML=list.map((d,n)=>`<details class="dq"><summary><span class="n">${String(n+1).padStart(2,"0")}</span><span>${d.q}</span><span class="mk">${esc(d.m)}</span></summary><div class="ans"><div class="marks">Chapter ${DR_CH(d.t)} · ${esc(d.t)} · likely ${esc(d.m)}</div>${d.a}<label class="got" for="dr-got-${d.i}"><input type="checkbox" id="dr-got-${d.i}" data-i="${d.i}" ${drGot[d.i]?"checked":""}> I can answer this without looking</label></div></details>`).join("");
 $("#dr-list").querySelectorAll("input[type=checkbox]").forEach(c=>c.onchange=()=>{drGot[c.dataset.i]=c.checked;store.set(K("got"),drGot);drCount()});drCount()}
function drCount(){const n=Object.values(drGot).filter(Boolean).length;$("#dr-count").textContent=`${n} of ${DR_DESC.length} mastered`}
$("#dr-dtopic").onchange=drRenderDesc;
$("#dr-open").onclick=()=>$("#dr-list").querySelectorAll("details.dq").forEach(d=>d.open=true);
$("#dr-close").onclick=()=>$("#dr-list").querySelectorAll("details.dq").forEach(d=>d.open=false);
$("#dr-factlist").innerHTML=DR_FACTS.map(f=>`<div class="fact"><h3>${f.h}</h3><ul>${f.l.map(x=>`<li>${x}</li>`).join("")}</ul></div>`).join("");
document.querySelectorAll(".dr-tabs button").forEach(b=>b.onclick=()=>{const v=b.dataset.v;document.querySelectorAll(".dr-tabs button").forEach(x=>x.setAttribute("aria-pressed",x===b));["mcq","desc","facts"].forEach(k=>{$("#dr-"+k).hidden=k!==v})});
drBuild();drRenderDesc();

}

/* ---------- search palette (Ctrl/Cmd+K or /) ---------- */
const IDX=[];let idxBuilt=false;
function buildIdx(){if(idxBuilt)return;idxBuilt=true;

XP.forEach(p=>IDX.push({ty:"Page",t:p.label,s:p.sub||"",href:"#"+p.v}));
CH.forEach(c=>IDX.push({ty:"Page",t:`Chapter ${c.n} · ${c.el.dataset.title||c.name}`,s:c.el.dataset.sub||"",href:"#ch"+c.n}));
IDX.push(...(S.searchPages||[]),{ty:"Page",t:"Practice",s:"Glossary, flashcards, quiz, slide gaps",href:"#practice"},{ty:"Page",t:"Home",s:"Chapters and how to revise",href:"#home"});
topics.forEach(t=>{const n=t.querySelector(".tnum").textContent,h=t.querySelector("h3").textContent,txt=t.textContent.replace(/\s+/g," ").trim();IDX.push({ty:"Topic",t:`${n} ${h}`,s:"Chapter "+t.dataset.ch+" · "+chName(t.dataset.ch),href:"#"+t.id,ch:t.dataset.ch,txt,low:txt.toLowerCase()})});
GL.forEach(g=>IDX.push({ty:"Term",t:g[0],s:g[2],term:g[0]}));
IDX.push({ty:"Action",t:"Review flashcards",s:"Spaced-repetition review of due cards",act:"cards"},{ty:"Action",t:"Toggle recall mode",s:"Hide key definitions until you try to recall them",act:"recall"},{ty:"Action",t:"Start the quiz",s:"All chapters, shuffled",href:"#quiz"});
}
const cmdk=$("#cmdk"),cq=$("#cmdk-q"),cres=$("#cmdk-res");let hits=[],sel=0,lastFocus=null;
const hl=(t,toks)=>{let h=esc(t);toks.forEach(k=>{if(k.length>1)h=h.replace(new RegExp("("+k.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+")","ig"),"<mark>$1</mark>")});return h};
function search(){const q=cq.value.trim().toLowerCase(),toks=q.split(/\s+/).filter(Boolean);
 if(!toks.length){hits=IDX.filter(x=>x.ty==="Page"||x.ty==="Action"||(x.ty==="Topic"&&"ch"+x.ch===curView));}
 else hits=IDX.map(x=>{const tl=x.t.toLowerCase(),sl=x.s.toLowerCase();let sc=0;for(const k of toks){const inT=tl.includes(k),inS=sl.includes(k),inB=x.low&&x.low.includes(k);if(!inT&&!inS&&!inB)return null;sc+=inT?(tl.startsWith(k)?16:10):inS?3:1}sc+=x.ty==="Page"?3:x.ty==="Term"?2:x.ty==="Topic"?2:0;return{x,sc}}).filter(Boolean).sort((a,b)=>b.sc-a.sc).slice(0,14).map(o=>o.x);
 sel=0;if(!hits.length){cres.innerHTML=`<li class="cmdk-empty" aria-disabled="true">No match for "${esc(cq.value)}". Try a shorter word.</li>`;return}
 cres.innerHTML=hits.map((x,i)=>{let sn=x.s;if(toks.length&&x.txt){const k=toks.find(k=>x.low.includes(k)&&!x.t.toLowerCase().includes(k));if(k){const at=x.low.indexOf(k);sn="…"+x.txt.slice(Math.max(0,at-40),at+70)+"…"}}
  return`<li role="option" id="cr${i}" aria-selected="${i===sel}" data-i="${i}"><span class="ty">${x.ty}</span><span class="tt">${hl(x.t,toks)}</span><span class="sn">${hl(sn,toks)}</span></li>`}).join("");cq.setAttribute("aria-activedescendant","cr0")}
function moveSel(d){if(!hits.length)return;sel=(sel+d+hits.length)%hits.length;cres.querySelectorAll("li").forEach((li,i)=>li.setAttribute("aria-selected",i===sel));const li=cres.children[sel];li&&li.scrollIntoView({block:"nearest"});cq.setAttribute("aria-activedescendant","cr"+sel)}
function openCmd(){buildIdx();lastFocus=document.activeElement;cmdk.hidden=false;cq.value="";search();cq.focus()}
function closeCmd(){cmdk.hidden=true;lastFocus&&lastFocus.focus&&lastFocus.focus()}
function go(x){closeCmd();
 if(x.term){location.hash="#glossary";gview="list";$("#gloss-v").querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.v==="list"));gf=0;$("#gloss-q").value=x.term;drawGloss();if(location.hash==="#glossary")route();return}
 if(x.act==="recall"){rc.checked=!rc.checked;rc.dispatchEvent(new Event("change"));return}
 if(x.act==="cards"){$("#gloss-q").value="";gf=0;$('#gloss-v [data-v="cards"]').click();location.hash="#glossary";route();return}
 if(location.hash===x.href)route();else location.hash=x.href}
cq.addEventListener("input",search);
cq.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();moveSel(1)}else if(e.key==="ArrowUp"){e.preventDefault();moveSel(-1)}else if(e.key==="Enter"){e.preventDefault();hits[sel]&&go(hits[sel])}else if(e.key==="Escape"){e.preventDefault();closeCmd()}});
cres.addEventListener("click",e=>{const li=e.target.closest("li[data-i]");if(li)go(hits[+li.dataset.i])});
cmdk.addEventListener("click",e=>{if(e.target===cmdk)closeCmd()});
$("#srch-btn").onclick=openCmd;
document.addEventListener("keydown",e=>{const tag=(document.activeElement&&document.activeElement.tagName)||"",typing=/INPUT|TEXTAREA|SELECT/.test(tag);
 if((e.key==="k"||e.key==="K")&&(e.ctrlKey||e.metaKey)){e.preventDefault();cmdk.hidden?openCmd():closeCmd();return}
 if(typing||e.ctrlKey||e.metaKey||e.altKey||!cmdk.hidden)return;
 if(e.key==="/"){e.preventDefault();openCmd()}
 else if(e.key==="["||e.key==="]"){const i=VIEWS.indexOf(curView),nx=VIEWS[i+(e.key==="]"?1:-1)];if(nx)location.hash="#"+nx}
 else if(curView==="practice"&&!$("#fc").hidden&&!$("#fc-good").disabled&&(e.key==="1"||e.key==="2"))rate(e.key==="2")});


/* ---------- app shell: toast, offline badge, install ---------- */
let toastT;window.bdlToast=(msg,act,fn,keep)=>{const t=$("#toast"),a=$("#toast-act");$("#toast-msg").textContent=msg;a.hidden=!act;if(act){a.textContent=act;a.onclick=()=>{t.hidden=true;fn&&fn()}}t.hidden=false;clearTimeout(toastT);if(!act&&!keep)toastT=setTimeout(()=>{t.hidden=true},6000)};
$("#toast-x").onclick=()=>{$("#toast").hidden=true};
const offB=$("#offline-badge"),netSync=()=>{offB.hidden=navigator.onLine};window.addEventListener("online",()=>{netSync();bdlToast("Back online.")});window.addEventListener("offline",()=>{netSync();bdlToast("You're offline. The notes, labs, flashcards and quiz still work.")});netSync();
let installEvt=null;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();installEvt=e;$("#install-btn").hidden=false});
$("#install-btn").onclick=async()=>{if(!installEvt)return;installEvt.prompt();try{await installEvt.userChoice}catch(e){}installEvt=null;$("#install-btn").hidden=true};
window.addEventListener("appinstalled",()=>{$("#install-btn").hidden=true;bdlToast("Installed. Open it from your home screen or app list.")});


/* ---------- ambient background: a quiet network fabric with data packets ---------- */
(function(){const cv=$("#bg"),ctx=cv.getContext("2d");if(!ctx)return;
 const CFG=Object.assign({home:{m:"sq",a:["#F5B83D","#4FD1C5"]},practice:{m:"sq",a:["#B79CFF","#4FD1C5"]}},S.bg||{});CH.forEach(c=>{if(!CFG["ch"+c.n])CFG["ch"+c.n]={m:"sq",a:["#4FD1C5","#7C98FF"]}});
 const G=40,rgba=(h,a)=>`rgba(${parseInt(h.slice(1,3),16)},${parseInt(h.slice(3,5),16)},${parseInt(h.slice(5,7),16)},${a})`;
 let W=0,H=0,dpr=1,base=null,cfg=CFG.home,pk=[],lastT=0,rt;
 function drawBase(){base=document.createElement("canvas");base.width=Math.round(W*dpr);base.height=Math.round(H*dpr);const b=base.getContext("2d");b.scale(dpr,dpr);
  const R=Math.max(W,H);[[.86,.06,.65,cfg.a[0],.11],[.08,.96,.55,cfg.a[1],.08]].forEach(([x,y,r,c,a])=>{const g=b.createRadialGradient(W*x,H*y,0,W*x,H*y,R*r);g.addColorStop(0,rgba(c,a));g.addColorStop(1,rgba(c,0));b.fillStyle=g;b.fillRect(0,0,W,H)});
  b.lineWidth=1;
  if(cfg.m==="sq"){for(let x=0;x<=W;x+=G){b.strokeStyle=x%(G*5)===0?"rgba(124,152,255,.075)":"rgba(124,152,255,.03)";b.beginPath();b.moveTo(x+.5,0);b.lineTo(x+.5,H);b.stroke()}
   for(let y=0;y<=H;y+=G){b.strokeStyle=y%(G*5)===0?"rgba(124,152,255,.075)":"rgba(124,152,255,.03)";b.beginPath();b.moveTo(0,y+.5);b.lineTo(W,y+.5);b.stroke()}
   b.fillStyle="rgba(124,152,255,.22)";for(let x=0;x<=W;x+=G*5)for(let y=0;y<=H;y+=G*5)b.fillRect(x-1,y-1,3,3)}
  else{const r=24,hw=Math.sqrt(3)*r;b.strokeStyle="rgba(245,184,61,.06)";for(let row=0,y=0;y<H+r*2;row++,y=row*r*1.5){for(let x=(row%2?hw/2:0);x<W+hw;x+=hw){b.beginPath();for(let k=0;k<6;k++){const a=Math.PI/180*(60*k-30),px=x+r*Math.cos(a),py=y+r*Math.sin(a);k?b.lineTo(px,py):b.moveTo(px,py)}b.closePath();b.stroke()}}}
  const v=b.createRadialGradient(W/2,H*.45,Math.min(W,H)*.25,W/2,H/2,R*.8);v.addColorStop(0,"rgba(13,19,30,0)");v.addColorStop(1,"rgba(13,19,30,.6)");b.fillStyle=v;b.fillRect(0,0,W,H)}
 function spawn(){const c=cfg.a[Math.random()<.6?0:1],sp=40+Math.random()*80,len=50+Math.random()*90,life=4+Math.random()*6;let x,y,dx,dy;
  if(cfg.m==="sq"){if(Math.random()<.5){y=Math.round(Math.random()*H/G)*G+.5;x=Math.random()*W;dx=Math.random()<.5?1:-1;dy=0}else{x=Math.round(Math.random()*W/G)*G+.5;y=Math.random()*H;dy=Math.random()<.5?1:-1;dx=0}}
  else{const a=[30,90,150,210,270,330][Math.floor(Math.random()*6)]*Math.PI/180;x=Math.random()*W;y=Math.random()*H;dx=Math.cos(a);dy=Math.sin(a)}
  return{x,y,dx,dy,c,sp,len,life,age:0}}
 function resize(){dpr=Math.min(window.devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);drawBase();pk=Array.from({length:reduced?0:Math.round(Math.min(26,Math.max(10,W*H/50000)))},()=>{const p=spawn();p.age=Math.random()*p.life;return p});paint(0)}
 function paint(dt){ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,cv.width,cv.height);if(base)ctx.drawImage(base,0,0);ctx.setTransform(dpr,0,0,dpr,0,0);ctx.lineCap="round";
  pk.forEach((p,i)=>{p.age+=dt;if(p.age>p.life){pk[i]=spawn();return}p.x+=p.dx*p.sp*dt;p.y+=p.dy*p.sp*dt;const f=Math.sin(Math.PI*p.age/p.life),tx=p.x-p.dx*p.len,ty=p.y-p.dy*p.len;
   const g=ctx.createLinearGradient(tx,ty,p.x,p.y);g.addColorStop(0,rgba(p.c,0));g.addColorStop(1,rgba(p.c,.5*f));ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(tx,ty);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.fillStyle=rgba(p.c,.85*f);ctx.fillRect(p.x-1.5,p.y-1.5,3,3)})}
 function tick(t){requestAnimationFrame(tick);if(document.hidden||reduced)return;if(t-lastT<33)return;const dt=Math.min(.1,(t-lastT)/1000);lastT=t;paint(dt)}
 window.addEventListener("resize",()=>{clearTimeout(rt);rt=setTimeout(resize,150)});
 bgSet=v=>{const n=CFG[v]||CFG.home;if(n===cfg&&base)return;cfg=n;drawBase();pk=pk.map(()=>spawn());paint(0)};
 cfg=CFG[curView]||CFG.home;resize();requestAnimationFrame(tick)})();


/* ======================= 3D ENGINE ======================= */
if(!window.THREE){document.querySelectorAll(".stage").forEach(s=>s.insertAdjacentHTML("beforeend",'<div class="fallback">3D library could not load. The notes around this box still cover everything.</div>'));return}
const C={bg:0x0A101A,amber:0xF5B83D,teal:0x4FD1C5,blue:0x7C98FF,rose:0xF2727F,mint:0x8FD694,lilac:0xB79CFF,slate:0x3A4A66,slate2:0x51617F,fg:0xE7EBF3};
const stages=[];

function rr(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
function textCanvas(text,o){o=o||{};const lines=String(text).split("\n");const fs=o.fs||56,lh=fs*1.22,pad=Math.round(fs*.45);
 const cv=document.createElement("canvas"),ctx=cv.getContext("2d");const font=`${o.weight||650} ${fs}px Archivo, "IBM Plex Sans", sans-serif`;ctx.font=font;
 let w=0;lines.forEach(l=>{w=Math.max(w,ctx.measureText(l).width)});cv.width=Math.ceil(w+pad*2);cv.height=Math.ceil(lines.length*lh+pad*1.2);
 ctx.font=font;if(o.bg){ctx.fillStyle=o.bg;rr(ctx,0,0,cv.width,cv.height,fs*.3);ctx.fill()}
 ctx.fillStyle=o.color||"#E7EBF3";ctx.textBaseline="middle";ctx.textAlign="center";lines.forEach((l,i)=>ctx.fillText(l,cv.width/2,pad*.6+lh*(i+.5)));
 const tex=new THREE.CanvasTexture(cv);tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;return{tex,w:cv.width,h:cv.height,fs}}
function sprite(text,size,o){o=o||{};const t=textCanvas(text,o);const m=new THREE.SpriteMaterial({map:t.tex,transparent:true,depthTest:o.depthTest!==false,depthWrite:false});const s=new THREE.Sprite(m);const h=size*t.h/t.fs;s.scale.set(h*t.w/t.h,h,1);if(o.depthTest===false)s.renderOrder=5;return s}

function facePlane(text,size,o){const t=textCanvas(text,o);const h=size*t.h/t.fs;return new THREE.Mesh(new THREE.PlaneGeometry(h*t.w/t.h,h),new THREE.MeshBasicMaterial({map:t.tex,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}))}

function makeStage(el,opt){
 const st={el,ticks:[],pick:[],visible:false,near:false,paused:false,renderer:null,dirty:true,onPick:null,hover:null,onHover:null,mode:"3d"};
 const ld=el.querySelector(".loading");ld&&ld.remove();
 const tools=document.createElement("div");tools.className="stage-tools";
 const rv=document.createElement("button");rv.type="button";rv.textContent="Reset view";rv.onclick=()=>{st.root.rotation.set(0,0,0);st.dirty=true};tools.appendChild(rv);
 if(document.fullscreenEnabled&&el.requestFullscreen){const fs=document.createElement("button");fs.type="button";fs.textContent="Full screen";fs.onclick=()=>{if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else el.requestFullscreen().catch(()=>{})};document.addEventListener("fullscreenchange",()=>{fs.textContent=document.fullscreenElement===el?"Exit full screen":"Full screen"});tools.appendChild(fs)}
 el.appendChild(tools);st.tools=tools;st.rv=rv;
 const scene=new THREE.Scene();scene.background=new THREE.Color(C.bg);scene.fog=new THREE.Fog(C.bg,opt.fogNear||28,opt.fogFar||60);
 const camera=new THREE.PerspectiveCamera(opt.fov||38,1,.1,200);
 const root=new THREE.Group();scene.add(root);
 scene.add(new THREE.AmbientLight(0xffffff,.55));const dl=new THREE.DirectionalLight(0xffffff,.85);dl.position.set(6,12,9);scene.add(dl);const dl2=new THREE.DirectionalLight(0x88aaff,.3);dl2.position.set(-8,4,-6);scene.add(dl2);
 if(opt.floor!==false){const g=new THREE.GridHelper(40,40,0x22304a,0x162034);g.position.y=opt.floorY||0;scene.add(g)}
 const look=new THREE.Vector3(...opt.look),cam0=new THREE.Vector3(...opt.cam);
 function resize(){const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;if(st.renderer)st.renderer.setSize(w,h,false);camera.aspect=w/h;const k=Math.max(1,(opt.aspectRef||1.6)/camera.aspect);camera.position.copy(cam0).sub(look).multiplyScalar(k).add(look);camera.lookAt(look);camera.updateProjectionMatrix();st.dirty=true}
 function attach(){if(st.renderer||st.failed)return;let r;try{r=new THREE.WebGLRenderer({antialias:true})}catch(e){st.failed=true;el.insertAdjacentHTML("beforeend",'<div class="fallback">Your browser could not start WebGL, so this 3D model is unavailable. Use the 2D view where offered; the notes still cover it.</div>');return}
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));el.prepend(r.domElement);st.renderer=r;resize();st.dirty=true}
 function detach(){const r=st.renderer;if(!r)return;st.renderer=null;r.domElement.remove();try{r.forceContextLoss()}catch(e){}r.dispose()}
 st.sync=()=>{if(st.near&&!st.paused)attach();else detach()};
 new ResizeObserver(resize).observe(el);resize();
 const yawLim=opt.yaw??1.1;let down=null,moved=0;const ray=new THREE.Raycaster(),mv=new THREE.Vector2();
 const isCv=e=>st.renderer&&e.target===st.renderer.domElement;
 function hit(e){const r=el.getBoundingClientRect();mv.x=((e.clientX-r.left)/r.width)*2-1;mv.y=-((e.clientY-r.top)/r.height)*2+1;ray.setFromCamera(mv,camera);const h=ray.intersectObjects(st.pick,false);return h.length?h[0].object:null}
 el.addEventListener("pointerdown",e=>{if(!isCv(e))return;down={x:e.clientX,y:e.clientY,ry:root.rotation.y,rx:root.rotation.x};moved=0});
 el.addEventListener("pointermove",e=>{if(down){const dx=e.clientX-down.x,dy=e.clientY-down.y;moved=Math.max(moved,Math.abs(dx)+Math.abs(dy));if(moved>4){root.rotation.y=Math.max(-yawLim,Math.min(yawLim,down.ry+dx*.008));if(e.pointerType==="mouse")root.rotation.x=Math.max(-.3,Math.min(.35,down.rx+dy*.004));st.dirty=true}}else if(e.pointerType==="mouse"&&isCv(e)){const o=hit(e);if(o!==st.hover){st.hover=o;st.renderer.domElement.style.cursor=o?"pointer":"grab";st.onHover&&st.onHover(o);st.dirty=true}}});
 const end=e=>{if(down&&moved<6&&isCv(e)){const o=hit(e);if(o&&st.onPick)st.onPick(o);st.dirty=true}down=null};
 el.addEventListener("pointerup",end);el.addEventListener("pointercancel",()=>{down=null});
 el.addEventListener("pointerleave",()=>{down=null;if(st.hover){st.hover=null;st.onHover&&st.onHover(null);st.dirty=true}});
 new IntersectionObserver(es=>{es.forEach(x=>{st.visible=x.isIntersecting;st.dirty=true})}).observe(el);
 new IntersectionObserver(es=>{es.forEach(x=>{st.near=x.isIntersecting;st.sync()})},{rootMargin:"700px 0px"}).observe(el);
 Object.assign(st,{scene,camera,root});stages.push(st);return st}

/* 2D overlay + 2D/3D switch */
const hex=c=>"#"+c.toString(16).padStart(6,"0");
function flatTile(items,i,extra,inner){const it=items[i];return`<button type="button" class="ft${extra&&extra.cls?" "+extra.cls:""}" data-i="${i}" style="background:${hex(it.color)};color:${it.tc||"#0B111C"};${extra&&extra.style||""}">${inner||esc(it.label||it.title).replace(/\n/g,"<br>")}</button>`}
function flatView(st,html,o){o=o||{};const ov=document.createElement("div");ov.className="flat";ov.hidden=true;ov.innerHTML=`<div class="flat-in">${html}${o.dot?'<span class="fdot" hidden></span>':""}</div>`;st.el.appendChild(ov);st.flat=ov;
 const inn=ov.firstElementChild,dot=inn.querySelector(".fdot");let cur=-1;
 const place=()=>{if(!dot||cur<0||ov.hidden)return;const t=inn.querySelector(`[data-i="${cur}"]`);if(!t)return;const a=inn.getBoundingClientRect(),b=t.getBoundingClientRect();if(!a.width)return;dot.hidden=false;dot.style.left=(b.right-a.left-4)+"px";dot.style.top=(b.top-a.top+4)+"px"};
 ov.addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b&&st.meshes&&st.select){const m=st.meshes[+b.dataset.i];if(st.onPick)st.onPick(m);else st.select(m)}});
 st.onSelect=i=>{cur=i;inn.querySelectorAll("[data-i]").forEach(x=>x.classList.toggle("on",+x.dataset.i===i));place()};
 new ResizeObserver(()=>{place();o.onResize&&o.onResize(inn)}).observe(inn);
 st.flatPlace=place;return inn}
function modeSwitch(st,id,def){const seg=document.createElement("div");seg.className="seg";seg.setAttribute("role","group");seg.setAttribute("aria-label","View");seg.innerHTML='<button type="button" data-m="2d">2D</button><button type="button" data-m="3d">3D</button>';st.tools.prepend(seg);
 const hint=st.el.querySelector(".hint"),h3=hint?hint.textContent:"";
 const set=(m,save)=>{st.mode=m;st.paused=m==="2d";st.flat.hidden=m!=="2d";st.rv.hidden=m==="2d";if(hint)hint.textContent=m==="2d"?"2D view · tap a box":h3;
  seg.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",b.dataset.m===m));st.sync();if(save)store.set(K("mode-")+id,m);st.dirty=true;
  if(m==="2d")requestAnimationFrame(()=>{st.flatPlace&&st.flatPlace();st.onFlatShow&&st.onFlatShow()})};
 seg.querySelectorAll("button").forEach(b=>b.onclick=()=>set(b.dataset.m,true));set(store.get(K("mode-")+id)||def)}

let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 stages.forEach(st=>{if(!st.visible||st.paused||!st.renderer){st.ticks.forEach(f=>{if(f.always&&f(dt,now/1000))st.dirty=true});return}let anim=false;st.ticks.forEach(f=>{if(f(dt,now/1000))anim=true});if(anim||st.dirty){st.renderer.render(st.scene,st.camera);st.dirty=false}});
 requestAnimationFrame(loop)}

/* tweens */
function tweener(st){const list=[];const tick=dt=>{for(let i=list.length-1;i>=0;i--){const t=list[i];t.t+=dt/t.dur;const k=Math.min(1,t.t);t.step(k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2,k);if(k>=1){list.splice(i,1);t.done&&t.done()}}return list.length>0};tick.always=true;st.ticks.push(tick);return(dur,step,done)=>list.push({t:0,dur:reduced?Math.min(dur,.25):dur,step,done})}

function rowsFlat(items,rows,o){o=o||{};return rows.map((r,ri)=>`<div class="frow">${o.labels?`<span class="frl" style="width:${o.lw||30}px">${esc(o.labels[ri])}</span>`:""}<div class="fwrap"><div class="fcells" style="width:${o.widths?o.widths[ri]:100}%">${r.map(c=>Array.isArray(c)?`<div class="fcells">${c.map(i=>flatTile(items,i,o.tile&&o.tile(i))).join("")}</div>`:flatTile(items,c,o.tile&&o.tile(c))).join("")}</div></div></div>`).join("")}

/* generic clickable blocks */
function blocksScene(el,panel,items,opt){
 const st=makeStage(el,opt);if(!st)return;
 const meshes=[];let sel=null;
 items.forEach(it=>{const geo=it.geo||new THREE.BoxGeometry(...it.size);
  const mat=new THREE.MeshStandardMaterial({color:it.color,roughness:.6,metalness:.08,emissive:it.color,emissiveIntensity:.06,transparent:true,opacity:it.opacity||1});
  const m=new THREE.Mesh(geo,mat);m.position.set(...it.pos);if(it.rotY)m.rotation.y=it.rotY;m.userData={it,baseY:it.pos[1],lift:0};
  const ed=new THREE.LineSegments(new THREE.EdgesGeometry(geo),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.16}));m.add(ed);
  st.root.add(m);st.pick.push(m);meshes.push(m);
  if(it.label){const s=facePlane(it.label,it.ls||.24,{color:it.tc||"#0B111C",weight:700});const lp=it.lp||[it.pos[0],it.pos[1],it.pos[2]+(it.size?it.size[2]/2:1)+.02];s.position.set(...lp);s.userData.m=m;st.root.add(s);m.userData.spr=s;m.userData.sprY=lp[1]}});
 function select(m){sel=m;meshes.forEach(x=>{x.material.emissiveIntensity=x===m?.42:.06;x.material.opacity=x===m?1:(x.userData.it.opacity||1)});const it=m.userData.it;
  panel.innerHTML=`<span class="kicker">${esc(it.kicker||"")}</span><h4>${esc(it.title||it.label.replace(/\n/g," "))}</h4>${it.desc?`<p>${it.desc}</p>`:""}${it.list?`<ul>${it.list.map(x=>`<li>${x}</li>`).join("")}</ul>`:""}`;st.dirty=true;st.onSelect&&st.onSelect(meshes.indexOf(m))}
 st.onPick=o=>{if(o.userData.it)select(o)};
 st.onHover=o=>{meshes.forEach(x=>{if(x!==sel)x.material.emissiveIntensity=x===o?.22:.06})};
 st.ticks.push(dt=>{let a=false;meshes.forEach(m=>{const tgt=m===sel?(m.userData.it.liftBy??.18):0;const d=tgt-m.userData.lift;if(Math.abs(d)>.001){m.userData.lift+=d*Math.min(1,dt*8);a=true}m.position.y=m.userData.baseY+m.userData.lift;if(m.userData.spr)m.userData.spr.position.y=m.userData.sprY+m.userData.lift});return a});
 st.meshes=meshes;st.select=select;st.items=items;
 if(opt.flat){flatView(st,opt.flat(items),opt.flatOpt);modeSwitch(st,el.id,opt.flatDefault||"2d")}
 select(meshes[opt.initial||0]);return st}


/* ---------- progress summary for the subject picker (hub) ---------- */
function saveSummary(){try{
 const ans=store.get(K("ans"))||{};let dc=0,dw=0;if(typeof DR_MCQ!=="undefined")DR_MCQ.forEach((m,i)=>{const a=ans[m.id??i];if(a&&a.pick!==-1){a.pick===m.a?dc++:dw++}});
 const last=store.get(K("last"));let lastLabel="";if(last){const t=document.getElementById(last.slice(1));const tp=t&&(t.matches("article.topic")?t:t.closest("article.topic"));const host=t&&t.closest("[data-view]");const pg=host&&PAGES.find(p=>p.v===host.dataset.view);lastLabel=tp?`${tp.querySelector(".tnum").textContent} ${tp.querySelector("h3").textContent}`:(pg?pg.label:"")}
 const ex=store.get(K("exam-last"));
 store.set(K("summary"),{v:1,at:Date.now(),learned:topics.filter(t=>learned.has(t.id)).length,topics:topics.length,
  chapters:CH.map(c=>{const ts=topics.filter(t=>t.dataset.ch===String(c.n));return{n:c.n,name:c.name,done:ts.filter(t=>learned.has(t.id)).length,total:ts.length}}),
  cards:GL.length,drill:typeof DR_MCQ!=="undefined"?{c:dc,w:dw,total:DR_MCQ.length}:null,exam:ex?ex.pct:null,last,lastLabel});
 if(last)store.set("nlq-last",{id:S.id,hash:last,label:lastLabel,at:Date.now()})}catch(e){}}
window.addEventListener("pagehide",saveSummary);document.addEventListener("visibilitychange",()=>{if(document.hidden)saveSummary()});
$("#topnav").addEventListener("click",saveSummary);document.querySelectorAll(".hub-link,.side-hub").forEach(a=>a.addEventListener("click",saveSummary));
setTimeout(saveSummary,1500);

/* ---------- start: subject labs register here; each model builds when it scrolls near ---------- */
document.querySelectorAll(".stage").forEach(s=>s.insertAdjacentHTML("afterbegin",'<div class="loading">Loading 3D model…</div>'));
function start(map){map=map.filter(m=>$(m[0]));
 const run=()=>{const io=new IntersectionObserver(es=>{es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);const f=map.find(m=>$(m[0])===e.target);try{f[1]()}catch(err){console.error(err)}})},{rootMargin:"600px 0px"});
  map.forEach(m=>io.observe($(m[0])));if(window.THREE)requestAnimationFrame(loop)};
 const fr=document.fonts&&document.fonts.ready?Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,1500))]):Promise.resolve();
 fr.then(run)}
/* toolkit for subject labs */
window.NL=Object.freeze({start,$,C,K,blocksScene,esc,facePlane,flatTile,flatView,hex,makeStage,modeSwitch,reduced,rowsFlat,rr,sleep,sprite,store,textCanvas,tweener});
})();
