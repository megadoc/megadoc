require('../../');

const Subject = require("../Corpus");
const resolve = require("../CorpusResolver");
const { assert, createBuildersWithUIDs, createSinonSuite } = require('megadoc-test-utils');
const { NullLinter } = require('megadoc-linter')
const b = createBuildersWithUIDs(require('../../'));

describe('CorpusResolver', function() {
  const sinon = createSinonSuite(this)
  var corpus;

  beforeEach(function() {
    corpus = Subject({}, { linter: NullLinter });
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
            filePath: '/ui/index.js',
            documents: [
              b.document({
                filePath: '/ui/Z.js',
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
            filePath: '/js/lib/core/index.js',

            documents: [
              b.document({
                id: 'X',
                filePath: '/js/lib/core/X.js',
                symbol: '',
                entities: [
                  b.documentEntity({
                    id: '@name',
                    filePath: '/js/lib/core/X.js',
                  }),

                  b.documentEntity({
                    id: '#add',
                    filePath: '/js/lib/core/X.js',
                  })
                ]
              }),

              b.document({
                id: 'Y',
                filePath: '/js/lib/core/Y.js',
                symbol: '',
                entities: [
                  b.documentEntity({
                    id: '@name',
                    filePath: '/js/lib/core/Y.js',
                    entities: [
                      b.documentEntity({
                        id: '@nameType',
                        filePath: '/js/lib/core/Y.js',
                      })
                    ]
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
    { from: "JS/Core.X@name"   , to: "X"               , res: "JS/Core.X",        text: 'X'       },
    { from: "JS/Core.X@name"   , to: "JS/X"            , res: "JS/X",             text: 'JS/X',   },
    { from: "JS/Core.X@name"   , to: "MD/X"            , res: "MD/X",             text: 'MD/X'    },
    { from: "JS/Core.X#add"    , to: "@name"           , res: "JS/Core.X@name",   text: '@name'   },
    { from: "JS/Core.X#add"    , to: "Y@name"          , res: "JS/Core.Y@name",   text: 'Y@name'  },
    { from: "JS/Core.X#add"    , to: "Core.Y@name"     , res: "JS/Core.Y@name",   text: 'Core.Y@name'  },
    { from: "JS/Core.X#add"    , to: "JS/Core.Y@name"  , res: "JS/Core.Y@name",   /* text: 'Y@name' */  },
    { from: "JS/Core.X"        , to: "@name"           , res: "JS/Core.X@name",   text: '@name'   },
    { from: "JS/Core.Y"        , to: "X"               , res: "JS/Core.X",        text: 'X'       },
    { from: "JS/Core.Y"        , to: "#add"            , res: null },
    { from: "JS/Core.Y"        , to: "X#add"           , res: "JS/Core.X#add",    text: 'X#add'   },
    { from: "JS/Core.Y"        , to: "X.js"            , res: null },
    { from: "JS/Z"             , to: "X"               , res: "JS/X",             /* text: 'X' */ },
    { from: "MD/X"             , to: "X"               , res: "MD/X",             /* text: 'X' */ },
    { from: "MD/X"             , to: "Core.X"          , res: "JS/Core.X",        text: 'Core.X' },
    { from: "MD/Y"             , to: "X"               , res: "MD/X",             /* text: 'X' */ },
    { from: "MD/Y"             , to: "JS/Core.Y@name@nameType"       , res: "JS/Core.Y@name@nameType" },

    // it should not use private indices:
    //
    // "JS UI/UI/Z" has a private index "Z" while JS/Z has a public index "Z" so
    // we expect the latter to be resolved:
    { from: "MD"               , to: "Z"               , res: "JS/Z",             text: 'Z' },

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
      var { node: document, text } = resolve({
        text: spec.to,
        contextNode: corpus.at(spec.from)
      }, { trace: false, getParentOf: corpus.getParentOf, }) || {};

      if (spec.res === null) {
        assert.notOk(document, (document && "Resolved '" + document.uid + "' when it should not have."));
      }
      else {
        assert.ok(document);
        assert.equal(document.uid, corpus.at(spec.res).uid);

        if (spec.text) {
          assert(text === spec.text, `Node should've been yielded as "${spec.text}" but was as "${text}"`);
        }
      }
    })
  });

  describe('funny names', function() {
    beforeEach(function() {
      sinon.spy(NullLinter, 'logError')

      corpus.add(b.namespace({
        id: 'Wild Babies',
        name: 'test-plugin',
        documents: [
          b.document({ id: 'The Gorilla Emperor', filePath: 'gorilla.js' })
        ]
      }));

      corpus.add(b.namespace({
        id: 'Wild #Hash',
        name: 'test-plugin',
        documents: [
          b.document({ id: 'The $Wilderness B3Y)ND', filePath: 'wilderness.js' })
        ]
      }));

      corpus.add(b.namespace({
        id: 'مجموعتي',
        name: 'test-plugin',
        documents: [
          b.document({ id: 'صفحة', filePath: 'page.js' })
        ]
      }));
    });

    it('works when there are spaces in a namespace', function() {
      assert.ok(corpus.resolve({ text: 'Wild Babies' }));
      assert.ok(corpus.resolve({ text: 'Wild Babies/The Gorilla Emperor' }));
    });

    it('works when there are special characters in a namespace', function() {
      assert.ok(corpus.resolve({ text: 'Wild #Hash' }));
      assert.ok(corpus.resolve({ text: 'Wild #Hash/The $Wilderness B3Y)ND' }));
    });

    it('works when there are unicode characters in a namespace', function() {
      assert.ok(corpus.resolve({ text: 'مجموعتي' }));
      assert.ok(corpus.resolve({ text: 'مجموعتي/صفحة' }));
    });

    it('rejects a namespace with an illegal name (starts with /)', function() {
      corpus.add(b.namespace({ id: '/foo', name: 'test-plugin' }));

      assert.calledWith(NullLinter.logError, sinon.match({
        message: 'Namespace id may not start with "/" or "."'
      }))
    });

    it('rejects a namespace with an illegal name (starts with .)', function() {
      corpus.add(b.namespace({ id: './foo', name: 'test-plugin' }));

      assert.calledWith(NullLinter.logError, sinon.match({
        message: 'Namespace id may not start with "/" or "."'
      }))
    });
  })
});