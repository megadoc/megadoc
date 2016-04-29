var Utils = require('../Utils');
var assert = require('chai').assert;
var multiline = require('multiline-slash');
var babel = require('babel-core');
var t = require('babel-types');

describe('CJS::Parser::Utils', function() {
  function parse(strGenerator) {
    return babel.transform(multiline(strGenerator), {
      code: false,
      ast: true
    }).ast;
  }

  describe('.flattenNodePath', function() {
    it('works with properties assigned to `prototype`', function() {
      var ast = parse(function() {;
        // SomeModule.prototype.someProperty = 'a';
      });

      babel.traverse(ast, {
        MemberExpression: function(path) {
          assert.equal(Utils.flattenNodePath(path.node), 'SomeModule.prototype');
          return false;
        }
      });
    });

    it('works with functions assigned to `prototype`', function() {
      var ast = parse(function() {;
        // SomeModule.prototype.someFunc = function() {};
      });

      babel.traverse(ast, {
        MemberExpression: function(path) {
          assert.equal(Utils.flattenNodePath(path.node), 'SomeModule.prototype');
          return false;
        }
      });
    });
  });

  describe('.findAncestorPath', function() {
    it('works', function() {
      var ast = parse(function() {;
        // function SomeModule() {
        //   return {
        //     obj: {}
        //   };
        // }
      });

      babel.traverse(ast, {
        Property: function(path) {
          var ancestorPath = Utils.findAncestorPath(path, function(parentPath) {
            return (
              parentPath.node &&
              t.isFunctionDeclaration(parentPath.node)
            );
          });

          assert.ok(ancestorPath);
          assert.equal(ancestorPath.node.id.name, 'SomeModule');

          return false;
        }
      });
    });

    it('ignores sibling paths', function() {
      var ast = parse(function() {;
        // function SomeModule() {
        // }
        //
        // SomeModule.someFunc = function() {
        // };
      });

      babel.traverse(ast, {
        MemberExpression: function(path) {
          var ancestorPath = Utils.findAncestorPath(path, function(parentPath) {
            return (
              parentPath.node &&
              t.isFunctionDeclaration(parentPath.node)
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
      var ast = parse(function() {;
        // function SomeModule() {
        //   function fn() {}
        //
        //   return {
        //     someFunc: fn
        //   };
        // }
      });

      babel.traverse(ast, {
        Property: function(path) {
          var targetPath = Utils.findIdentifierInScope(
            path.node.value.name,
            path
          );

          assert.ok(targetPath);
          assert.equal(targetPath.node.id.name, 'fn');

          return false;
        }
      });
    });
  });
});