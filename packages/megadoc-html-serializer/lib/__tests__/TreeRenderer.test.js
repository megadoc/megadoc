const { assert } = require('chai');
const Subject = require('../TreeRenderer');
const b = require('megadoc-corpus').builders;
const { markdown, linkify } = require('../renderRoutines');
const Renderer = require('../Renderer')

describe('TreeRenderer', function() {
  describe('.renderTree', function() {
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
        markdownRenderer: new Renderer({})
      }, tree, treeOperations);

      assert.include(renderedTree.documents[0].properties.text, 'Hello <em>World</em>!')
    });
  });
});