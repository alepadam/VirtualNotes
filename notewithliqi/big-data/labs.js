/* Big Data Applications and Analytics: this subject's own labs and visuals.
   Runs after shared/core.js and uses its toolkit through window.NL. */
(function(){
"use strict";
const {$,C,K,blocksScene,esc,facePlane,flatTile,flatView,hex,makeStage,modeSwitch,reduced,rowsFlat,rr,sleep,sprite,store,textCanvas,tweener}=NL;
/* ---------- 1.1 data scale ---------- */
const UNITS=[
 ["Megabyte",6,"The bottom of the scale on the slide."],
 ["Gigabyte",9,"One step up: a thousand megabytes."],
 ["Terabyte",12,"500 TB of new data is ingested into Facebook databases per day."],
 ["Petabyte",15,"The CERN Large Hadron Collider generates 1 PB per second."],
 ["Exabyte",18,"1 EB of data is created on the internet each day, equal to 250 million DVDs."],
 ["Zettabyte",21,"1.3 ZB of network traffic by 2016."],
 ["Yottabyte",24,"\"Our digital universe today\" = 250 trillion DVDs. Data scientists use yottabytes to describe how much government data the NSA or FBI hold on people."],
 ["Brontobyte",27,"\"Our digital universe tomorrow\": the unit predicted for sensor data from the Internet of Things (IoT)."]];
const sc=$("#scale");
UNITS.forEach((u,i)=>{const b=document.createElement("button");b.type="button";b.innerHTML=`<b>${u[0]}</b><span>10^${u[1]}</span>`;b.onclick=()=>pickUnit(i);sc.appendChild(b)});
function pickUnit(i){[...sc.children].forEach((b,j)=>b.classList.toggle("on",i===j));const u=UNITS[i];$("#scale-pow").innerHTML=`10<sup>${u[1]}</sup>`;$("#scale-name").textContent=u[0];$("#scale-ex").textContent=u[2]}
pickUnit(3);

/* ---------- 1.3 ecosystem ---------- */
const ECO=[["Core Hadoop (HDFS, MR)"],["HBase","ZooKeeper"],["Hive","Pig","Mahout"],["Sqoop","Whirr","Avro"],["Flume","Bigtop","Oozie","MRUnit","HCatalog","+ YARN"],["Spark","Impala","Solr","Kafka"],["Parquet","Sentry"]];
const ecoHooks=[];
function drawEco(){const y=+$("#eco").value;let h="";for(let i=0;i<=y;i++)ECO[i].forEach(t=>{h+=`<span class="chip ${i===y?"on":""}">${esc(t)}</span>`});$("#eco-chips").innerHTML=h;ecoHooks.forEach(f=>f(y))}
$("#eco").addEventListener("input",drawEco);drawEco();

/* ---------- 1.9 bars ---------- */
function bars(el,rows,max){el.innerHTML=rows.map(r=>`<div class="bar"><span class="name">${esc(r[0])}</span><div class="track"><div class="fill" style="width:${r[1]/max*100}%"></div></div><span class="v">${r[1]}%</span></div>`).join("")}
bars($("#bars-1"),[["Faster innovation cycles",25],["Improved business efficiencies",17],["More effective R&D",13],["Product / service",12]],50);
bars($("#bars-2"),[["Social media data",50],["Documents, texts",44],["Clickstream media",41],["Videos, images",34],["Sensor, RFID, machine data",29],["Transaction data",28],["System logs",25]],50);
bars($("#bars-3"),[["Provision of digital platform",38],["Provision of analysis results",26],["Provision of data via benchmarking",25]],50);

/* ---------- 2.1 internet minute ---------- */
const MIN={
 "2021":{src:"Created by Lori Lewis & @OfficiallyChadd",d:[["1.4M","Facebook scrolling"],["21.1M","texts sent"],["500 hrs","YouTube content uploaded"],["414,764","apps downloaded"],["695,000","Instagram stories shared"],["200,000","people tweeting"],["2M","Tinder swipes"],["197.6M","emails sent"],["2M","Twitch views"],["5,000","TikTok downloads"],["932","smart audio devices shipped"],["3M","Imgur images viewed"],["69M","Messenger/WhatsApp messages"],["3.4M","Snapchat snaps created"],["$1.6M","spent online"],["28,000","Netflix subscribers watching"],["9,132","LinkedIn connections made"]]},
 "2022":{src:"Source: LocaliQ · RankingRoyals",d:[["4K","reading Yelp reviews"],["174K","apps downloaded"],["16.2M","texts sent"],["231M","emails sent"],["694M","songs streamed in the US"],["6M","people shopping online"],["5.9M","Google searches"],["44M","viewing Facebook live streams"],["12.5K","ride-shares taken"],["20.8K","active users on LinkedIn"],["2.1M","active on Facebook"],["575K","tweets sent"],["46K","searches on Pinterest"],["66K","Instagram photos & videos shared"],["2M","Snapchats sent"],["167M","TikTok videos watched"],["452K","hours streamed on Netflix"],["3.67M","YouTube videos watched"]]},
 "2023":{src:"Created by eDiscovery Today & LTMG",d:[["22,831","visits to ChatGPT"],["241.2M","emails sent"],["18.8M","text messages sent"],["2.4M","Google searches"],["694,000","YouTube video hours viewed"],["347,222","tweets"],["3.47M","snaps created"],["10.4M","Instagram viewing minutes"],["11,035","Facebook fake accounts removed"],["6.3M","Zoom meeting minutes"],["34,247","Slack messages"],["11,834","Microsoft Teams chats"],["6.94M","emoji sent"],["3.02M","smartphone photos created"],["271,309","iOS & Android app downloads"]]},
 "2026":{src:"Labelled \"Every minute in 2026\" · GO-Globe",d:[[">243,000","Facebook photos uploaded"],["70,000 hrs","Facebook video watched"],[">3.8M","Google searches"],[">350,000","tweets sent"],[">65,000","Instagram photos"],[">210,000","snaps uploaded"],["120","new LinkedIn accounts"],[">29M","WhatsApp messages processed"],["1M","WhatsApp photos"],["175,000","WhatsApp video messages"],[">156M","emails sent"],[">87,000 hrs","Netflix watched"],[">25,000","Tumblr posts"],["16,550","Vimeo video views"],["18,000","Tinder matches"],[">1,000,000","Tinder swipes"],[">500,000","apps downloaded"],[">50","new Yelp reviews"],[">1,000","Imgur images uploaded"],["~200","Eventbrite tickets sold"],[">2,000,000","Skype call minutes"],[">5,500","Foursquare check-ins"],[">800,000","Dropbox files uploaded"],["~700,000 hrs","YouTube watched"],[">400 hrs","YouTube uploaded"]]}};
const mt=$("#min-tabs");
Object.keys(MIN).forEach(y=>{const b=document.createElement("button");b.className="btn";b.type="button";b.textContent=y;b.onclick=()=>showMin(y);mt.appendChild(b)});
function showMin(y){[...mt.children].forEach(b=>b.classList.toggle("on",b.textContent===y));$("#min-tiles").innerHTML=MIN[y].d.map(r=>`<div class="tile"><b>${esc(r[0])}</b><span>${esc(r[1])}</span></div>`).join("");$("#min-src").textContent=MIN[y].src+" · all figures per 60 seconds";$("#min-note").hidden=y!=="2026"}
showMin("2023");

/* ---------- 1.6 V evolution ---------- */
const VEVO=[["Douglas Laney · 3Vs",["Volume","Variety","Velocity"]],["IBM · 4Vs",["Veracity"]],["Yuri Demchenko · 5Vs",["Value"]],["Microsoft · 6Vs",["Visibility"]]];
const vb=$("#vevo-btns");
VEVO.forEach((v,i)=>{const b=document.createElement("button");b.className="btn";b.type="button";b.textContent=v[0];b.onclick=()=>vevo(i);vb.appendChild(b)});
function vevo(i){[...vb.children].forEach((b,j)=>b.classList.toggle("on",i===j));let h="";VEVO.forEach((v,j)=>v[1].forEach(n=>{h+=`<span class="vchip ${j<i?"on":j===i?"new":""}">${n}</span>`}));$("#vevo-chips").innerHTML=h}
vevo(0);


/* ---------- HiveQL practice: AlaSQL in the browser, with Hive-only commands and a pruning readout ---------- */
const ALASQL_SRC="../vendor/alasql-4.4.0.min.js";
const loadScript=src=>new Promise((res,rej)=>{const sc=document.createElement("script");sc.src=src;sc.onload=res;sc.onerror=()=>rej(new Error("load failed"));document.head.appendChild(sc)});
const PRODS=[["Laptop",3500],["Phone",2200],["Tablet",1400],["Monitor",800]],REGS=["US","IN","UK"],MONS=["2025-06","2025-07","2025-08"];
const SALES=[];{let id=1;REGS.forEach((r,ri)=>MONS.forEach((m,mi)=>PRODS.forEach((p,pi)=>SALES.push({order_id:id++,product:p[0],qty:((ri*7+mi*5+pi*3)%6)+1,price:p[1],region:r,sales_date:m}))))}
const USERS=[[1001,"MY",2023],[1002,"US",2024],[1003,"IN",2022],[1004,"UK",2024],[1005,"MY",2025]].map(r=>({userid:r[0],country:r[1],signup_year:r[2]}));
const PV=[["2025-08-01 09:15",1001,"/home","google.com","10.0.0.11"],["2025-08-01 09:17",1001,"/hive","/home","10.0.0.11"],["2025-08-01 10:02",1002,"/home","bing.com","10.0.0.25"],["2025-08-01 10:05",1002,"/hdfs","/home","10.0.0.25"],["2025-08-01 10:09",1002,"/yarn","/hdfs","10.0.0.25"],["2025-08-02 08:40",1003,"/home","google.com","10.0.0.37"],["2025-08-02 08:44",1003,"/quiz","/home","10.0.0.37"],["2025-08-02 11:20",1004,"/hive","twitter.com","10.0.0.42"],["2025-08-02 11:31",1001,"/quiz","/hive","10.0.0.11"],["2025-08-03 14:05",1005,"/home","google.com","10.0.0.58"],["2025-08-03 14:07",1005,"/mapreduce","/home","10.0.0.58"],["2025-08-03 14:15",1003,"/hdfs","/quiz","10.0.0.37"]].map(r=>({ts:r[0],userid:r[1],page_url:r[2],referer_url:r[3],ip:r[4]}));
const HSCHEMA={sales:{cols:[["order_id","INT"],["product","STRING"],["qty","INT"],["price","DOUBLE"]],parts:[["region","STRING"],["sales_date","STRING"]],rows:SALES},page_views:{cols:[["ts","STRING"],["userid","INT"],["page_url","STRING"],["referer_url","STRING"],["ip","STRING"]],parts:[],rows:PV},users:{cols:[["userid","INT"],["country","STRING"],["signup_year","INT"]],parts:[],rows:USERS}};
const HEX=[
 {t:"Filter one partition",task:"List every sale from the <b>US</b> region.",ref:"SELECT * FROM sales WHERE region = 'US'",hint:"Filter with WHERE on the partition column region. Watch how many folders Hive would read."},
 {t:"Use both partition keys",task:"Show <b>India's</b> sales for <b>2025-08</b> only.",ref:"SELECT * FROM sales WHERE region = 'IN' AND sales_date = '2025-08'",hint:"Combine both partition columns with AND. Only one of the 9 folders should be read."},
 {t:"Aggregate by group",task:"Total quantity sold in each region. Return the region and its total.",ref:"SELECT region, SUM(qty) AS total_qty FROM sales GROUP BY region",hint:"GROUP BY region and SUM(qty). Call the column total_qty: total is a reserved word here."},
 {t:"Top product by revenue",task:"Which product earned the most revenue (qty × price)? Return the product and its revenue.",ref:"SELECT product, SUM(qty * price) AS revenue FROM sales GROUP BY product ORDER BY revenue DESC LIMIT 1",ordered:true,hint:"SUM(qty * price) per product, ORDER BY it DESC, LIMIT 1."},
 {t:"Count per user",task:"How many page views does each user have? Return userid and the count.",ref:"SELECT userid, COUNT(*) AS views FROM page_views GROUP BY userid",hint:"GROUP BY userid with COUNT(*)."},
 {t:"Equi-join two tables",task:"For every page view, show the <b>page_url</b> and the viewer's <b>country</b>.",ref:"SELECT p.page_url, u.country FROM page_views p JOIN users u ON (p.userid = u.userid)",hint:"JOIN users ON matching userid. This is the equi-join ability from slide 19."},
 {t:"Hive commands",task:"List the partitions of the sales table using a Hive command.",ref:"SHOW PARTITIONS sales",hint:"Hive has a command that lists a table's partition folders: SHOW PARTITIONS."}];
const HQ={db:null,cur:0,ready:false,draft:{},done:new Set(store.get(K("hql-done"))||[])};
const hmsg=h=>{$("#hql-msg").innerHTML=h};
function hqlInit(){const db=new alasql.Database();Object.entries(HSCHEMA).forEach(([t,sc])=>{db.exec(`CREATE TABLE ${t} (${[...sc.cols,...sc.parts].map(c=>c[0]+" "+c[1]).join(", ")})`);db.tables[t].data=sc.rows.map(r=>({...r}))});HQ.db=db}
function hqlOne(st){
 if(/^SHOW\s+TABLES$/i.test(st))return{rows:Object.keys(HQ.db.tables).sort().map(t=>({tab_name:t}))};
 let m=st.match(/^(?:DESCRIBE|DESC)\s+(?:FORMATTED\s+|EXTENDED\s+)?(\w+)$/i);if(m){const sc=HSCHEMA[m[1].toLowerCase()];if(!sc)throw new Error(`Table not found: ${m[1]}`);return{rows:[...sc.cols.map(c=>({col_name:c[0],data_type:c[1].toLowerCase(),comment:""})),...sc.parts.map(c=>({col_name:c[0],data_type:c[1].toLowerCase(),comment:"partition column"}))]}}
 m=st.match(/^SHOW\s+PARTITIONS\s+(\w+)$/i);if(m){if(m[1].toLowerCase()!=="sales")throw new Error(`${m[1]} is not a partitioned table. Only sales is partitioned (by region and sales_date).`);return{rows:REGS.flatMap(r=>MONS.map(d=>({partition:`region=${r}/sales_date=${d}`})))}}
 if(/^LOAD\s+DATA/i.test(st))throw new Error("In real Hive, LOAD DATA just moves a file into the table's HDFS folder (schema on read). There are no files in this practice area, so try a SELECT.");
 const q=st.replace(/PARTITIONED\s+BY\s*\([^)]*\)/ig,"").replace(/CLUSTERED\s+BY\s*\([^)]*\)\s*(SORTED\s+BY\s*\([^)]*\)\s*)?INTO\s+\d+\s+BUCKETS/ig,"").replace(/ROW\s+FORMAT[\s\S]*?(?=STORED|LOCATION|$)/ig,"").replace(/STORED\s+AS\s+\w+/ig,"").replace(/LOCATION\s+'[^']*'/ig,"").replace(/INSERT\s+OVERWRITE\s+TABLE/ig,"INSERT INTO");
 const out=HQ.db.exec(q);return Array.isArray(out)?{rows:out}:{rows:[],info:`OK · ${out} row${out===1?"":"s"} affected`}}
function hqlExec(raw){const sts=raw.replace(/--[^\n]*/g,"").split(";").map(x=>x.trim()).filter(Boolean);if(!sts.length)throw new Error("Type a query first.");let r=null;sts.forEach(st=>{r=hqlOne(st)});return r}
function pruneInfo(sql){if(!/\bfrom\s+sales\b/i.test(sql))return null;const w=(sql.match(/\bwhere\b([\s\S]*)/i)||[0,""])[1];
 const rv=[...w.matchAll(/\bregion\s*=\s*'([^']*)'/ig)].map(x=>x[1].toUpperCase()),dv=[...w.matchAll(/\bsales_date\s*=\s*'([^']*)'/ig)].map(x=>x[1]);
 const hit=REGS.flatMap(r=>MONS.map(d=>[r,d])).filter(([r,d])=>(!rv.length||rv.includes(r))&&(!dv.length||dv.includes(d)));return{n:hit.length,paths:hit.map(([r,d])=>`…/sales/region=${r}/sales_date=${d}`)}}
const fmtv=v=>v==null?"NULL":typeof v==="number"?(Number.isInteger(v)?String(v):v.toFixed(2)):String(v);
function renderRows(r){const out=$("#hql-out");if(r.info&&!r.rows.length){out.innerHTML=`<p style="padding:10px;color:var(--muted)">${esc(r.info)}</p>`;return}if(!r.rows.length){out.innerHTML='<p style="padding:10px;color:var(--muted)">No rows returned.</p>';return}
 const cols=Object.keys(r.rows[0]);out.innerHTML=`<table><thead><tr>${cols.map(c=>`<th>${esc(c)}</th>`).join("")}</tr></thead><tbody>${r.rows.slice(0,100).map(x=>`<tr>${cols.map(c=>`<td>${esc(fmtv(x[c]))}</td>`).join("")}</tr>`).join("")}</tbody></table>${r.rows.length>100?`<p style="padding:8px 10px;color:var(--muted)">Showing 100 of ${r.rows.length} rows.</p>`:""}`}
function errMsg(e){let m=String(e&&e.message||e).split("\n")[0];if(/got '(TOTAL|VALUE)'/i.test(String(e&&e.message)))m="That alias is a reserved word in this engine. Rename it (for example total_qty instead of total).";else if(/Parse error/i.test(m))m="Syntax error. Check commas, quotes and keyword order. "+m.replace(/^.*?Parse error/i,"Parse error");return m}
function hqlRun(){if(!HQ.ready)return;const sql=$("#hql-in").value;try{const r=hqlExec(sql);renderRows(r);const p=pruneInfo(sql);const pr=$("#hql-prune");
  if(p){pr.hidden=false;pr.innerHTML=p.n===9?"No partition filter: Hive would scan all 9 partition folders of sales.":`Partition pruning: Hive would read ${p.n} of 9 folders (${Math.round(p.n/9*100)}% of the table)<br>${p.paths.slice(0,3).map(esc).join("<br>")}${p.n>3?"<br>…":""}`}else pr.hidden=true;
  hmsg(`<span class="badge ok">Ran</span> ${r.info?esc(r.info):`${r.rows.length} row${r.rows.length===1?"":"s"}`}. Press <b>Check answer</b> when you think it's right.`)}catch(e){$("#hql-prune").hidden=true;$("#hql-out").innerHTML="";hmsg(`<span class="badge bad">Error</span> ${esc(errMsg(e))}`)}}
const normRows=rows=>rows.map(r=>Object.values(r).map(v=>typeof v==="number"?String(Math.round(v*100)/100):String(v)).sort().join("|"));
function hqlCheck(){if(!HQ.ready)return;const ex=HEX[HQ.cur];let mine,ref;try{mine=hqlExec($("#hql-in").value).rows}catch(e){hmsg(`<span class="badge bad">Error</span> ${esc(errMsg(e))}`);return}ref=hqlExec(ex.ref).rows;
 let a=normRows(mine),b=normRows(ref);if(!ex.ordered){a=a.sort();b=b.sort()}else{a=a.slice(0,b.length)}
 const ok=mine.length===ref.length&&a.join("\n")===b.join("\n");hqlRun();
 if(ok){HQ.done.add(HQ.cur);store.set(K("hql-done"),[...HQ.done]);hmsg(`<span class="badge ok">Correct</span> Your result matches. ${HQ.cur<HEX.length-1?"On to the next exercise.":"That's every exercise done."}`);drawEx()}
 else hmsg(`<span class="badge bad">Not yet</span> Your query returned ${mine.length} row${mine.length===1?"":"s"}; the answer has ${ref.length}. Compare the columns and filters, or open the hint.`)}
function drawEx(){$("#hql-ex").innerHTML=HEX.map((x,i)=>`<li><button type="button" data-x="${i}" class="${i===HQ.cur?"on":""}"><span class="st ${HQ.done.has(i)?"ok":""}">${HQ.done.has(i)?"✓":i+1}</span><span>${esc(x.t)}</span></button></li>`).join("");
 $("#hql-task").innerHTML=`<span class="kicker">Exercise ${HQ.cur+1} of ${HEX.length}</span><div style="margin-top:4px">${HEX[HQ.cur].task}</div>`}
function pickEx(i){HQ.draft[HQ.cur]=$("#hql-in").value;HQ.cur=i;$("#hql-in").value=HQ.draft[i]??"SELECT \nFROM sales\n";drawEx();$("#hql-out").innerHTML="";$("#hql-prune").hidden=true;hmsg(HQ.ready?"Write your query, then Run.":"Loading the query engine…")}
$("#hql-schema").innerHTML=Object.entries(HSCHEMA).map(([t,sc])=>`<div><b>${t}</b>${sc.parts.length?' <span class="pk">partitioned</span>':""}<br>${sc.cols.map(c=>`${c[0]} ${c[1].toLowerCase()}`).join(", ")}${sc.parts.length?`<br><span class="pk">${sc.parts.map(c=>c[0]).join(", ")}</span>`:""}</div>`).join("");
$("#hql-ex").addEventListener("click",e=>{const b=e.target.closest("[data-x]");if(b)pickEx(+b.dataset.x)});
$("#hql-run").onclick=hqlRun;$("#hql-check").onclick=hqlCheck;
$("#hql-hint").onclick=()=>hmsg(`<span class="badge warn">Hint</span> ${esc(HEX[HQ.cur].hint)}`);
$("#hql-sol").onclick=()=>{$("#hql-in").value=HEX[HQ.cur].ref;hmsg('<span class="badge warn">Solution</span> Read it, then press Run. Try the next exercise without peeking.')};
$("#hql-reset").onclick=()=>{if(HQ.ready){hqlInit();hmsg("Tables reset to the original data.")}};
$("#hql-in").addEventListener("keydown",e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();hqlRun()}});
$("#hql-in").value="SELECT \nFROM sales\n";drawEx();
new IntersectionObserver((es,ob)=>{if(!es.some(e=>e.isIntersecting))return;ob.disconnect();
 loadScript(ALASQL_SRC).then(()=>{hqlInit();HQ.ready=true;hmsg("Ready. Write your query, then press <b>Run</b> or Ctrl + Enter.")}).catch(()=>hmsg('<span class="badge bad">Offline</span> The query engine needs a connection the first time it loads. After that, the installed site keeps it for offline use.'))},{rootMargin:"500px 0px"}).observe($("#hql-lab"));


/* ---------- NoSQL: scale out, partition, replicate, survive failures ---------- */
(function(){const KEYS=Array.from({length:12},(_,i)=>"k"+(i+1));let load=1,down=new Set();
 function draw(){const n=Math.max(2,load+1),up=$("#nq-up"),maxed=load>=4;
  up.style.width=Math.min(100,40+load*15)+"%";up.style.height=Math.min(140,50+load*22)+"px";up.classList.toggle("max",maxed);
  $("#nq-up-t").textContent=maxed?"at the hardware limit: no bigger machine to buy":`load ${load}: buy a bigger machine`;
  const owners=KEYS.map((k,i)=>[i%n,(i+1)%n]);
  $("#nq-nodes").innerHTML=Array.from({length:n},(_,d)=>`<div class="nsq-node ${down.has(d)?"down":""}"><b>Node ${d+1}${down.has(d)?" · down":""}</b><div class="kk">${KEYS.map((k,i)=>owners[i][0]===d?`<i>${k}</i>`:owners[i][1]===d?`<i class="rep">${k}</i>`:"").join("")}</div></div>`).join("");
  const lost=KEYS.filter((k,i)=>owners[i].every(o=>down.has(o)));
  $("#nq-msg").innerHTML=down.size?(lost.length?`<span class="badge bad">Data lost</span> ${lost.join(", ")} had both copies on failed nodes. Two copies survive one failure, not two neighbouring ones.`:`<span class="badge ok">No data lost</span> ${down.size} node${down.size>1?"s":""} down, yet every key still has a live copy. No single point of failure.`):`${n} nodes share the load. Teal keys are each node's own partition; grey ones are replica copies of a neighbour's keys.`}
 $("#nq-load").onclick=()=>{if(load<6){load++;down.clear();draw()}};
 $("#nq-fail").onclick=()=>{const n=Math.max(2,load+1),alive=[...Array(n).keys()].filter(d=>!down.has(d));if(alive.length>1){down.add(alive[Math.floor(Math.random()*alive.length)]);draw()}};
 $("#nq-reset").onclick=()=>{load=1;down.clear();draw()};draw()})();

/* ---------- MRv1 vs YARN: where the work lands ---------- */
(function(){let jobs=[],n=0;const COLS={mr:"#F5B83D",sp:"#B79CFF"};
 function draw(){const mr=jobs.filter(j=>j.t==="mr").length,jt=Math.min(100,mr*22),rm=Math.min(100,jobs.length*7);
  const jtEl=$("#my-jt"),rmEl=$("#my-rm");jtEl.style.width=jt+"%";jtEl.classList.toggle("hot",jt>=80);rmEl.style.width=rm+"%";
  const tt=[[],[],[]],nm=[[],[],[]];
  jobs.forEach((j,i)=>{if(j.t==="mr"){[0,1,2].forEach(w=>tt[w].push(`<i style="background:${COLS.mr}">J${j.n} task</i>`))}
   nm[i%3].push(`<i style="background:${COLS[j.t]};outline:2px solid var(--fg);outline-offset:-2px">J${j.n} AM</i>`);[1,2].forEach(o=>nm[(i+o)%3].push(`<i style="background:${COLS[j.t]}">J${j.n} task</i>`))});
  $("#my-tt").innerHTML=tt.map((x,w)=>`<div class="my-w"><b>TaskTracker ${w+1}</b>${x.join("")}</div>`).join("");
  $("#my-nm").innerHTML=nm.map((x,w)=>`<div class="my-w"><b>NodeManager ${w+1}</b>${x.join("")}</div>`).join("")}
 $("#my-mr").onclick=()=>{if(jobs.length>=6)return;n++;jobs.push({t:"mr",n});draw();const mr=jobs.filter(j=>j.t==="mr").length;
  $("#my-msg").innerHTML=mr>=4?`<span class="badge bad">Bottleneck</span> ${mr} MapReduce jobs: the one JobTracker is scheduling and monitoring every task of every job. YARN's ResourceManager stays light because each job's ApplicationMaster (outlined) does that work.`:`<b>Job ${n} (MapReduce)</b> runs on both. MRv1: the JobTracker tracks all of its tasks. YARN: the ResourceManager gives it containers, and its own ApplicationMaster (outlined) runs it.`};
 $("#my-sp").onclick=()=>{if(jobs.length>=6)return;n++;jobs.push({t:"sp",n});draw();$("#my-msg").innerHTML=`<span class="badge warn">Job ${n} (Spark)</span> MRv1 can't run it: it only runs MapReduce. YARN accepts it, because YARN supports non-MapReduce workloads.`};
 $("#my-reset").onclick=()=>{jobs=[];n=0;draw();$("#my-msg").textContent="Submit a job to see where the work lands."};draw()})();


/* ---------- hub diagrams (Ch 3) ---------- */
function hub(id,center,nodes,kicker){const el=$("#"+id),pn=$("#hubp-"+id.slice(4));if(!el||!pn)return;const n=nodes.length;
 const pts=nodes.map((_,i)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[50+35*Math.cos(a),50+36*Math.sin(a)]});
 el.innerHTML=`<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${pts.map((p,i)=>`<line data-i="${i}" x1="50" y1="50" x2="${p[0].toFixed(1)}" y2="${p[1].toFixed(1)}" vector-effect="non-scaling-stroke"/>`).join("")}</svg><div class="hc" style="left:50%;top:50%">${esc(center)}</div>`+nodes.map((nd,i)=>`<button type="button" class="hn" data-i="${i}" style="left:${pts[i][0].toFixed(1)}%;top:${pts[i][1].toFixed(1)}%">${esc(nd.t)}</button>`).join("");
 const pick=i=>{el.querySelectorAll(".hn").forEach(b=>b.classList.toggle("on",+b.dataset.i===i));el.querySelectorAll("line").forEach(l=>l.classList.toggle("on",+l.dataset.i===i));const nd=nodes[i];pn.innerHTML=`<span class="kicker">${esc(kicker)} · ${i+1} of ${n}</span><h4>${esc(nd.t)}</h4>${nd.d}`};
 el.querySelectorAll(".hn").forEach(b=>b.onclick=()=>pick(+b.dataset.i));pick(0)}
const dim=t=>`<p style="color:var(--dim)">${t}</p>`;
hub("hub-apps","Hive applications",[
 {t:"Data mining",d:"<p>Running large aggregations and joins over huge tables to find patterns.</p>"+dim("The slide names the five applications only; these one-line explanations are added for revision.")},
 {t:"Document indexing",d:"<p>Processing large document collections to build or update search indexes.</p>"},
 {t:"Predictive modeling, hypothesis testing",d:"<p>Preparing and summarising training data, and checking a hypothesis against the full data set.</p>"},
 {t:"Customer-facing business intelligence",d:"<p>Feeding reports and dashboards that customers or business users read.</p>"},
 {t:"Log processing",d:"<p>Querying web and server logs (like Facebook's clickstream) with SQL instead of Java.</p>"}],"Where to use Hive");
hub("hub-comp","Hive components",[
 {t:"Shell",d:"<p><b>Allows interactive queries.</b> You type HiveQL and see results. In the architecture this is the CLI.</p>"},
 {t:"Metastore",d:"<p><b>Schema, location in HDFS, SerDe.</b> The catalogue of every table: its columns and types, the HDFS folder holding its files, and the SerDe that reads them.</p>"},
 {t:"Execution engine",d:"<p><b>Directed Acyclic Graph (DAG) of stages (MR, HDFS, metadata).</b> Runs the compiled plan stage by stage. Step through the DAG below.</p>"},
 {t:"Compiler",d:"<p><b>Parse, plan, optimize.</b> Checks the HiveQL, looks up tables in the Metastore, and turns the query into an optimized plan of stages.</p>"},
 {t:"Driver",d:"<p><b>Session handles, fetch, execute.</b> Receives the query, manages the session, passes it to the compiler and execution engine, and fetches the results.</p>"}],"Hive component");
const sqlPre=s=>`<pre class="code">${esc(s)}</pre>`;
hub("hub-ql","HiveQL",[
 {t:"Filter rows from a table using a 'where' clause",d:sqlPre("SELECT page_url, userid\nFROM page_views\nWHERE dt = '2025-08-01'\n  AND userid = 1007;")+dim("Example statements are added for revision; the slide lists the abilities only.")},
 {t:"Equi-joins between two tables",d:"<p>An equi-join matches rows on equal column values.</p>"+sqlPre("SELECT p.page_url, u.country\nFROM page_views p\nJOIN users u ON (p.userid = u.userid);")},
 {t:"Store query results in a Hadoop dfs directory",d:sqlPre("INSERT OVERWRITE DIRECTORY '/tmp/top_pages'\nSELECT page_url, COUNT(*)\nFROM page_views\nGROUP BY page_url;")},
 {t:"Manage tables and partitions (create, drop & alter)",d:sqlPre("CREATE TABLE page_views (\n  ts STRING, userid INT, referer_url STRING,\n  page_url STRING, ip STRING)\nPARTITIONED BY (dt STRING)\nCLUSTERED BY (userid) INTO 4 BUCKETS;\n\nALTER TABLE page_views ADD PARTITION (dt='2025-08-02');\nDROP TABLE page_views;")},
 {t:"Store query results into another table",d:sqlPre("INSERT OVERWRITE TABLE daily_summary\nSELECT dt, COUNT(*) AS views\nFROM page_views\nGROUP BY dt;")}],"HiveQL ability");

/* ---------- partition folder trees (Ch 3) ---------- */
const TREES={
 "Slide 27 · /hivebase/Sales":{root:"/hivebase/Sales",kids:[{n:"country=US",kids:[{n:"year=2012",kids:[{n:"month=12",kids:[{f:"File"}]},{n:"month=11",kids:[{f:"File"}]}]},{n:"year=2015"}]},{n:"country=CANADA",kids:[{n:"year=2012"},{n:"year=2014",kids:[{n:"month=11",kids:[{f:"File"}]}]}]}]},
 "Slide 28 · orders":{root:"orders",kids:[{n:"year=2021",kids:[{n:"month=1",kids:[{f:"file1.parquet"},{f:"file2.parquet"}]},{n:"month=2",kids:[{f:"file3.parquet"}]}]},{n:"year=2022",kids:[{n:"month=11",kids:[{f:"file4.parquet"},{f:"file5.parquet"}]},{n:"month=12",kids:[{f:"file6.parquet"}]}]}]}};
const tt=$("#tree-tabs");let curTree=Object.keys(TREES)[0];
Object.keys(TREES).forEach(k=>{const b=document.createElement("button");b.className="btn";b.type="button";b.textContent=k;b.onclick=()=>{curTree=k;drawTree()};tt.appendChild(b)});
function drawTree(){[...tt.children].forEach(b=>b.classList.toggle("on",b.textContent===curTree));const T=TREES[curTree];
 const rec=(nodes,path)=>`<ul>${nodes.map(nd=>{const p=path+"/"+(nd.n||nd.f);return`<li><button type="button" class="${nd.f?"file":""}" data-p="${esc(p)}" data-f="${nd.f?1:0}">${nd.f?"▤ ":"▸ "}${esc(nd.n||nd.f)}</button>${nd.kids?rec(nd.kids,p):""}</li>`}).join("")}</ul>`;
 const el=$("#tree");el.innerHTML=`<li><button type="button" data-p="${esc(T.root)}" data-f="0">▾ ${esc(T.root)}</button>${rec(T.kids,T.root)}</li>`;
 el.querySelectorAll("button").forEach(b=>b.onclick=()=>pickTree(b));pickTree(el.querySelector("button.file")||el.querySelector("button"))}
function pickTree(b){$("#tree").querySelectorAll("button").forEach(x=>x.classList.toggle("on",x===b));const p=b.dataset.p,isF=b.dataset.f==="1";
 const keys=p.split("/").filter(s=>s.includes("=")).map(s=>s.split("="));
 $("#tree-info").innerHTML=`<span class="kicker">${isF?"Data file":"Folder"}</span><h4 style="word-break:break-all;font-family:var(--f-mono);font-size:var(--s-1)">${esc(p)}</h4>`+(keys.length?`<p>Partition values implied by the path:</p><div class="tbl"><table><tbody>${keys.map(k=>`<tr><td><b>${esc(k[0])}</b></td><td class="num">${esc(k[1])}</td></tr>`).join("")}</tbody></table></div>`:"<p>The table's root folder. Every partition is a subdirectory below it.</p>")+(isF?`<p>Every row in this file has these values. They are not stored inside the file; Hive reads them from the folder names.</p>`:keys.length?`<p>A query that filters on ${keys.map(k=>esc(k[0])+" = "+esc(k[1])).join(" AND ")} only needs to open this folder.</p>`:"")}
drawTree();

/* ---------- primitive type byte bars ---------- */
$("#bytes").innerHTML=[["TINYINT",1,"−128 to 127"],["SMALLINT",2,"−32,768 to 32,767"],["INT",4,"about ±2.1 billion"],["BIGINT",8,"about ±9.2 × 10¹⁸"]].map(r=>`<div class="brow"><code>${r[0]}</code><div class="bcells" aria-label="${r[1]} byte${r[1]>1?"s":""}">${Array.from({length:8},(_,i)=>`<i class="${i<r[1]?"f":""}"></i>`).join("")}</div><span class="rng">${r[1]} byte${r[1]>1?"s":""} · ${r[2]}</span></div>`).join("");

/* ---------- complex type playground ---------- */
const CXC=`<span class="k">CREATE TABLE</span> students (
  id        INT,
  info      STRUCT&lt;name:STRING, dept:STRING&gt;,
  marks     MAP&lt;STRING, INT&gt;,
  subjects  ARRAY&lt;STRING&gt;
);

<span class="c">-- one example row</span>
id       = 1007
info     = {name: <span data-k="n">"Student A"</span>, dept: <span data-k="d">"CSE"</span>}
marks    = {"quiz": <span data-k="q">18</span>, "exam": <span data-k="e">62</span>}
subjects = [<span data-k="s0">"Big Data"</span>, <span data-k="s1">"Data Mining"</span>, <span data-k="s2">"Statistics"</span>]`;
$("#cx-code").innerHTML=CXC;
const CXE=[["info.name","n",'"Student A"',"Struct: access a named field with DOT (.) notation."],["info.dept","d",'"CSE"',"Struct: dot notation again, a different field."],["marks['exam']","e","62","Map: key-value tuples, accessed with ['element name']."],["marks['quiz']","q","18","Map: look up a different key."],["subjects[0]","s0",'"Big Data"',"Array: indexable list, [n] with a zero-based index, so [0] is the first element."],["subjects[2]","s2",'"Statistics"',"Array: [2] is the third element because counting starts at 0."],["subjects[3]","",'NULL',"Array: index 3 is past the end of a 3-element list, so Hive returns NULL instead of an error."]];
const cxb=$("#cx-btns");
CXE.forEach((e,i)=>{const b=document.createElement("button");b.className="btn";b.type="button";b.innerHTML=`<code>${esc(e[0])}</code>`;b.onclick=()=>cx(i);cxb.appendChild(b)});
function cx(i){const e=CXE[i];[...cxb.children].forEach((b,j)=>b.classList.toggle("on",i===j));$("#cx-code").querySelectorAll("[data-k]").forEach(s=>s.classList.toggle("hl",s.dataset.k===e[1]));$("#cx-res").textContent=`SELECT ${e[0]} → ${e[2]}`;$("#cx-why").textContent=e[3]}
cx(0);

/* ---------- schema on read vs write ---------- */

let sorBusy=false;
$("#sor-run").onclick=async()=>{if(sorBusy)return;sorBusy=true;$("#sor-run").disabled=true;const W=[...$("#lane-w").children],R=[...$("#lane-r").children],LW=$("#sor-log-w"),LR=$("#sor-log-r");LW.innerHTML="";LR.innerHTML="";
 const add=(t,c)=>{const hive=t.startsWith("Hive");const li=document.createElement("li");li.className=c;li.textContent=t.replace(/^(Hive|RDBMS)( query)?: /,(m,a,q)=>q?"Query: ":"").replace(/^./,x=>x.toUpperCase());(hive?LR:LW).appendChild(li)};
 const clr=()=>[...W,...R].forEach(s=>s.className="station");clr();
 W[0].classList.add("act");R[0].classList.add("act");await sleep(500);
 R[1].classList.add("act");add("Hive: LOAD DATA just copies sales.csv into the table's HDFS folder. Nothing is checked.","t");
 W[1].classList.add("act");add("RDBMS: reads, parses and validates every row before storing it…","a");await sleep(600);
 R[2].classList.add("good");add("Hive: load finished almost instantly (schema on read).","t");await sleep(900);
 W[1].className="station bad";add("RDBMS: row 3 rejected at load time: \"abc\" is not an INT.","r");await sleep(600);
 W[2].classList.add("good");add("RDBMS: rows 1–2 serialized into the database's internal format. Slow load, but data is clean.","a");await sleep(700);
 W[3].classList.add("good");add("RDBMS query: returns 2 clean rows.","a");
 R[3].classList.add("act");await sleep(600);R[3].className="station bad";add("Hive query: the schema is applied now. Row 3's price can't be read as INT, so Hive returns NULL for it.","r");
 sorBusy=false;$("#sor-run").disabled=false;$("#sor-run").textContent="Run again"};

/* ---------- live internet-minute counter ---------- */
const TICK=[["Emails sent",241.2e6],["Text messages",18.8e6],["Emoji sent",6.94e6],["Google searches",2.4e6],["YouTube hours viewed",694000],["ChatGPT visits",22831]];
const tk=$("#ticker");tk.innerHTML=TICK.map(t=>`<div><b>0</b><span>${esc(t[0])}</span></div>`).join("");
let tStart=null,tVis=false,tElapsed=0,tLast=0;
new IntersectionObserver(es=>{tVis=es[0].isIntersecting;if(tVis)tLast=performance.now()}).observe(tk);
setInterval(()=>{if(!tVis)return;const now=performance.now();tElapsed+=(now-tLast)/1000;tLast=now;const bs=tk.querySelectorAll("b");TICK.forEach((t,i)=>{bs[i].textContent=Math.floor(t[1]/60*tElapsed).toLocaleString("en-US")})},200);


/* ---------- 1.7 analytics stack ---------- */
function buildStack(){const Y=i=>.45+i*1.0,H=.8,D=2.2;const items=[
 {label:"Cloud",kicker:"Layer 1 · Infrastructure platforms",title:"Cloud",desc:"Examples: Azure, Amazon…",color:C.slate2,tc:"#E7EBF3",pos:[-2.75,Y(0),0],size:[2.5,H,D]},
 {label:"Enterprise\ndistributed systems",ls:.2,kicker:"Layer 1 · Infrastructure platforms",title:"Enterprise distributed systems",desc:"Examples: IBM, Oracle, Tibco…",color:C.slate2,tc:"#E7EBF3",pos:[0,Y(0),0],size:[2.5,H,D]},
 {label:"Others",kicker:"Layer 1 · Infrastructure platforms",title:"Others",desc:"Any other infrastructure the platforms run on.",color:C.slate2,tc:"#E7EBF3",pos:[2.75,Y(0),0],size:[2.5,H,D]},
 {label:"Data stream\nprocessing",ls:.21,kicker:"Layer 2 · Big data platforms",title:"Data stream processing platforms",desc:"Process data in motion.",list:["Storm","Kafka","Flume","ActiveMQ","AWS Kinesis","Microsoft Azure…"],color:C.teal,pos:[-2.05,Y(1),0],size:[3.9,H,D]},
 {label:"Stored data\nprocessing",ls:.21,kicker:"Layer 2 · Big data platforms",title:"Stored data processing platforms",desc:"Process data at rest.",list:["Hadoop","Spark…"],color:C.amber,pos:[2.05,Y(1),0],size:[3.9,H,D]},
 {label:"Data stream\nanalytics",ls:.21,kicker:"Layer 3 · Analytics platforms",title:"Data stream analytics platforms",list:["Drools Fusion","Esper","Event Swarm","InfoSphere Streams","Azure Stream Analytics…"],color:0x3FB3A8,pos:[-1.85,Y(2),0],size:[3.5,H,D]},
 {label:"Stored data\nanalytics",ls:.21,kicker:"Layer 3 · Analytics platforms",title:"Stored data analytics platforms",list:["Elastic Search","Pentaho…"],color:0xE0A22E,pos:[1.85,Y(2),0],size:[3.5,H,D]},
 {label:"Analytics techniques\n& functions",ls:.21,kicker:"Layer 4 · Analytics tools",title:"Analytics techniques and functions",list:["Advanced statistics","Machine learning","Text processing…"],color:C.blue,pos:[0,Y(3),0],size:[6.2,H,D]},
 {label:"Specific solutions",kicker:"Layer 5 · Analytics solutions",title:"Specific solutions",list:["Finance","Health","Social Media","IoT…"],color:C.lilac,pos:[0,Y(4),0],size:[4.6,H,D]}];
 const st=blocksScene($("#st-stack"),$("#pn-stack"),items,{cam:[5,5.5,12],look:[0,2.3,0],initial:4,flat:it=>rowsFlat(it,[[8],[7],[5,6],[3,4],[0,1,2]],{labels:["L5","L4","L3","L2","L1"],widths:[56,76,88,96,100],tile:i=>({style:"min-height:54px"})})});
 if(st){[1,2,3,4,5].forEach(l=>{const s=sprite("L"+l,.3,{color:"#6C7A94"});s.position.set(-4.7,.45+(l-1),0);st.root.add(s)})}}

/* ---------- 2.2 pyramid ---------- */
function buildPyr(){const lv=[
 {n:"Unstructured",rb:3.3,rt:2.55,c:0x2FA39B,desc:"Information with no predefined data model, schema or organisational structure, so it is hard to store and query in a traditional RDBMS. Data with no inherent structure: text documents, PDFs, images, video.",list:["<b>Machine-generated:</b> satellite images, scientific data, photographs and video, radar or sonar data","<b>Human-generated:</b> Word, PDF, text; social media (Facebook, Twitter, LinkedIn); mobile data (text messages); website contents (blogs, Instagram)"]},
 {n:"Quasi-structured",rb:2.45,rt:1.75,c:C.rose,desc:"Sits between structured and unstructured data: loose or irregular patterns, recognisable tags and partial organisation that need specialised parsing.",list:["<b>Clickstream data:</b> sequence of pages a user visits; varies by session length and path","<b>Server and web logs:</b> timestamp + event pattern with variable-length error or diagnostic text","<b>Email headers:</b> standard fields (To, From, Subject, routing) with unstructured bodies","<b>Sensor and IoT streams:</b> periodic telemetry where fields drop out or change by event type","<b>Fig 1-6:</b> Google search for \"EMC data science\" → EMC campaign page → certification page. Each visit adds one URL to the log (3 URLs)"]},
 {n:"Semi-structured",rb:1.65,rt:.95,c:0xF29A4A,desc:"Textual data files with a discernible pattern that enables parsing, such as XML data files that are self-describing and defined by an XML schema.",list:["<b>Fig 1-5:</b> HTML source of the EMC website (meta tags, title, stylesheet links, script tags), opened through the browser's View → Source"]},
 {n:"Structured",rb:.85,rt:.04,c:C.amber,desc:"Data containing a defined data type, format and structure: transaction data, traditional RDBMS, CSV files and even simple spreadsheets.",list:["<b>Fig 1-4:</b> Summer Food Service Program table (data as of 1 Aug 2011), fiscal years 1969–1990, including a TQ (transition quarter) row","Columns: Number of Sites (thousands), Peak (July) Participation (thousands), Meals Served (millions), Total Federal Expenditures (million $)"]}];
 const H=1,G=.14;const items=lv.map((l,i)=>{const y=H/2+i*(H+G);return{label:(4-i)+"  "+l.n,ls:.24,tc:"#E7EBF3",kicker:`Level 0${4-i} · ${i===3?"most":i===0?"least":"more"} structured`,title:l.n+" data",desc:l.desc,list:l.list,color:l.c,geo:new THREE.CylinderGeometry(l.rt,l.rb,H,4),rotY:Math.PI/4,pos:[0,y,0],lp:[0,y,l.rb+.12]}});
 items.forEach(it=>{it.tc="#0B111C"});
 const st=blocksScene($("#st-pyr"),$("#pn-pyr"),items,{cam:[5.5,4.6,10],look:[0,2.1,0],initial:3,aspectRef:1.4,flat:it=>rowsFlat(it,[[3],[2],[1],[0]],{widths:[26,50,74,100],tile:i=>{const p=((lv[i].rb-lv[i].rt)/(2*lv[i].rb)*100).toFixed(1);return{cls:"clip",style:`clip-path:polygon(${p}% 0,${100-p}% 0,100% 100%,0 100%);min-height:74px;justify-content:flex-end;padding-bottom:12px;border-radius:0`}}})});
 if(st){const ar=sprite("▲ more structured",.24,{color:"#97A3BA"});ar.position.set(-3.6,4.4,0);st.root.add(ar)}}

/* ---------- 2.4 five pillars ---------- */
function buildPillars(){const D=2.4,tw=1.1,gap=.15,x0=-(6*tw+5*gap)/2+tw/2;
 const acc=[["Batch\nMapReduce",C.amber,"Batch","MapReduce","Classic batch processing (Map then Reduce)."],["Script\nPig",0xF29A4A,"Script","Pig","Pig Latin scripts compiled to MapReduce."],["SQL\nHive/Tez",C.blue,"SQL","Hive/Tez, HCatalog","SQL-like queries; HCatalog shares table metadata."],["NoSQL\nHBase",C.mint,"NoSQL","HBase, Accumulo","Random real-time read/write stores."],["Stream\nStorm",C.teal,"Stream","Storm","Real-time stream computation."],["Others\nIn-Memory",C.lilac,"Others","In-memory analytics, ISV engines","E.g. Spark (in-memory) and third-party engines."]];
 const items=[
  {label:"HDFS",ls:.3,kicker:"Pillar 1 · Data Management",title:"HDFS (Hadoop Distributed File System)",desc:"The storage layer. Stores and processes vast quantities of data in a layer that scales linearly, on low-cost commodity hardware.",color:0x8293B3,pos:[0,.3,0],size:[7.6,.6,D]},
  {label:"YARN : Data Operating System",ls:.26,kicker:"Pillar 1 · Data Management",title:"YARN",desc:"The resource management layer that lets many data access engines share the cluster and the same data.",color:0x5D6F92,tc:"#E7EBF3",pos:[0,.95,0],size:[7.6,.6,D]},
  ...acc.map((a,i)=>({label:a[0],ls:.19,kicker:"Pillar 2 · Data Access · "+a[2],title:a[3],desc:a[4]+" Data access means interacting with data in a wide variety of ways, from batch to real-time.",color:a[1],pos:[x0+i*(tw+gap),1.25+1,0],size:[tw,2,D]})),
  {label:"Governance\n& Integration",ls:.19,kicker:"Pillar 3 · Data Governance & Integration",title:"Governance & Integration",desc:"Data workflow, lifecycle & governance. Quickly and easily load data, and manage it according to policy.",list:["Falcon","Sqoop: bulk RDBMS ↔ Hadoop transfer","Flume: streaming and log data into Hadoop","NFS","WebHDFS"],color:0x6BA6D6,pos:[-5.1,1.7,0],size:[1.8,3.4,D]},
  {label:"Security",ls:.22,kicker:"Pillar 4 · Security",title:"Security",desc:"Authentication, Authorization, Accounting, Data Protection, at every layer of the stack.",list:["Storage: HDFS","Resources: YARN","Access: Hive, …","Pipeline: Falcon","Cluster: Knox (perimeter gateway, reverse proxy)","Ranger: centralized authorization, fine-grained access control"],color:C.rose,pos:[5.1,1.7,0],size:[1.8,3.4,D]},
  {label:"Operations",ls:.22,kicker:"Pillar 5 · Operations",title:"Operations",desc:"Provision, manage, monitor and operate Hadoop clusters at scale.",list:["Provision, manage & monitor: Ambari (cluster management, provisioning), ZooKeeper (distributed coordination)","Scheduling: Oozie (workflow scheduler, coordination engine)"],color:0xD6A85A,pos:[7.1,1.7,0],size:[1.8,3.4,D]}];
 const st=blocksScene($("#st-pil"),$("#pn-pil"),items,{cam:[3,6,15],look:[1,1.6,0],initial:1,aspectRef:1.7,flat:it=>{const A=(a,i)=>`<div style="grid-area:${a};display:grid">${flatTile(it,i)}</div>`;return`<div class="pil2">${A("gov",8)}<div class="acc">${[2,3,4,5,6,7].map(i=>flatTile(it,i)).join("")}</div>${A("yarn",1)}${A("hdfs",0)}${A("sec",9)}${A("ops",10)}</div>`}});
 if(st)st.root.position.x=-1}

/* ---------- 1.5 V particles ---------- */
const VMODES={
 volume:{name:"Volume",tag:"Data at rest",desc:"Terabytes to exabytes of existing data to process.",col:[0.96,0.72,0.24]},
 velocity:{name:"Velocity",tag:"Data in motion",desc:"Streaming data; milliseconds to seconds to respond.",col:[0.31,0.82,0.77]},
 variety:{name:"Variety",tag:"Data in many forms",desc:"Structured, unstructured, text, multimedia.",col:null},
 veracity:{name:"Veracity",tag:"Data in doubt",desc:"Uncertainty due to data inconsistency and incompleteness, ambiguities, latency, deception, model approximations.",col:[0.6,0.64,0.72]},
 value:{name:"Value",tag:"Demchenko's 5th V",desc:"The worth extracted from data: hypothetical, correlations, events, statistical. Most raw particles collapse into a small, bright insight.",col:[1,0.82,0.35]}};
function buildVs(){const st=makeStage($("#st-vs"),{cam:[0,2.5,14],look:[0,0,0],floor:false,yaw:3.2});if(!st)return;
 const N=900,pos=new Float32Array(N*3),col=new Float32Array(N*3),tgt=new Float32Array(N*3),tcol=new Float32Array(N*3),spd=new Float32Array(N);
 for(let i=0;i<N;i++){pos[i*3]=(Math.random()-.5)*10;pos[i*3+1]=(Math.random()-.5)*6;pos[i*3+2]=(Math.random()-.5)*6;spd[i]=2+Math.random()*5;col[i*3]=col[i*3+1]=col[i*3+2]=.6}
 const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));
 const pts=new THREE.Points(g,new THREE.PointsMaterial({size:.16,vertexColors:true,sizeAttenuation:true}));st.root.add(pts);
 const palette=[[.96,.72,.24],[.31,.82,.77],[.49,.6,1],[.95,.45,.5],[.56,.84,.58],[.72,.61,1]];
 let mode="volume";
 function setMode(m){mode=m;const M=VMODES[m];
  for(let i=0;i<N;i++){let x,y,z,c=M.col;
   if(m==="volume"){const a=i%10,b=Math.floor(i/10)%9,d=Math.floor(i/90);x=(a-4.5)*.55;y=(b-4)*.55;z=(d-4.5)*.55}
   else if(m==="velocity"){const lane=i%5;x=pos[i*3];y=(lane-2)*.9+(Math.random()-.5)*.15;z=(Math.random()-.5)*.6}
   else if(m==="variety"){const k=i%6,ang=k/6*Math.PI*2;const cx=Math.cos(ang)*3.6,cy=Math.sin(ang)*2.2;const r=Math.random()*1.0,t=Math.random()*6.28,p=Math.acos(2*Math.random()-1);x=cx+r*Math.sin(p)*Math.cos(t);y=cy+r*Math.sin(p)*Math.sin(t);z=r*Math.cos(p);c=palette[k]}
   else if(m==="veracity"){const r=1.5+Math.random()*3.5,t=Math.random()*6.28,p=Math.acos(2*Math.random()-1);x=r*Math.sin(p)*Math.cos(t);y=r*Math.sin(p)*Math.sin(t)*.8;z=r*Math.cos(p);const b=.2+Math.random()*.6;c=[b,b*1.05,b*1.15]}
   else{const core=i<N*.72;const r=core?Math.random()*.7:3+Math.random()*2.5,t=Math.random()*6.28,p=Math.acos(2*Math.random()-1);x=r*Math.sin(p)*Math.cos(t);y=r*Math.sin(p)*Math.sin(t);z=r*Math.cos(p);c=core?M.col:[.25,.28,.34]}
   tgt[i*3]=x;tgt[i*3+1]=y;tgt[i*3+2]=z;tcol[i*3]=c[0];tcol[i*3+1]=c[1];tcol[i*3+2]=c[2]}
  [...$("#v-btns").children].forEach(b=>b.classList.toggle("on",b.dataset.m===m));
  $("#pn-vs").innerHTML=`<span class="kicker">${M.tag}</span><h4>${M.name}</h4><p>${M.desc}</p><p style="color:var(--dim)">${m==="volume"?"A huge, dense block of stored data.":m==="velocity"?"Particles stream past continuously; the system must keep up.":m==="variety"?"Six clusters, six different kinds of data that all need handling.":m==="veracity"?"Particles flicker and drift: you can't fully trust where they are.":"The goal of big data: turn mass into insight."}</p>`;st.dirty=true}
 Object.keys(VMODES).forEach(k=>{const b=document.createElement("button");b.className="btn";b.type="button";b.dataset.m=k;b.textContent=VMODES[k].name;b.onclick=()=>setMode(k);$("#v-btns").appendChild(b)});
 st.ticks.push((dt,t)=>{const f=Math.min(1,dt*(reduced?8:3));
  for(let i=0;i<N;i++){const j=i*3;
   if(mode==="velocity"){pos[j]+=spd[i]*dt*(reduced?.3:1);if(pos[j]>6){pos[j]=-6}tgt[j]=pos[j]}
   pos[j]+=(tgt[j]-pos[j])*f;pos[j+1]+=(tgt[j+1]-pos[j+1])*f;pos[j+2]+=(tgt[j+2]-pos[j+2])*f;
   if(mode==="veracity"&&!reduced){pos[j]+=(Math.random()-.5)*.06;pos[j+1]+=(Math.random()-.5)*.06}
   col[j]+=(tcol[j]-col[j])*f;col[j+1]+=(tcol[j+1]-col[j+1])*f;col[j+2]+=(tcol[j+2]-col[j+2])*f}
  if(!reduced&&mode!=="velocity")pts.rotation.y+=dt*.12;
  g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;return true});
 setMode("volume")}

/* ---------- 2.8 YARN ---------- */
function buildYarn(){const st=makeStage($("#st-yarn"),{cam:[0,7,13],look:[0,1.2,0],aspectRef:1.5});if(!st)return;const tw=tweener(st);
 const info={
  client:["Client","Submits the job (application) to the ResourceManager."],
  rm:["ResourceManager","The ultimate authority that arbitrates resources among all applications. Has a pluggable <b>Scheduler</b> (allocates resources subject to capacities, queues, etc., using the abstract <b>Resource Container</b>: memory, CPU, disk, network) and an <b>Application Manager</b>."],
  nm:["NodeManager","The per-machine framework agent. Responsible for containers, monitoring their resource usage (CPU, memory, disk, network) and reporting it to the ResourceManager/Scheduler."],
  am:["ApplicationMaster","Per-application, in effect a framework-specific library. Negotiates resources from the ResourceManager and works with the NodeManager(s) to execute and monitor the tasks. It runs inside a container itself."],
  ct:["Container","A bundle of resources (memory, CPU, disk, network) on one node, in which a task runs."]};
 const show=k=>{$("#pn-yarn").innerHTML=`<span class="kicker">YARN component</span><h4>${info[k][0]}</h4><p style="color:var(--muted);font-size:var(--s-1)">${info[k][1]}</p>`};
 const mk=(geo,color,p,key)=>{const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,roughness:.55,emissive:color,emissiveIntensity:.08}));m.position.set(...p);m.userData.k=key;st.root.add(m);st.pick.push(m);return m};
 const client=mk(new THREE.SphereGeometry(.55,24,16),0xF2A0A8,[-6,1.2,0],"client");
 const rm=mk(new THREE.BoxGeometry(2.6,1.3,1.6),C.rose,[-2,1.2,0],"rm");
 const lab=(t,p,s)=>{const x=sprite(t,s||.24,{color:"#E7EBF3"});x.position.set(...p);st.root.add(x)};
 lab("Client",[-6,2.2,0]);lab("ResourceManager",[-2,2.3,0]);lab("Scheduler · App Manager",[-2,.25,0],.18);
 const nms=[],slots=[];
 [[3.2,2.6,-1.6],[3.2,1.2,1.2],[3.2,-.2,4]].forEach((p,i)=>{const n=mk(new THREE.BoxGeometry(3.4,.35,2),C.blue,[p[0],p[1]-.4,p[2]-1.2],"nm");nms.push(n);lab("NodeManager "+(i+1),[p[0]-2.6,p[1]-.4,p[2]-1.2],.2);slots.push([[p[0]-.8,p[1]+.05,p[2]-1.2],[p[0]+.8,p[1]+.05,p[2]-1.2]])});
 const ctGeo=new THREE.BoxGeometry(1.3,.6,1.3);const cts=[];
 function ct(p,isAM){const m=mk(ctGeo,isAM?C.lilac:C.teal,p,isAM?"am":"ct");m.scale.setScalar(.001);cts.push(m);const s=sprite(isAM?"AppMaster":"task",.18,{color:"#0B111C",weight:700});s.position.set(p[0],p[1],p[2]+.68);s.scale.multiplyScalar(.001);st.root.add(s);m.userData.s=s;m.userData.sScale=s.scale.clone().multiplyScalar(1000);tw(.5,k=>{m.scale.setScalar(Math.max(.001,k));s.scale.copy(m.userData.sScale).multiplyScalar(Math.max(.001,k))});return m}
 st.onPick=o=>show(o.userData.k);show("rm");
 const legend={submit:[0xFFFFFF,"job submission"],status:[C.blue,"node status"],req:[C.lilac,"resource request"],alloc:[C.amber,"resource allocation"],coord:[C.teal,"task coordination"]};
 function packet(a,b,color,dur){return new Promise(res=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.16,12,10),new THREE.MeshBasicMaterial({color}));st.root.add(m);const A=a.clone?a.clone():new THREE.Vector3(...a),B=b.clone?b.clone():new THREE.Vector3(...b);tw(dur||.9,k=>{m.position.lerpVectors(A,B,k);m.position.y+=Math.sin(Math.PI*k)*.8},()=>{st.root.remove(m);res()})})}
 const say=(t,c)=>{$("#yarn-step").innerHTML=`<span class="badge ${c||"ok"}">${t[0]}</span> ${t[1]}`};
 let busy=false;
 // background node status heartbeats
 let hb=0;st.ticks.push(dt=>{hb+=dt;if(hb>2.2&&!reduced){hb=0;nms.forEach(n=>packet(n.position,rm.position,C.blue,1.1))}return false});
 $("#yarn-run").onclick=async()=>{if(busy)return;busy=true;$("#yarn-run").disabled=true;cts.forEach(m=>{st.root.remove(m);st.root.remove(m.userData.s)});cts.length=0;st.pick=st.pick.filter(m=>m.userData.k!=="ct"&&m.userData.k!=="am");
  say(["1 Job submission","The client submits the application to the ResourceManager."]);await packet(client.position,rm.position,0xffffff);
  say(["2 Allocation","The ResourceManager's Scheduler allocates a container on NodeManager 2 to start the ApplicationMaster."],"warn");await packet(rm.position,new THREE.Vector3(...slots[1][0]),C.amber);const am=ct(slots[1][0],true);await new Promise(r=>setTimeout(r,500));
  say(["3 Resource request","The ApplicationMaster negotiates resources (containers) from the ResourceManager."]);await packet(am.position,rm.position,C.lilac);
  say(["4 Resource allocation","The Scheduler grants containers on NodeManagers 1, 2 and 3 based on resource requirements."],"warn");await Promise.all([packet(rm.position,new THREE.Vector3(...slots[0][0]),C.amber),packet(rm.position,new THREE.Vector3(...slots[0][1]),C.amber),packet(rm.position,new THREE.Vector3(...slots[2][0]),C.amber)]);[slots[0][0],slots[0][1],slots[2][0]].forEach(p=>ct(p,false));await new Promise(r=>setTimeout(r,500));
  say(["5 Task coordination","The ApplicationMaster works with the NodeManagers to execute and monitor the tasks. Node status flows to the RM all along (blue)."]);await Promise.all([[slots[0][0]],[slots[0][1]],[slots[2][0]]].map(p=>packet(am.position,new THREE.Vector3(...p[0]),C.teal,1.1)));
  busy=false;$("#yarn-run").disabled=false;$("#yarn-run").textContent="Run again"}}

/* ---------- 2.9 HDFS ---------- */
function buildHdfs(){const st=makeStage($("#st-hdfs"),{cam:[0,7.5,15.5],look:[0,1.6,0],aspectRef:1.45});if(!st)return;const tw=tweener(st);
 const FILE={1:"foo",2:"foo",4:"foo",3:"bar",5:"bar"};const fileCol=b=>FILE[b]==="foo"?"#F5B83D":"#4FD1C5";
 const blockMat={};[1,2,3,4,5].forEach(b=>{const t=textCanvas(String(b),{fs:90,bg:fileCol(b),color:"#0B111C",weight:800});blockMat[b]=new THREE.MeshStandardMaterial({map:t.tex,roughness:.5})});
 const bgeo=new THREE.BoxGeometry(.5,.5,.5);
 let cluster,nodes,nn,clientM,lines=[];
 const logEl=$("#hdfs-log");
 function log(t,c){const li=document.createElement("li");li.className=c||"";li.textContent=t;logEl.prepend(li);while(logEl.children.length>6)logEl.lastChild.remove()}
 function slotPos(n,i){const col=i%2,row=Math.floor(i/2)%2,lay=Math.floor(i/4);return new THREE.Vector3(n.x+(col-.5)*.6,.85+.28+lay*.56,(row-.5)*.6)}
 function layout(n){n.blocks.forEach((b,i)=>{const m=n.meshes[b];if(m){m.position.copy(slotPos(n,i))}})}
 function addMesh(n,b){const m=new THREE.Mesh(bgeo,blockMat[b]);n.meshes[b]=m;cluster.add(m);return m}
 function build(){if(cluster)st.root.remove(cluster);cluster=new THREE.Group();st.root.add(cluster);lines=[];
  const L=[[1,2],[1,5],[3,5,2],[1,4,5,3],[4,2],[3,4]];const xs=[-5.6,-3.7,-1.8,1.8,3.7,5.6];
  nodes=L.map((bl,i)=>{const x=xs[i];const box=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.7,1.6),new THREE.MeshStandardMaterial({color:0x2A3A57,roughness:.6,emissive:0x2A3A57,emissiveIntensity:.15}));box.position.set(x,0,0);
   const ed=new THREE.LineSegments(new THREE.EdgesGeometry(box.geometry),new THREE.LineBasicMaterial({color:0x7C98FF,transparent:true,opacity:.35}));box.add(ed);
   const n={id:"N"+(i+1),x,box,blocks:bl.slice(),meshes:{},alive:true,rack:i<3?1:2};box.userData.node=n;cluster.add(box);st.pick.push(box);
   const s=sprite("DataNode "+n.id,.2,{color:"#E7EBF3"});s.position.set(x,-.05,.86);cluster.add(s);n.spr=s;
   n.blocks.forEach(b=>addMesh(n,b));layout(n);return n});
  st.pick=st.pick.filter(o=>o.parent===cluster);
  [["Rack 1",-3.7],["Rack 2",3.7]].forEach(([t,x])=>{const s=sprite(t,.24,{color:"#97A3BA"});s.position.set(x,-1.3,0);cluster.add(s);const bar=new THREE.Mesh(new THREE.BoxGeometry(5.6,.05,2.2),new THREE.MeshBasicMaterial({color:0x22304A}));bar.position.set(x,-.88,0);cluster.add(bar)});
  nn=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.2,1.6),new THREE.MeshStandardMaterial({color:0xB79CFF,roughness:.5,emissive:0xB79CFF,emissiveIntensity:.12}));nn.position.set(0,4.6,0);nn.userData.nn=true;cluster.add(nn);st.pick.push(nn);
  const ns=sprite("NameNode",.3,{color:"#0B111C",weight:800});ns.position.set(0,4.75,.85);cluster.add(ns);const ns2=sprite("metadata only",.17,{color:"#2A1F4A"});ns2.position.set(0,4.3,.85);cluster.add(ns2);
  clientM=new THREE.Mesh(new THREE.SphereGeometry(.55,24,16),new THREE.MeshStandardMaterial({color:0xF2A0A8,roughness:.5,emissive:0xF2A0A8,emissiveIntensity:.15}));clientM.position.set(-7.4,4.4,0);cluster.add(clientM);
  const cs=sprite("Client",.24,{color:"#E7EBF3"});cs.position.set(-7.4,5.3,0);cluster.add(cs);
  table();st.dirty=true}
 function holders(b){return nodes.filter(n=>n.alive&&n.blocks.includes(b))}
 function table(){$("#hdfs-tbl").innerHTML=[1,2,3,4,5].map(b=>{const h=holders(b);const c=h.length;const cls=c>=3?"ok":c===0?"bad":"warn";return`<tr><td class="num">${b}</td><td>${FILE[b]}</td><td class="num">${h.map(n=>n.id).join(", ")||"none"}</td><td><span class="badge ${cls}">${c===0?"LOST":c+" / 3"}</span></td></tr>`}).join("")}
 function line(a,b,color){const g=new THREE.BufferGeometry().setFromPoints([a.clone(),b.clone()]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.95}));cluster.add(l);lines.push(l);return l}
 function clearLines(){lines.forEach(l=>cluster.remove(l));lines=[];st.dirty=true}
 function packet(a,b,color,dur,arc){return new Promise(res=>{const m=new THREE.Mesh(new THREE.SphereGeometry(.13,10,8),new THREE.MeshBasicMaterial({color}));cluster.add(m);const A=a.clone(),B=b.clone();tw(dur,k=>{m.position.lerpVectors(A,B,k);m.position.y+=Math.sin(Math.PI*k)*(arc||0)},()=>{cluster.remove(m);res()})})}
 // heartbeats
 let hb=0;st.ticks.push(dt=>{hb+=dt;if(hb>1.8&&!reduced){hb=0;nodes.forEach(n=>{if(n.alive)packet(n.box.position.clone().add(new THREE.Vector3(0,.9,0)),nn.position.clone().add(new THREE.Vector3(0,-.6,0)),0x7C98FF,1.0,0)})}return false});
 let busy=false;
 function fail(n){if(!n.alive||busy)return;n.alive=false;n.box.material.color.set(0x5A2630);n.box.material.emissive.set(C.rose);n.box.material.emissiveIntensity=.25;
  const lost=n.blocks.slice();lost.forEach(b=>{const m=n.meshes[b];tw(.5,k=>m.scale.setScalar(Math.max(.001,1-k)),()=>cluster.remove(m))});n.blocks=[];n.meshes={};
  log(`${n.id} failed. Blocks ${lost.join(", ")||"(none)"} lost on that node.`,"r");table();
  setTimeout(()=>{log(`NameNode: no heartbeat from ${n.id}. Under-replicated blocks detected.`,"a");rerep(lost)},1300)}
 function rerep(lost){let pend=0;lost.forEach(b=>{const h=holders(b);if(h.length===0){log(`Block ${b} has no surviving replica. Data lost (all 3 copies gone).`,"r");return}
   let need=3-h.length;while(need>0){const cand=nodes.filter(n=>n.alive&&!n.blocks.includes(b)).sort((a,c)=>a.blocks.length-c.blocks.length);if(!cand.length){log(`Block ${b}: not enough live DataNodes for 3 replicas.`,"r");break}
    const tgt=cand[0],src=h[0];tgt.blocks.push(b);const idx=tgt.blocks.length-1;pend++;
    const fly=new THREE.Mesh(bgeo,blockMat[b]);cluster.add(fly);const A=src.meshes[b]?src.meshes[b].position.clone():src.box.position.clone(),B=slotPos(tgt,idx);
    log(`NameNode (heartbeat reply) → ${src.id}: replicate block ${b} to ${tgt.id}.`,"t");
    tw(1.2,k=>{fly.position.lerpVectors(A,B,k);fly.position.y+=Math.sin(Math.PI*k)*2.2;fly.rotation.y=k*6.28},()=>{cluster.remove(fly);addMesh(tgt,b);layout(tgt);table();if(--pend===0)log("Replication factor restored where possible.","t")});need--}});
  table()}
 st.onPick=o=>{if(o.userData.nn){log("NameNode holds the namespace tree and block → DataNode map in RAM. It stores metadata only.","a");return}if(o.userData.node)fail(o.userData.node)};
 st.onHover=o=>{nodes.forEach(n=>{if(n.alive)n.box.material.emissiveIntensity=n.box===o?.4:.15})};
 $("#hdfs-read").onclick=async()=>{if(busy)return;busy=true;clearLines();const top=new THREE.Vector3(0,-.6,0);
  const nnB=nn.position.clone().add(new THREE.Vector3(-1.7,0,0));
  log("Client → NameNode: which blocks make up /user/diana/bar?","a");line(clientM.position,nnB,0xF2A0A8);await packet(clientM.position,nnB,0xF2A0A8,.9);
  const h3=holders(3),h5=holders(5);
  log(`NameNode → Client: blocks 3, 5. Block 3 → ${h3.map(n=>n.id).join(", ")||"none"}; Block 5 → ${h5.map(n=>n.id).join(", ")||"none"}.`,"a");await packet(nnB,clientM.position,C.lilac,.9);
  const reads=[[3,h3[0]],[5,h5[0]]].filter(r=>r[1]);
  if(reads.length<2)log("At least one block of bar has no live replica, so the read fails for that block.","r");
  await Promise.all(reads.map(([b,n])=>{const m=n.meshes[b];const p=m.position.clone();line(clientM.position,p,C.teal);return packet(p,clientM.position,C.teal,1.2,1).then(()=>{tw(.4,k=>m.scale.setScalar(1+.4*Math.sin(Math.PI*k)))})}));
  if(reads.length)log(`Client reads directly from ${reads.map(r=>r[1].id+" (block "+r[0]+")").join(" and ")}. Data never passes through the NameNode.`,"t");
  setTimeout(clearLines,2500);busy=false};
 $("#hdfs-reset").onclick=()=>{if(busy)return;logEl.innerHTML="";build();log("Cluster reset to the slide layout. Every block has 3 replicas.","t")};
 build();log("Tap any DataNode to make it fail, or read the file bar.","t")}

/* ---------- 2.6 MapReduce ---------- */
function buildMR(){const st=makeStage($("#st-mr"),{cam:[0,2,19],look:[0,0,0],floor:false,yaw:.7,aspectRef:1.6});if(!st)return;const tw=tweener(st);
 const COLS=[["Input files","#97A3BA"],["1 Splitting","#7C98FF"],["2 Mapping","#F2727F"],["3 Shuffling","#8FD694"],["4 Reducing","#4FD1C5"],["5 Aggregating","#F5B83D"]];
 const STEPS=["Press Next step. The input file sits on HDFS, waiting to be processed.",
  "<b>Step 1 · Splitting.</b> The input is divided into independent chunks (here, one per line). Each chunk goes to its own map task.",
  "<b>Step 2 · Mapping.</b> Each mapper turns its chunk into key/value pairs in parallel, on the node that stores the chunk.",
  "<b>Step 3 · Shuffling and sorting.</b> All values for the same key are gathered into one list and sent to the same reducer, in sorted key order.",
  "<b>Step 4 · Reducing.</b> Each reducer sums its list and emits one key/value pair per key, in parallel.",
  "<b>Step 5 · Aggregating.</b> The reducer outputs are combined into the final result, written to HDFS."];
 let group=null,cols=[],links=[],step=0,playing=false;
 const inn=flatView(st,"");modeSwitch(st,"st-mr","2d");
 function card(lines,color,w){const fs=44,lh=fs*1.3,pad=22,W=420;const cv=document.createElement("canvas"),ctx=cv.getContext("2d");cv.width=W;cv.height=Math.ceil(pad*2+lines.length*lh);
  ctx.fillStyle="#172133";rr(ctx,2,2,W-4,cv.height-4,18);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle=color;rr(ctx,2,2,W-4,cv.height-4,18);ctx.stroke();
  ctx.fillStyle="#E7EBF3";ctx.font=`600 ${fs}px "JetBrains Mono", monospace`;ctx.textBaseline="middle";ctx.textAlign="center";lines.forEach((l,i)=>ctx.fillText(l,W/2,pad+lh*(i+.5)));
  const tex=new THREE.CanvasTexture(cv);tex.minFilter=THREE.LinearFilter;tex.generateMipmaps=false;const h=w*cv.height/W;
  const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex,transparent:true,side:THREE.DoubleSide}));m.userData.h=h;return m}
 function compute(){const raw=$("#mr-in").value.split("\n").map(s=>s.trim()).filter(Boolean).slice(0,6);const mode=$("#mr-mode").value,comb=$("#mr-comb").checked;
  const tok=l=>mode==="letters"?l.replace(/\s+/g,"").split(""):l.toLowerCase().replace(/[^\w\s']/g,"").split(/\s+/).filter(Boolean);
  const maps=raw.map(l=>{const t=tok(l);if(comb){const o=new Map();t.forEach(k=>o.set(k,(o.get(k)||0)+1));return[...o.entries()]}return t.map(k=>[k,1])});
  const sh=new Map();maps.forEach(m=>m.forEach(([k,v])=>{if(!sh.has(k))sh.set(k,[]);sh.get(k).push(v)}));const keys=[...sh.keys()].sort();
  return{raw,maps,keys,sh}}
 const cap=(arr,n)=>arr.length>n?arr.slice(0,n-1).concat(["… +"+(arr.length-n+1)]):arr;
 function build(){if(group)st.root.remove(group);group=new THREE.Group();st.root.add(group);cols=[];links=[];
  const d=compute();if(!d.raw.length){$("#mr-step").innerHTML="Type at least one line of input.";inn.innerHTML='<p style="color:var(--muted)">Type at least one line of input.</p>';st.dirty=true;return}
  const tooMany=d.keys.length>10;const keys=d.keys.slice(0,10);
  const spec=[[cap(d.raw,8)],d.raw.map(l=>[l]),d.maps.map(m=>cap(m.map(([k,v])=>`${k},${v}`),7)),keys.map(k=>[`${k}: ${cap(d.sh.get(k).map(String),5).join(",")}`]),keys.map(k=>[`${k},${d.sh.get(k).reduce((a,b)=>a+b,0)}`]),[cap(keys.map(k=>`${k}, ${d.sh.get(k).reduce((a,b)=>a+b,0)}`),11)]];
  const X=[-8.6,-5.2,-1.7,1.8,5.2,8.6],W=[2.9,2.9,2.9,3.0,2.7,2.9];
  let maxH=0;spec.forEach((cards,ci)=>{const ms=cards.map(lines=>card(lines,COLS[ci][1],W[ci]));const gap=.25;const tot=ms.reduce((a,m)=>a+m.userData.h,0)+gap*(ms.length-1);maxH=Math.max(maxH,tot);let y=tot/2;
   ms.forEach(m=>{y-=m.userData.h/2;m.position.set(X[ci],y,0);y-=m.userData.h/2+gap;m.scale.setScalar(.001);m.visible=false;group.add(m)});
   const t=sprite(COLS[ci][0],.32,{color:COLS[ci][1]});t.userData.col=ci;cols.push({ms,title:t,x:X[ci]});group.add(t)});
  cols.forEach(c=>{c.title.position.set(c.x,maxH/2+.7,0);c.title.visible=c===cols[0]});
  const s=Math.min(1,9/(maxH+1.6));group.scale.setScalar(s);
  const edge=(a,b,ci,color)=>{const A=new THREE.Vector3(a.position.x+W[ci-1]/2,a.position.y,0),B=new THREE.Vector3(b.position.x-W[ci]/2,b.position.y,0);const g=new THREE.BufferGeometry().setFromPoints([A,B]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:.75}));l.visible=false;l.userData.step=ci;group.add(l);links.push(l)};
  cols[1].ms.forEach(m=>edge(cols[0].ms[0],m,1,0x7C98FF));
  cols[1].ms.forEach((m,i)=>edge(m,cols[2].ms[i],2,0xF2727F));
  d.maps.forEach((mp,i)=>{const ks=new Set(mp.map(x=>x[0]));keys.forEach((k,j)=>{if(ks.has(k))edge(cols[2].ms[i],cols[3].ms[j],3,0x8FD694)})});
  cols[3].ms.forEach((m,i)=>edge(m,cols[4].ms[i],4,0x4FD1C5));
  cols[4].ms.forEach(m=>edge(m,cols[5].ms[0],5,0xF5B83D));
  inn.innerHTML=`<div class="mr2">${spec.map((cards,ci)=>`<div class="mr2-col" data-c="${ci}"><div class="mr2-h" style="color:${COLS[ci][1]}">${esc(COLS[ci][0])}</div>${cards.map(lines=>`<div class="mr2-card" style="border-color:${COLS[ci][1]}">${lines.map(esc).join("<br>")}</div>`).join("")}</div>`).join("")}</div>`;
  if(tooMany)log2="Showing the first 10 keys only.";else log2="";
  step=0;reveal(0,true)}
 let log2="";
 function reveal(n,instant){step=n;cols.forEach((c,ci)=>{const show=ci<=n;c.title.visible=show;c.ms.forEach((m,i)=>{if(show&&!m.visible){m.visible=true;if(instant)m.scale.setScalar(1);else{m.scale.setScalar(.001);setTimeout(()=>tw(.45,k=>m.scale.setScalar(Math.max(.001,k))),i*90)}}else if(!show){m.visible=false;m.scale.setScalar(.001)}})});
  links.forEach(l=>l.visible=l.userData.step<=n);inn.querySelectorAll(".mr2-col").forEach(c=>c.classList.toggle("off",+c.dataset.c>n));
  $("#mr-step").innerHTML=STEPS[n]+(log2?` <span style="color:var(--amber)">${log2}</span>`:"");$("#mr-prev").disabled=n===0;$("#mr-next").disabled=n===5;st.dirty=true}
 $("#mr-next").onclick=()=>{if(step<5)reveal(step+1)};$("#mr-prev").onclick=()=>{if(step>0)reveal(step-1)};
 $("#mr-play").onclick=()=>{if(playing)return;playing=true;reveal(0);let i=0;const iv=setInterval(()=>{i++;reveal(i);if(i>=5){clearInterval(iv);playing=false}},reduced?600:1300)};
 ["mr-mode","mr-comb"].forEach(id=>$("#"+id).addEventListener("change",build));
 let to;$("#mr-in").addEventListener("input",()=>{clearTimeout(to);to=setTimeout(build,400)});
 $("#mr-ex1").onclick=()=>{$("#mr-in").value="BAB\nDAD\nCAD";$("#mr-mode").value="letters";$("#mr-comb").checked=true;build()};
 $("#mr-ex2").onclick=()=>{$("#mr-in").value="The cat sat on the mat\nThe aardvark sat on the sofa";$("#mr-mode").value="words";$("#mr-comb").checked=false;build()};
 st.ticks.push((dt,t)=>{if(reduced||!group)return false;group.position.y=Math.sin(t*.8)*.05;return true});
 build()}

/* ---------- 1.3 ecosystem city ---------- */
const ECO_D={"Core Hadoop (HDFS, MR)":"HDFS for storage and MapReduce for processing: the original Hadoop (Ch 2).","HBase":"Column-oriented NoSQL store with random real-time read/write (Ch 2).","ZooKeeper":"Distributed coordination service (Ch 2, Operations).","Hive":"SQL-like data warehouse on Hadoop (Ch 2, and all of Ch 3).","Pig":"Pig Latin scripts compiled to MapReduce (Ch 2).","Mahout":"Scalable machine learning: distributed linear algebra and a Scala DSL (Ch 2).","Sqoop":"Bulk transfer between RDBMS/NoSQL stores and Hadoop (Ch 2).","Flume":"Moves streaming and log data into Hadoop (Ch 2).","Oozie":"Workflow scheduler (Ch 2, Operations).","HCatalog":"Table and storage management layer (Ch 2).","+ YARN":"Resource management layer added to core Hadoop (Ch 2).","Spark":"In-memory processing engine (Ch 2).","Solr":"Enterprise search built on Apache Lucene (Ch 2).","Kafka":"Distributed event streaming platform (Ch 2).","Parquet":"Named only on the timeline. It appears again as the .parquet files in Ch 3's partition example, but is never explained."};
function buildCity(){const st=makeStage($("#st-eco"),{cam:[0,3.6,15.5],look:[0,1.7,0],aspectRef:1.7});if(!st)return;const tw=tweener(st);
 const yrs=["2006","2008","2009","2010","2011","2012","Present"],H=.56,towers=[];
 ECO.forEach((tools,yi)=>{const x=-6.75+yi*2.25;const ys=sprite(yrs[yi],.28,{color:"#97A3BA"});ys.position.set(x,-.35,.8);st.root.add(ys);
  tools.forEach((t,j)=>{const name=t==="+ YARN"?"YARN":t.startsWith("Core")?"Core Hadoop":t;const y=H/2+j*(H+.06);
   const m=new THREE.Mesh(new THREE.BoxGeometry(2.05,H,1.2),new THREE.MeshStandardMaterial({color:C.slate2,roughness:.55}));m.position.set(x,y,0);m.scale.setScalar(.001);m.visible=false;
   const s=facePlane(name,.2,{color:"#0B111C",weight:700});s.position.z=.61;m.add(s);m.userData={t,yi,name};st.root.add(m);st.pick.push(m);towers.push(m)})});
 const pn=$("#pn-eco");
 const inn=flatView(st,`<div class="eco2">${ECO.map((tools,yi)=>`<div class="eco2-col"><div class="eco2-stack">${tools.map((t,j)=>`<button type="button" class="ft" data-t="${yi}-${j}">${esc(t==="+ YARN"?"YARN":t.startsWith("Core")?"Core Hadoop":t)}</button>`).join("")}</div><span>${yrs[yi]}</span></div>`).join("")}</div>`);
 inn.addEventListener("click",e=>{const b=e.target.closest("[data-t]");if(!b)return;const [yi,j]=b.dataset.t.split("-").map(Number);inn.querySelectorAll("[data-t]").forEach(x=>x.classList.toggle("on",x===b));const m=towers.find(x=>x.userData.yi===yi&&x.userData.t===ECO[yi][j]);if(m)st.onPick(m)});
 modeSwitch(st,"st-eco","2d");
 function set(y){inn.querySelectorAll("[data-t]").forEach(b=>{const yi=+b.dataset.t.split("-")[0];b.classList.toggle("gone",yi>y);b.style.background=hex(yi===y?C.amber:yi===0?0x8293B3:0x6B7FA6);b.style.color=yi===y?"#1A1406":"#0B111C"});towers.forEach(m=>{const d=m.userData,show=d.yi<=y;m.material.color.set(d.yi===y?C.amber:d.yi===0?0x8293B3:0x6B7FA6);
   if(show&&!m.visible){m.visible=true;tw(.5,k=>m.scale.setScalar(Math.max(.001,k)))}
   else if(!show&&m.visible){m.visible=false;m.scale.setScalar(.001)}});
  const n=towers.filter(m=>m.userData.yi<=y).length;pn.innerHTML=`<span class="kicker">Year · ${yrs[y]}</span><h4>${n} tools in the ecosystem</h4><p>New this year (amber): ${ECO[y].map(esc).join(", ")}.</p><p style="color:var(--dim)">Each column is a year; each block is a tool added that year. Tap a block for what it does.</p>`;st.dirty=true}
 st.onPick=o=>{const d=o.userData;pn.innerHTML=`<span class="kicker">Joined · ${yrs[d.yi]}</span><h4>${esc(d.name)}</h4><p>${esc(ECO_D[d.t]||"Named only on this timeline slide; neither chapter explains it.")}</p>`};
 ecoHooks.push(set);set(+$("#eco").value)}

/* ---------- 1.4 pipeline particles ---------- */
function buildPipe(){const st=makeStage($("#st-pipe"),{cam:[0,3.4,15.5],look:[0,2.4,0],aspectRef:1.75,floor:false,yaw:.8});if(!st)return;
 const pn=$("#pn-pipe");const show=d=>{pn.innerHTML=`<span class="kicker">${esc(d[0])}</span><h4>${esc(d[1])}</h4><p>${d[2]}</p>`};
 const add=(mesh,d,p)=>{mesh.position.copy(p);mesh.userData.info=d;st.root.add(mesh);st.pick.push(mesh);return mesh};
 const SRC=[["Medical scans",0xF2727F],["Social media",0x7C98FF],["News & journals",0xE7EBF3],["Satellite images",0x4FD1C5],["E-commerce",0xF5B83D],["TV & video",0xB79CFF],["Sensors & surveillance",0x8FD694]];
 const INS=["Business intelligence","Biodiversity trends","Customer purchase habits","Epidemic migration paths","Falls prevention (elderly)","Extreme weather prediction"];
 const srcP=SRC.map((s,i)=>{const p=new THREE.Vector3(-4.9,4.7-i*.75,0);add(new THREE.Mesh(new THREE.SphereGeometry(.24,16,12),new THREE.MeshStandardMaterial({color:s[1],emissive:s[1],emissiveIntensity:.35})),["Gather · source",s[0],"One of the seven sources on the Intel slide. Data from every source is collected and sent on to storage."],p);const l=sprite(s[0],.21,{color:"#C9D2E3"});l.position.set(-6.75,p.y,0);st.root.add(l);return p});
 const storeP=new THREE.Vector3(-1.3,2.45,0);add(new THREE.Mesh(new THREE.CylinderGeometry(.95,.95,2.4,32),new THREE.MeshStandardMaterial({color:C.lilac,roughness:.5,emissive:C.lilac,emissiveIntensity:.1})),["Store","Correlate and store","Collected data is correlated and stored together, ready for analysis."],storeP);
 const srvP=[3.5,2.45,1.4].map(y=>{const p=new THREE.Vector3(2.1,y,0);add(new THREE.Mesh(new THREE.BoxGeometry(1.5,.75,1.2),new THREE.MeshStandardMaterial({color:C.blue,roughness:.5,emissive:C.blue,emissiveIntensity:.1})),["Manipulate","Analyze / predict","Servers analyse the stored data and make predictions."],p);return p});
 const insM=[];const insP=INS.map((t,i)=>{const p=new THREE.Vector3(5.1,4.5-i*.78,0);insM.push(add(new THREE.Mesh(new THREE.OctahedronGeometry(.26),new THREE.MeshStandardMaterial({color:C.amber,emissive:C.amber,emissiveIntensity:.4})),["Untapped value · insight",t,"One of the insights on the slide. The untapped value of big data: answers, improved ROI, and insights like this one."],p));const l=sprite(t,.2,{color:"#F5D79A"});l.position.set(7.0,p.y,0);st.root.add(l);return p});
 [["GATHER",-4.9],["STORE",-1.3],["MANIPULATE",2.1],["UNTAPPED VALUE",5.6]].forEach(([t,x])=>{const s=sprite(t,.22,{color:"#4FD1C5",weight:800});s.position.set(x,5.55,0);st.root.add(s)});
 const N=240,pos=new Float32Array(N*3),col=new Float32Array(N*3),P=[];
 const rnd=a=>Math.floor(Math.random()*a);
 for(let i=0;i<N;i++)P.push({s:rnd(7),v:rnd(3),k:rnd(6),u:Math.random(),j:new THREE.Vector3((Math.random()-.5)*.9,(Math.random()-.5)*1.6,(Math.random()-.5)*.9)});
 const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.BufferAttribute(pos,3));g.setAttribute("color",new THREE.BufferAttribute(col,3));
 st.root.add(new THREE.Points(g,new THREE.PointsMaterial({size:.13,vertexColors:true})));
 const tmp=new THREE.Vector3(),cA=new THREE.Color(),cB=new THREE.Color(C.amber),sp=reduced?.04:.13;
 st.ticks.push((dt,t)=>{P.forEach((p,i)=>{p.u+=dt*sp;if(p.u>=1){p.u-=1;p.s=rnd(7);p.v=rnd(3);p.k=rnd(6)}const s3=p.u*3;const sc=storeP.clone().add(p.j);
   if(s3<1)tmp.lerpVectors(srcP[p.s],sc,s3);else if(s3<2)tmp.lerpVectors(sc,srvP[p.v],s3-1);else tmp.lerpVectors(srvP[p.v],insP[p.k],s3-2);
   pos[i*3]=tmp.x;pos[i*3+1]=tmp.y;pos[i*3+2]=tmp.z;cA.set(SRC[p.s][1]);if(s3>2)cA.lerp(cB,s3-2);col[i*3]=cA.r;col[i*3+1]=cA.g;col[i*3+2]=cA.b});
  insM.forEach((m,i)=>{m.rotation.y=t*.8+i});g.attributes.position.needsUpdate=true;g.attributes.color.needsUpdate=true;return true});
 st.onPick=o=>show(o.userData.info);
 show(["Overview","Gather → store → manipulate → value","Data from seven sources is collected, correlated and stored, analysed by servers, and turned into insight. Colours show which source a particle came from; they turn amber as data becomes value. Tap any part for details."])}

/* ---------- 2.3 Hadoop layers ---------- */
function buildLayers(){blocksScene($("#st-layers"),$("#pn-layers"),[
 {label:"Storage layer · HDFS",ls:.24,kicker:"Layer 1 · Storage",title:"HDFS",desc:"Stores the data: files split into blocks and replicated across DataNodes. See 2.9.",color:0x8293B3,pos:[0,.45,0],size:[6.2,.8,2.4]},
 {label:"Resource management · YARN",ls:.24,kicker:"Layer 2 · Resource management",title:"YARN",desc:"Allocates cluster resources (containers) to applications. See 2.8.",color:C.teal,pos:[0,1.4,0],size:[5.4,.8,2.2]},
 {label:"Application layer · MapReduce",ls:.24,kicker:"Layer 3 · Application",title:"MapReduce",desc:"The programs that process the data with Map and Reduce tasks. See 2.5 and 2.6.",color:C.amber,pos:[0,2.35,0],size:[4.6,.8,2]}],{cam:[4,4.2,10],look:[0,1.3,0],initial:0,aspectRef:1.5,flat:it=>rowsFlat(it,[[2],[1],[0]],{labels:["L3","L2","L1"],widths:[74,87,100],tile:i=>({style:"min-height:56px"})})})}

/* ---------- 3.3 Hive architecture ---------- */
function buildHiveArch(){const B=C.blue,Tl=0x3FB3A8,Am=C.amber,Or=0xF29A4A;
 const ext="An outside tool drawn above Hive on the slide. The slides don't explain it.";
 const box=(key,label,kicker,title,desc,color,pos,size,extra)=>Object.assign({key,label,kicker,title,desc,color,pos,size,ls:.19},extra||{});
 const items=[
  box("karma","Karmasphere","Outside tool","Karmasphere",ext+" Karmasphere was a commercial big data analytics workspace.",0x51617F,[-4.4,6.95,0],[2.2,.55,1.2],{tc:"#E7EBF3"}),
  box("hue","Hue","Outside tool","Hue",ext+" Hue is an open-source web UI for querying Hadoop.",0x51617F,[-1.9,6.95,0],[2.2,.55,1.2],{tc:"#E7EBF3"}),
  box("qubole","Qubole","Outside tool","Qubole",ext+" Qubole is a cloud data platform that runs Hive.",0x51617F,[2.1,6.95,0],[2.2,.55,1.2],{tc:"#E7EBF3"}),
  box("others","Others…","Outside tool","Others",ext,0x51617F,[4.6,6.95,0],[2.2,.55,1.2],{tc:"#E7EBF3"}),
  box("tapp","Thrift App","Client application","Thrift Application","A program, in any language, that talks to Hive through Apache Thrift, a cross-language remote call framework.",B,[-.3,5.9,0],[2.2,.5,1.2]),
  box("japp","JDBC App","Client application","JDBC Application","A Java application that sends HiveQL through JDBC.",B,[2.1,5.9,0],[2.2,.5,1.2]),
  box("oapp","ODBC App","Client application","ODBC Application","An application, often a BI or spreadsheet tool, that connects through ODBC.",B,[4.6,5.9,0],[2.2,.5,1.2]),
  box("tcl","Hive Thrift Client","Client driver","Hive Thrift Client","Library that connects the Thrift application to the Thrift Server. The slide draws this link as a dashed arrow.",B,[-.3,5.1,0],[2.2,.5,1.2],{ls:.16}),
  box("jdrv","Hive JDBC Driver","Client driver","Hive JDBC Driver","Turns JDBC calls into requests the Thrift Server understands.",B,[2.1,5.1,0],[2.2,.5,1.2],{ls:.16}),
  box("odrv","Hive ODBC Driver","Client driver","Hive ODBC Driver","Turns ODBC calls into requests the Thrift Server understands.",B,[4.6,5.1,0],[2.2,.5,1.2],{ls:.16}),
  box("jdbc","JDBC","Connection","JDBC","The JDBC connection between the driver and the Thrift Server.",B,[2.1,4.3,0],[2.2,.5,1.2]),
  box("odbc","ODBC","Connection","ODBC","The ODBC connection between the driver and the Thrift Server.",B,[4.6,4.3,0],[2.2,.5,1.2]),
  box("cli","CLI","Hive interface","CLI (command line interface)","The Hive shell: type HiveQL and get results interactively. Same as the Shell component (slide 13) and the Hive command line (slide 17).",Tl,[-4.4,3.4,0],[1.7,.6,1.4],{ls:.24}),
  box("hwi","HWI","Hive interface","HWI (Hive Web Interface)","Run queries from a browser; the Web UI on slide 17. Not explained on the slides, and removed in Hive 2.2.",Tl,[-2.45,3.4,0],[1.7,.6,1.4],{ls:.24}),
  box("thrift","Thrift Server","Hive interface","Thrift Server","Accepts requests from Thrift, JDBC and ODBC clients and hands them to the Driver, so programs in many languages can use Hive. Today this role is played by HiveServer2.",Tl,[2.1,3.4,0],[6.7,.6,1.4],{ls:.24}),
  box("driver","Driver\ncompiles · optimizes · executes","Hive core","Driver","Receives each query, manages the session, runs it through the compiler (parse, plan, optimize) and the execution engine, and fetches results. Slide 13: session handles, fetch, execute.",Am,[-2.4,2.3,0],[5.6,.85,1.8],{ls:.2}),
  {key:"meta",label:"Metastore",ls:.24,kicker:"Hive core",title:"Metastore",desc:"Stores metadata for every table: schema, location in HDFS, and SerDe. The compiler reads it to plan each query.",color:Am,geo:new THREE.CylinderGeometry(1.05,1.05,1,32),pos:[3.4,2.3,0],lp:[3.4,2.3,1.1]},
  box("master","Master","Hadoop","Master node","The Hadoop master node. It hosts the ResourceManager and the NameNode.",0x5E8A5F,[-2.4,.45,0],[5.6,.9,2],{tc:"#E7EBF3",ls:.22,lp:[-2.4,.3,1.02],liftBy:.05}),
  box("rm","Resource Manager*","Hadoop · YARN","Resource Manager","Allocates cluster resources to the jobs Hive submits (see YARN, 2.8). The asterisk on the slide has no footnote; in Hadoop 1 this role was the JobTracker.",Or,[-3.75,1.15,.2],[2.4,.5,1.2],{ls:.17}),
  box("nn","Name Node","Hadoop · HDFS","NameNode","Holds HDFS metadata: which blocks make up each file and which DataNodes store them (see 2.9).",Or,[-1.05,1.15,.2],[2.4,.5,1.2],{ls:.17}),
  {key:"dfs",label:"DFS",ls:.26,kicker:"Hadoop · HDFS",title:"DFS (HDFS)",desc:"The distributed file system where Hive's table data actually lives, under the warehouse directory.",color:0x8FD694,geo:new THREE.CylinderGeometry(1.05,1.05,1.1,32),pos:[3.4,.6,0],lp:[3.4,.6,1.1]}];
 const st=blocksScene($("#st-harch"),$("#pn-harch"),items,{cam:[3,5.5,16],look:[0,3.5,0],initial:15,aspectRef:1.25,yaw:.9,flatDefault:"3d",flatOpt:{dot:true},flat:it=>{const T=(i,c,r)=>flatTile(it,i,{style:`grid-column:${c};grid-row:${r}`});
  return`<div class="ha-grid">${T(0,1,1)}${T(1,2,1)}${T(2,4,1)}${T(3,5,1)}</div><div class="ha-box"><span class="ha-lbl">Hive</span><div class="ha-grid">${T(4,3,1)}${T(5,4,1)}${T(6,5,1)}${T(7,3,2)}${T(8,4,2)}${T(9,5,2)}${T(10,4,3)}${T(11,5,3)}${T(12,1,4)}${T(13,2,4)}${T(14,"3/6",4)}${T(15,"1/4",5)}${flatTile(it,16,{cls:"cyl",style:"grid-column:4/6;grid-row:5"})}</div></div><div class="ha-box"><span class="ha-lbl">Hadoop</span><div class="ha-grid"><div class="ha-master" style="grid-column:1/4">${flatTile(it,17,{style:"min-height:26px"})}<div class="fcells">${flatTile(it,18)}${flatTile(it,19)}</div></div>${flatTile(it,20,{cls:"cyl",style:"grid-column:4/6"})}</div></div>`}});if(!st)return;const tw=tweener(st);
 const plate=(y,h,label,ly,lx,lz)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(12.8,h),new THREE.MeshBasicMaterial({color:0x8FD694,transparent:true,opacity:.1,depthWrite:false}));m.position.set(.1,y,-1.2);st.root.add(m);const s=sprite(label,.34,{color:"#B9D9A8",weight:800});s.position.set(lx??-5.7,ly,lz??-1.1);st.root.add(s)};
 plate(4.15,4.7,"Hive",6.15);plate(.8,1.7,"Hadoop",-.4,0,1.2);
 const M=k=>st.meshes.find(m=>m.userData.it.key===k);
 [["karma","cli"],["hue","hwi"],["qubole","japp"],["others","oapp"],["tapp","tcl"],["tcl","thrift"],["japp","jdrv"],["jdrv","jdbc"],["jdbc","thrift"],["oapp","odrv"],["odrv","odbc"],["odbc","thrift"],["cli","driver"],["hwi","driver"],["thrift","driver"],["driver","meta"],["driver","master"],["meta","dfs"]].forEach(([a,b])=>{const A=M(a).position.clone(),Bp=M(b).position.clone();A.z=Bp.z=-.75;st.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([A,Bp]),new THREE.LineBasicMaterial({color:0x51617F})))});
 const hop=(a,b)=>new Promise(res=>{const A=M(a).position.clone(),Bp=M(b).position.clone();A.z=Bp.z=1;const p=new THREE.Mesh(new THREE.SphereGeometry(.18,14,10),new THREE.MeshBasicMaterial({color:0xffffff}));st.root.add(p);tw(.9,k=>{p.position.lerpVectors(A,Bp,k);p.position.z+=Math.sin(Math.PI*k)*.9},()=>{st.root.remove(p);res()})});
 const core=[["driver","meta","Compile","The compiler parses the query and asks the Metastore for the table's schema, HDFS location and SerDe."],["meta","driver","Plan","Metadata comes back. The compiler plans and optimizes the query into a DAG of stages."],["driver","rm","Execute","The execution engine submits the MapReduce stages to the ResourceManager, which allocates containers."],["rm","nn","Locate","The tasks need their input, so the NameNode supplies block → DataNode locations."],["nn","dfs","Read / write","Tasks read the table's blocks from DFS and write the results back to HDFS."],["dfs","driver","Fetch","The Driver fetches the result rows."]];
 const RUNS={cli:[["cli","driver","Submit","You type a HiveQL query in the CLI (the Shell). The Driver opens a session and receives it."],...core,["driver","cli","Results","Results appear in the CLI."]],
  jdbc:[["japp","jdrv","Connect","A Java application sends HiveQL through the Hive JDBC Driver."],["jdrv","jdbc","JDBC","The driver passes the request over the JDBC connection."],["jdbc","thrift","Thrift Server","The Thrift Server accepts the request for remote clients."],["thrift","driver","Submit","The Thrift Server hands the query to the Driver."],...core,["driver","thrift","Return","Results go back through the Thrift Server."],["thrift","japp","Results","The JDBC application receives the result set."]]};
 let busy=false;const btns=[$("#harch-cli"),$("#harch-jdbc")];
 const run=async k=>{if(busy)return;busy=true;btns.forEach(b=>b.disabled=true);const R=RUNS[k];
  for(let i=0;i<R.length;i++){const [a,b,t,d]=R[i];$("#harch-step").innerHTML=`<span class="badge warn">${i+1}/${R.length} · ${esc(t)}</span> ${esc(d)}`;await hop(a,b);st.select(M(b));await sleep(350)}
  busy=false;btns.forEach(b=>b.disabled=false)};
 $("#harch-cli").onclick=()=>run("cli");$("#harch-jdbc").onclick=()=>run("jdbc")}

/* ---------- 3.4 DAG of stages ---------- */
function buildDag(){const N=[
 ["Input Dataset","","The data to be processed, stored in HDFS.",0x51617F,"#E7EBF3",null],
 ["HDFS Metadata","NameNode: blocks & locations","Maintains filesystem metadata, including file names and block locations.",C.lilac,null,"1 · HDFS NameNode"],
 ["HDFS Read","DataNodes: read blocks","Store the actual data blocks and provide data to MapReduce tasks.",C.blue,null,"2 · HDFS DataNodes"],
 ["Map Stage","process input splits","Processes input records and generates intermediate key-value pairs.",C.amber,null,"3 · Map"],
 ["Shuffle and Sort","group data by key","Transfers intermediate data and groups values by key for reducers.",C.mint,null,"4 · Shuffle and Sort"],
 ["Reduce Stage","aggregate results","Processes grouped values to generate final results.",C.teal,null,"5 · Reduce"],
 ["HDFS Write","store output blocks","Stores the results in HDFS.",C.blue,null,"6 · HDFS Write"],
 ["Output Metadata","NameNode records locations","Records filesystem information for the output file and its blocks.",C.lilac,null,"7 · NameNode metadata update"],
 ["Final Output","","The finished result, ready to read from HDFS.",0x51617F,"#E7EBF3",null]];
 const pos=i=>[-4.6+Math.floor(i/3)*4.6,4.3-(i%3)*1.65,0];
 function dagPath(inn){const g=inn.querySelector(".dp");if(!g)return;const A=inn.getBoundingClientRect();if(!A.width)return;const R=[...inn.querySelectorAll(".dag2 .ft")].map(t=>{const r=t.getBoundingClientRect();return{x:r.left-A.left+r.width/2,top:r.top-A.top,bot:r.bottom-A.top}});
  let d="";for(let i=0;i<8;i++){const a=R[i],b=R[i+1];d+=i%3===2?`<path d="M${a.x} ${a.bot+2} C${a.x} ${a.bot+44} ${b.x} ${b.top-44} ${b.x} ${b.top-3}"/>`:`<path d="M${a.x} ${a.bot+2} L${b.x} ${b.top-3}"/>`}g.innerHTML=d}
 const items=N.map((n,i)=>({key:"d"+i,label:n[0]+(n[1]?"\n"+n[1]:""),ls:.17,tc:n[4]||"#0B111C",kicker:n[5]?"Stage "+n[5]:(i===0?"Start":"End"),title:n[0],desc:n[2]+(n[1]?` <span style="color:var(--dim)">Diagram box: ${esc(n[1])}.</span>`:""),color:n[3],pos:pos(i),size:[3.6,1.05,.9],liftBy:.1}));
 const st=blocksScene($("#st-dag"),$("#pn-dag"),items,{cam:[0,2.6,15.5],look:[0,2.6,0],floor:false,initial:0,aspectRef:1.45,yaw:.8,flatOpt:{dot:true,onResize:dagPath},
  flat:it=>`<svg class="dag2-svg" aria-hidden="true"><defs><marker id="dagArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="#6C7A94"/></marker></defs><g class="dp"></g></svg><div class="dag2">${it.map((x,i)=>flatTile(it,i,{style:`grid-column:${Math.floor(i/3)+1};grid-row:${i%3+1}`},`<span class="sn">${N[i][5]?"Stage "+N[i][5].split(" ·")[0]:(i?"End":"Start")}</span>${esc(N[i][0])}${N[i][1]?`<small>${esc(N[i][1])}</small>`:""}`)).join("")}</div>`});if(!st)return;const tw=tweener(st);
 const P=items.map(it=>new THREE.Vector3(...it.pos));const curves=[];
 for(let i=0;i<8;i++){const a=P[i].clone(),b=P[i+1].clone();a.y-=.55;b.y+=.55;const c=i%3===2?new THREE.CubicBezierCurve3(a,a.clone().add(new THREE.Vector3(0,-1.3,0)),b.clone().add(new THREE.Vector3(0,1.3,0)),b):new THREE.LineCurve3(a,b);curves.push(c);
  st.root.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(40)),new THREE.LineBasicMaterial({color:0x6C7A94})))}
 const pk=new THREE.Mesh(new THREE.SphereGeometry(.17,14,10),new THREE.MeshBasicMaterial({color:0xffffff}));pk.position.copy(P[0]).add(new THREE.Vector3(0,0,.7));st.root.add(pk);
 let cur=0,busy=false,playing=false;const rows=[...document.querySelectorAll("#dag-tbl tr")];
 const show=i=>{st.select(st.meshes[i]);const n=N[i];$("#dag-step").innerHTML=`<span class="badge warn">${esc(n[5]||(i===0?"Start":"End"))}</span> ${esc(n[2])}`;rows.forEach(r=>r.classList.toggle("on",+r.dataset.s===(n[5]?i:-1)));$("#dag-prev").disabled=i===0;$("#dag-next").disabled=i===8};
 const move=i=>new Promise(res=>{const c=curves[i];tw(.8,k=>{pk.position.copy(c.getPoint(k));pk.position.z=.7},res)});
 const next=async()=>{if(busy||cur>=8)return;busy=true;await move(cur);cur++;show(cur);busy=false};
 $("#dag-next").onclick=()=>{if(!playing)next()};
 $("#dag-prev").onclick=()=>{if(busy||playing||cur===0)return;cur--;pk.position.copy(P[cur]).add(new THREE.Vector3(0,0,.7));show(cur);st.dirty=true};
 $("#dag-play").onclick=async()=>{if(playing||busy)return;playing=true;cur=0;pk.position.copy(P[0]).add(new THREE.Vector3(0,0,.7));show(0);await sleep(500);while(cur<8){await next();await sleep(650)}playing=false};
 st.onPick=o=>{const i=st.meshes.indexOf(o);if(i>=0&&!busy&&!playing){cur=i;pk.position.copy(P[i]).add(new THREE.Vector3(0,0,.7));show(i)}};
 show(0)}

/* ---------- 3.5 data model granularity ---------- */
function buildGran(){const items=[
 {key:"db",label:"Database · web_logs",ls:.24,tc:"#E7EBF3",kicker:"Level 1 · Database",title:"Database",desc:"Namespaces. A database groups related tables. In HDFS it is a folder such as /user/hive/warehouse/web_logs.db.",color:0x3A4A66,pos:[0,.2,0],size:[10.4,.4,4.4],lp:[0,.2,2.22],liftBy:.04},
 {key:"tb",label:"Table · page_views",ls:.26,kicker:"Level 2 · Table",title:"Table",desc:"Schemas in namespaces. Typed columns (int, float, string, boolean), plus list and map for JSON-like data. Columns in the slide 23 example: timestamp, userid, referer_url, page_url, IP.",color:C.amber,pos:[0,.95,0],size:[9.4,1,3.6],lp:[0,1.12,1.82],liftBy:.06}];
 for(let i=0;i<3;i++){const x=-3.1+i*3.1,dt="2025-08-0"+(i+1);
  items.push({key:"p"+i,label:"dt="+dt,ls:.19,kicker:"Level 3 · Partition",title:"Partition dt="+dt,desc:`How data is stored in HDFS: grouped on a column (here the date), one or more columns allowed. The slide's example is range-partitioning by date. Folder: …/page_views/dt=${dt}`,color:C.teal,pos:[x,1.9,0],size:[2.8,.9,2.6]});
  for(let b=0;b<2;b++)items.push({key:`b${i}${b}`,label:"bucket "+(b+1),ls:.14,kicker:"Level 4 · Bucket",title:`Bucket ${b+1} of dt=${dt}`,desc:`Partitions divided further into buckets based on another column (here a hash of userid). Used for data sampling and join optimization. File: …/dt=${dt}/00000${b}_0`,color:C.lilac,pos:[x+(b?.68:-.68),2.8,0],size:[1.15,.8,1.15]})}
 const st=blocksScene($("#st-gran"),$("#pn-gran"),items,{cam:[2.5,5.4,13.5],look:[-.4,1.5,0],initial:1,aspectRef:1.6,flat:it=>rowsFlat(it,[[[3,4],[6,7],[9,10]],[2,5,8],[1],[0]],{labels:["Buckets","Partitions","Table","Database"],lw:76,widths:[100,100,92,100],tile:i=>({style:"min-height:50px"})})});if(!st)return;
 const cs=sprite("timestamp · userid · referer_url · page_url · IP",.15,{color:"#3A2A05"});cs.position.set(0,.68,1.82);st.root.add(cs);
 [["Buckets",2.8],["Partitions",1.9],["Table",.95],["Database",.2]].forEach(([t,y])=>{const s=sprite(t,.2,{color:"#97A3BA"});s.position.set(-6.4,y,0);st.root.add(s)});
 const ar=sprite("▲ finer granularity",.18,{color:"#6C7A94"});ar.position.set(-6.4,3.6,0);st.root.add(ar)}

/* ---------- 3.6 partition pruning ---------- */
function buildPrune(){const st=makeStage($("#st-prune"),{cam:[1.1,9,13],look:[-.4,0,0],aspectRef:1.45});if(!st)return;
 const R=["US","IN","UK"],D=["2025-06","2025-07","2025-08"],F=[];
 const tbl=new THREE.Mesh(new THREE.CylinderGeometry(1,1,2,32),new THREE.MeshStandardMaterial({color:0x8293B3,roughness:.5}));tbl.position.set(-5.7,1,0);st.root.add(tbl);
 const t1=sprite("sales",.3,{color:"#0B111C",weight:800});t1.position.set(-5.7,1,1.05);st.root.add(t1);
 const t2=sprite("/user/hive/warehouse/sales",.16,{color:"#97A3BA"});t2.position.set(-5.7,2.45,0);st.root.add(t2);
 R.forEach((r,ri)=>{const z=-2.3+ri*2.3;const rl=sprite("region="+r,.2,{color:"#C9D2E3"});rl.position.set(-3.45,.3,z);st.root.add(rl);
  D.forEach((d,di)=>{const x=-1.1+di*2.9,g=new THREE.Group();g.position.set(x,0,z);st.root.add(g);
   const plat=new THREE.Mesh(new THREE.BoxGeometry(2.5,.22,1.7),new THREE.MeshStandardMaterial({color:C.teal,roughness:.5,transparent:true,emissive:C.amber,emissiveIntensity:0}));plat.position.y=.11;g.add(plat);
   const files=[-.75,0,.75].map(fx=>{const f=new THREE.Mesh(new THREE.BoxGeometry(.5,.5,.5),new THREE.MeshStandardMaterial({color:0xE7EBF3,roughness:.5,transparent:true}));f.position.set(fx,.48,0);g.add(f);return f});
   const o={g,plat,files,r,d,cur:1,tgt:1};plat.userData.o=o;st.pick.push(plat);F.push(o)})});
 D.forEach((d,di)=>{const s=sprite("sales_date="+d,.17,{color:"#C9D2E3"});s.position.set(-1.1+di*2.9,.05,3.55);st.root.add(s)});
 const grey=new THREE.Color(0x2A3852),teal=new THREE.Color(C.teal);let beams=[];
 st.ticks.push(dt=>{let a=false;F.forEach(o=>{const d=o.tgt-o.cur;if(Math.abs(d)>.002){o.cur+=d*Math.min(1,dt*6);a=true}else o.cur=o.tgt;const c=o.cur;
   o.plat.material.color.copy(grey).lerp(teal,c);o.plat.material.opacity=.45+.55*c;o.plat.material.emissiveIntensity=.22*c;o.files.forEach(f=>{f.material.opacity=.12+.88*c});o.g.position.y=-.3*(1-c)});return a});
 function update(){const r=$("#pr-region").value,d=$("#pr-date").value;let hit=0;
  F.forEach(o=>{const on=(!r||o.r===r)&&(!d||o.d===d);o.tgt=on?1:0;if(on)hit++});
  beams.forEach(b=>st.root.remove(b));beams=F.filter(o=>o.tgt).map(o=>{const l=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5.7,2,0),new THREE.Vector3(o.g.position.x,.5,o.g.position.z)]),new THREE.LineBasicMaterial({color:C.amber,transparent:true,opacity:.55}));st.root.add(l);return l});
  const c=[];if(r)c.push(`region = '${r}'`);if(d)c.push(`sales_date = '${d}'`);
  $("#pr-sql").textContent="SELECT * FROM sales"+(c.length?"\nWHERE "+c.join("\n  AND "):"")+";"+(c.length?"":"\n-- no partition filter: full scan");
  $("#pr-stats").innerHTML=`<div class="tile"><b>${hit} / 9</b><span>partition folders read</span></div><div class="tile"><b>${hit*3} / 27</b><span>files scanned</span></div><div class="tile"><b>${Math.round((1-hit/9)*100)}%</b><span>skipped by pruning</span></div>`;st.dirty=true}
 st.onPick=o=>{const x=o.userData.o;$("#pr-pick").innerHTML=`<code>/user/hive/warehouse/sales/region=${x.r}/sales_date=${x.d}</code> <span class="badge ${x.tgt?"ok":"bad"}">${x.tgt?"read by this query":"skipped (pruned)"}</span>`};
 $("#pr-region").addEventListener("change",update);$("#pr-date").addEventListener("change",update);update()}

/* ---------- 3.7 bucketing ---------- */
function buildBucket(){const st=makeStage($("#st-bucket"),{cam:[0,5.2,13.5],look:[0,2.5,0],aspectRef:1.45});if(!st)return;const tw=tweener(st);
 const STU=[[1001,"CSE"],[1002,"ECE"],[1003,"CSE"],[1004,"CSE"],[1005,"ECE"],[1006,"ECE"],[1007,"CSE"],[1008,"ECE"],[1009,"CSE"],[1010,"ECE"],[1011,"CSE"],[1012,"ECE"]];
 const PX={ECE:-3.3,CSE:3.3};let n=2,next=0,busy=false,grp=null,bins={},counts={},recs=[],sampling=false;
 const say=h=>{$("#bk-step").innerHTML=h};
 const ln=(a,b)=>{grp.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([a,b]),new THREE.LineBasicMaterial({color:0x51617F})))};
 function table(){$("#bk-tbl").innerHTML=recs.length?recs.map(r=>`<tr><td class="num">${r.id}</td><td>${r.dp}</td><td class="num">${r.id} mod ${n} = ${r.b}</td><td>Bucket ${r.b+1}</td></tr>`).join(""):`<tr><td colspan="4" style="color:var(--muted)">No students inserted yet.</td></tr>`}
 function build(){if(grp)st.root.remove(grp);grp=new THREE.Group();st.root.add(grp);bins={};counts={};recs=[];next=0;sampling=false;$("#bk-sample").textContent="Sample bucket 1";
  const src=new THREE.Mesh(new THREE.BoxGeometry(3.4,.8,1.6),new THREE.MeshStandardMaterial({color:0xF2A0A8,roughness:.5}));src.position.set(0,5.3,0);grp.add(src);
  const ss=sprite("Student Details",.24,{color:"#0B111C",weight:800});ss.position.set(0,5.3,.82);grp.add(ss);
  ["ECE","CSE"].forEach(dp=>{const x=PX[dp];const p=new THREE.Mesh(new THREE.BoxGeometry(3,.45,1.6),new THREE.MeshStandardMaterial({color:C.blue,roughness:.5}));p.position.set(x,3.1,0);grp.add(p);
   const ps=sprite("Dept - "+dp,.22,{color:"#0B111C",weight:800});ps.position.set(x,3.1,.82);grp.add(ps);ln(new THREE.Vector3(0,4.9,0),new THREE.Vector3(x,3.33,0));
   for(let b=0;b<n;b++){const bx=x+(b-(n-1)/2)*1.45;const bin=new THREE.Mesh(new THREE.BoxGeometry(1.15,1.8,1.15),new THREE.MeshStandardMaterial({color:C.mint,transparent:true,opacity:.18,depthWrite:false,emissive:C.mint,emissiveIntensity:0}));bin.position.set(bx,.9,0);grp.add(bin);
    bin.add(new THREE.LineSegments(new THREE.EdgesGeometry(bin.geometry),new THREE.LineBasicMaterial({color:C.mint,transparent:true,opacity:.7})));
    const bs=sprite("Bucket "+(b+1),.17,{color:"#8FD694"});bs.position.set(bx,-.25,.6);grp.add(bs);ln(new THREE.Vector3(x,2.87,0),new THREE.Vector3(bx,1.8,0));bins[dp+b]={bin,x:bx};counts[dp+b]=0}});
  table();say(`Each student goes to its department's partition, then to bucket (student_id mod ${n}) + 1. Press <b>Insert next student</b>.`);st.dirty=true}
 const insert=()=>new Promise(res=>{if(next>=STU.length){res(false);return}const [id,dp]=STU[next++];const b=id%n,key=dp+b;
  const cube=new THREE.Mesh(new THREE.BoxGeometry(.6,.32,.6),new THREE.MeshStandardMaterial({color:dp==="CSE"?C.amber:C.teal,roughness:.5,transparent:true}));
  const lab=sprite(String(id),.13,{color:"#0B111C",weight:800});lab.position.set(0,0,.31);cube.add(lab);grp.add(cube);
  const A=new THREE.Vector3(0,5.3,0),Bv=new THREE.Vector3(PX[dp],3.6,0),Cv=new THREE.Vector3(bins[key].x,.2+counts[key]*.36,0);counts[key]++;
  say(`<b>${id}</b> · dept = ${dp} → partition <b>Dept - ${dp}</b> · hash(${id}) mod ${n} = ${b} → <b>Bucket ${b+1}</b>`);
  tw(.6,k=>{cube.position.lerpVectors(A,Bv,k);cube.position.y+=Math.sin(Math.PI*k)*.5},()=>tw(.6,k=>{cube.position.lerpVectors(Bv,Cv,k)},()=>{recs.push({id,dp,b,cube});table();res(true)}))});
 const lock=v=>{busy=v;["bk-one","bk-all","bk-sample","bk-reset","bk-n"].forEach(id=>$("#"+id).disabled=v)};
 function clearSample(){sampling=false;$("#bk-sample").textContent="Sample bucket 1";Object.values(bins).forEach(o=>{o.bin.material.emissiveIntensity=0;o.bin.material.opacity=.18});recs.forEach(r=>r.cube.material.opacity=1);st.dirty=true}
 $("#bk-one").onclick=async()=>{if(busy)return;if(sampling)clearSample();lock(true);const ok=await insert();lock(false);if(!ok)say("All 12 students are stored. Try <b>Sample bucket 1</b>, or change the bucket count.")};
 $("#bk-all").onclick=async()=>{if(busy)return;if(sampling)clearSample();lock(true);while(await insert())await sleep(120);lock(false);say(`All 12 students stored in ${n*2} bucket files (${n} per partition). Try <b>Sample bucket 1</b>.`)};
 $("#bk-sample").onclick=()=>{if(busy)return;if(sampling){clearSample();return}sampling=true;$("#bk-sample").textContent="Clear sample";
  Object.entries(bins).forEach(([k,o])=>{const on=k.endsWith("0");o.bin.material.emissiveIntensity=on?.55:0;o.bin.material.opacity=on?.4:.08});recs.forEach(r=>r.cube.material.opacity=r.b===0?1:.15);
  const c=recs.filter(r=>r.b===0).length;say(`<code>TABLESAMPLE(BUCKET 1 OUT OF ${n} ON student_id)</code> reads only the first bucket file in each partition: ${c} of ${recs.length} stored students. That is a quick sample of about 1/${n} of the data. (Example syntax added for revision.)`);st.dirty=true};
 $("#bk-reset").onclick=()=>{if(!busy)build()};
 $("#bk-n").addEventListener("change",()=>{if(busy)return;n=+$("#bk-n").value;build()});
 build()}

/* ---------- 2.10 HDFS write path: 2D + 3D views driven by one step machine ---------- */
function buildHw(){const st=makeStage($("#st-hw"),{cam:[0,6.4,15.5],look:[0.2,2,0],aspectRef:1.55});if(!st)return;const tw=tweener(st);
 const inn=flatView(st,"");modeSwitch(st,"st-hw","2d");
 const PAL=["#F5B83D","#4FD1C5","#7C98FF","#F2727F","#8FD694","#B79CFF","#F29A4A","#6BA6D6"],DN=["DN1","DN2","DN3","DN4","DN5","DN6"];
 let S,B,R,sizes,step=0,busy=false,playing=false,gen=0,pendingReset=false;
 const rackOf=d=>d<3?1:2;
 const plan=i=>{const ra=i%2,rb=1-ra,a=ra*3+(i%3),b=rb*3+((i+1)%3),c=rb*3+((i+2)%3);return[a,b,c].slice(0,R)};
 const LAST=()=>3+sizes.length;
 /* ----- 3D scene ----- */
 const dnX=[-3.4,-1.8,-0.2,2.6,4.2,5.8],dnPos=dnX.map(x=>new THREE.Vector3(x,.75,0));
 [[-1.8,"Rack 1"],[4.2,"Rack 2"]].forEach(([x,t])=>{const pl=new THREE.Mesh(new THREE.BoxGeometry(5.2,.12,2.2),new THREE.MeshStandardMaterial({color:0x22304A}));pl.position.set(x,.06,0);st.root.add(pl);const sp=sprite(t,.26,{color:"#97A3BA"});sp.position.set(x,-.35,1.3);st.root.add(sp)});
 const dnM=dnPos.map((p,i)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1.3),new THREE.MeshStandardMaterial({color:0x2A3A57,roughness:.6,emissive:C.amber,emissiveIntensity:0}));m.position.copy(p);st.root.add(m);const f=facePlane(DN[i],.24,{color:"#E7EBF3",weight:700});f.position.set(0,0,.66);m.add(f);return m});
 const nn=new THREE.Mesh(new THREE.BoxGeometry(3,1,1.4),new THREE.MeshStandardMaterial({color:C.lilac,roughness:.5}));nn.position.set(1.2,4.6,0);st.root.add(nn);{const f=facePlane("NameNode · metadata",.22,{color:"#0B111C",weight:800});f.position.set(0,0,.71);nn.add(f)}
 const cl=new THREE.Mesh(new THREE.SphereGeometry(.55,24,16),new THREE.MeshStandardMaterial({color:0xF2A0A8,roughness:.5}));cl.position.set(-6.6,1.2,0);st.root.add(cl);{const sp=sprite("Client",.26,{color:"#E7EBF3"});sp.position.set(-6.6,2.1,0);st.root.add(sp)}
 let g3=null;const cubeGeo=new THREE.BoxGeometry(.5,.38,.5);
 const mat=i=>new THREE.MeshStandardMaterial({color:new THREE.Color(PAL[i%PAL.length]),roughness:.45});
 const slotPos=(d,k)=>new THREE.Vector3(dnPos[d].x+((k%2)?.3:-.3),1.55+Math.floor(k/2)*.44,0);
 function draw3D(){if(g3)st.root.remove(g3);g3=new THREE.Group();st.root.add(g3);const cnt=[0,0,0,0,0,0],done=Math.max(0,step-3);
  if(step>=1)sizes.forEach((sz,i)=>{if(i<done)return;const c=new THREE.Mesh(cubeGeo,mat(i));c.scale.x=Math.max(.35,sz/B);c.position.set(-7.4+i*.62,.35+0,1.4);g3.add(c)});
  else{const bar=new THREE.Mesh(new THREE.BoxGeometry(Math.min(4,S/100),.38,.5),new THREE.MeshStandardMaterial({color:0xE7EBF3}));bar.position.set(-6.6,.35,1.4);g3.add(bar)}
  for(let i=0;i<done;i++)plan(i).forEach(d=>{const c=new THREE.Mesh(cubeGeo,mat(i));c.position.copy(slotPos(d,cnt[d]++));g3.add(c)});
  dnM.forEach(m=>m.material.emissiveIntensity=0);if(step>=3&&step<LAST())plan(step-3).forEach(d=>dnM[d].material.emissiveIntensity=.35);
  nn.material.emissive=new THREE.Color(C.lilac);nn.material.emissiveIntensity=(step===2||(step>=3&&step<LAST()))?.35:.05;st.dirty=true}
 function anim3D(i){return new Promise(res=>{const pl=plan(i),cnt=[0,0,0,0,0,0];for(let k=0;k<i;k++)plan(k).forEach(d=>cnt[d]++);
  let from=cl.position.clone().add(new THREE.Vector3(0,.2,0)),hop=0;
  const go=()=>{if(hop>=pl.length){res();return}const d=pl[hop],to=slotPos(d,cnt[d]),c=new THREE.Mesh(cubeGeo,mat(i));g3.add(c);const A=from.clone();
   tw(.65,k=>{c.position.lerpVectors(A,to,k);c.position.y+=Math.sin(Math.PI*k)*1.4},()=>{from=to.clone();hop++;go()})};go()})}
 /* ----- 2D view ----- */
 function build2D(){inn.innerHTML=`<div class="hw2" id="hw2"><svg class="hw-svg" aria-hidden="true"><path id="hw-path" d=""/></svg><span class="hw-dot" id="hw-dot" hidden></span>
  <div class="hw-box" style="grid-area:client"><b>Client</b><small>file.csv · ${S} MB</small><div class="hw-file" id="hw-file"></div></div>
  <div class="hw-box" style="grid-area:nn" id="hw-nn"><b>NameNode</b><small>metadata only · in RAM</small><div class="hw-nnlog" id="hw-nnlog"></div></div>
  <div class="hw-racks">${[0,1].map(r=>`<div class="hw-rack"><span>Rack ${r+1}</span><div class="row">${[0,1,2].map(k=>{const d=r*3+k;return`<div class="hw-dn" data-dn="${d}"><b>${DN[d]}</b><div class="hw-bl"></div></div>`}).join("")}</div></div>`).join("")}</div></div>`}
 function draw2D(){const f=$("#hw-file"),done=Math.max(0,step-3);if(!f)return;
  f.innerHTML=step>=1?sizes.map((sz,i)=>`<i style="flex:${sz};background:${PAL[i%PAL.length]}" class="${i<done?"sent":""}" data-b="${i}">B${i+1}</i>`).join(""):`<i style="flex:1;background:#E7EBF3">${S} MB</i>`;
  inn.querySelectorAll(".hw-dn").forEach(el=>{const d=+el.dataset.dn;const bl=[];for(let i=0;i<done;i++)if(plan(i).includes(d))bl.push(`<i style="background:${PAL[i%PAL.length]}">B${i+1} · ${sizes[i]}</i>`);el.querySelector(".hw-bl").innerHTML=bl.join("");el.classList.toggle("hot",step>=3&&step<LAST()&&plan(step-3).includes(d))});
  $("#hw-nnlog").innerHTML=step<2?"(no entry yet)":`/user/demo/file.csv · inode · ${sizes.length} blocks · rep ${R}<br>${step>=LAST()?"file closed ✓":done<sizes.length?`allocating block ${done+1}…`:""}`;
  $("#hw-path").setAttribute("d","");$("#hw-dot").hidden=true}
 function centre(el,box){const a=box.getBoundingClientRect(),b=el.getBoundingClientRect();return[b.left-a.left+b.width/2,b.top-a.top+b.height/2]}
 function anim2D(i){return new Promise(res=>{const box=$("#hw2");if(!box||st.mode!=="2d"||!box.getBoundingClientRect().width||reduced){res();return}
  const seg=box.querySelector(`[data-b="${i}"]`),pts=[centre(seg,box),...plan(i).map(d=>centre(box.querySelector(`[data-dn="${d}"]`),box))];
  $("#hw-path").setAttribute("d","M"+pts.map(p=>p.join(" ")).join(" L"));const dot=$("#hw-dot");dot.hidden=false;dot.style.background=PAL[i%PAL.length];
  let leg=0,t0=null;const LEG=520;const tick=t=>{if(t0===null)t0=t;const k=Math.min(1,(t-t0)/LEG),A=pts[leg],Bp=pts[leg+1];dot.style.left=(A[0]+(Bp[0]-A[0])*k)+"px";dot.style.top=(A[1]+(Bp[1]-A[1])*k)+"px";
   if(k>=1){leg++;t0=null;if(leg>=pts.length-1){setTimeout(res,150);return}}requestAnimationFrame(tick)};requestAnimationFrame(tick)})}
 /* ----- panel ----- */
 function text(){const n=sizes.length;
  if(step===0)return[`Start`,`A client wants to save <b>file.csv (${S} MB)</b> into HDFS with ${B} MB blocks and replication ${R}.`];
  if(step===1)return[`Step 1 · Split`,`The client splits the file into <b>${n} block${n>1?"s":""}</b>: ${sizes.join(" + ")} MB.${sizes[n-1]<B?` The last block holds only the remaining ${sizes[n-1]} MB.`:""}`];
  if(step===2)return[`Step 2 · Ask the NameNode`,`The client asks the <b>NameNode</b> to create /user/demo/file.csv. The NameNode adds an inode (permissions, times, quotas) to its namespace in RAM. No file data is sent to it.`];
  if(step<LAST()){const i=step-3,pl=plan(i).map(d=>DN[d]);return[`Step ${step} · Write block ${i+1} of ${n}`,`The NameNode picks ${pl.length===1?"a DataNode":pl.length+" DataNodes"}: <b>${pl.join(", ")}</b>. The client sends the ${sizes[i]} MB block to ${pl[0]}${pl.length>1?`, which forwards it to ${pl.slice(1).join(" and then ")} in a pipeline. Acknowledgements travel back up the chain`:""}.${R>=2?` The first copy is on Rack ${rackOf(plan(i)[0])}; the other${R>2?"s are":" is"} on Rack ${rackOf(plan(i)[1])}.`:""}`]}
  return[`Done · Close the file`,`The client closes the file. The NameNode now maps every block to its DataNodes. Raw disk used: ${S} MB × ${R} = <b>${S*R} MB</b>. ${R>1?`Any single DataNode can fail and every block still has a copy.`:`With replication 1, losing a DataNode loses the blocks it held.`}`]}
 function panel(){const [k,t]=text();$("#hw-kick").textContent=k;$("#hw-step").innerHTML=t;const done=Math.max(0,step-3);
  $("#hw-meta").innerHTML=step<2?`<tr><td colspan="3" style="color:var(--muted)">Empty. Nothing has been created yet.</td></tr>`:sizes.map((sz,i)=>`<tr class="${i===step-3?"on":""}"><td class="num">B${i+1}</td><td class="num">${sz} MB</td><td class="num">${i<done?plan(i).map(d=>DN[d]).join(", "):i===step-3?"writing…":"—"}</td></tr>`).join("");
  $("#hw-stats").innerHTML=`<div class="tile"><b>${sizes.length}</b><span>blocks</span></div><div class="tile"><b>${S*R} MB</b><span>raw disk at rep ${R}</span></div><div class="tile"><b>${sizes.length*R}</b><span>block locations in NameNode RAM</span></div>`;
  $("#hw-prev").disabled=step===0||busy;$("#hw-next").disabled=step>=LAST()||busy}
 function render(){draw3D();draw2D();panel()}
 async function next(){if(busy||step>=LAST())return;busy=true;panel();const target=step+1;
  if(target>=4&&target<=LAST()){await Promise.all([anim3D(target-4),anim2D(target-4)])}
  busy=false;if(pendingReset){pendingReset=false;reset();return}step=target;render()}
 function reset(){S=+$("#hw-size").value;B=+$("#hw-bs").value;R=+$("#hw-rf").value;sizes=[];let left=S;while(left>0){sizes.push(Math.min(B,left));left-=B}step=0;build2D();render()}
 $("#hw-next").onclick=()=>{if(!playing)next()};
 $("#hw-prev").onclick=()=>{if(busy||playing||step===0)return;step--;render()};
 $("#hw-play").onclick=async()=>{if(playing||busy)return;playing=true;const my=++gen;if(step>=LAST()){step=0;render()}while(step<LAST()&&gen===my){await next();await sleep(reduced?150:500)}if(gen===my)playing=false};
 ["hw-size","hw-bs","hw-rf"].forEach(id=>$("#"+id).addEventListener("change",()=>{gen++;playing=false;if(busy)pendingReset=true;else reset()}));
 st.onFlatShow=()=>draw2D();
 reset()}


NL.start([["#st-vs",buildVs],["#st-stack",buildStack],["#st-pyr",buildPyr],["#st-pil",buildPillars],["#st-mr",buildMR],["#st-yarn",buildYarn],["#st-hdfs",buildHdfs],["#st-eco",buildCity],["#st-pipe",buildPipe],["#st-layers",buildLayers],["#st-harch",buildHiveArch],["#st-dag",buildDag],["#st-gran",buildGran],["#st-prune",buildPrune],["#st-bucket",buildBucket],["#st-hw",buildHw]]);
})();
