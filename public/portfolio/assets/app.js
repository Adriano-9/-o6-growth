const $=(s,c=document)=>c.querySelector(s);const $$=(s,c=document)=>[...c.querySelectorAll(s)];

const menuBtn=$('[data-menu]');const mobilePanel=$('.mobile-panel');
if(menuBtn&&mobilePanel){menuBtn.addEventListener('click',()=>{const open=mobilePanel.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open));menuBtn.textContent=open?'Fechar':'Menu';document.body.style.overflow=open?'hidden':''});$$('.mobile-panel a').forEach(a=>a.addEventListener('click',()=>{mobilePanel.classList.remove('open');menuBtn.setAttribute('aria-expanded','false');menuBtn.textContent='Menu';document.body.style.overflow=''}));}

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -8%'});$$('.reveal').forEach(el=>io.observe(el));}
else{$$('.reveal').forEach(el=>el.classList.add('in'));}

$$('video[autoplay]').forEach(v=>{v.muted=true;v.playsInline=true;const attempt=()=>v.play().catch(()=>{});attempt();document.addEventListener('visibilitychange',()=>{if(!document.hidden)attempt()});});

const filterButtons=$$('[data-filter]');const archiveRows=$$('[data-tags]');
if(filterButtons.length){filterButtons.forEach(btn=>btn.addEventListener('click',()=>{filterButtons.forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;archiveRows.forEach(row=>{const tags=(row.dataset.tags||'').split(' ');row.hidden=!(f==='all'||tags.includes(f));});}));}

let lastY=0;const nav=$('.site-nav');if(nav&&!reduced){addEventListener('scroll',()=>{const y=scrollY;nav.style.transform=y>lastY&&y>180?'translateY(-90px)':'translateY(0)';nav.style.transition='transform .35s ease';lastY=y;},{passive:true});}
