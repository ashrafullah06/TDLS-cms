// src/admin/app.tsx
export default {
  register(app: any) {
    // System codes preview (read-only)
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'system-codes',
      Component: async () =>
        (await import(/* webpackChunkName: "system-codes" */ './components/system-codes')).default,
    });

    // Masked inputs + duplicate checks + suggestions (browser-safe)
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'masked-inputs',
      Component: async () =>
        (await import(/* webpackChunkName: "masked-inputs" */ './components/masked-inputs')).default,
    });

    // Optional: checklist, variant matrix, url preview, quick actions (keep if you already have them)
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'prepublish-checklist',
      Component: async () =>
        (await import(/* webpackChunkName: "prepublish-checklist" */ './components/prepublish-checklist')).default,
    });
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'variant-matrix',
      Component: async () =>
        (await import(/* webpackChunkName: "variant-matrix" */ './components/variant-matrix')).default,
    });
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'url-preview',
      Component: async () =>
        (await import(/* webpackChunkName: "url-preview" */ './components/url-preview')).default,
    });
    app.injectContentManagerComponent('editView', 'informations', {
      name: 'quick-actions',
      Component: async () =>
        (await import(/* webpackChunkName: "quick-actions" */ './components/quick-actions')).default,
    });
  },
  bootstrap() {},
};
