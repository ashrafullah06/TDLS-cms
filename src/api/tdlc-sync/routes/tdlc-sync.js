// FILE: src/api/tdlc-sync/routes/tdlc-sync.js
'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/tdlc-sync/update-stock',
      handler: 'tdlc-sync.updateStock',
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
