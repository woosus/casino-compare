// nav active state
const current = document.body.className.replace('page-','');
document.querySelectorAll('.menu a').forEach(a=>{
  if(a.dataset.page===current) a.classList.add('active');
});

// animation helpers
function staggerShow(items, delay=40){
  items.forEach((el,i)=>setTimeout(()=>el.classList.add('show'), delay*i));
}

// ranking & compare
async function loadData(){
  try{
    const res = await fetch('./assets/events.json');
    return await res.json();
  }catch(e){
    // fallback mock
    return [
      { name:'BET A', type:'슬롯', bonus:60, wager:25, tag:'리로드' },
      { name:'BET B', type:'라이브', bonus:30, wager:15, tag:'첫입금' },
      { name:'BET C', type:'스포츠', bonus:0,  wager:0,  tag:'롤백10%' },
      { name:'BET D', type:'슬롯', bonus:70, wager:40, tag:'슬롯전용' },
      { name:'BET E', type:'카지노', bonus:35, wager:18, tag:'리로드' },
      { name:'BET F', type:'라이브', bonus:45, wager:22, tag:'스페셜' },
    ];
  }
}

const page = current;
if(page==='ranking'){
  loadData().then(data=>{
    // simple score model: bonus - (wager*0.8) + type weight
    const weight = t => ({'슬롯':4,'라이브':3,'카지노':2,'스포츠':1}[t]||0);
    const scored = data.map(d=>({ ...d, score: Math.round(d.bonus - (d.wager*0.8) + weight(d.type)*3) }))
                       .sort((a,b)=>b.score-a.score);
    const ul = document.querySelector('#rankCards');
    ul.innerHTML = scored.map((it,i)=>`<li class="card">
      <div class="title"><span class="rank">${i+1}</span>${it.name}</div>
      <div class="meta">${it.bonus}% ${it.tag} • 웨이저 ${it.wager||'-'}x • ${it.type} • 점수 ${it.score}</div>
    </li>`).join('');
  });
}

if(page==='compare'){
  const trigger=document.querySelector('.acc-trigger');
  const panel=document.querySelector('#acc-panel');
  const chips=[...document.querySelectorAll('.chip-list li')];
  function setOpen(open){
    trigger.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('open', open);
    if(open) staggerShow(chips, 40);
    else chips.forEach(c=>c.classList.remove('show'));
  }
  setOpen(true);
  trigger.addEventListener('click', ()=> setOpen(trigger.getAttribute('aria-expanded')!=='true') );

  const results = document.getElementById('results');
  const doSearch = document.getElementById('do-search');
  const fBonus = document.getElementById('f-bonus');
  const fWager = document.getElementById('f-wager');
  const fType = document.getElementById('f-type');

  loadData().then(data=>{
    function render(list){
      results.innerHTML = list.map((it,i)=>`<li class="card">
        <div class="title"><span class="rank">${i+1}</span>${it.name}</div>
        <div class="meta">${it.bonus}% ${it.tag} • 웨이저 ${it.wager||'-'}x • ${it.type}</div>
      </li>`).join('');
    }
    function filter(){
      const b = Number(fBonus.value);
      const w = Number(fWager.value);
      const t = fType.value;
      const list = data.filter(it => (it.bonus>=b*0.3) && (it.wager<=w || it.wager===0) && (!t || it.type===t))
                       .sort((a,b)=> (b.bonus - a.bonus) || (a.wager - b.wager));
      render(list);
    }
    render(data);
    doSearch.addEventListener('click', filter);
  });
}

// coupon stub (prevent submit)
if(page==='coupon'){
  const form = document.getElementById('couponForm');
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    alert('데모: 제출은 저장되지 않습니다.');
  });
}