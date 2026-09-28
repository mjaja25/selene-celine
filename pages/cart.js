PAGES.cart = () => {
  const main = $('#cartMain'), side = $('#cartSide');
  const items = Store.cart;

  function render() {
    const lines = Store.cart;

    if (!lines.length) {
      main.innerHTML = `<div class="empty tall">
        <span class="empty-mark">✦</span>
        <h3>YOUR SHOPPING BAG IS CURRENTLY EMPTY</h3>
        <p>Discover our fine jewellery selection curated for the modern muse.</p>
        <a class="btn btn-solid" href="shop.html">EXPLORE THE COLLECTION</a>
      </div>`;
      side.innerHTML = '';
      side.hidden = true;
      renderUpsell(PRODUCTS);
      return;
    }
    side.hidden = false;

    main.innerHTML = lines.map(i => `
      <article class="c-line" data-id="${i.id}" data-size="${i.size}">
        <a class="c-media" href="product.html?id=${i.id}"><img src="${i.product.img}" alt="${i.product.name}"></a>
        <div class="c-info">
          <a href="product.html?id=${i.id}"><h3>${i.product.name}</h3></a>
          <p class="card-cat">${i.product.catLabel} · ${i.product.sub}</p>
          ${i.size ? `<p class="c-size">SIZE: <strong>${i.size}</strong> <button class="link-btn" data-edit>Change</button></p>` : ''}
          <div class="c-actions">
            <div class="qty"><button data-q="-1" aria-label="Decrease">−</button><span>${i.qty}</span><button data-q="1" aria-label="Increase">+</button></div>
            <button class="link-btn" data-remove>REMOVE</button>
            <button class="link-btn" data-move>SAVE FOR LATER</button>
          </div>
        </div>
        <div class="c-price">
          <strong>${money(i.line)}</strong>
          ${i.product.mrp > i.product.price ? `<s>${money(i.product.mrp * i.qty)}</s>` : ''}
          <span class="c-unit">${money(i.product.price)} each</span>
        </div>
      </article>`).join('') +
      `<div class="cart-foot"><a class="link-btn" href="shop.html">← CONTINUE SHOPPING</a>
        <button class="link-btn" id="clearBag">EMPTY BAG</button></div>`;

    const sub = Store.subtotal(), disc = Store.discount(), ship = Store.shipping(), tot = Store.total();
    const toFree = Math.max(0, FREE_SHIP_THRESHOLD - sub);
    const promo = Store.promo;

    side.innerHTML = `
      <div class="sum-card">
        <h3>ORDER SUMMARY</h3>
        ${toFree > 0 && Store.orders.length > 0 ? `
          <div class="ship-progress">
            <p>Add <strong>${money(toFree)}</strong> for complimentary express delivery</p>
            <div class="bar"><span style="width:${Math.min(100, Math.round(sub / FREE_SHIP_THRESHOLD * 100))}%"></span></div>
          </div>` : `<p class="ship-ok">✦ COMPLIMENTARY EXPRESS DELIVERY UNLOCKED</p>`}

        <div class="sum-rows">
          <div><span>SUBTOTAL (${Store.count()} ITEMS)</span><span>${money(sub)}</span></div>
          ${disc ? `<div class="is-disc"><span>DISCOUNT ${promo ? '· ' + promo.code : ''}</span><span>−${money(disc)}</span></div>` : ''}
          <div><span>SHIPPING</span><span>${ship === 0 ? 'COMPLIMENTARY' : money(ship)}</span></div>
          <div class="sum-total"><span>ESTIMATED TOTAL</span><strong>${money(tot)}</strong></div>
        </div>

        <form class="promo" id="promoForm">
          <input type="text" id="promoInput" placeholder="PROMO CODE" value="${promo ? promo.code : ''}" ${promo ? 'disabled' : ''}>
          <button type="${promo ? 'button' : 'submit'}" id="promoBtn">${promo ? 'REMOVE' : 'APPLY'}</button>
        </form>
        <p class="promo-note" id="promoNote">${promo ? promo.label : 'Available codes: FIRSTSHIP, SELENE10 or MOON200'}</p>

        <a class="btn btn-solid full" href="checkout.html">CONTINUE TO CHECKOUT · ${money(tot)}</a>
        <div class="pay-marks"><span>UPI</span><span>CARDS</span><span>COD</span><span>NETBANKING</span></div>
        <p class="sum-note">Taxes included. 14-day complimentary returns on unworn pieces.</p>
      </div>`;

    renderUpsell(PRODUCTS.filter(p => !lines.some(l => l.id === p.id)));
  }

  function renderUpsell(pool) {
    const picks = (pool.length ? pool : PRODUCTS).slice(0, 4);
    $('#upsellGrid').innerHTML = picks.map(p => productCard(p)).join('');
    $$('.reveal', $('#upsellSection')).forEach(el => el.classList.add('in'));
  }

  main.addEventListener('click', e => {
    const line = e.target.closest('.c-line');
    if (line) {
      const { id, size } = line.dataset;
      const cur = Store.cart.find(i => i.id === id && i.size === size);
      if (e.target.closest('[data-remove]')) { Store.remove(id, size); showToast('Removed from bag'); return; }
      if (e.target.closest('[data-move]')) {
        if (!Store.isWished(id)) Store.toggleWish(id);
        Store.remove(id, size);
        showToast('Saved to wishlist');
        return;
      }
      if (e.target.closest('[data-edit]')) { location.href = 'product.html?id=' + id; return; }
      const q = e.target.closest('[data-q]');
      if (q) {
        const next = cur.qty + Number(q.dataset.q);
        if (next < 1) { Store.remove(id, size); showToast('Removed from bag'); }
        else Store.setQty(id, size, next);
        return;
      }
    }
    if (e.target.id === 'clearBag') { Store.clearBag(); showToast('Bag emptied'); }
  });

  side.addEventListener('click', e => {
    if (e.target.id === 'promoBtn' && Store.promo) {
      Store.clearPromo();
      showToast('Code removed');
    }
  });

  side.addEventListener('submit', e => {
    if (e.target.id !== 'promoForm') return;
    e.preventDefault();
    const res = Store.applyPromo($('#promoInput').value);
    showToast(res.msg);
  });

  Store.subscribe(render);
  render();
};
