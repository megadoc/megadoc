require('../../');

var Subject = require("../Corpus");
var b = require('../CorpusTypes').builders;
var assert = require('chai').assert;

describe('Corpus', function() {
  var subject;

  beforeEach(function() {
    subject = Subject();
  });

  it('works', function() {
  });

  it('lets me add a namespace', function() {
    var ns = b.namespace({
      id: 'JS',
      corpusContext: 'JavaScripts',
      documents: []
    });

    subject.add(ns);

    assert.equal(subject.get('JS'), ns);
  });

  it('tracks documents within a namespace', function() {
    var ns = b.namespace({
      id: 'JS',
      corpusContext: 'JavaScripts',
      documents: [
        b.document({
          id: 'Cache',
          entities: [],
        })
      ]
    });

    subject.add(ns);

    assert.equal(subject.get('JS'), ns);
    assert.equal(subject.get('JS/Cache'), ns.documents[0]);
  });

  it('allows me to customize the namespace symbol', function() {
    var ns = b.namespace({
      id: 'API',
      symbol: '::',
      corpusContext: 'Rails API',
      documents: [
        b.document({
          id: 'Users'
        })
      ]
    });

    subject.add(ns);

    assert.equal(subject.get('API'), ns);
    assert.equal(subject.get('API::Users'), ns.documents[0]);
  });

  it('borks if the namespace id is taken', function() {
    subject.add(b.namespace({ id: 'foo' }));

    assert.throws(function() {
      subject.add(b.namespace({ id: 'foo' }));
    }, "IntegrityViolation: a namespace with the id 'foo' already exists.");
  });

  it('borks if i try to add a non-namespace node without a parentNode', function() {
    assert.throws(function() {
      subject.add(b.document({ id: 'foo' }));
    }, "IntegrityViolation: expected node to reference a parentNode.");
  });

  describe('serialization', function() {
    it('flattens the database', function() {
      subject.add(b.namespace({
        id: 'API',
        documents: [
          b.document({
            id: 'Users',
            entities: [
              b.documentEntity({
                id: 'add'
              })
            ]
          })
        ]
      }));

      var dump = subject.toJSON();

      assert.equal(Object.keys(dump).length, 3);
      assert.equal(dump['API'].parentNode, undefined,
        "it does not serialize the root corpus node"
      );

      assert.equal(dump['API/Users'].parentNode, 'API');
      assert.equal(dump['API/Users'].entities[0], 'API/Usersadd',
        "it swaps entities with their UIDs"
      );

      assert.equal(dump['API/Usersadd'].parentNode, 'API/Users',
        "it swaps parentNode values with the UID"
      );
    });
  });

  describe('resolving', function() {
    beforeEach(function() {
      subject.add(
        b.namespace({
          id: 'MD',
          corpusContext: 'Articles',
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

            b.document({
              id: 'Z',
              filePath: '/doc/articles/Z.md',
              entities: [],
            }),
          ]
        })
      );

      subject.add(
        b.namespace({
          id: 'JS',
          corpusContext: 'JavaScripts',
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
      { ctx: "JS/Core.X@name"     , link: "X"               , res: "JS/Core.X" },
      { ctx: "JS/Core.X@name"     , link: "JS/X"            , res: "JS/X" },
      { ctx: "JS/Core.X@name"     , link: "MD/X"            , res: "MD/X" },
      { ctx: "JS/Core.X#add"      , link: "@name"           , res: "JS/Core.X@name" },
      { ctx: "JS/Core.X#add"      , link: "Y@name"          , res: "JS/Core.Y@name" },
      { ctx: "JS/Core.X#add"      , link: "Core.Y@name"     , res: "JS/Core.Y@name" },
      { ctx: "JS/Core.X#add"      , link: "JS/Core.Y@name"  , res: "JS/Core.Y@name" },
      { ctx: "JS/Core.Y"        , link: "X"            , res: "JS/Core.X" },
      { ctx: "JS/Core.Y"        , link: "#add"         , res: null },
      { ctx: "JS/Core.Y"        , link: "X#add"        , res: "JS/Core.X#add" },
      // { ctx: "JS/Core.Y"        , link: "X.js"         , res: null },
      // { ctx: "JS/Core.Y"        , link: "./X.js"       , res: "JS/Core.X" },
      // { ctx: "JS/Core.Y"        , link: "../X.js"      , res: "JS/X" },
      { ctx: "JS/Z"             , link: "X"            , res: "JS/X" },
      { ctx: "MD/X"             , link: "X"            , res: "MD/X" },
      { ctx: "MD/X"             , link: "Core.X"       , res: "JS/Core.X" },
      { ctx: "MD/Y"             , link: "X"            , res: "MD/X" },
    ].forEach(function(spec) {
      var fn = spec.only ? it.only : it;

      fn("resolves '" + spec.res + "' from '" + spec.ctx + "' using '" + spec.link + "'", function() {
        var document = subject.resolve({
          text: spec.link,
          contextNode: subject.get(spec.ctx)
        });

        if (spec.res === null) {
          if (document) {
            subject.resolve({
              text: spec.link,
              contextNode: subject.get(spec.ctx),
            }, { trace: true });
          }

          assert.notOk(document);
        }
        else {
          if (!document) {
            subject.resolve({
              text: spec.link,
              contextNode: subject.get(spec.ctx),
            }, { trace: true });
          }

          assert.ok(document);
          assert.equal(document, subject.get(spec.res),
            document.id + " vs " + spec.res
          );
        }
      })
    })
  })
});