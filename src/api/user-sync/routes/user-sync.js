'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/user-sync',
      handler: 'user-sync.upsert',
      config: { auth: false }, // protected by shared secret header
    },
  ],
};
