/* SOLOMEO theme — lightweight interactions (vanilla JS, no deps) */
(function () {
  'use strict';

  /* ---- Sticky header on scroll ---- */
  var header = document.querySelector('[data-header]');
  if (header) {
    var lastY = 0;
    window.addEventListener('scroll', function () {
      var y = window.pageYOffset;
      header.classList.toggle('is-scrolled', y > 40);
      lastY = y;
    }, { passive: true });
  }

  /* ---- Mega menu (desktop hover + keyboard) ---- */
  document.querySelectorAll('[data-menu-item]').forEach(function (item) {
    var trigger = item.querySelector('[data-menu-trigger]');
    if (!trigger) return;
    trigger.addEventListener('focus', function () { item.classList.add('is-open'); });
    item.addEventListener('mouseleave', function () { item.classList.remove('is-open'); });
  });

  /* ---- Mobile nav drawer ---- */
  var navToggle = document.querySelector('[data-nav-toggle]');
  var drawer = document.querySelector('[data-nav-drawer]');
  var overlay = document.querySelector('[data-overlay]');
  function closeDrawers() {
    document.body.classList.remove('drawer-open');
    document.querySelectorAll('.is-active-drawer').forEach(function (d) { d.classList.remove('is-active-drawer'); });
  }
  if (navToggle && drawer) {
    navToggle.addEventListener('click', function () {
      var open = drawer.classList.toggle('is-active-drawer');
      document.body.classList.toggle('drawer-open', open);
    });
  }
  if (overlay) overlay.addEventListener('click', closeDrawers);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawers(); });

  /* ---- Mobile accordion submenus ---- */
  document.querySelectorAll('[data-accordion-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var parent = btn.closest('[data-accordion]');
      if (parent) parent.classList.toggle('is-open');
    });
  });

  /* ---- Search overlay ---- */
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', function () {
      var open = searchPanel.classList.toggle('is-open');
      document.body.classList.toggle('drawer-open', open);
      if (open) { var inp = searchPanel.querySelector('input[type="search"]'); if (inp) setTimeout(function(){ inp.focus(); }, 120); }
    });
    searchPanel.querySelectorAll('[data-search-close]').forEach(function (c) {
      c.addEventListener('click', function () { searchPanel.classList.remove('is-open'); document.body.classList.remove('drawer-open'); });
    });
  }

  /* ---- Product gallery thumbnails ---- */
  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var main = gallery.querySelector('[data-gallery-main] img');
    gallery.querySelectorAll('[data-gallery-thumb]').forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        if (main) { main.src = thumb.dataset.full || thumb.querySelector('img').src; }
        gallery.querySelectorAll('[data-gallery-thumb]').forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });
  });

  /* ---- Variant selection ---- */
  document.querySelectorAll('[data-product-form]').forEach(function (form) {
    var data = form.querySelector('[data-variant-json]');
    if (!data) return;
    var variants = JSON.parse(data.textContent);
    var selects = form.querySelectorAll('[data-option-selector]');
    var idField = form.querySelector('[name="id"]');
    var priceEl = document.querySelector('[data-product-price]');
    var addBtn = form.querySelector('[data-add-to-cart]');
    function update() {
      var chosen = Array.from(selects).map(function (s) { return s.value; });
      var match = variants.find(function (v) {
        return v.options.every(function (opt, i) { return opt === chosen[i]; });
      });
      if (match) {
        if (idField) idField.value = match.id;
        if (priceEl && match.price != null) {
          priceEl.textContent = (match.price / 100).toLocaleString(undefined, { style: 'currency', currency: window.Shopify ? Shopify.currency.active : 'USD' });
        }
        if (addBtn) {
          addBtn.disabled = !match.available;
          addBtn.textContent = match.available ? addBtn.dataset.labelAdd : addBtn.dataset.labelSoldout;
        }
      }
    }
    selects.forEach(function (s) { s.addEventListener('change', update); });
    selects.forEach(function (s) {
      if (s.dataset.swatch === 'true') {
        s.querySelectorAll('input').forEach(function (i) { i.addEventListener('change', update); });
      }
    });
  });

  /* ---- Cart line quantity (submit on change) ---- */
  document.querySelectorAll('[data-cart-qty]').forEach(function (input) {
    input.addEventListener('change', function () {
      var form = input.closest('form');
      if (form) form.submit();
    });
  });

  /* ---- Scroll reveal ---- */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }
})();

/* ============================================================
   Cart drawer (AJAX) + predictive search
   ============================================================ */
(function () {
  'use strict';
  var CART_SECTION = 'cart-drawer';
  var wrapperId = 'shopify-section-' + CART_SECTION;

  function openCart() { document.body.classList.add('cart-open', 'drawer-open'); }
  function closeCart() { document.body.classList.remove('cart-open'); if (!document.querySelector('.is-active-drawer')) document.body.classList.remove('drawer-open'); }

  function refreshCartSection(html) {
    var wrap = document.getElementById(wrapperId);
    if (wrap && html != null) wrap.innerHTML = html;
  }
  function updateCount() {
    fetch(window.Shopify ? '/cart.js' : '/cart.js', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        document.querySelectorAll('[data-cart-count]').forEach(function (el) {
          el.textContent = el.classList.contains('header__cart-count') ? cart.item_count : '(' + cart.item_count + ')';
        });
      }).catch(function () {});
  }

  function addToCart(form) {
    var body = { items: [{ id: form.querySelector('[name="id"]').value, quantity: parseInt((form.querySelector('[name="quantity"]') || {}).value || 1, 10) }], sections: [CART_SECTION] };
    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.classList.add('is-loading'); btn.disabled = true; }
    fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.sections && data.sections[CART_SECTION]) refreshCartSection(data.sections[CART_SECTION]);
        updateCount(); openCart();
      })
      .catch(function () { form.submit(); })
      .finally(function () { if (btn) { btn.classList.remove('is-loading'); btn.disabled = false; } });
  }

  function changeLine(line, qty) {
    fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ line: line, quantity: qty, sections: [CART_SECTION] }) })
      .then(function (r) { return r.json(); })
      .then(function (data) { if (data.sections && data.sections[CART_SECTION]) refreshCartSection(data.sections[CART_SECTION]); updateCount(); })
      .catch(function () {});
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('[data-cart-toggle]');
    if (toggle) { e.preventDefault(); openCart(); return; }
    var close = e.target.closest('[data-cart-close]');
    if (close) { e.preventDefault(); closeCart(); return; }
    var change = e.target.closest('[data-cart-change]');
    if (change) { e.preventDefault(); changeLine(parseInt(change.dataset.cartChange, 10), parseInt(change.dataset.qty, 10)); return; }
  });

  document.addEventListener('submit', function (e) {
    var qa = e.target.closest('[data-quick-add]');
    var pf = e.target.closest('[data-product-form]');
    if (qa || pf) {
      // only AJAX when drawer markup is present
      if (document.getElementById(wrapperId)) { e.preventDefault(); addToCart(e.target); }
    }
  });

  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); });
  var ov = document.querySelector('[data-overlay]');
  if (ov) ov.addEventListener('click', closeCart);

  /* ---- Predictive search ---- */
  var panel = document.querySelector('[data-search-panel]');
  if (panel) {
    var input = panel.querySelector('input[type="search"]');
    var results = panel.querySelector('[data-predictive-results]');
    var timer;
    if (input && results) {
      input.addEventListener('input', function () {
        clearTimeout(timer);
        var q = input.value.trim();
        if (q.length < 2) { results.hidden = true; results.innerHTML = ''; return; }
        timer = setTimeout(function () {
          fetch('/search/suggest.json?q=' + encodeURIComponent(q) + '&resources[type]=product,collection,page&resources[limit]=6&resources[options][unavailable_products]=last', { headers: { 'Accept': 'application/json' } })
            .then(function (r) { return r.json(); })
            .then(function (data) {
              var prods = (data.resources && data.resources.results && data.resources.results.products) || [];
              if (!prods.length) { results.innerHTML = '<p class="search-panel__empty">No matches found.</p>'; results.hidden = false; return; }
              results.innerHTML = '<ul class="predictive">' + prods.map(function (p) {
                var img = p.featured_image && p.featured_image.url ? '<img src="' + p.featured_image.url + '" alt="" width="48" height="60" loading="lazy">' : '';
                return '<li><a href="' + p.url + '">' + img + '<span>' + p.title + '</span></a></li>';
              }).join('') + '</ul>';
              results.hidden = false;
            }).catch(function () {});
        }, 220);
      });
    }
  }
})();
