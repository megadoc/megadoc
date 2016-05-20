require('../../');

var Subject = require("../Corpus");
var resolve = require("../CorpusResolver");
var b = require('../CorpusTypes').builders;
var assert = require('chai').assert;

describe('CorpusResolver', function() {
  var corpus;

  beforeEach(function() {
    corpus = Subject();
    corpus.add(
      b.namespace({
        id: 'MD',
        name: 'test-plugin',
        title: 'Articles',
        documents: [
          b.document({
            id: 'X',
            filePath: '/doc/articles/X.md',
            entities: [],
          }),

          b.document({
            id: 'Y',
            filePath: '/doc/articles/Y.md',
            entities: [],
          }),
        ]
      })
    );

    corpus.add(
      b.namespace({
        id: 'JS_UI',
        name: 'test-plugin',
        documents: [
          b.document({
            id: 'UI',
            documents: [
              b.document({
                id: 'Z'
              })
            ]
          })
        ]
      })
    );

    corpus.add(
      b.namespace({
        id: 'JS',
        name: 'test-plugin',
        title: 'JavaScripts',
        documents: [
          b.document({
            id: 'X',
            filePath: '/js/lib/X.js',
            entities: [],
          }),

          b.document({
            id: 'Z',
            filePath: '/js/lib/Z.js',
          }),

          b.document({
            id: 'Core',
            symbol: '.',

            documents: [
              b.document({
                id: 'X',
                filePath: '/js/lib/core/X.js',
                symbol: '',
                entities: [
                  b.documentEntity({
                    id: '@name'
                  }),

                  b.documentEntity({
                    id: '#add'
                  })
                ]
              }),

              b.document({
                id: 'Y',
                filePath: '/js/lib/core/Y.js',
                symbol: '',
                entities: [
                  b.documentEntity({
                    id: '@name'
                  })
                ]
              }),
            ]
          })
        ]
      })
    );
  });

  [
    { from: "JS/Core.X@name"   , to: "X"               , res: "JS/Core.X" },
    { from: "JS/Core.X@name"   , to: "JS/X"            , res: "JS/X" },
    { from: "JS/Core.X@name"   , to: "MD/X"            , res: "MD/X" },
    { from: "JS/Core.X#add"    , to: "@name"           , res: "JS/Core.X@name" },
    { from: "JS/Core.X#add"    , to: "Y@name"          , res: "JS/Core.Y@name" },
    { from: "JS/Core.X#add"    , to: "Core.Y@name"     , res: "JS/Core.Y@name" },
    { from: "JS/Core.X#add"    , to: "JS/Core.Y@name"  , res: "JS/Core.Y@name" },
    { from: "JS/Core.X"        , to: "@name"           , res: "JS/Core.X@name" },
    { from: "JS/Core.Y"        , to: "X"               , res: "JS/Core.X" },
    { from: "JS/Core.Y"        , to: "#add"            , res: null },
    { from: "JS/Core.Y"        , to: "X#add"           , res: "JS/Core.X#add" },
    { from: "JS/Core.Y"        , to: "X.js"            , res: null },
    { from: "JS/Z"             , to: "X"               , res: "JS/X" },
    { from: "MD/X"             , to: "X"               , res: "MD/X" },
    { from: "MD/X"             , to: "Core.X"          , res: "JS/Core.X" },
    { from: "MD/Y"             , to: "X"               , res: "MD/X" },

    // it should not use private indices:
    //
    // "JS UI/UI/Z" has a private index "Z" while JS/Z has a public index "Z" so
    // we expect the latter to be resolved:
    { from: "MD"               , to: "Z"               , res: "JS/Z" },

    // filepath resolving (relative to contextNode's filepath):
    { from: "JS/Core.Y"        , to: "./X.js"          , res: "JS/Core.X" },
    { from: "JS/Core.Y"        , to: "../X.js"         , res: "JS/X" },
    { from: "JS/Core.Y"        , to: "../../X.js"      , res: null },
    { from: "MD/X"             , to: "./Y.md"          , res: "MD/Y" },

    // resolving entities within a document by a filepath:
    { from: 'JS/Core.Y'        , to: './X.js#add'      , res: 'JS/Core.X#add' },
    { from: 'JS/Core.Y'        , to: '/js/lib/core/X.js#add', res: 'JS/Core.X#add' },
    { from: 'JS/Core.Y'        , to: '../X.js#add'     , res: null },

    // absolute filepath resolving (relative to assetRoot):
    { from: "JS/Core.Y"        , to: "/js/lib/core/X.js"   , res: 'JS/Core.X' },
  ].forEach(function(spec) {
    var fn = spec.only ? it.only : it;

    fn("resolves '" + spec.res + "' from '" + spec.from + "' using '" + spec.to + "'", function() {
      var document = resolve({
        text: spec.to,
        contextNode: corpus.get(spec.from)
      }, { trace: false });

      if (spec.res === null) {
        assert.notOk(document, (document && "Resolved '" + document.uid + "' when it should not have."));
      }
      else {

        assert.ok(document);
        assert.equal(document.uid, corpus.get(spec.res).uid);
      }
    })
  });

  describe('funny names', function() {
    beforeEach(function() {
      corpus.add(b.namespace({
        id: 'Wild Babies',
        name: 'test-plugin',
        documents: [
          b.document({ id: 'The Gorilla Emperor' })
        ]
      }));

      corpus.add(b.namespace({
        id: 'Wild #Hash',
        name: 'test-plugin',
        documents: [
          b.document({ id: 'The $Wilderness B3Y)ND' })
        ]
      }));

      corpus.add(b.namespace({
        id: 'مجموعتي',
        name: 'test-plugin',
        documents: [
          b.document({ id: 'صفحة' })
        ]
      }));
    });

    it('works when there are spaces in a namespace', function() {
      assert(corpus.resolve({ text: 'Wild Babies' }));
      assert(corpus.resolve({ text: 'Wild Babies/The Gorilla Emperor' }));
    });

    it('works when there are special characters in a namespace', function() {
      assert(corpus.resolve({ text: 'Wild #Hash' }));
      assert(corpus.resolve({ text: 'Wild #Hash/The $Wilderness B3Y)ND' }));
    });

    it('works when there are unicode characters in a namespace', function() {
      assert(corpus.resolve({ text: 'مجموعتي' }));
      assert(corpus.resolve({ text: 'مجموعتي/صفحة' }));
    });

    it('rejects a namespace with an illegal name (starts with /)', function() {
      assert.throws(function() {
        corpus.add(b.namespace({ id: '/foo', name: 'test-plugin' }));
      }, 'IntegrityViolation: a namespace id may not start with');
    });

    it('rejects a namespace with an illegal name (starts with .)', function() {
      assert.throws(function() {
        corpus.add(b.namespace({ id: './foo', name: 'test-plugin' }));
      }, 'IntegrityViolation: a namespace id may not start with');
    });
  })
});