const { createIntegrationSuite } = require('megadoc-test-utils');
const path = require('path');

describe('[integration] megadoc-plugin-js', function() {
  const suite = createIntegrationSuite(this);

  it('works', function(done) {
    const sourceFile = suite.createFile('source.js', `
      /**
       * Hello!
       */
      module.exports = function beep() {}
    `);

    suite.compile({
      sources: [
        {
          id: 'js',
          pattern: /\.js$/,
          include: [ path.dirname(sourceFile.path) ],
          processor: {
            name: path.resolve(__dirname, '../index.js'),
            options: {
              id: 'js',
              name: 'JavaScripts',
              strict: true,
            }
          }
        }
      ]
    }, {}, done)
  });

  it('works against a real thing', function(done) {
    const sourceFile = suite.createFile('source.js', `

      /**
       * # RID Bag
       *
       * A bag of Record IDs, can come in two formats:
       *
       *  * embedded - just a list of record ids.
       *  * tree based - a remote tree based data structure
       *
       * for more details on the RID Bag structure, see https://github.com/orientechnologies/orientdb/wiki/RidBag
       *
       *
       * @param {String} serialized The base64 encoded RID Bag
       */
      function Bag (serialized) {
        this.serialized = serialized;
        this.uuid = null;
        this._content = [];
        this._buffer = null;
        this._type = null;
        this._offset = 0;
        this._current = -1;
        this._size = null;
        this._prefetchedRecords = null;
      }

      Bag.BAG_EMBEDDED = 0;
      Bag.BAG_TREE = 1;

      module.exports = Bag;


      Object.defineProperties(Bag.prototype, {
        /**
         * The bag type.
         * @type {String}
         */
        type: {
          get: function () {
            if (this._type === null) {
              this._parse();
            }
            return this._type;
          }
        },
        /**
         * The size of the bag.
         * @type {Integer}
         */
        size: {
          get: function () {
            if (this._size === null) {
              this._parse();
            }
            return this._size;
          }
        }
      });
    `);

    suite.compile({
      sources: [
        {
          id: 'js',
          pattern: /\.js$/,
          include: [ path.dirname(sourceFile.path) ],
          processor: {
            name: path.resolve(__dirname, '../index.js'),
            options: {
              id: 'js',
              name: 'JavaScripts',
              strict: true,
            }
          }
        }
      ]
    }, {}, done)
  });
});