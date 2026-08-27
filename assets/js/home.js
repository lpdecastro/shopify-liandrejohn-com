
document.addEventListener('DOMContentLoaded',()=>{
  const featured=Store.products.filter(p=>p.isFeatured).slice(0,4);
  document.getElementById('featuredGrid').innerHTML=featured.map(p=>`<div class="col-6 col-lg-3">${Store.renderProductCard(p)}</div>`).join('');
  Store.updateCounts();
});
