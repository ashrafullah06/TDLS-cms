// Plugin Path: ./src/plugins/variant-prefill-plugin/admin/src/index.js

import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import App from './containers/App';
import Initializer from './components/Initializer';

export default {
  register(app) {
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name: pluginPkg.strapi.name,
    });
  },
};
