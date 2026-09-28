PAGES.shop = () => {
  const grid = $('#shopGrid'), empty = $('#shopEmpty'), title = $('#plpTitle');
  const sort = $('#shopSort'), range = $('#priceRange'), out = $('#priceOut'), inStock = $('#inStock');
  const panel = $('#fPanel'), filtersBtn = $('#filtersBtn');
  const params = new URLSearchParams(location.search);

  const state = {
    cat: CATEGORIES.some(c => c.id === params.get('cat')) ? params.get('cat') : 'all',
    q: (params.get('q') || '').trim(),
    sort: ['low', 'high', 'rating', 'new'].includes(params.get('sort')) ? params.get('sort') : 'featured',
    max: Number(range.max),
    stock: false
  };
  sort.value = state.sort;

  const TITLE = { all: 'THE COLLECTION', rings: 'RINGS', necklaces: 'NECKLACES & PENDANTS', earrings: 'EARRINGS', bracelets: 'BRACELETS' };

  function apply() {
    let list = PRODUCTS.filter(p => state.cat === 'all' || p.cat === state.cat);
    if (state.q) {
      const t = state.q.toLowerCase();
      list = list.filter(p => (p.name + ' ' + p.cat + ' ' + p.catLabel + ' ' + p.sub + ' ' + p.desc).toLowerCase().includes(t));
    }
    if (state.stock) list = list.filter(p => p.stock > 0);
    list = list.filter(p => p.price <= state.max);

    const sorters = {
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      new: (a, b) => (b.tag === 'New' ? 1 : 0) - (a.tag === 'New' ? 1 : 0) || b.rating - a.rating,
      featured: (a, b) => (b.tag === 'Bestseller' ? 1 : 0) - (a.tag === 'Bestseller' ? 1 : 0) || b.rating - a.rating
    };
    list = [...list].sort(sorters[state.sort] || sorters.featured);

    grid.innerHTML = list.map(p => productCard(p)).join('');
    empty.hidden = list.length > 0;
    grid.hidden = list.length === 0;

    title.textContent = state.q ? 'RESULTS FOR “' + state.q.toUpperCase() + '”' : (TITLE[state.cat] || TITLE.all);

    $$('.filter', panel).forEach(b => b.classList.toggle('is-active', b.dataset.filter === state.cat));
    $$('#gnav a[data-k], #mmenu a[data-k]').forEach(a =>
      a.classList.toggle('on', ['women', 'jewelry', state.cat === 'all' ? 'cat-all' : 'cat-' + state.cat].includes(a.dataset.k)));

    const url = new URL(location.href);
    state.cat === 'all' ? url.searchParams.delete('cat') : url.searchParams.set('cat', state.cat);
    state.q ? url.searchParams.set('q', state.q) : url.searchParams.delete('q');
    state.sort === 'featured' ? url.searchParams.delete('sort') : url.searchParams.set('sort', state.sort);
    history.replaceState(null, '', url);
  }

  filtersBtn.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    filtersBtn.setAttribute('aria-expanded', open);
  });

  $('#filters').addEventListener('click', e => {
    const b = e.target.closest('.filter'); if (!b) return;
    state.cat = b.dataset.filter;
    apply();
  });

  sort.addEventListener('change', () => { state.sort = sort.value; apply(); });
  inStock.addEventListener('change', () => { state.stock = inStock.checked; apply(); });

  range.addEventListener('input', () => {
    state.max = Number(range.value);
    out.textContent = money(state.max);
    apply();
  });

  function reset() {
    state.cat = 'all'; state.q = ''; state.sort = 'featured'; state.max = Number(range.max); state.stock = false;
    sort.value = 'featured'; range.value = range.max; inStock.checked = false; out.textContent = money(state.max);
    apply();
  }
  $('#clearFilters').addEventListener('click', reset);
  $('#emptyReset').addEventListener('click', reset);

  out.textContent = money(Number(range.value));
  apply();
};
