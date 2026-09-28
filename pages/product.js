PAGES.product = () => {
  const id = new URLSearchParams(location.search).get('id');
  const p = byId(id) || PRODUCTS[0];
  const root = $('#pdp');
  document.title = p.name + ' — SELENE';

  const RV_KEY = 'selene_reviews';
  const custom = (() => { try { return JSON.parse(localStorage.getItem(RV_KEY)) || {}; } catch { return {}; } })();
  const saveCustom = () => localStorage.setItem(RV_KEY, JSON.stringify(custom));
  const allReviews = () => [...(custom[p.id] || []), ...p.reviews];
  const avgRating = () => {
    const r = allReviews();
    return r.length ? Math.round((r.reduce((s, x) => s + x.stars, 0) / r.length) * 10) / 10 : p.rating;
  };

  const colors = (p.colors && p.colors.length) ? p.colors : [{ n: 'Gold', h: '#d9b26a' }];
  let size = p.sizes.length > 1 ? null : p.sizes[0];
  let qty = 1;

  root.innerHTML = `
    <section class="pdp">
      <div class="pdp-gallery-wrap">
        <div class="pdp-gallery" id="pdpGallery">
          ${p.gallery.map((g, i) => `<figure data-idx="${i}"><img src="${g}" alt="${p.name} — view ${i + 1}" ${i ? 'loading="lazy"' : ''}></figure>`).join('')}
        </div>
        ${p.gallery.length > 1 ? `
          <div class="pdp-counter" id="pdpCounter">1 / ${p.gallery.length}</div>
          <div class="pdp-dots" id="pdpDots">
            ${p.gallery.map((_, i) => `<span class="dot ${i === 0 ? 'on' : ''}"></span>`).join('')}
          </div>
        ` : ''}
      </div>

      <div class="pdp-meta">
        <button class="o-wish ${Store.isWished(p.id) ? 'is-on' : ''}" data-wish="${p.id}" aria-label="Save to wishlist">${Store.isWished(p.id) ? '♥' : '♡'}</button>

        <h1>${p.name}</h1>
        <p class="pdp-price">${money(p.price)}</p>
        ${p.mrp > p.price ? `<p class="pdp-was"><s>${money(p.mrp)}</s></p>` : ''}

        <div class="pdp-color">Color — <b id="pdpColorName">${colors[0].n}</b></div>
        <div class="pdp-sw" id="pdpSw">${colors.map((c, i) =>
          `<button type="button" class="${i === 0 ? 'on' : ''}" data-col="${i}" style="background:${c.h}" title="${c.n}" aria-label="${c.n}"></button>`).join('')}</div>

        ${p.sizes.length > 1 ? `
        <div class="pdp-size">
          <div class="o-lab-row"><span>${p.cat === 'rings' ? 'Size' : 'Length'}</span>${p.cat === 'rings' ? '<a class="link-btn" href="#" id="sizeGuide">Size guide</a>' : ''}</div>
          <div class="opt-vals" id="sizeVals">${p.sizes.map(s => `<button type="button" data-size="${s}">${s}</button>`).join('')}</div>
          <p class="opt-hint" id="sizeHint" hidden>Please choose a ${p.cat === 'rings' ? 'size' : 'length'}.</p>
        </div>` : ''}

        <div class="o-buy">
          <div class="qty big"><button data-step="-1" aria-label="Decrease">−</button><span id="pdpQty">1</span><button data-step="1" aria-label="Increase">+</button></div>
          <span class="hint">${p.stock > 0 ? 'Ships in 24h' : 'Unavailable'}</span>
        </div>
        <p class="avail">${p.stock > 0 ? (p.stock <= 4 ? `Only ${p.stock} left in stock` : 'In stock online') : 'Sold out'}</p>

        <div class="thumbs">${p.gallery.slice(0, 3).map(g => `<figure><img src="${g}" alt="" loading="lazy"></figure>`).join('')}</div>

        <button class="btn o-cta full" id="pdpAdd">${p.stock > 0 ? 'Add to bag — ' + money(p.price) : 'Sold out'}</button>

        <div class="acc">
          <details open><summary>Product details <i>+</i></summary><div class="acc-body">${p.details.map(d => `<p>${d}</p>`).join('')}</div></details>
          <details><summary>Care <i>+</i></summary><div class="acc-body"><p>${p.care}</p></div></details>
          <details><summary>Shipping &amp; returns <i>+</i></summary><div class="acc-body"><p>Free shipping on your first order and on orders over ${money(FREE_SHIP_THRESHOLD)}. Standard delivery 2–5 business days across India. Unworn pieces can be returned within 7 days.</p></div></details>
        </div>

        <div class="links">
          <a href="#">Delivery &amp; returns <span class="g">›</span></a>
          <a href="#">Contact us <span class="g">›</span></a>
        </div>
      </div>
    </section>`;

  $('#pdpSw').addEventListener('click', e => {
    const b = e.target.closest('[data-col]'); if (!b) return;
    $$('#pdpSw button').forEach(x => x.classList.toggle('on', x === b));
    $('#pdpColorName').textContent = colors[Number(b.dataset.col)].n;
  });

  const sizeBox = $('#sizeVals');
  if (sizeBox) sizeBox.addEventListener('click', e => {
    const b = e.target.closest('[data-size]'); if (!b) return;
    size = b.dataset.size;
    $$('#sizeVals button').forEach(v => v.classList.toggle('is-on', v === b));
    $('#sizeHint').hidden = true;
  });

  const qtyEl = $('#pdpQty');
  $('.pdp-meta .qty').addEventListener('click', e => {
    const s = e.target.closest('[data-step]'); if (!s) return;
    qty = Math.max(1, Math.min(qty + Number(s.dataset.step), Math.max(1, p.stock)));
    qtyEl.textContent = qty;
  });

  $('#pdpAdd').addEventListener('click', () => {
    if (p.stock <= 0) { showToast('Sold out'); return; }
    if (!size) { $('#sizeHint').hidden = false; $('#sizeVals').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    Store.add(p.id, size, qty);
    showToast(p.name + ' added to bag');
    openDrawer(true);
  });

  const guide = $('#sizeGuide');
  if (guide) guide.addEventListener('click', e => {
    e.preventDefault();
    showToast('Indian sizing: measure the inner diameter in mm — 16mm ≈ size 8');
  });

  const pdpGallery = $('#pdpGallery');
  $$('.thumbs figure').forEach((thumb, idx) => {
    thumb.style.cursor = 'pointer';
    thumb.addEventListener('click', () => {
      if (pdpGallery) {
        const figures = pdpGallery.querySelectorAll('figure');
        if (figures[idx]) figures[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
      }
    });
  });

  function renderReviews() {
    const list = allReviews();
    $('#reviewList').innerHTML = list.length ? list.map(r => `
      <article class="review">
        <div class="review-top"><span class="avatar">${r.name.trim().charAt(0).toUpperCase()}</span>
          <div><strong>${r.name}</strong><span class="review-date">${r.date}</span></div>
          ${starsHTML(r.stars)}
        </div>
        <p>${r.text}</p>
        ${custom[p.id] && custom[p.id].includes(r) ? '<span class="review-tag">Your review</span>' : ''}
      </article>`).join('')
      : '<p class="muted">No reviews yet — be the first.</p>';
  }
  renderReviews();

  $('#ratePick').addEventListener('click', e => {
    const b = e.target.closest('[data-rate]'); if (!b) return;
    const n = Number(b.dataset.rate);
    $$('#ratePick button').forEach(x => x.classList.toggle('on', Number(x.dataset.rate) <= n));
    $('#ratePick').dataset.value = n;
  });

  $('#reviewForm').addEventListener('submit', e => {
    e.preventDefault();
    const stars = Number($('#ratePick').dataset.value || 5);
    const name = $('#rvName').value.trim(), text = $('#rvText').value.trim();
    if (!name || !text) return;
    (custom[p.id] = custom[p.id] || []).unshift({
      name, stars, text,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    });
    saveCustom();
    e.target.reset();
    $('#ratePick').dataset.value = 0;
    $$('#ratePick button').forEach(x => x.classList.remove('on'));
    renderReviews();
    showToast('Review posted — thank you');
  });

  const related = PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat)
    .concat(PRODUCTS.filter(x => x.id !== p.id && x.cat !== p.cat))
    .slice(0, 4);
  $('#relatedGrid').innerHTML = related.map(x => productCard(x)).join('');
  observeReveals(root);
  observeReveals($('#relatedSection'));
};
