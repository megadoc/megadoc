var assert = require('assert');
var TestUtils = require('../../TestUtils');

describe('CJS::Parser: customAnalyzer support', function() {
  it('accepts a custom analyzeNode function', function() {
    var docs = TestUtils.parseInline(function() {;
      // /**
      //  * A component that does hairy things.
      //  */
      // const SomeComponent = React.createClass({
      //   render() {
      //     return <div />;
      //   }
      // });
      //
      // module.exports = SomeComponent;
    }, {
      parserOptions: {
        presets: [ 'react' ],
      },

      nodeAnalyzers: [
        function(t, node, path, nodeInfo) {
          if (t.isVariableDeclaration(node)) {
            var decl = node.declarations[0];

            if (t.isCallExpression(decl.init) && t.isMemberExpression(decl.init.callee)) {
              var callee = decl.init.callee;

              if (callee.object.name === 'React' && callee.property.name === 'createClass') {
                nodeInfo.setContext({
                  type: 'component'
                });
              }
            }
          }
        }
      ]
    });

    assert.equal(docs.length, 1);
    assert.equal(docs[0].id, 'SomeComponent');
    assert.equal(docs[0].isModule, true);
    assert.equal(docs[0].typeInfo.name, 'component');
  });
});