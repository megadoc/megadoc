require('../../');

var Subject = require("../Corpus");
var b = require('../CorpusTypes').builders;
var assert = require('chai').assert;

describe('CorpusResolver', function() {
  var subject;

  beforeEach(function() {
    subject = Subject();
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
});