
/* Shared storefront behavior: header/footer, cart, wishlist, quick view and localStorage. */
(function () {
  const CART_KEY = 'stillwardCart';
  const WISH_KEY = 'stillwardWishlist';
  const PROMO_KEY = 'stillwardPromo';
  const products = window.DEMO_PRODUCTS || [];
  const money = value => new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(value);
  const byId = id => products.find(p => p.id === Number(id));
  const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const getCart = () => read(CART_KEY, []);
  const getWishlist = () => read(WISH_KEY, []);
  const getPromo = () => read(PROMO_KEY, null);

  function toast(message) {
    const el = document.getElementById('liveToast');
    if (!el) return;
    el.querySelector('.toast-body').textContent = message;
    bootstrap.Toast.getOrCreateInstance(el, { delay:2200 }).show();
  }

  function cartCount() { return getCart().reduce((sum, item) => sum + item.quantity, 0); }
  function cartSubtotal() { return getCart().reduce((sum, item) => { const p=byId(item.id); return sum + (p ? p.price*item.quantity : 0); }, 0); }
  function discountAmount() { return getPromo() === 'PITCH10' ? cartSubtotal() * .10 : 0; }

  function updateCounts() {
    document.querySelectorAll('[data-cart-count]').forEach(el => el.textContent = cartCount());
    document.querySelectorAll('[data-wish-count]').forEach(el => el.textContent = getWishlist().length);
  }

  function addToCart(id, quantity=1, options={}) {
    const p=byId(id); if (!p) return false;
    if (p.stock <= 0) { toast('This item is currently out of stock.'); return false; }
    const cart=getCart();
    const existing=cart.find(i => i.id === p.id && JSON.stringify(i.options||{})===JSON.stringify(options||{}));
    const current = existing ? existing.quantity : 0;
    const safeQty = Math.min(Math.max(1, Number(quantity)||1), p.stock-current);
    if (safeQty <= 0) { toast(`Stock limit reached for ${p.name}.`); return false; }
    if (existing) existing.quantity += safeQty; else cart.push({id:p.id, quantity:safeQty, options});
    write(CART_KEY,cart); updateCounts(); renderMiniCart();
    toast(`${p.name} added to cart.`); return true;
  }

  function setCartQty(index, qty) {
    const cart=getCart(); const item=cart[index]; if(!item) return;
    const p=byId(item.id); if(!p) return;
    item.quantity=Math.max(1, Math.min(Number(qty)||1,p.stock));
    write(CART_KEY,cart); updateCounts(); renderMiniCart();
  }
  function removeCartItem(index) { const cart=getCart(); cart.splice(index,1); write(CART_KEY,cart); updateCounts(); renderMiniCart(); }
  function clearCart() { write(CART_KEY,[]); localStorage.removeItem(PROMO_KEY); updateCounts(); renderMiniCart(); }

  function toggleWishlist(id) {
    const p=byId(id); if(!p) return;
    let wish=getWishlist(); const exists=wish.includes(p.id);
    wish=exists ? wish.filter(x=>x!==p.id) : [...wish,p.id];
    write(WISH_KEY,wish); updateCounts(); syncWishlistButtons();
    toast(exists ? `${p.name} removed from wishlist.` : `${p.name} saved to wishlist.`);
    document.dispatchEvent(new CustomEvent('wishlist:change'));
  }
  function isWished(id) { return getWishlist().includes(Number(id)); }
  function syncWishlistButtons() {
    document.querySelectorAll('[data-wishlist]').forEach(btn => {
      const active=isWished(btn.dataset.wishlist); btn.classList.toggle('active',active); btn.setAttribute('aria-pressed',active?'true':'false');
      const icon=btn.querySelector('i'); if(icon) icon.className=active?'bi bi-heart-fill':'bi bi-heart';
    });
  }

  function productBadge(p) { if(p.stock===0) return ''; if(p.originalPrice) return '<span class="merch-badge">Sale</span>'; if(p.isNew) return '<span class="merch-badge">New</span>'; if(p.stock<=4) return '<span class="merch-badge">Low stock</span>'; return ''; }
  function stockText(p) { if(p.stock===0) return '<div class="stock-text stock-out">Out of stock</div>'; if(p.stock<=4) return `<div class="stock-text stock-low">Only ${p.stock} available</div>`; return '<div class="stock-text text-muted-sw">In stock</div>'; }
  function renderProductCard(p) {
    return `<article class="product-card" data-product-id="${p.id}">
      <div class="product-media">
        ${productBadge(p)}
        <button class="wishlist-btn ${isWished(p.id)?'active':''}" data-wishlist="${p.id}" aria-label="Save ${p.name} to wishlist" aria-pressed="${isWished(p.id)}"><i class="bi ${isWished(p.id)?'bi-heart-fill':'bi-heart'}"></i></button>
        <a href="product.html?id=${p.id}" aria-label="View ${p.name}">
          <img class="main-image" src="${p.image}" alt="${p.name} demo product photography" loading="lazy" width="700" height="875">
          <img class="hover-image" src="${p.hoverImage}" alt="" loading="lazy" width="700" height="875">
        </a>
      </div>
      <div class="pt-3">
        <div class="product-meta">${p.category}</div>
        <h3 class="product-name"><a href="product.html?id=${p.id}">${p.name}</a></h3>
        <div class="d-flex justify-content-between align-items-start gap-2">
          <div><span class="product-price">${money(p.price)}</span>${p.originalPrice?`<span class="price-old">${money(p.originalPrice)}</span>`:''}</div>
          <div class="rating" aria-label="Rated ${p.rating} out of 5"><i class="bi bi-star-fill"></i> ${p.rating} <span class="text-muted-sw">(${p.reviewCount})</span></div>
        </div>
        ${stockText(p)}
        <div class="product-actions">
          <button class="btn btn-primary flex-grow-1" data-add-cart="${p.id}" ${p.stock===0?'disabled':''}>${p.stock===0?'Out of stock':'Add to cart'}</button>
          <button class="btn btn-outline-dark" data-quick-view="${p.id}">Quick view</button>
        </div>
      </div>
    </article>`;
  }

  function renderMiniCart() {
    const wrap=document.getElementById('miniCartBody'); if(!wrap) return;
    const cart=getCart();
    if(!cart.length) { wrap.innerHTML='<div class="empty-state"><i class="bi bi-bag fs-1"></i><h3 class="h4 mt-3">Your cart is quiet</h3><p class="text-muted-sw">Add a few pieces and they will stay here while you browse.</p><a href="shop.html" class="btn btn-primary">Shop the collection</a></div>'; document.getElementById('miniCartSubtotal').textContent=money(0); return; }
    wrap.innerHTML=cart.map((item,index)=>{ const p=byId(item.id); if(!p)return''; return `<div class="cart-line d-flex gap-3"><img class="cart-thumb" src="${p.image}" alt="${p.name}" width="84" height="105"><div class="flex-grow-1"><div class="d-flex justify-content-between gap-2"><a class="fw-semibold no-decoration" href="product.html?id=${p.id}">${p.name}</a><button class="btn btn-sm p-0" data-mini-remove="${index}" aria-label="Remove ${p.name}"><i class="bi bi-x-lg"></i></button></div><small class="text-muted-sw">${item.options?.finish||'Standard finish'}</small><div class="d-flex justify-content-between align-items-center mt-2"><div class="quantity-control"><button data-mini-dec="${index}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-mini-inc="${index}" aria-label="Increase quantity">+</button></div><strong>${money(p.price*item.quantity)}</strong></div></div></div>`; }).join('');
    document.getElementById('miniCartSubtotal').textContent=money(cartSubtotal());
  }

  function buildHeader() {
    const current=document.body.dataset.page||'';
    const link=(href,label)=>`<a class="nav-link ${current===href?'active':''}" href="${href}">${label}</a>`;
    document.getElementById('siteHeader').innerHTML=`
      <div class="announcement py-2 text-center px-3">Demo storefront · Free shipping over $150 · 30-day returns</div>
      <header class="site-header sticky-top">
        <div class="container py-3">
          <div class="d-flex align-items-center gap-3">
            <button class="header-icon d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#mobileNav" aria-label="Open menu"><i class="bi bi-list"></i></button>
            <a href="index.html" class="site-brand me-auto me-lg-4">Stillward</a>
            <nav class="d-none d-lg-flex align-items-center gap-3 me-auto" aria-label="Main navigation">${link('shop.html','Shop')}${link('about.html','About')}${link('reviews.html','Reviews')}${link('faq.html','FAQ')}${link('contact.html','Contact')}</nav>
            <form class="header-search d-none d-xl-flex" data-header-search><div class="input-group input-group-sm"><span class="input-group-text bg-transparent"><i class="bi bi-search"></i></span><input class="form-control" name="search" type="search" placeholder="Search the shop" aria-label="Search products"></div></form>
            <a class="header-icon" href="account.html" aria-label="Account"><i class="bi bi-person"></i></a><a class="header-icon" href="wishlist.html" aria-label="Wishlist"><i class="bi bi-heart"></i><span class="count-badge" data-wish-count>0</span></a>
            <button class="header-icon" data-bs-toggle="offcanvas" data-bs-target="#miniCart" aria-label="Open cart"><i class="bi bi-bag"></i><span class="count-badge" data-cart-count>0</span></button>
          </div>
        </div>
      </header>`;
  }

  function buildFooter() {
    document.getElementById('siteFooter').innerHTML=`<footer class="footer mt-5"><div class="container"><div class="row g-4 pb-5"><div class="col-lg-4"><div class="site-brand mb-3">Stillward</div><p class="text-white-50 pe-lg-5">A fictional home-goods brand created as demo content for this client-pitch ecommerce prototype.</p><form class="mt-4" data-newsletter><label class="form-label text-white">Notes from the studio</label><div class="input-group"><input type="email" required class="form-control" placeholder="Email address" aria-label="Email address"><button class="btn btn-light" type="submit">Join</button></div><small class="text-white-50">Prototype only. No email is stored or sent.</small></form></div><div class="col-6 col-lg-2"><div class="footer-heading mb-3">Shop</div><div class="d-grid gap-2"><a href="shop.html">All products</a><a href="shop.html?sort=newest">New arrivals</a><a href="shop.html?category=Lighting">Lighting</a><a href="wishlist.html">Wishlist</a><a href="account.html">Account</a></div></div><div class="col-6 col-lg-2"><div class="footer-heading mb-3">Help</div><div class="d-grid gap-2"><a href="contact.html">Contact</a><a href="shipping.html">Shipping</a><a href="returns.html">Returns</a><a href="faq.html">FAQs</a></div></div><div class="col-6 col-lg-2"><div class="footer-heading mb-3">About</div><div class="d-grid gap-2"><a href="about.html">Our story</a><a href="reviews.html">Reviews</a><a href="about.html#materials">Materials</a></div></div><div class="col-6 col-lg-2"><div class="footer-heading mb-3">Follow</div><div class="d-flex gap-3 fs-5"><a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a><a href="#" aria-label="Pinterest"><i class="bi bi-pinterest"></i></a><a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a></div><div class="mt-4 small text-white-50">USD · United States</div></div></div><div class="footer-bottom py-3 d-flex flex-wrap justify-content-between gap-2 small text-white-50"><span>© 2026 Stillward demo store</span><span>Prototype content · Privacy · Terms · Cookies</span></div></div></footer>`;
  }

  function buildSharedUi() {
    document.getElementById('sharedCommerceUi').innerHTML=`
      <div class="offcanvas offcanvas-start" tabindex="-1" id="mobileNav"><div class="offcanvas-header"><h2 class="site-brand mb-0">Stillward</h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body"><form class="mb-4" data-header-search><input class="form-control" name="search" type="search" placeholder="Search products" aria-label="Search products"></form><nav class="d-grid gap-3 fs-5"><a href="shop.html">Shop</a><a href="about.html">About</a><a href="reviews.html">Reviews</a><a href="faq.html">FAQ</a><a href="contact.html">Contact</a></nav></div></div>
      <div class="offcanvas offcanvas-end" tabindex="-1" id="miniCart"><div class="offcanvas-header"><h2 class="h4 mb-0">Your cart <span class="text-muted-sw">(<span data-cart-count>0</span>)</span></h2><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div><div class="offcanvas-body d-flex flex-column"><div id="miniCartBody" class="flex-grow-1"></div><div class="pt-3 border-top"><div class="d-flex justify-content-between mb-3"><span>Subtotal</span><strong id="miniCartSubtotal">$0.00</strong></div><div class="d-grid gap-2"><a class="btn btn-primary" href="cart.html">View cart</a><a class="btn btn-outline-dark" href="checkout.html">Checkout</a></div></div></div></div>
      <div class="modal fade" id="quickViewModal" tabindex="-1" aria-labelledby="quickViewTitle"><div class="modal-dialog modal-lg modal-dialog-centered"><div class="modal-content"><div class="modal-header border-0"><h2 class="modal-title h4" id="quickViewTitle">Quick view</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body" id="quickViewBody"></div></div></div></div>
      <div class="toast-container position-fixed bottom-0 end-0 p-3"><div id="liveToast" class="toast" role="status" aria-live="polite"><div class="toast-body">Updated.</div></div></div>`;
  }

  function openQuickView(id) {
    const p=byId(id); if(!p)return;
    const body=document.getElementById('quickViewBody');
    body.innerHTML=`<div class="row g-4"><div class="col-md-6"><img src="${p.image}" class="w-100" style="aspect-ratio:4/5;object-fit:cover" alt="${p.name}" width="600" height="750"></div><div class="col-md-6"><div class="section-kicker">${p.category}</div><h3 class="h1 mt-2">${p.name}</h3><div class="rating mb-2"><i class="bi bi-star-fill"></i> ${p.rating} (${p.reviewCount} demo reviews)</div><p><strong class="fs-5">${money(p.price)}</strong>${p.originalPrice?` <span class="price-old">${money(p.originalPrice)}</span>`:''}</p>${stockText(p)}<p class="text-muted-sw mt-3">${p.shortDescription}</p><label class="form-label" for="qvFinish">Finish</label><select class="form-select mb-3" id="qvFinish">${p.finish.map(x=>`<option>${x}</option>`).join('')}</select><div class="d-flex gap-2"><button class="btn btn-primary flex-grow-1" data-qv-add="${p.id}" ${p.stock===0?'disabled':''}>${p.stock===0?'Out of stock':'Add to cart'}</button><button class="btn btn-outline-dark" data-wishlist="${p.id}" aria-label="Toggle wishlist"><i class="bi ${isWished(p.id)?'bi-heart-fill':'bi-heart'}"></i></button></div><hr><small class="text-muted-sw">SKU ${p.sku}</small><p class="small mt-2 mb-0">${p.materials}</p><a class="btn btn-link px-0 mt-2" href="product.html?id=${p.id}">See full product details</a></div></div>`;
    bootstrap.Modal.getOrCreateInstance(document.getElementById('quickViewModal')).show(); syncWishlistButtons();
  }

  function applyPromo(code) { const clean=String(code||'').trim().toUpperCase(); if(clean==='PITCH10'){write(PROMO_KEY,'PITCH10');toast('Demo code PITCH10 applied.');return true;} localStorage.removeItem(PROMO_KEY);toast('That demo code is not available.');return false; }

  document.addEventListener('click', e => {
    const add=e.target.closest('[data-add-cart]'); if(add){ addToCart(add.dataset.addCart); return; }
    const wish=e.target.closest('[data-wishlist]'); if(wish){ toggleWishlist(wish.dataset.wishlist); return; }
    const quick=e.target.closest('[data-quick-view]'); if(quick){ openQuickView(quick.dataset.quickView); return; }
    const qv=e.target.closest('[data-qv-add]'); if(qv){ addToCart(qv.dataset.qvAdd,1,{finish:document.getElementById('qvFinish')?.value}); return; }
    const rem=e.target.closest('[data-mini-remove]'); if(rem){ removeCartItem(Number(rem.dataset.miniRemove)); return; }
    const inc=e.target.closest('[data-mini-inc]'); if(inc){ const i=Number(inc.dataset.miniInc), cart=getCart(); setCartQty(i,cart[i].quantity+1); return; }
    const dec=e.target.closest('[data-mini-dec]'); if(dec){ const i=Number(dec.dataset.miniDec), cart=getCart(); if(cart[i].quantity<=1) removeCartItem(i); else setCartQty(i,cart[i].quantity-1); }
  });
  document.addEventListener('submit', e => {
    if(e.target.matches('[data-header-search]')){ e.preventDefault(); const q=e.target.querySelector('[name="search"]').value.trim(); location.href='shop.html'+(q?`?search=${encodeURIComponent(q)}`:''); }
    if(e.target.matches('[data-newsletter]')){ e.preventDefault(); if(e.target.checkValidity()){ toast('Thanks — newsletter signup is simulated for this prototype.'); e.target.reset(); } }
  });

  document.addEventListener('DOMContentLoaded', () => { buildHeader(); buildFooter(); buildSharedUi(); updateCounts(); renderMiniCart(); syncWishlistButtons(); });

  window.Store={money,byId,getCart,getWishlist,getPromo,cartSubtotal,discountAmount,addToCart,setCartQty,removeCartItem,clearCart,toggleWishlist,isWished,renderProductCard,updateCounts,renderMiniCart,applyPromo,toast,products};
})();
