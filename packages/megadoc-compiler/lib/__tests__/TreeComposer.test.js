const { assert } = require('chai');
const Subject = require('../TreeComposer');
const b = require('megadoc-corpus').builders;
const { markdown, linkify } = require('../renderRoutines');

describe('TreeComposer', function() {
  describe('.composeRenderedTree', function() {
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

      const renderedTree = Subject.composeRenderedTree({}, tree, treeOperations);

      assert.include(renderedTree.documents[0].properties.text, 'Hello <em>World</em>!')
    });
  });
});