const ReferenceGraph = require('./components/ReferenceGraph');

module.exports = {
  name: 'megadoc-plugin-reference-graph',
  plugin: true,
  outlets: [
    'ReferenceGraph',
  ],

  outletOccupants: [
    { name: 'ReferenceGraph', component: ReferenceGraph, },
  ]
}