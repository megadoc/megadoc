const { assert, createBuildersWithUIDs, uidOf } = require('megadoc-test-utils');
const Subject = require('../TreeRenderer');
const {  Corpus } = require('megadoc-corpus');
const { markdown, linkify } = require('../../renderRoutines');
const Renderer = require('../Renderer')
const LinkResolver = require('../LinkResolver')
const { NullLinter } = require('megadoc-linter')
const b = createBuildersWithUIDs(require('megadoc-corpus'));

describe('TreeRenderer', function() {
  describe('.markdown', function() {
    it('transform properties', function() {
      const tree = b.namespace({
        id: 'test',
        name: 'Test',
        documents: [
          b.document({
            id: 'moduleA',
            properties: {
              text: 'Hello *World*!',
            }
          }),

          b.document({
            id: 'moduleB',
          })
        ]
      });

      const renderOperations = {
        [uidOf('moduleA', tree.documents)]: {
          text: markdown({
            text: tree.documents[0].properties.text,
            contextNode: tree.documents[0]
          })
        }
      };

      const renderedTree = Subject.renderTree({
        markdownRenderer: new Renderer({}),
        linkResolver: new LinkResolver(null, {}),
      }, tree, { renderOperations });

      assert.include(renderedTree.documents[0].properties.text, 'Hello <em>World</em>!')
    });

    it('extracts a summary from one of the "summaryFields" fields', function() {
      const tree = b.namespace({
        id: 'test',
        name: 'Test',
        documents: [
          b.document({
            id: 'moduleA',
            summaryFields: [ 'description' ],
            properties: {
              text: 'Hello *World*!',
              description: 'lol!'
            }
          }),
        ]
      });

      const renderOperations = {};

      const renderedTree = Subject.renderTree({
        markdownRenderer: new Renderer({}),
        linkResolver: new LinkResolver(null, {}),
      }, tree, { renderOperations });

      assert.equal(renderedTree.documents[0].summary, 'lol!')
    })

    it('uses custom block renderers from decorators', function() {
      const tree = b.namespace({
        id: 'test',
        name: 'Test',
        documents: [
          b.document({
            id: 'moduleA',
            properties: {
              text: "```js\nvar x;\n```",
            }
          }),

          b.document({
            id: 'moduleB',
          })
        ]
      });

      const renderOperations = {
        [uidOf('moduleA', tree.documents)]: {
          text: markdown({
            text: tree.documents[0].properties.text,
            contextNode: tree.documents[0]
          })
        }
      };

      const decorators = [{
        name: 'test-decorator',
        spec: {
          serializerOptions: {
            html: {
              codeBlockRenderers: [
                {
                  lang: 'js',
                  renderFn: function({ linkify: linkifyThis }, config, { text, contextNode }) {
                    return linkifyThis({ text: `${text} + 1`, contextNode: contextNode });
                  }
                }
              ]
            }
          }
        }
      }]

      const corpus = Corpus({
        debug: false,
      }, { linter: NullLinter });

      corpus.add(tree);

      const linkResolver = new LinkResolver(corpus, {
        ignore: [],
        injectors: null,
        linter: NullLinter,
      });

      const renderedTree = Subject.renderTree({
        markdownRenderer: new Renderer({}),
        linkResolver,
      }, tree, { decorators, renderOperations });

      assert.include(renderedTree.documents[0].properties.text, "var x; + 1")
    })
  });

  describe('.linkify', function() {
    it('works', function() {
      const tree = b.namespace({
        id: 'test',
        name: 'Test',
        documents: [
          b.document({
            id: 'moduleA',
            title: 'Module A',
            meta: {
              href: '/moduleA.html',
            },
            properties: {
              text: 'Hello *World*!',
            }
          }),

          b.document({
            id: 'moduleB',
            meta: {
              href: '/moduleB.html',
            },
            properties: {
              text: 'See [[moduleA]]'
            }
          })
        ]
      });

      const corpus = Corpus({
        debug: false,
      }, { linter: NullLinter });

      corpus.add(tree);

      const renderOperations = {
        [uidOf('moduleA', tree.documents)]: {
          text: markdown({
            text: tree.documents[0].properties.text,
            contextNode: tree.documents[0],
          })
        },
        [uidOf('moduleB', tree.documents)]: {
          text: markdown({
            text: linkify({
              text: tree.documents[1].properties.text,
              contextNode: tree.documents[1],
            }),
            contextNode: tree.documents[1],
          }),
        },
      };

      const linkResolver = new LinkResolver(corpus, {
        ignore: [],
        injectors: null,
        linter: NullLinter,
      });

      const renderedTree = Subject.renderTree({
        markdownRenderer: new Renderer({}),
        linkResolver: linkResolver,
      }, tree, { renderOperations });

      assert.include(renderedTree.documents[1].properties.text,
        'See <a href="moduleA.html" class="mega-link--internal">Module A</a>'
      )
    });
  });
});