const StaticFile = require('./components/StaticFile');

megadoc.outlets.define('Static::Document');

megadoc.use('megadoc-plugin-static', function StaticPlugin() {
  megadoc.outlets.add('Static::Document', {
    key: 'Static::Document',
    component: StaticFile
  });
});