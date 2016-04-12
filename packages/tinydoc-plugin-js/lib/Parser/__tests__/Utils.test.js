var Utils = require('../Utils');
var recast = require('recast');
var assert = require('chai').assert;
var multiline = require('multiline-slash');
var n = recast.types.namedTypes;

describe('CJS::Parser::Utils', function() {
  function parse(strGenerator) {
    return recast.parse(multiline(strGenerator));
  }

  describe('.flattenNodePath', function() {
    it('works with properties assigned to `prototype`', function() {
      var ast = parse(function() {
        // SomeModule.prototype.someProperty = 'a';
      });

      recast.visit(ast, {
        visitMemberExpression: function(path) {
          assert.equal(Utils.flattenNodePath(path.node), 'SomeModule.prototype');
          return false;
        }
      });
    });

    it('works with functions assigned to `prototype`', function() {
      var ast = parse(function() {
        // SomeModule.prototype.someFunc = function() {};
      });

      recast.visit(ast, {
        visitMemberExpression: function(path) {
          assert.equal(Utils.flattenNodePath(path.node), 'SomeModule.prototype');
          return false;
        }
      });
    });
  });

  describe('.findAncestorPath', function() {
    it('works', function() {
      var ast = parse(function() {
        // function SomeModule() {
        //   return {
        //     obj: {}
        //   };
        // }
      });

      recast.visit(ast, {
        visitProperty: function(path) {
          var ancestorPath = Utils.findAncestorPath(path, function(parentPath) {
            return (
              parentPath.node &&
              n.FunctionDeclaration.check(parentPath.node)
            );
          });

          assert.ok(ancestorPath);
          assert.equal(ancestorPath.node.id.name, 'SomeModule');

          return false;
        }
      });
    });

    it('ignores sibling paths', function() {
      var ast = parse(function() {
        // function SomeModule() {
        // }
        //
        // SomeModule.someFunc = function() {
        // };
      });

      recast.visit(ast, {
        visitMemberExpression: function(path) {
          var ancestorPath = Utils.findAncestorPath(path, function(parentPath) {
            return (
              parentPath.node &&
              n.FunctionDeclaration.check(parentPath.node)
            );
          });

          assert.ok(!ancestorPath);

          return false;
        }
      });
    });
  });

  describe('.resolveIdentifierInScope', function() {
    it('works', function() {
      var ast = parse(function() {
        // function SomeModule() {
        //   function fn() {}
        //
        //   return {
        //     someFunc: fn
        //   };
        // }
      });

      recast.visit(ast, {
        visitProperty: function(path) {
          var targetPath = Utils.findIdentifierInScope(
            path.node.value.name,
            path
          );

          assert.ok(targetPath);
          assert.equal(targetPath.node.name, 'fn');

          return false;
        }
      });
    });
  });
});