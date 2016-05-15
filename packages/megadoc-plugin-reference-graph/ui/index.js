const RelatedDocuments = require('./components/RelatedDocuments');

tinydoc.use('tinydoc-plugin-reference-graph', function ReferenceGraph(api, configs) {
  const component = RelatedDocuments(configs[0]);

  tinydoc.outlets.add('CJS::ModuleBody', {
    key: 'tinydoc-plugin-reference-graph',
    component
  });

  tinydoc.outlets.add('Markdown::Document', {
    key: 'tinydoc-plugin-reference-graph',
    component
  });
});