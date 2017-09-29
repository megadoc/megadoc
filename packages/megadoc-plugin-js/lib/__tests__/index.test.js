const { assert, createIntegrationSuite } = require('megadoc-test-utils');
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
          include: [ path.dirname(sourceFile.path + '/*') ],
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

  it('works with namespacing', function(done) {
    const sourceFile = suite.createFile('source.js', `
      /**
       * @namespace Core
       * @module
       */
      const Cache = {};

      /** @property {String}  */
      Cache.something = '';
    `);

    suite.compile({
      strict: true,
      sources: [
        {
          id: 'js',
          pattern: /\.js$/,
          include: [ path.dirname(sourceFile.path + '/*') ],
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
    }, {}, function(err, stats) {
      if (err) {
        return done(err)
      }

      const corpus = stats.renderedCorpus.toJSON();
      const getByPath = nodePath => corpus.filter(x => x.path === nodePath)[0]
      const uidOf = nodePath => getByPath(nodePath).uid

      const assertEmptyArray = (a) => {
        assert.deepEqual(a || [], [])
      }

      assert.deepEqual(corpus.map(x => x.path), [
        'js',
        'js/Core',
        'js/Core.Cache',
        'js/Core.Cache.something'
      ])

      assert.equal(getByPath('js').parentNodeUID, undefined)
      assert.deepEqual(getByPath('js').documents, [uidOf('js/Core')])
      assertEmptyArray(getByPath('js').entities)

      assert.equal(getByPath('js/Core').parentNodeUID, uidOf('js'))
      assert.deepEqual(getByPath('js/Core').documents, [uidOf('js/Core.Cache')])
      assertEmptyArray(getByPath('js/Core').entities)

      assert.equal(getByPath('js/Core.Cache').parentNodeUID, uidOf('js/Core'))
      assertEmptyArray(getByPath('js/Core.Cache').documents)
      assert.deepEqual(getByPath('js/Core.Cache').entities, [uidOf('js/Core.Cache.something')])

      assert.equal(getByPath('js/Core.Cache.something').parentNodeUID, uidOf('js/Core.Cache'))
      assertEmptyArray(getByPath('js/Core.Cache.something').documents)
      assertEmptyArray(getByPath('js/Core.Cache.something').entities)

      done();
    })
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

  it('works with a previous compilation', function(done) {
    suite.createFile('src/a.js', `
      /**
       * @module A
       *
       * See [[./b.js]]
       */
      module.exports = {
        /** Do something */
        doSomething() {},
      }
    `);

    suite.createFile('src/b.js', `
      /**
       * @module B
       *
       * See [[./a.js]]
       */
      module.exports = function B() {}
    `);

    const config = {
      assetRoot: suite.root,
      strict: true,
      sources: [
        {
          id: 'js',
          pattern: /\.js$/,
          include: [ suite.root + '/src/*.js' ],
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
    }

    suite.compile(config, {}, function(err, state) {
      if (err) {
        return done(err);
      }

      const { compilations } = state;

      assert.deepEqual(
        compilations[0].documents.map(x => x.id),
        [ 'A', '.doSomething', 'B' ]
      )

      secondRun(state)
    });

    function secondRun(initialState) {
      suite.createFile('src/a.js', `
        /**
         * @module NewA
         *
         * See [[./b.js]]
         */
        module.exports = {
          /** Do something */
          doSomething() {},
        }
      `);

      suite.compile(config, {
        watch: true,
        changedSources: [
          suite.join('src/a.js')
        ],
        initialState,
        purge: true
      }, function(mergeErr, nextState) {
        if (mergeErr) {
          return done(mergeErr);
        }

        const { compilations } = nextState;

        assert.deepEqual(
          compilations[0].documents.map(x => x.title),
          [ 'NewA', 'NewA.doSomething', 'B' ]
        )

        thirdRun(nextState);
      });
    }

    function thirdRun(initialState) {
      suite.compile(config, {
        watch: true,
        changedSources: [],
        initialState,
        purge: true
      }, function(mergeErr, nextState) {
        if (mergeErr) {
          return done(mergeErr);
        }

        const { compilations } = nextState;

        assert.deepEqual(
          compilations[0].documents.map(x => x.title),
          [ 'NewA', 'NewA.doSomething', 'B' ]
        )

        done();
      })
    }
  });

});