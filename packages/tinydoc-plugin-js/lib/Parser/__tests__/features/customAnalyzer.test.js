var assert = require('assert');
var TestUtils = require('../../TestUtils');

describe('CJS::Parser: customAnalyzer support', function() {
  it('accepts a custom analyzeNode function', function() {
    var docs = TestUtils.parseInline(function() {
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
      nodeAnalyzers: [
        function(n, node, path, nodeInfo) {
          if (n.VariableDeclaration.check(node)) {
            var decl = node.declarations[0];

            if (n.CallExpression.check(decl.init) && n.MemberExpression.check(decl.init.callee)) {
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
    assert.equal(docs[0].ctx.type, 'component');
  });
});