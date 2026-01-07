// Plugin Path: ./src/plugins/variant-prefill-plugin/admin/src/pluginId.js

const pluginPkg = require('../../package.json');
const pluginId = pluginPkg.name.replace(/^(@[^/]+\/)?strapi-plugin-/, '');

module.exports = pluginId;
