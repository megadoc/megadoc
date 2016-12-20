const { assert } = require('chai');
const Subject = require('../stage5/TreeRenderer');
const b = require('megadoc-corpus').builders;
const { markdown, linkify } = require('../renderRoutines');

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

      const renderedTree = Subject.renderTree({}, tree, treeOperations);

      assert.include(renderedTree.documents[0].properties.text, 'Hello <em>World</em>!')
    });
  });
});