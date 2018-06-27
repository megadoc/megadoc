/**
 * @module Config
 */
module.exports = {
  /**
   * @property {Boolean}
   */
  showEndpointPath: false,

  /**
   * @property {String}
   */
  url: '/api',

  /**
   * @property {String}
   */
  title: 'API',

  /**
   * @property {Array.<String>}
   */
  builtInTypes: [
    'Array',
    'Boolean',
    'Fixnum',
    'Float',
    'Hash',
    'Integer',
    'Number',
    'Numeric',
    'Object',
    'String',
  ],

  /**
   * @property {String}
   */
  arrayTypeStartSymbol: 'Array.<',

  /**
   * @property {String}
   */
  arrayTypeEndSymbol: '>',
};