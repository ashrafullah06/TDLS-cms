// Plugin structure will go here. Let's start with plugin bootstrap.

// ./src/plugins/variant-prefill-plugin/admin/src/plugin.js
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import PluginIcon from './components/PluginIcon';

export default {
  register(app) {
    app.addFields({
      type: 'variant-repeater',
      Component: async () => import('./components/VariantRepeater'),
    });
  },

  bootstrap(app) {},

  async registerTrads({ locales }) {
    return Promise.all(
      locales.map((locale) => {
        return import(`./translations/${locale}.json`)
          .then(({ default: data }) => {
            return {
              data: { [pluginId]: data },
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );
  },
};
