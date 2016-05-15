const RelatedDocuments = require('./components/RelatedDocuments');

megadoc.use('megadoc-plugin-reference-graph', function ReferenceGraph(api, configs) {
  const component = RelatedDocuments(configs[0]);

  megadoc.outlets.add('CJS::ModuleBody', {
    key: 'megadoc-plugin-reference-graph',
    component
  });

  megadoc.outlets.add('Markdown::Document', {
    key: 'megadoc-plugin-reference-graph',
    component
  });
});