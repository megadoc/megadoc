const StaticFile = require('./components/StaticFile');

tinydoc.outlets.define('Static::Document');

tinydoc.use('tinydoc-plugin-static', function StaticPlugin() {
  tinydoc.outlets.add('Static::Document', {
    key: 'Static::Document',
    component: StaticFile
  });
});