
document.addEventListener('DOMContentLoaded',()=>{
  const params=new URLSearchParams(location.search);
  const state={search:params.get('search')||'',category:params.get('category')||'all',availability:params.get('availability')||'all',price:params.get('price')||'all',sort:params.get('sort')||'featured',page:Math.max(1,Number(params.get('page'))||1),itemsPerPage:Number(params.get('items')||8)};
  const $=id=>document.getElementById(id);
  const controls=['search','category','availability','price','sort','itemsPerPage'];
  function populate(){
    document.querySelectorAll('[data-filter="search"]').forEach(el=>el.value=state.search);
    document.querySelectorAll('[data-filter="category"]').forEach(el=>el.value=state.category);
    document.querySelectorAll('[data-filter="availability"]').forEach(el=>el.value=state.availability);
    document.querySelectorAll('[data-filter="price"]').forEach(el=>el.value=state.price);
    document.querySelectorAll('[data-filter="sort"]').forEach(el=>el.value=state.sort);
    document.querySelectorAll('[data-filter="itemsPerPage"]').forEach(el=>el.value=state.itemsPerPage);
  }
  function filtered(){
    const q=state.search.toLowerCase();
    return Store.products.filter(p=>{
      const searchable=[p.name,p.category,p.shortDescription,...p.tags].join(' ').toLowerCase();
      const searchOk=!q||searchable.includes(q);
      const catOk=state.category==='all'||p.category===state.category;
      const avOk=state.availability==='all'||(state.availability==='in'&&p.stock>0)||(state.availability==='out'&&p.stock===0);
      const priceOk=state.price==='all'||(state.price==='under75'&&p.price<75)||(state.price==='75to150'&&p.price>=75&&p.price<=150)||(state.price==='over150'&&p.price>150);
      return searchOk&&catOk&&avOk&&priceOk;
    });
  }
  function sorted(list){ return [...list].sort((a,b)=>{
    if(state.sort==='newest') return Number(b.isNew)-Number(a.isNew)||b.id-a.id;
    if(state.sort==='price-asc') return a.price-b.price;
    if(state.sort==='price-desc') return b.price-a.price;
    if(state.sort==='rating') return b.rating-a.rating;
    return Number(b.isFeatured)-Number(a.isFeatured)||a.id-b.id;
  }); }
  function syncUrl(){ const p=new URLSearchParams(); Object.entries(state).forEach(([k,v])=>{ if((k==='category'||k==='availability'||k==='price')&&v==='all')return; if(k==='sort'&&v==='featured')return; if(k==='page'&&v===1)return; if(k==='itemsPerPage'&&v===8)return; if(k==='search'&&!v)return; p.set(k==='itemsPerPage'?'items':k,v); }); history.replaceState(null,'',location.pathname+(p.toString()?`?${p}`:'')); }
  function activeFilters(){ const arr=[]; if(state.search)arr.push(`Search: “${state.search}”`); if(state.category!=='all')arr.push(state.category); if(state.availability!=='all')arr.push(state.availability==='in'?'In stock':'Out of stock'); if(state.price!=='all')arr.push(({under75:'Under $75','75to150':'$75–$150',over150:'Over $150'})[state.price]); $('activeFilters').innerHTML=arr.map(x=>`<span class="active-filter">${x}</span>`).join(''); }
  function pagination(total,totalPages){ const wrap=$('pagination'); if(totalPages<=1){wrap.innerHTML='';return;} let html='<nav aria-label="Product pages"><ul class="pagination flex-wrap mb-0">'; html+=`<li class="page-item ${state.page===1?'disabled':''}"><button class="page-link" data-page="${state.page-1}">Previous</button></li>`; for(let i=1;i<=totalPages;i++)html+=`<li class="page-item ${state.page===i?'active':''}"><button class="page-link" data-page="${i}">${i}</button></li>`; html+=`<li class="page-item ${state.page===totalPages?'disabled':''}"><button class="page-link" data-page="${state.page+1}">Next</button></li></ul></nav>`; wrap.innerHTML=html; }
  function render(){ const list=sorted(filtered()); const pages=Math.max(1,Math.ceil(list.length/state.itemsPerPage)); if(state.page>pages)state.page=pages; const start=(state.page-1)*state.itemsPerPage; const shown=list.slice(start,start+state.itemsPerPage); $('resultCount').textContent=`${list.length} ${list.length===1?'product':'products'}`; $('resultRange').textContent=list.length?`Showing ${start+1}–${Math.min(start+state.itemsPerPage,list.length)} of ${list.length}`:'No matching products'; $('productGrid').innerHTML=shown.length?shown.map(p=>`<div class="col-6 col-xl-4">${Store.renderProductCard(p)}</div>`).join(''):`<div class="col-12"><div class="empty-state"><i class="bi bi-search fs-1"></i><h2 class="h3 mt-3">No pieces matched those filters</h2><p class="text-muted-sw">Try a broader search or clear the filters to see the full collection.</p><button class="btn btn-primary" data-reset>Clear filters</button></div></div>`; pagination(list.length,pages); activeFilters(); populate(); syncUrl(); Store.updateCounts(); }
  function change(key,value){ state[key]=key==='itemsPerPage'?Number(value):value; state.page=1; render(); }
  document.addEventListener('input',e=>{ const key=e.target.dataset.filter; if(key==='search')change('search',e.target.value); });
  document.addEventListener('change',e=>{ const key=e.target.dataset.filter; if(key&&key!=='search')change(key,e.target.value); });
  document.addEventListener('click',e=>{ const p=e.target.closest('.page-link[data-page]'); if(p&&!p.closest('.disabled')){const nextPage=Number(p.dataset.page);if(Number.isFinite(nextPage)&&nextPage>=1){state.page=nextPage;render();scrollTo({top:document.querySelector('.toolbar').offsetTop-80,behavior:'smooth'});}} if(e.target.closest('[data-reset]')){Object.assign(state,{search:'',category:'all',availability:'all',price:'all',sort:'featured',page:1,itemsPerPage:8});render();} });
  populate(); render();
});
