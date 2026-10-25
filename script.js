(()=>{'use strict';
const $=s=>document.querySelector(s);
const SY=['Ny','Xo','Ra','Vex','Zar','Lum','Or','Kai','Thal','Eru','Syn','Vyr','Ael','Qor','Ith','Mor'];
const EP=['of the Hollow Star','the Unbound','of Seven Eclipses','Dawnbreaker','the Quiet Flame','of the Last Horizon','Wavecaller','the Gilded Void','of Fading Suns','the Stormlit','of Endless Orbit','Lightweaver'];
const CL=['Celestial Wanderer','Void Architect','Nebula Guardian','Dimension Explorer','Cosmic Sentinel','Starborn Entity','Quantum Voyager','Astral Keeper','Eclipse Sovereign','Infinity Traveler'];
const OR=['the Lyra Rift','a collapsed pulsar','the Veil of Orion',"Andromeda's shadow",'a dying quasar','the Ninth Dimension','the Crab Nebula','a forgotten comet','the Cygnus Gate','a mirror galaxy','the Hollow Moon','the Singularity Garden'];
const SYM=['✦','☽','◈','✧','⬡','✺','✹','⟁'];
const VB=['guards','maps','sings to','binds','forges','charts','whispers to','weaves'];
const OB=['silent constellations','fractured timelines','the edge of black holes','sleeping stars','folded dimensions','drifting nebulae','forgotten gravity wells','living starlight'];
/* Deterministic PRNG seeded from the exact decimal string (never a Number). */
function rng(id){let a=0x811c9dc5,b=0x9e3779b9;for(let i=0;i<id.length;i++){const c=id.charCodeAt(i);a=Math.imul(a^c,16777619);b=Math.imul(b+c+i,0x85ebca6b);b^=b>>>13}
a^=id.length;let t=(a^Math.imul(b,0x27d4eb2d))>>>0;
return()=>{t=(t+0x6D2B79F5)>>>0;let x=Math.imul(t^t>>>15,1|t);x^=x+Math.imul(x^x>>>7,61|x);return((x^x>>>14)>>>0)/4294967296}}
const cache=new Map();
function prof(id){let p=cache.get(id);if(p)return p;const r=rng(id),pk=a=>a[r()*a.length|0];
const name=pk(SY)+pk(SY).toLowerCase()+(r()<.5?pk(SY).toLowerCase():'')+' '+pk(EP),origin=pk(OR);
p={id,name,cls:pk(CL),sym:pk(SYM),origin,h:r()*360|0,h2:0,
bio:`${name.split(' ')[0]} ${pk(VB)} ${pk(OB)}, drifting out of ${origin}.`,
attrs:[['Energy',1+r()*99|0],['Gravity',1+r()*99|0],['Resonance',1+r()*99|0],['Dimension',1+r()*11|0]]};
p.h2=(p.h+60+(rng(id+'h')()*140|0))%360;
if(cache.size>300)cache.clear();cache.set(id,p);return p}
function avatar(p,pre){const r=rng(p.id+'a'),h=p.h,h2=p.h2,s=[];
for(let i=0;i<14;i++)s.push(`<circle cx="${r()*64|0}" cy="${r()*64|0}" r="${(.3+r()*.9).toFixed(1)}" fill="#fff" opacity=".${5+(r()*4|0)}"/>`);
const k=r()*4|0,L=`hsl(${h} 90% 68%)`,M=`hsl(${h2} 90% 65%)`;let m;
if(k==0)m=`<ellipse cx="32" cy="32" rx="26" ry="${5+r()*6|0}" fill="none" stroke="${L}" stroke-width="1.5" transform="rotate(${r()*80-40|0} 32 32)"/><circle cx="32" cy="32" r="11" fill="#000" stroke="${M}" stroke-width="2"/>`;
else if(k==1)m=`<polygon points="32,8 38,26 56,32 38,38 32,56 26,38 8,32 26,26" fill="${L}" opacity=".85"/><circle cx="32" cy="32" r="6" fill="#fff"/>`;
else if(k==2)m=`<circle cx="32" cy="32" r="16" fill="${M}" opacity=".35"/><circle cx="32" cy="32" r="10" fill="${L}"/><circle cx="29" cy="29" r="3" fill="#fff"/>`;
else m=`<path d="M18 20q14-14 28 0v14q-14 18-28 0z" fill="hsl(${h} 40% 10%)" stroke="${M}" stroke-width="1.5"/><path d="M24 30l6 2M40 30l-6 2" stroke="${L}" stroke-width="2"/>`;
return`<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="${pre}${p.id}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="hsl(${h} 70% 38%)"/><stop offset="1" stop-color="hsl(${h2} 60% 8%)"/></radialGradient></defs><rect width="64" height="64" fill="url(#${pre}${p.id})"/>${s.join('')}${m}</svg>`}
/* Exact decimal-string arithmetic. */
function inc(s){const a=s.split('');for(let i=a.length-1;i>=0;i--){if(a[i]==='9')a[i]='0';else{a[i]=String(+a[i]+1);return a.join('')}}return'1'+a.join('')}
function dec(s){if(s==='1')return s;const a=s.split('');let i=a.length-1;while(a[i]==='0'){a[i]='9';i--}a[i]=String(a[i]-1);return a.join('').replace(/^0+/,'')}
/* ---------- Feed (windowed, bidirectional, self-recovering) ---------- */
const list=$('#feed'),end=$('#end'),BATCH=8,AHEAD=1800;
let first=1n,last=0n,pad=0,busy=false,raf=0,cur=null,pushed=false;
function card(id){const p=prof(id),e=document.createElement('article');e.className='card';e.style.setProperty('--a',`hsl(${p.h} 85% 62%)`);
e.innerHTML=`<div class="av">${avatar(p,'f')}</div><div class="m"><div class="n">#${id}</div><h2>${p.name}</h2><p class="k">${p.sym} ${p.cls}</p><p class="d">${p.bio}</p></div><button data-id="${id}" aria-label="View profile ${id}">View</button>`;return e}
function mk(a,n){const f=document.createDocumentFragment();for(let i=0;i<n;i++)f.append(card((a+BigInt(i)).toString()));return f}
const H=()=>list.firstElementChild.offsetHeight+8;
function setPad(v){const h=H(),i=Math.max(0,Math.min(list.children.length-1,Math.floor(-list.firstElementChild.getBoundingClientRect().top/h))),a=list.children[i],y=a.getBoundingClientRect().top;
pad=v;list.style.paddingTop=v+'px';const d=a.getBoundingClientRect().top-y;if(d)scrollBy(0,d)}
function step(){if(busy||cur)return;busy=true;let more=false;
try{const h=H(),vh=innerHeight;let g=0;
while(g++<30&&list.lastElementChild.getBoundingClientRect().bottom<vh+AHEAD){list.append(mk(last+1n,BATCH));last+=BigInt(BATCH)}
if(g>30)more=true;
let t=list.firstElementChild.getBoundingClientRect().top,k=Math.min(Math.floor((-2500-t)/h),list.children.length-30);
if(k>0){for(let i=0;i<k;i++)list.firstElementChild.remove();first+=BigInt(k);pad+=k*h;list.style.paddingTop=pad+'px'}
if(first>1n){t=list.firstElementChild.getBoundingClientRect().top;
if(t>-AHEAD){if(pad<BATCH*h*2)setPad(60000);g=0;
while(first>1n&&g++<30&&list.firstElementChild.getBoundingClientRect().top>-AHEAD){const n=first>BigInt(BATCH)?BATCH:Number(first-1n);
if(pad<n*h)setPad(pad+60000);list.prepend(mk(first-BigInt(n),n));first-=BigInt(n);pad-=n*h;list.style.paddingTop=pad+'px'}
if(g>30)more=true}
else if(pad>200000)setPad(60000)}
if(first===1n&&pad!==0)setPad(0);
const lt=list.lastElementChild.getBoundingClientRect().top;k=Math.min(Math.floor((lt-vh-3500)/h),list.children.length-30);
if(k>0){for(let i=0;i<k;i++)list.lastElementChild.remove();last-=BigInt(k)}
}finally{busy=false}
if(io){io.unobserve(end);io.observe(end)}
if(more)sched()}
const sched=()=>{raf||(raf=requestAnimationFrame(()=>{raf=0;step()}))};
const io='IntersectionObserver' in window?new IntersectionObserver(sched,{rootMargin:'0px 0px 1800px 0px'}):null;
if(io)io.observe(end);
addEventListener('scroll',sched,{passive:true});addEventListener('resize',sched);addEventListener('orientationchange',sched);
document.addEventListener('visibilitychange',sched);
setInterval(()=>{if(!document.hidden)sched()},1200); /* recovery if observer/scroll events stall */
list.append(mk(1n,BATCH));last=BigInt(BATCH);step();
/* ---------- Profile view ---------- */
const M=$('#modal');
function render(id){const p=prof(id);M.style.setProperty('--a',`hsl(${p.h} 85% 62%)`);
$('#mbody').innerHTML=`<div class="big">${avatar(p,'m')}</div><div class="num">Profile #${id}</div><h2 id="mt">${p.name}</h2><p class="k">${p.sym} ${p.cls}</p><p>${p.bio}</p><dl>${p.attrs.map(a=>`<div><dt>${a[0]}</dt><dd>${a[1]}</dd></div>`).join('')}<div><dt>Origin</dt><dd>${p.origin}</dd></div><div><dt>Symbol</dt><dd>${p.sym}</dd></div></dl>`;
$('#prev').disabled=id==='1'}
function open(id,mode){const was=cur!==null;cur=id;render(id);M.hidden=false;$('#main').inert=$('#hdr').inert=true;
const u=location.pathname+'?profile='+id;
if(mode==='push'){if(was)history.replaceState({p:id},'',u);else{history.pushState({p:id},'',u);pushed=true}}else if(mode==='replace')history.replaceState({p:id},'',u);
M.scrollTop=0;$('#back').focus()}
function close(pop){cur=null;M.hidden=true;$('#main').inert=$('#hdr').inert=false;
if(!pop){if(pushed){pushed=false;history.back()}else history.replaceState(null,'',location.pathname)}else pushed=false;sched()}
function parse(raw){if(!/^\d+$/.test(raw))return null;const n=raw.replace(/^0+/,'');return n||null}
function route(init){const raw=new URLSearchParams(location.search).get('profile');
if(raw===null){if(cur)close(true);return}
const n=parse(raw);if(!n){if(cur)close(true);return}
open(n,init&&n!==raw?'replace':'none')}
addEventListener('popstate',()=>route(false));
list.addEventListener('click',e=>{const b=e.target.closest('button[data-id]');if(b)open(b.dataset.id,'push')});
$('#next').onclick=()=>open(inc(cur),'push');$('#prev').onclick=()=>open(dec(cur),'push');$('#back').onclick=()=>close(false);
function toast(t){const e=$('#toast');e.textContent=t;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,1800)}
async function cp(t,m){try{await navigator.clipboard.writeText(t);toast(m)}catch{const x=document.createElement('textarea');x.value=t;document.body.append(x);x.select();try{document.execCommand('copy');toast(m)}catch{toast('Copy is not supported here')}x.remove()}}
$('#cn').onclick=()=>cp(cur,'Profile number copied');
$('#cl').onclick=()=>cp(location.origin+location.pathname+'?profile='+cur,'Profile link copied');
/* ---------- Panels, search, settings ---------- */
function panel(id){for(const[b,p]of[['sb','sp'],['tb','tp']]){const o=p===id&&$('#'+p).hidden;$('#'+p).hidden=!o;$('#'+b).setAttribute('aria-expanded',o)}if(id==='sp'&&!$('#sp').hidden)$('#q').focus()}
$('#sb').onclick=()=>panel('sp');$('#tb').onclick=()=>panel('tp');
$('#sp').onsubmit=e=>{e.preventDefault();const v=$('#q').value.trim(),er=$('#err');
if(!/^\d+$/.test(v)){er.textContent='Use digits 0-9 only: no signs, spaces, decimals or letters.';return}
const n=parse(v);if(!n){er.textContent='Profile numbers start at 1. Zero is not valid.';return}
er.textContent=n!==v?`Leading zeros removed. Opening profile #${n}.`:'';panel();open(n,'push')};
addEventListener('keydown',e=>{if(e.key!=='Escape')return;if(cur)close(false);else panel()});
let S={anim:true,acc:'#22D3EE',compact:false};
try{Object.assign(S,JSON.parse(localStorage.getItem('nyx-settings')||'{}'))}catch{}
function apply(){document.body.classList.toggle('noanim',!S.anim);document.body.classList.toggle('compact',S.compact);document.documentElement.style.setProperty('--acc',S.acc);
$('#sa').checked=S.anim;$('#sc').checked=S.compact;$('#ss').value=S.acc}
function save(){try{localStorage.setItem('nyx-settings',JSON.stringify(S))}catch{}}
$('#sa').onchange=e=>{S.anim=e.target.checked;apply();save()};
$('#ss').onchange=e=>{S.acc=e.target.value;apply();save()};
$('#sc').onchange=e=>{const o=H();S.compact=e.target.checked;apply();save();setPad(first>1n?pad*H()/o:0);sched()};
apply();route(true);
})();
