const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const PAGE = document.body.dataset.page || '';

const money = n => Store.money(n);

function showToast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('on');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove('on'), 2600);
}

function starsHTML(r) {
  const full = Math.round(r);
  let out = '<span class="stars" aria-label="' + r + ' out of 5">';
  for (let i = 1; i <= 5; i++) out += '<i class="' + (i <= full ? 'on' : '') + '">★</i>';
  return out + '</span>';
}

function swatchHTML(p, max) {
  const cols = (p.colors && p.colors.length) ? p.colors : [{ n: 'Gold', h: '#d9b26a' }];
  const show = cols.slice(0, max || 1);
  const more = cols.length > show.length ? '<em>+' + (cols.length - show.length) + '</em>' : '';
  return show.map(c => '<i style="background:' + c.h + '" title="' + (c.n || '') + '"></i>').join('') + more;
}

function productCard(p) {
  const wished = Store.isWished(p.id);
  return '<article class="tile" data-cat="' + p.cat + '" data-id="' + p.id + '">' +
    '<a class="tile-img" href="product.html?id=' + p.id + '"><img src="' + p.img + '" alt="' + p.name + '" loading="lazy"></a>' +
    '<button class="tile-wish ' + (wished ? 'is-on' : '') + '" data-wish="' + p.id + '" aria-label="Save to wishlist">' + (wished ? '♥' : '♡') + '</button>' +
    (p.stock > 0 ? '<button class="tile-add" data-add="' + p.id + '">Add to bag</button>' : '<span class="tile-add is-out">Sold out</span>') +
    '<div class="tile-meta">' +
      '<a class="tile-title" href="product.html?id=' + p.id + '">' + p.name + '</a>' +
      '<div class="tile-price"><b>' + money(p.price) + '</b><span class="tile-sw">' + swatchHTML(p, 2) + '</span></div>' +
      (p.tag ? '<span class="tile-tag">' + p.tag + '</span>' : '') +
    '</div>' +
  '</article>';
}

function observeReveals(root) {
  $$('.reveal', root || document).forEach(el => el.classList.add('in'));
}

/* ================= NAV ================= */
const LINE_OF = { 'andrea-tbar': 'andrea', 'moon-venus': 'moon', 'seraphina-band': 'seraphina', 'lumina-trio': 'lumina', 'aura-bangle': 'aura' };
const SUGS = ['Rings', 'Necklaces', 'Earrings', 'Bracelets', 'Gifting'];

function activeKeys() {
  const keys = new Set();
  if (PAGE !== 'shop' && PAGE !== 'product') return keys;
  const p = new URLSearchParams(location.search);
  keys.add('women'); keys.add('jewelry');
  let cat = p.get('cat'), line = null;
  if (PAGE === 'product') {
    const pr = PRODUCTS.find(x => x.id === p.get('id'));
    if (pr) { cat = pr.cat; line = LINE_OF[pr.id] || null; }
  }
  keys.add(cat ? 'cat-' + cat : 'cat-all');
  if (line) keys.add('line-' + line);
  return keys;
}

const NAV_LV2 = [
  ['cat-all', 'View all', 'shop.html'],
  ['', 'New', 'shop.html?sort=new'],
  ['cat-rings', 'Rings', 'shop.html?cat=rings'],
  ['cat-necklaces', 'Necklaces', 'shop.html?cat=necklaces'],
  ['cat-earrings', 'Earrings', 'shop.html?cat=earrings'],
  ['cat-bracelets', 'Bracelets', 'shop.html?cat=bracelets']
];
const NAV_LINES = [
  ['line-andrea', 'The Andrea', 'shop.html?q=andrea'],
  ['line-moon', 'Moon & Venus', 'shop.html?q=moon'],
  ['line-seraphina', 'Seraphina', 'shop.html?q=seraphina'],
  ['line-lumina', 'Lumina', 'shop.html?q=lumina'],
  ['line-aura', 'Aura', 'shop.html?q=aura'],
  ['', 'The Edit', 'shop.html'],
  ['', 'Gifting', 'shop.html?cat=all']
];

function railHTML() {
  const a = (k, cls, txt, href) => '<a' + (k ? ' data-k="' + k + '"' : '') + (cls ? ' class="' + cls + '"' : '') + ' href="' + href + '">' + txt + '</a>';
  let h = '<nav class="g-nav" id="gnav"><ul>';
  h += '<li>' + a('', '', 'New', 'shop.html?sort=new') + '</li>';
  h += '<li class="grp">' + a('women', '', 'Women', 'shop.html');
  h += a('jewelry', 'lv1', 'Jewelry', 'shop.html');
  NAV_LV2.forEach(x => { h += a(x[0], 'lv2', x[1], x[2]); });
  NAV_LINES.forEach(x => { h += a(x[0], 'lv1', x[1], x[2]); });
  h += '</li>';
  h += '<li class="grp">' + a('', '', 'Gifts', 'shop.html?cat=all') + a('', '', 'Gift cards', 'shop.html?cat=all') + '</li>';
  h += '<li class="grp">' + a('', '', 'The house', 'index.html#story') + a('', '', 'Selene now', 'index.html') + '</li>';
  h += '<li class="grp">' + a('', '', 'Store locator', 'index.html#story') + a('', '', 'Sign in / register', '#') + '</li>';
  h += '<li class="grp search-row"><button type="button" id="searchOpen">Search <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg></button></li>';
  h += '</ul></nav>';
  return h;
}

function mmHTML() {
  const a = (k, txt, href) => '<a' + (k ? ' data-k="' + k + '"' : '') + ' href="' + href + '">' + txt + '</a>';
  const item = (label, sub) => '<div class="mm-item"><button type="button" class="mm-row" data-mm>' + label + '<i>+</i></button><div class="mm-sub">' + sub + '</div></div>';
  let list = '<div class="mm-item"><a class="mm-row" href="shop.html?sort=new">New</a></div>';
  let sub = a('women', 'Women', 'shop.html') + a('jewelry', 'Jewelry', 'shop.html');
  NAV_LV2.forEach(x => { sub += a(x[0], 'lv2', x[1], x[2]); });
  NAV_LINES.forEach(x => { sub += a(x[0], 'lv2', x[1], x[2]); });
  list += item('Women', sub);
  list += '<div class="mm-item"><a class="mm-row" href="shop.html?cat=all">Gifts</a></div>';
  list += '<div class="mm-item"><a class="mm-row" href="index.html#story">The house</a></div>';
  list += '<div class="mm-item"><a class="mm-row" href="index.html">Selene now</a></div>';
  list += '<div class="mm-item"><button type="button" class="mm-row" id="mmSearch">Search<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg></button></div>';
  return '<nav class="g-mmenu" id="mmenu" aria-label="Menu">' +
    '<div class="mm-head"><a class="m-logo" href="index.html">Selene</a><button class="mm-x" id="mmClose" aria-label="Close menu"></button></div>' +
    '<div class="mm-list">' + list + '</div>' +
    '<div class="mm-bottom">' +
      '<a href="index.html#story">Store locator</a>' +
      '<a href="#">Sign in / register</a>' +
      '<button type="button" id="mmBag">Bag (<span id="mmBagN">0</span>)</button>' +
      '<a href="#">Contact us</a>' +
      '<div class="mm-region">India | EN</div>' +
    '</div></nav>';
}

function footerHTML() {
  return '<footer class="g-footer wrap">' +
    '<div class="fr"><a href="#">Contact us</a><a href="#">Shipping &amp; returns</a><a href="#">Care guide</a><a href="#">Size guide</a><a href="#">FAQ</a>' +
      '<span class="fr-r"><a href="https://www.instagram.com/selene._co" target="_blank" rel="noopener">Instagram</a><button type="button" id="newsOpen">Newsletter</button></span></div>' +
    '<div class="fr"><a href="index.html#story">The house</a><a href="index.html">Selene now</a><a href="orders.html">Order status</a><a href="wishlist.html">Wishlist</a>' +
      '<span class="fr-r"><button type="button" id="ckOpen">Cookie settings</button></span></div>' +
    '<div class="fr f-legal"><span>© 2026 Selene</span><span class="fr-r">India | EN</span></div>' +
  '</footer>';
}

function chromeHTML() {
  const searchSVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4.2-4.2"/></svg>';
  return '<a class="g-logo" href="index.html">Selene</a>' +
    '<div class="g-hover" id="hoverStrip"></div>' +
    '<aside class="g-rail" id="rail">' + railHTML() + '</aside>' +
    '<button class="g-bag" id="bagBtn" type="button">Bag (<span id="bagCount">0</span>)</button>' +
    '<header class="g-mhead"><a class="m-logo" href="index.html">Selene</a>' +
      '<div class="m-tools"><button type="button" id="mSearch" aria-label="Search">' + searchSVG + '</button>' +
      '<button type="button" class="g-ham" id="burger" aria-label="Menu"><span></span><span></span></button></div></header>' +
    mmHTML() +
    footerHTML() +
    '<div class="scrim" id="scrim"></div>' +
    '<aside class="s-search" id="searchPanel" aria-label="Search">' +
      '<div class="s-top"><span>Search</span><button class="x" id="searchClose" aria-label="Close"></button></div>' +
      '<form class="s-form" id="searchForm"><input id="searchInput" placeholder="What are you looking for" autocomplete="off" aria-label="Search products"><button type="submit">See the results</button></form>' +
      '<div class="s-sug" id="searchSugs"><div class="lbl">Suggestions</div><ul>' +
        SUGS.map(s => '<li><button type="button" class="link-btn" data-sug="' + s + '">' + s + '</button></li>').join('') +
      '</ul></div>' +
      '<div class="s-res" id="searchResults"></div>' +
    '</aside>' +
    '<aside class="s-drawer" id="drawer" aria-label="Shopping bag">' +
      '<div class="d-head"><h3>Bag <span id="drawerCount"></span></h3><button class="x" id="drawerClose" aria-label="Close"></button></div>' +
      '<div class="d-body" id="drawerBody"></div>' +
      '<div class="d-foot" id="drawerFoot"></div>' +
    '</aside>' +
    '<div class="s-quick" id="quick" role="dialog" aria-label="Quick add">' +
      '<div class="scrim q-scrim" id="qScrim"></div>' +
      '<div class="q-card"><button class="x q-x" id="quickClose" aria-label="Close"></button>' +
        '<div class="q-grid"><img id="quickImg" src="" alt="">' +
        '<div class="q-info"><p class="q-cat" id="quickCat"></p><h3 id="quickName"></h3><p class="q-price" id="quickPrice"></p>' +
        '<p class="q-lab">Color — <b id="quickColor"></b></p><div class="q-sw" id="quickSw"></div>' +
        '<p class="q-lab" id="quickSizeLab">Size</p><div class="q-sw sizes" id="quickSizes"></div>' +
        '<p class="q-hint" id="quickHint" hidden>Please make a selection.</p>' +
        '<div class="q-buy"><div class="qty" id="quickQty"><button data-step="-1" aria-label="Decrease">−</button><span id="quickQtyN">1</span><button data-step="1" aria-label="Increase">+</button></div>' +
        '<button class="btn" id="quickAdd">Add to bag</button></div>' +
        '<a class="link-btn" id="quickLink" href="#">View full details</a></div>' +
        '</div></div></div>' +
    '<aside class="s-news" id="news" aria-label="Newsletter">' +
      '<button class="x" id="newsClose" aria-label="Close"></button>' +
      '<h3>Join the list</h3><p>New collections, private restocks and invitations — straight to your inbox.</p>' +
      '<form class="row" id="newsForm"><input type="email" placeholder="Email address" required aria-label="Email"><button type="submit">Subscribe</button></form>' +
      '<p class="news-note" id="newsNote"></p>' +
    '</aside>' +
    '<div class="s-cookie" id="cookie"><div class="txt"><b>Cookies</b> — we use cookies to improve your experience and measure our audience. <a class="link-btn" href="#">Privacy policy</a></div>' +
      '<div class="btns"><button type="button" data-ck="all">Accept all</button><button type="button" class="ghost" data-ck="none">Reject all</button><button type="button" class="ghost" data-ck="set">Cookie settings</button></div></div>' +
    '<div class="s-toast" id="toast"></div>';
}

/* ================= DRAWER ================= */
function renderDrawer() {
  const body = $('#drawerBody'), foot = $('#drawerFoot');
  if (!body) return;
  const items = Store.cart;
  const dc = $('#drawerCount');
  if (dc) dc.textContent = items.length ? '(' + Store.count() + ')' : '';
  if (!items.length) {
    body.innerHTML = '<div class="d-empty">Your bag is empty.<br><br><a class="link-btn" href="shop.html">See the collection</a></div>';
    foot.innerHTML = '';
    return;
  }
  body.innerHTML = items.map(i =>
    '<div class="d-line" data-id="' + i.id + '" data-size="' + i.size + '">' +
      '<a class="d-limg" href="product.html?id=' + i.id + '"><img src="' + i.product.img + '" alt=""></a>' +
      '<div class="d-info"><a class="d-n" href="product.html?id=' + i.id + '">' + i.product.name + '</a>' +
        (i.size ? '<span class="d-size">Size ' + i.size + '</span>' : '') +
        '<div class="qty"><button data-dq="-1" aria-label="Decrease">−</button><span>' + i.qty + '</span><button data-dq="1" aria-label="Increase">+</button></div>' +
      '</div>' +
      '<div class="d-right"><span class="d-lp">' + money(i.line) + '</span><button class="d-rm" data-drm>Remove</button></div>' +
    '</div>').join('');
  foot.innerHTML =
    '<div class="d-sum"><span>Subtotal</span><strong>' + money(Store.subtotal()) + '</strong></div>' +
    '<div class="d-actions"><a class="btn" href="cart.html">View bag</a><a class="btn btn-solid" href="checkout.html">Checkout</a></div>';
}

function anyPanelOpen() {
  return ['searchPanel', 'drawer', 'quick', 'news'].some(id => { const el = document.getElementById(id); return el && (el.classList.contains('on') || el.classList.contains('open')); });
}

function syncOverlay() {
  const on = anyPanelOpen();
  $('#scrim').classList.toggle('on', on);
  document.body.classList.toggle('is-lock', on);
}

function openDrawer(open) {
  const d = $('#drawer');
  if (!d) return;
  d.classList.toggle('on', open);
  if (open) { renderDrawer(); closeSearch(); closeNews(); }
  syncOverlay();
}

/* ================= SEARCH ================= */
function renderSearch(q) {
  const res = $('#searchResults'), sug = $('#searchSugs');
  const t = (q || '').trim().toLowerCase();
  if (!t) { res.innerHTML = ''; sug.style.display = ''; return; }
  sug.style.display = 'none';
  const hits = PRODUCTS.filter(p => (p.name + ' ' + p.cat + ' ' + p.catLabel + ' ' + p.sub + ' ' + p.desc).toLowerCase().includes(t));
  res.innerHTML = hits.length
    ? hits.map(p => '<a class="row" href="product.html?id=' + p.id + '"><img src="' + p.img + '" alt=""><span class="n">' + p.name + '</span><span class="p">' + money(p.price) + '</span></a>').join('')
    : '<p class="d-empty">No results — try “ring”, “gold” or “bracelet”.</p>';
}

function closeSearch() { const p = $('#searchPanel'); if (p) p.classList.remove('on'); }

function openSearch(open) {
  const p = $('#searchPanel');
  if (!p) return;
  p.classList.toggle('on', open);
  if (open) { $('#drawer').classList.remove('on'); closeNews(); renderSearch(''); syncOverlay(); setTimeout(() => $('#searchInput').focus(), 80); }
  else syncOverlay();
}

/* ================= QUICK ADD ================= */
let quickProduct = null, quickSize = null, quickQty = 1;

function openQuick(p) {
  quickProduct = p;
  quickSize = p.sizes.length === 1 ? p.sizes[0] : null;
  quickQty = 1;
  const col = (p.colors && p.colors[0]) || { n: 'Gold' };
  $('#quickImg').src = p.img;
  $('#quickImg').alt = p.name;
  $('#quickCat').textContent = p.catLabel;
  $('#quickName').textContent = p.name;
  $('#quickPrice').textContent = money(p.price);
  $('#quickColor').textContent = col.n || 'Gold';
  $('#quickSw').innerHTML = swatchHTML(p, 4);
  $('#quickSizeLab').hidden = p.sizes.length === 1;
  $('#quickSizes').innerHTML = p.sizes.length > 1
    ? p.sizes.map(s => '<button type="button" data-qsize="' + s + '">' + s + '</button>').join('') : '';
  $('#quickQtyN').textContent = '1';
  $('#quickHint').hidden = true;
  $('#quickLink').href = 'product.html?id=' + p.id;
  $('#quick').classList.add('on');
  syncOverlay();
}

function closeQuick() {
  const q = $('#quick');
  if (q) q.classList.remove('on');
  window.__moveFromWish = null;
  syncOverlay();
}

function closeNews() { const n = $('#news'); if (n) n.classList.remove('on'); }

/* ================= BADGES ================= */
function updateBadges() {
  const n = Store.count();
  const bc = $('#bagCount'); if (bc) bc.textContent = n;
  const mn = $('#mmBagN'); if (mn) mn.textContent = n;
}

/* ================= NAV OVER VIDEO ================= */
function initOverVideo() {
  if (PAGE !== 'home') return;
  const strip = $('#hoverStrip'), rail = $('#rail') || $('.g-rail');
  let hover = false;
  const apply = () => {
    const over = $$('.bleed').some(el => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; });
    document.body.classList.toggle('nav-over-video', over && !hover);
  };
  addEventListener('scroll', apply, { passive: true });
  addEventListener('resize', apply);
  if (strip) strip.addEventListener('mouseenter', () => { hover = true; apply(); });
  if (rail) rail.addEventListener('mouseleave', () => { hover = false; apply(); });
  apply();
}

/* ================= INIT ================= */
function initPage() {
  $$('.announce, header.nav, footer.footer').forEach(el => el.remove());
  document.body.classList.add('p-' + (PAGE || 'home'));
  const mainEl = $('main');
  if (mainEl && PAGE !== 'home') mainEl.classList.add('wrap');
  document.body.insertAdjacentHTML('beforeend', chromeHTML());

  const keys = activeKeys();
  $$('#gnav a[data-k], #mmenu a[data-k]').forEach(a => a.classList.toggle('on', keys.has(a.dataset.k)));

  $('#bagBtn').addEventListener('click', () => openDrawer(true));
  $('#mmBag').addEventListener('click', () => { closeMenu(); openDrawer(true); });
  $('#drawerClose').addEventListener('click', () => openDrawer(false));
  $('#searchOpen').addEventListener('click', () => openSearch(true));
  $('#mSearch').addEventListener('click', () => openSearch(true));
  $('#mmSearch').addEventListener('click', () => { closeMenu(); openSearch(true); });
  $('#searchClose').addEventListener('click', () => openSearch(false));
  $('#quickClose').addEventListener('click', closeQuick);
  $('#qScrim').addEventListener('click', closeQuick);
  $('#newsClose').addEventListener('click', () => { closeNews(); syncOverlay(); });
  $('#scrim').addEventListener('click', () => { openDrawer(false); openSearch(false); closeQuick(); closeNews(); });

  $('#burger').addEventListener('click', () => { $('#mmenu').classList.add('open'); document.body.classList.add('is-lock'); });
  $('#mmClose').addEventListener('click', closeMenu);
  $('#mmenu').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  $$('#mmenu [data-mm]').forEach(b => b.addEventListener('click', () => b.parentElement.classList.toggle('open')));

  addEventListener('keydown', e => {
    if (e.key === 'Escape') { openDrawer(false); openSearch(false); closeQuick(); closeNews(); closeMenu(); }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearch(true); }
  });
  document.addEventListener('click', e => {
    const noop = e.target.closest('a[href="#"]');
    if (noop) { e.preventDefault(); showToast('Coming soon'); }
  });

  const si = $('#searchInput');
  si.addEventListener('input', () => renderSearch(si.value));
  $('#searchSugs').addEventListener('click', e => {
    const b = e.target.closest('[data-sug]'); if (!b) return;
    si.value = b.dataset.sug; renderSearch(si.value); si.focus();
  });
  $('#searchForm').addEventListener('submit', e => {
    e.preventDefault();
    const t = si.value.trim();
    location.href = 'shop.html' + (t ? '?q=' + encodeURIComponent(t) : '');
  });

  $('#drawerBody').addEventListener('click', e => {
    const line = e.target.closest('.d-line'); if (!line) return;
    const { id, size } = line.dataset;
    if (e.target.closest('[data-drm]')) { Store.remove(id, size); showToast('Removed from bag'); return; }
    const q = e.target.closest('[data-dq]');
    if (q) {
      const cur = Store.cart.find(i => i.id === id && i.size === size);
      Store.setQty(id, size, cur.qty + Number(q.dataset.dq));
    }
  });

  $('#quickSizes').addEventListener('click', e => {
    const b = e.target.closest('[data-qsize]'); if (!b) return;
    quickSize = b.dataset.qsize;
    $$('#quickSizes button').forEach(v => v.classList.toggle('on', v === b));
    $('#quickHint').hidden = true;
  });
  $('#quickQty').addEventListener('click', e => {
    const s = e.target.closest('[data-step]'); if (!s || !quickProduct) return;
    quickQty = Math.max(1, Math.min(quickQty + Number(s.dataset.step), quickProduct.stock));
    $('#quickQtyN').textContent = quickQty;
  });
  $('#quickAdd').addEventListener('click', () => {
    if (!quickProduct) return;
    if (!quickSize) { $('#quickHint').hidden = false; return; }
    Store.add(quickProduct.id, quickSize, quickQty);
    if (window.__moveFromWish === quickProduct.id) {
      if (Store.isWished(quickProduct.id)) Store.toggleWish(quickProduct.id);
      showToast(quickProduct.name + ' moved to bag');
    } else showToast(quickProduct.name + ' added to bag');
    closeQuick();
  });
  window.openQuick = openQuick;

  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      const p = byId(add.dataset.add);
      if (!p) return;
      if (p.stock <= 0) { showToast('Sold out'); return; }
      if (p.sizes.length > 1 && PAGE !== 'product') { openQuick(p); return; }
      Store.add(p.id, add.dataset.size || p.sizes[0], Number(add.dataset.qty) || 1);
      showToast(p.name + ' added to bag');
      return;
    }
    const wish = e.target.closest('[data-wish]');
    if (wish) {
      e.preventDefault();
      const on = Store.toggleWish(wish.dataset.wish);
      showToast(on ? 'Saved to wishlist' : 'Removed from wishlist');
      $$('[data-wish="' + wish.dataset.wish + '"]').forEach(b => {
        b.classList.toggle('is-on', on);
        if (b.classList.contains('tile-wish') || b.classList.contains('o-wish')) b.textContent = on ? '♥' : '♡';
      });
    }
  });

  const hc = $('#heroCtrl');
  if (hc) hc.addEventListener('click', () => {
    const h = $('#hero');
    h.classList.toggle('paused');
    const paused = h.classList.contains('paused');
    $('.glyph', hc).textContent = paused ? '▶' : '❙❙';
    $('.lab', hc).textContent = paused ? 'Play' : 'Pause';
  });

  $('#newsOpen').addEventListener('click', () => { $('#news').classList.add('on'); syncOverlay(); });
  $('#newsForm').addEventListener('submit', e => {
    e.preventDefault();
    localStorage.setItem('selene_news', '1');
    $('#newsNote').textContent = 'Welcome to the list.';
    showToast('You’re on the list');
    setTimeout(() => { closeNews(); syncOverlay(); }, 1200);
  });

  $('#cookie').addEventListener('click', e => {
    const b = e.target.closest('[data-ck]'); if (!b) return;
    localStorage.setItem('selene_ck', b.dataset.ck);
    $('#cookie').classList.remove('on');
    if (b.dataset.ck === 'set') showToast('Cookie preferences saved');
  });
  $('#ckOpen').addEventListener('click', () => $('#cookie').classList.add('on'));
  if (!localStorage.getItem('selene_ck')) setTimeout(() => $('#cookie').classList.add('on'), 1400);
  if (!localStorage.getItem('selene_news') && !sessionStorage.getItem('selene_news_seen')) {
    setTimeout(() => {
      sessionStorage.setItem('selene_news_seen', '1');
      if (!anyPanelOpen()) { $('#news').classList.add('on'); syncOverlay(); }
    }, 12000);
  }

  Store.subscribe(() => { updateBadges(); if ($('#drawer').classList.contains('on')) renderDrawer(); });
  initOverVideo();
  observeReveals();
  const fn = PAGES[PAGE];
  if (fn) fn();
}

function closeMenu() {
  const m = $('#mmenu');
  if (m) m.classList.remove('open');
  if (!anyPanelOpen()) document.body.classList.remove('is-lock');
}

const PAGES = {};
