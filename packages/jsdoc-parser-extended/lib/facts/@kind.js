module.exports = {
  syntax: {
    driver: 'jsdoc',
    string: '@kind',
    properties: [
      ['name', {
        oneOf: [
          'class',
          // 'constant',
          'event',
          // 'external',
          // 'file',
          'function',
          // 'member',
          'mixin',
          'module',
          'namespace',
          'typedef',
        ]
      }]
    ]
  },

  semantics: [
    // ['defines-property', {
    //   name: 'kind',
    //   value: '$name'
    // }]
    ['tags-document', '$name'],
  ]
}