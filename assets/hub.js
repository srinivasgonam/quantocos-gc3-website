const D={w:1000,h:820,rx:340,ry:300,hub:110,cw:230,ch:96,f:1,t:20,s:10,ico:20,ht:46,hs:9,r1:46,r2:96};
const M={w:440,h:700,rx:124,ry:240,hub:62,cw:168,ch:78,f:.62,t:16,s:8.5,ico:16,ht:28,hs:6.5,r1:34,r2:70};
const ICONS={
sparkle:'<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
cursor:'<path d="M5 3l14 7-6 2-2 6z"/>',
nodes:'<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="M12 7v5M12 12l-6 4.5M12 12l6 4.5"/>',
building:'<path d="M6 21V4h9v17M15 9h3v12M3 21h18M9 8h3M9 12h3M9 16h3"/>'};

class HubDiagram{
 constructor(el,cfg){
  this.el=typeof el==='string'?document.querySelector(el):el;this.cfg=cfg;this.anims=[];this.timers=[];this.vis=false;this.raf=0;
  this.rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
  this.fx=null;this.px=0;this.py=0;this.tx=null;this.ty=0;
  this.el.addEventListener('pointermove',e=>{const r=this.el.getBoundingClientRect();this.tx=e.clientX-r.left;this.ty=e.clientY-r.top});
  this.el.addEventListener('pointerleave',()=>{this.tx=null});
  this.el.innerHTML='<canvas></canvas><div class="stage"></div>';
  this.cv=this.el.firstChild;this.ctx=this.cv.getContext('2d');this.stage=this.el.lastChild;
  new ResizeObserver(()=>this.fit()).observe(this.el);
  addEventListener('resize',()=>this.fit());
  new IntersectionObserver(([x])=>{const r=x.intersectionRatio;if(r>=.8){if(!this.vis)this.enter()}else if(r<=.05){if(this.vis)this.leave()}},{threshold:[0,.05,.8],rootMargin:`-${this.top()}px 0px 0px 0px`}).observe(this.el);
  this.fit();
 }
 build(){
  const L=this.L=this.m?M:D,c=this.cfg.center,N=this.cfg.nodes,cx=L.w/2,cy=L.h/2,rad=Math.PI/180;
  const pos=N.map((n,i)=>{const a=-90+i*360/N.length;return{a,x:cx+L.rx*Math.cos(a*rad),y:cy+L.ry*Math.sin(a*rad)}});
  const hit=(x,y)=>pos.some(p=>Math.abs(x-p.x)<L.cw/2+12&&Math.abs(y-p.y)<L.ch/2+12);
  const rays=pos.map((p,i)=>({a:p.a,x:p.x,y:p.y,n:i}));
  const lens=[170,250,200,290,160,230,270,190,240,150,280,210];let j=0;
  for(let k=0;k<18&&rays.length<18;k++){
   const a=-90+k*20;
   if(pos.some(p=>Math.abs(((a-p.a+540)%360)-180)<8))continue;
   let l=lens[j%12]*L.f,x,y;
   do{x=cx+l*Math.cos(a*rad);y=cy+l*Math.sin(a*rad);l-=6}while(hit(x,y)&&l>L.hub+20);
   rays.push({a,x,y,r:[3,5,4,6][j%4]*(this.m?.8:1)});j++;
  }
  rays.sort((p,q)=>p.a-q.a);
  let h=`<div class="zoom"><svg width="${L.w}" height="${L.h}" viewBox="0 0 ${L.w} ${L.h}">`;
  [L.hub+L.r1,L.hub+L.r2].forEach(r=>h+=`<circle class="ring" cx="${cx}" cy="${cy}" r="${r}"/>`);
  rays.forEach(r=>h+=`<line class="ray${r.r?'':' nr'}" pathLength="1" x1="${cx}" y1="${cy}" x2="${r.x.toFixed(1)}" y2="${r.y.toFixed(1)}"/>`);
  rays.forEach((r,k)=>{if(r.r)h+=`<circle class="edot" cx="${r.x.toFixed(1)}" cy="${r.y.toFixed(1)}" r="${r.r}" data-k="${k}" data-dx="${(r.x-cx).toFixed(1)}" data-dy="${(r.y-cy).toFixed(1)}" style="--d:${(k*.37).toFixed(2)}s"/>`});
  rays.forEach(r=>h+=`<circle class="pk" cx="${cx}" cy="${cy}" r="2.4" data-n="${r.r?-1:r.n}" data-dx="${(r.x-cx).toFixed(1)}" data-dy="${(r.y-cy).toFixed(1)}"/>`);
  h+=`</svg><div class="core" style="left:${cx-L.hub}px;top:${cy-L.hub}px;width:${L.hub*2}px;height:${L.hub*2}px"><b>${c.title}</b><i>${c.sub}</i></div>`;
  N.forEach((n,i)=>h+=`<div class="slot" style="left:${pos[i].x.toFixed(1)}px;top:${pos[i].y.toFixed(1)}px;width:${L.cw}px"><div class="card"><svg class="ic" viewBox="0 0 24 24">${ICONS[n.icon]||ICONS.sparkle}</svg><b>${n.title}</b><span>${n.line2}</span></div></div>`);
  h+='</div>';
  this.stage.style.cssText=`width:${L.w}px;height:${L.h}px;--t:${L.t}px;--s:${L.s}px;--i:${L.ico}px;--ht:${L.ht}px;--hs:${L.hs}px`;
  this.stage.innerHTML=h;
  const q=s=>[...this.stage.querySelectorAll(s)];
  this.zoom=this.stage.firstChild;this.core=this.stage.querySelector('.core');this.sub=this.core.querySelector('i');
  this.rings=q('.ring');this.lines=q('.ray');this.dots=q('.edot');this.cards=q('.card');this.pks=q('.pk');
 }
 top(){const v=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hub-top'));if(v)return v;const h=document.querySelector('header,[role=banner]');return h&&/fixed|sticky/.test(getComputedStyle(h).position)?Math.round(h.offsetHeight):0}
 fit(){
  const W=this.el.clientWidth;if(!W)return;
  const m=W<640;
  if(m!==this.m||!this.zoom){this.m=m;this.build();if(this.vis)this.finish();else this.reset()}
  const s=Math.min(W/this.L.w,Math.max(.55,(innerHeight-this.top()-32)/this.L.h)),H=this.L.h*s;
  this.stage.style.transform=`translateX(${(W-this.L.w*s)/2}px) scale(${s})`;this.el.style.height=H+'px';
  this.cw=W;this.chh=H;const d=devicePixelRatio||1;
  this.cv.width=W*d;this.cv.height=H*d;this.ctx.setTransform(d,0,0,d,0,0);
  if(this.rm&&this.vis)this.draw(0);
 }
 reset(){
  this.timers.forEach(clearTimeout);this.timers=[];
  this.anims.forEach(a=>a.cancel());this.anims=[];
  this.zoom.style.translate=this.core.style.translate='';
  this.cards.forEach((c,i)=>{c.querySelector('span').textContent=this.cfg.nodes[i].line2});
  this.el.classList.remove('on','done');
  this.sub.textContent=this.cfg.center.sub;this.sub.style.opacity='';
 }
 finish(){this.reset();this.el.classList.add('done');this.sub.textContent=this.cfg.center.subShort;this.idle()}
 play(){
  this.reset();this.el.classList.add('on');
  const A=this.anims,ez='cubic-bezier(.22,1,.36,1)';
  const an=(n,k,o)=>A.push(n.animate(k,{fill:'both',easing:ez,...o}));
  an(this.core,[{opacity:0},{opacity:1}],{duration:300});
  this.rings.forEach(r=>an(r,[{opacity:0},{opacity:1}],{duration:900,delay:100}));
  this.lines.forEach((l,k)=>an(l,[{strokeDashoffset:1},{strokeDashoffset:0}],{delay:200+k*30,duration:900}));
  this.dots.forEach(d=>an(d,[{opacity:0,transform:`translate(${-d.dataset.dx}px,${-d.dataset.dy}px)`},{opacity:1,transform:'translate(0,0)'}],{delay:200+d.dataset.k*30,duration:900}));
  const T0='perspective(900px) rotateX(0) rotateY(0) scale(1)';
  this.cards.forEach((c,i)=>an(c,[{opacity:0,transform:'perspective(900px) rotateX(72deg) rotateY(-22deg) scale(.92)'},{opacity:.5,offset:.3},{opacity:1,transform:T0}],{delay:2000+i*350,duration:450}));
  an(this.zoom,[{transform:'scale(1.12)',offset:0},{transform:'scale(1.12)',offset:4600/5400,easing:'cubic-bezier(.65,0,.35,1)'},{transform:'scale(1)',offset:1}],{duration:5400,easing:'linear'});
  an(this.core,[{transform:'scale(.8)',filter:'brightness(2.4)'},{transform:'scale(1.06)',filter:'brightness(1.5)',offset:.5},{transform:'scale(1)',filter:'brightness(1)'}],{duration:900,delay:150});
  this.cards.forEach((c,i)=>A.push(c.animate([{backgroundPosition:'150% 0'},{backgroundPosition:'-50% 0'}],{pseudoElement:'::after',duration:900,delay:2250+i*350,easing:'ease-in-out',fill:'both'})));
  this.cards.forEach((c,i)=>{
   const s=c.querySelector('span'),t=this.cfg.nodes[i].line2,m=t.match(/\$([\d,]+)/);if(!m)return;
   const v=+m[1].replace(/,/g,''),fmt=n=>t.replace(m[0],()=>'$'+n.toLocaleString('en-US'));
   s.textContent=fmt(0);
   this.timers.push(setTimeout(()=>{const st=performance.now(),f=now=>{if(!this.el.classList.contains('on'))return;const k=Math.min(1,(now-st)/800);s.textContent=fmt(Math.round(v*(1-(1-k)**3)));if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)},2150+i*350));
  });
  this.timers.push(setTimeout(()=>{this.sub.style.opacity=0},2500));
  this.timers.push(setTimeout(()=>{this.sub.textContent=this.cfg.center.subShort;this.sub.style.opacity=1},2760));
  this.timers.push(setTimeout(()=>this.finish(),5400));
 }
 idle(){
  if(this.rm)return;const A=this.anims,base='rgba(255,255,255,.1)',sh='0 10px 30px rgba(0,0,0,.55)';
  this.pks.forEach((p,i)=>{
   const dx=p.dataset.dx,dy=p.dataset.dy,n=+p.dataset.n,o={duration:3600,delay:i*330,iterations:Infinity,fill:'both'};
   A.push(p.animate([{transform:'translate(0,0)'},{transform:`translate(${dx}px,${dy}px)`}],{...o,easing:'cubic-bezier(.45,0,.25,1)'}));
   A.push(p.animate([{opacity:0},{opacity:1,offset:.1},{opacity:1,offset:.78},{opacity:0,offset:.86},{opacity:0}],{...o,easing:'linear'}));
   if(n>=0)A.push(this.cards[n].animate([{borderColor:base,boxShadow:sh},{borderColor:base,boxShadow:sh,offset:.8},{borderColor:'rgba(34,211,238,.75)',boxShadow:sh+',0 0 28px rgba(34,211,238,.4)',offset:.88},{borderColor:base,boxShadow:sh}],{...o,easing:'linear'}));
  });
 }
 enter(){this.vis=true;if(this.rm){this.finish();this.draw(0)}else{this.play();this.loop()}}
 leave(){this.vis=false;this.reset()}
 loop(){
  if(this.raf)return;
  const f=t=>{if(!this.vis){this.raf=0;return}this.draw(t);this.raf=requestAnimationFrame(f)};
  this.raf=requestAnimationFrame(f);
 }
 draw(t){
  const c=this.ctx,W=this.cw,H=this.chh;c.clearRect(0,0,W,H);
  const g=34,R=Math.min(200,W*.3);
  let gx=W/2,gy=H/2;
  if(!this.rm){if(this.tx!=null){gx=this.tx;gy=this.ty}else{gx+=Math.sin(t/2800)*W*.24;gy+=Math.sin(t/4100)*H*.04}}
  if(this.fx==null||this.rm){this.fx=gx;this.fy=gy}else{this.fx+=(gx-this.fx)*.08;this.fy+=(gy-this.fy)*.08}
  const fx=this.fx,fy=this.fy;
  if(this.el.classList.contains('done')&&!this.rm){
   const kx=this.tx!=null?this.tx/W-.5:0,ky=this.tx!=null?this.ty/H-.5:0;
   this.px+=(kx-this.px)*.07;this.py+=(ky-this.py)*.07;
   this.zoom.style.translate=`${-this.px*16}px ${-this.py*12}px`;this.core.style.translate=`${this.px*12}px ${this.py*9}px`;
  }
  const near=[];
  for(let y=g/2;y<H;y+=g)for(let x=g/2;x<W;x+=g){
   const d=Math.hypot(x-fx,y-fy),f=d<R?(1-d/R)**2:0;
   c.globalAlpha=.14+.75*f;c.fillStyle=f>.15?'#22d3ee':'#fff';
   c.beginPath();c.arc(x,y,.9+2.4*f,0,6.2832);c.fill();
   if(f>0)near.push([d,x,y]);
  }
  near.sort((a,b)=>a[0]-b[0]);
  c.globalAlpha=.3;c.strokeStyle='#fff';c.lineWidth=.8;c.beginPath();
  near.slice(0,12).forEach(n=>{c.moveTo(fx,fy);c.lineTo(n[1],n[2])});c.stroke();
  c.globalAlpha=1;c.fillStyle='#fff';c.beginPath();c.arc(fx,fy,3.5,0,6.2832);c.fill();
 }
}

document.querySelectorAll('[data-hub]').forEach(e=>new HubDiagram(e,JSON.parse(e.dataset.hub)));
