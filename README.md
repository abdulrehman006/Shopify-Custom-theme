# Vespera — Shopify Theme

A luxury, editorial Shopify theme built for **Vespera Designs** (silk scarves). Inspired by the quiet-luxury aesthetic of Hermès and Brunello Cucinelli — generous whitespace, serif headings, a muted ivory/black palette, and large editorial imagery.

Built to **Online Store 2.0** standards: JSON templates, section groups, the `color_scheme_group` color system, full theme-editor customization, SEO structured data, and validated with Shopify's official `theme-check` (0 errors).

---

## Highlights

- **Online Store 2.0** — JSON templates + section groups; every page is section-based and editable in the theme customizer.
- **Color schemes** — `color_scheme_group` with all 10 semantic roles and a per-section scheme picker.
- **SEO** — meta description, canonical, Open Graph, Twitter cards, hreflang, and JSON-LD structured data (Organization, WebSite, Product, Article, BreadcrumbList).
- **Performance** — deferred JS, CDN `preconnect`, responsive `srcset`/`sizes` images with width/height (no layout shift), lazy loading, `font-display: swap`.
- **Accessibility** — skip link, `:focus-visible`, ARIA labels, semantic landmarks, `prefers-reduced-motion`, fail-safe (no-JS) animations.
- **Commerce UX** — AJAX cart drawer (Section Rendering API), predictive search, product-card quick add, variant picker with live price.
- **Responsive** — mobile-first across all templates.

---

## Requirements

- A Shopify store (any plan).
- For local development: [Node.js](https://nodejs.org) 18+ and the [Shopify CLI](https://shopify.dev/docs/api/shopify-cli).

---

## Installation

### Option A — Upload via Shopify admin (no tools)

1. Download this repository as a ZIP **or** zip the theme folders so that `assets/`, `config/`, `layout/`, `locales/`, `sections/`, `snippets/`, and `templates/` sit at the **root** of the zip (not inside a parent folder).
2. In Shopify admin go to **Online Store → Themes**.
3. Under **Theme library**, click **Add theme → Upload zip file**.
4. Select the zip and click **Upload file**.
5. Click **Customize** to edit/preview, then **⋯ → Publish** to go live.

> Tip: a pre-zipped, upload-ready file is also provided (`Vespera-Shopify-Theme.zip`) if you don't want to zip it yourself.

### Option B — Shopify CLI (recommended for developers)

```bash
npm install -g @shopify/cli@latest

# from the theme root:
shopify theme dev   --store your-store.myshopify.com   # live local preview with hot reload
shopify theme push  --store your-store.myshopify.com   # upload to the store
shopify theme check                                    # run Shopify's linter
```

---

## Post-install setup

1. **Logo / favicon** — a bundled wordmark shows by default. Override it in **Customize → Theme settings → Brand & SEO**. Set the favicon and default social share image there too.
2. **Navigation** — in **Settings → Navigation**, create a menu with handle `main-menu` (nested items power the mega-menu). Create footer menus and assign them in the footer section.
3. **Products** — import `Vespera-products-import.csv` via **Products → Import**, then upload product images. Assign the **`scarf`** product template to get the Composition / Dimensions / Shipping rows.
4. **Collections** — create collections and assign them to the homepage *Featured Collection* and *Collection List* sections.
5. **Contact page** — create a page and assign the **`contact`** template for the contact form.

---

## Theme structure

```
.
├── assets/                 # base.css, global.js, logos, images
├── config/
│   ├── settings_schema.json   # theme settings + color_scheme_group
│   └── settings_data.json     # default values + color schemes
├── layout/
│   └── theme.liquid           # base layout: head/SEO, scheme CSS, scripts
├── locales/
│   └── en.default.json        # storefront strings
├── sections/                  # all sections + header/footer groups + cart drawer
├── snippets/                  # icon, image, price, product-card, meta-tags, structured-data
└── templates/                 # JSON templates (index, product, collection, cart, …)
    └── customers/             # account, login, register, addresses, order, …
```

### Key sections

`hero-banner`, `featured-collection`, `editorial-grid`, `image-with-text`, `collection-list`, `rich-text`, `newsletter`, `contact-form`, `cart-drawer`, plus `main-*` sections for product, collection, cart, blog, article, search, page, and customer pages.

---

## Customization

- **Colors:** Theme settings → Colors edits the four color schemes; each section has a *Color scheme* picker.
- **Typography:** Theme settings → Typography (heading/body fonts + body text size).
- **Layout:** page width, section spacing, corner radius, text direction (LTR/RTL).
- **Product cards:** second-image hover, vendor display, quick add.
- **Cart:** drawer or page, optional order note.

---

## Development & quality

Validated with Shopify's official linter:

```bash
shopify theme check
```

Result: **0 errors.** The only warnings are `ValidScopedCSSClass`, which is expected — the theme uses a shared design-system stylesheet (`assets/base.css`) in addition to per-section `{% stylesheet %}` blocks (the same approach as Shopify's Dawn). This rule is disabled in `.theme-check.yml`.

---

## Browser support

Latest 2 versions of Chrome, Firefox, Safari, and Edge. Progressive enhancement: core content and navigation work without JavaScript.

---

## Credits

- Design inspiration: Hermès, Brunello Cucinelli (aesthetic reference only; no assets copied).
- Built following the [Shopify theme documentation](https://shopify.dev/docs/storefronts/themes).

## License

Proprietary — © Vespera Designs. All rights reserved.
