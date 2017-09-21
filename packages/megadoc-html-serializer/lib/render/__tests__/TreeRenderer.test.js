const { assert } = require('megadoc-test-utils');
const Subject = require('../TreeRenderer');
const { builders: b, Corpus } = require('megadoc-corpus');
const { markdown, linkify } = require('../../renderRoutines');
const Renderer = require('../Renderer')
const LinkResolver = require('../LinkResolver')
const { NullLinter } = require('megadoc-linter')

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

      const treeOperations = {
        'moduleA': {
          text: markdown(tree.documents[0].properties.text)
        }
      };

      const renderedTree = Subject.renderTree({
        compilerConfig: { strict: true },
        markdownRenderer: new Renderer({})
      }, tree, treeOperations);

      assert.include(renderedTree.documents[0].properties.text, 'Hello <em>World</em>!')
    });
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
              href: 'moduleA.html',
            },
            properties: {
              text: 'Hello *World*!',
            }
          }),

          b.document({
            id: 'moduleB',
            properties: {
              text: 'See [[moduleA]]'
            }
          })
        ]
      });

      const corpus = Corpus({
        strict: true,
        debug: false,
      }, { linter: NullLinter });

      corpus.add(tree);

      const treeOperations = {
        'moduleA': {
          text: markdown(tree.documents[0].properties.text)
        },
        'moduleB': {
          text: markdown(linkify(tree.documents[1].properties.text)),
        },
      };

      const linkResolver = new LinkResolver(corpus, {
        relativeLinks: false,
        ignore: [],
        injectors: null,
        linter: NullLinter,
      });

      const renderedTree = Subject.renderTree({
        compilerConfig: { strict: true },
        markdownRenderer: new Renderer({}),
        linkResolver: linkResolver,
      }, tree, treeOperations);

      assert.include(renderedTree.documents[1].properties.text,
        'See <a href="moduleA.html" class="mega-link--internal">Module A</a>'
      )
    });
  });
});