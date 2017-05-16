module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@borrows',

    properties: [
      ['text', {
        required: true,
        format: '([\w\s]+)\s*as\s*([\w\s]+)',
        captureGroups: [ 'source', 'symbol' ]
      }]
    ]
  },

  semantics: [
    ['document'],

    ['defines-property', {
      name: 'id',
      value: '$symbol'
    }],

    ['inherits-doc', {
      source: '$source'
    }]
  ]
}