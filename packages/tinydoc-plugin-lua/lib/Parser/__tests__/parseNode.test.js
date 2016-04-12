var assert = require('assert');
var multiline = require('multiline-slash');
var subject = require('../parseNode');

function parseNode(str) {
  var parser = require('luaparse');
  var ast = parser.parse(multiline(str, true), {
    comments: false,
    scope: false,
    locations: false
  });

  var nodeInfos = ast.body.reduce(function(set, node) {
    set.push(subject(node));

    if (node.init) {
      node.init.forEach(function(initNode) {
        if (initNode.type === 'TableConstructorExpression') {
          initNode.fields.forEach(function(childNode) {
            set.push(subject(childNode));
          });
        }
      });
    }

    return set;
  }, []);

  if (nodeInfos.length === 1) {
    return nodeInfos[0];
  }
  else {
    return nodeInfos;
  }
}

describe('Lua::Parser#parseNode', function() {
  it('understands a function', function() {
    var nodeInfo = parseNode(function() {
      // function do_something()
      // end
    });

    assert.equal(nodeInfo.id, 'do_something')
  });

  it('understands a self-bound function', function() {
    var nodeInfo = parseNode(function() {
      // function me:something()
      // end
    });

    assert.equal(nodeInfo.id, 'something')
    assert.equal(nodeInfo.ctx.type, 'function')
    assert.equal(nodeInfo.receiver, 'me')
    assert.equal(nodeInfo.indexer, ':')
  });

  it('understands a variable-bound function', function() {
    var nodeInfo = parseNode(function() {
      // function me.something()
      // end
    });

    assert.equal(nodeInfo.id, 'something')
    assert.equal(nodeInfo.ctx.type, 'function')
    assert.equal(nodeInfo.receiver, 'me')
    assert.equal(nodeInfo.indexer, '.')
  });

  it('understands a function assigned to a table property', function() {
    var nodeInfo = parseNode(function() {
      // me.something = function()
      // end
    });

    assert.equal(nodeInfo.id, 'something')
    assert.equal(nodeInfo.ctx.type, 'function')
    assert.equal(nodeInfo.receiver, 'me')
    assert.equal(nodeInfo.indexer, '.')
  });

  it('understands a local variable declaration', function() {
    var nodeInfo = parseNode(function() {
      // local foo = 'bar'
    });

    assert.equal(nodeInfo.id, 'foo')
  });

  it('ignores multiple local variable declarations', function() {
    var nodeInfo = parseNode(function() {
      // local foo, _ = 'bar'
    });

    assert.equal(nodeInfo.id, undefined)
  });

  it('understands a global variable declaration', function() {
    var nodeInfo = parseNode(function() {
      // foo = 'bar'
    });

    assert.equal(nodeInfo.id, 'foo')
  });

  it('ignores multiple variable declarations', function() {
    var nodeInfo = parseNode(function() {
      // foo, x = 'bar'
    });

    assert.equal(nodeInfo.id, undefined)
  });

  it('understands an inline table property', function() {
    var nodeInfo = parseNode(function() {
      // local t = {
      //   foo = 'bar'
      // }
    });

    assert.equal(nodeInfo.length, 2);
    assert.equal(nodeInfo[0].id, 't')
    assert.equal(nodeInfo[0].ctx.type, 'table')

    assert.equal(nodeInfo[1].id, 'foo')
    assert.equal(nodeInfo[1].ctx.type, 'literal')
  });

  it('understands an inline table function', function() {
    var nodeInfo = parseNode(function() {
      // local t = {
      //   foo = function()
      //   end
      // }
    });

    assert.equal(nodeInfo.length, 2);
    assert.equal(nodeInfo[0].id, 't')
    assert.equal(nodeInfo[0].ctx.type, 'table')

    assert.equal(nodeInfo[1].id, 'foo')
    assert.equal(nodeInfo[1].ctx.type, 'function')
  });

  it('understands an assignment of a literal table property', function() {
    var nodeInfo = parseNode(function() {
      // local t = {}
      //
      // t.foo = 'bar'
    });

    assert.equal(nodeInfo.length, 2);
    assert.equal(nodeInfo[0].id, 't')
    assert.equal(nodeInfo[0].ctx.type, 'table')

    assert.equal(nodeInfo[1].id, 'foo')
    assert.equal(nodeInfo[1].ctx.type, 'literal')
  });

  it('understands an assignment of a function table property', function() {
    var nodeInfo = parseNode(function() {
      // local t = {}
      //
      // t.foo = function()
      // end
    });

    assert.equal(nodeInfo.length, 2);
    assert.equal(nodeInfo[0].id, 't')
    assert.equal(nodeInfo[0].ctx.type, 'table')

    assert.equal(nodeInfo[1].id, 'foo')
    assert.equal(nodeInfo[1].ctx.type, 'function')
  });
});