'use strict';

module.exports = {
  routes: [
    {
      method: 'PUT',
      path: '/user-update/me',
      handler: 'update-me.update',
      config: {
        auth: false, // guarded by shared secret header
      },
    },
  ],
};
