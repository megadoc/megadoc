var Utils = require('../Utils');
var NodeInfo = require('./NodeInfo');
var K = require('../constants');
var generateContext = require('./generateContext');
var recast = require('recast');
var Logger = require('../../../../lib/Logger');
var console = Logger('cjs');

var n = recast.types.namedTypes;

function analyzeNode(node, path, filePath, config) {
  var info = new NodeInfo(node, filePath);

  console.debug('Analyzing "%s".', node.type);

  // CommonJS: a default export
  //
  //     /**
  //      * Something.
  //      */
  //     var SomeModule = function() {
  //     };
  //
  //     module.exports = SomeModule;
  if (n.VariableDeclaration.check(node)) {
    analyzeVariableDeclaration(node, path, info);
  }

  else if (n.ExpressionStatement.check(node)) {
    analyzeExpressionStatement(node, path, info, filePath, config);
  }
  // a plain named function:
  //
  //     /**
  //      * Something.
  //      */
  //     function SomeModule() {}
  else if (n.FunctionDeclaration.check(node) && n.Identifier.check(node.id)) {
    info.id = node.id.name;
    info.$contextNode = node;
  }
  else if (n.FunctionExpression.check(node)) {
    info.id = node.id.name;
    info.$contextNode = node;
  }
  else if (n.ClassDeclaration.check(node)) {
    info.id = node.id.name;
    info.$contextNode = node;
  }
  else if (n.Property.check(node)) {
    analyzeProperty(node, path, info, filePath, config);
  }
  // Factory returns:
  //
  //     function someFactory() {
  //       return function processor() {};
  //     }
  else if (n.ReturnStatement.check(node)) {
    analyzeReturnStatement(node, path, info);
  }

  if (info.id) {
    info.addContextInfo(generateContext(info.$contextNode));

    if (info.isExports() || info.isDestructuredObject()) {
      info.addContextInfo({ type: K.TYPE_OBJECT });
    }
  }

  return info;
}

function analyzeVariableDeclaration(node, path, info) {
  var decl = node.declarations[0];

  //     var Something = 'a';
  //     var Something = SomeFunc();
  //     var Something = {};
  //     var Something = ...;
  if (n.Identifier.check(decl.id)) {
    info.id = decl.id.name;
    info.$contextNode = decl.init;
  }
  // ES6 destructuring:
  //
  //     /**
  //      * @module SomeModulEntity
  //      */
  //     var { entity } = require('SomeModule');
  //
  // This will be supported only if there's 1 key being destructured.
  else if (n.ObjectPattern.check(decl.id)) {
    if (decl.id.properties.length === 1 && n.Property.check(decl.id.properties[0])) {
      var prop = decl.id.properties[0];

      // We'll use prop.value so that we map to the correct variable if it
      // is remapped:
      //
      //     /**
      //      * @module SomeModulEntity
      //      */
      //     var { entity: SomeModulEntity } = require('SomeModule');
      if (n.Identifier.check(prop.value)) {
        info.id = prop.value.name;
      }

      info.markAsDestructuredObject();
    }
  }

  // CommonJS: a module mapped to the default "exports" object
  //
  //     /**
  //      * Something.
  //      */
  //     var SomeModule = exports;
  if (Utils.isExports(node)) {
    info.markAsExports();
  }
}

function analyzeExpressionStatement(node, path, info, filePath, config) {
  var expr = node.expression;
  var lhs = expr.left;
  var rhs = expr.right;

  // Properties assigned to some object.
  if (n.MemberExpression.check(lhs) && n.Literal.check(rhs)) {
    info.$contextNode = rhs;

    // Static properties:
    //
    //     SomeModule.foo = 'a';
    if (n.Identifier.check(lhs.object) && n.Identifier.check(lhs.property)) {
      info.type = 'property';
      info.id = lhs.property.name;
      info.receiver = lhs.object.name;
    }

    // Properties assigned to `this`:
    //
    //     this.foo = 'a';
    else if (n.ThisExpression.check(lhs.object) && n.Identifier.check(lhs.property)) {
      info.id = lhs.property.name;
      info.markAsInstanceProperty();
      // no way to know the receiver now, we'll resolve later
    }
    // A prototype property:
    //
    //     SomeModule.prototype.foo = 'a';
    else if (isPrototypeProperty(lhs)) {
      info.id = lhs.property.name;
      info.receiver = lhs.object.object.name;
      info.markAsPrototypeProperty();
    }
  }

  // Functions assigned to a property.
  else if (n.MemberExpression.check(lhs) && n.FunctionExpression.check(rhs)) {
    info.$contextNode = rhs;

    // CommonJS special scenario: a named function assigned to `module.exports`
    //
    //     module.exports = function namedFunction() {};
    if (Utils.isModuleExports(expr) && n.Identifier.check(rhs.id)) {
      info.id = rhs.id.name;
    }
    // Unnamed CommonJS module.exports:
    //
    //     module.exports = function() {};
    else if (Utils.isModuleExports(expr) && config.inferModuleIdFromFileName) {
      info.id = Utils.getVariableNameFromFilePath(filePath);
    }
    // A function assigned to some object property:
    //
    //     SomeModule.someFunction = function() {};
    else if (n.Identifier.check(lhs.object) && n.Identifier.check(lhs.property)) {
      info.id = lhs.property.name;
      info.receiver = lhs.object.name;
    }

    // For functions assigned to an object's prototype:
    //
    //     SomeModule.prototype.someFunction = function() {};
    else if (isPrototypeProperty(lhs)) {
      info.id = lhs.property.name;
      info.receiver = lhs.object.object.name;
      info.markAsPrototypeProperty();
    }
    else {
      console.warn('Expected FunctionExpression to contain an "id", but it does not.');
      console.debug(expr.left);
    }
  }

  // Objects assigned to a property.
  else if (n.MemberExpression.check(lhs) && n.ObjectExpression.check(rhs)) {
    info.$contextNode = rhs;

    // An object assigned to some object property:
    //
    //     SomeModule.someProperty = {};
    if (n.Identifier.check(lhs.object) && n.Identifier.check(lhs.property)) {
      info.id = lhs.property.name;
      info.receiver = lhs.object.name;
    }

    // For functions assigned to an object's prototype:
    //
    //     SomeModule.prototype.someFunction = function() {};
    else if (n.MemberExpression.check(lhs.object) && n.Identifier.check(lhs.property)) {
      info.id = lhs.property.name;
      info.receiver = Utils.flattenNodePath(lhs.object);
    }
  }
  else if (n.MemberExpression.check(lhs)) {
    // Properties assigned to `this`:
    //
    //     this.foo = something;
    //     this.foo = new Something();
    if (n.ThisExpression.check(lhs.object)) {
      info.id = lhs.property.name;
      info.markAsInstanceProperty();
    }
  }

  if (!info.id) {
    console.warn("Unrecognized ExpressionStatement '%s' => '%s' (Source: %s).",
      lhs ? lhs.type : expr.type,
      rhs ? rhs.type : expr.type,
      Utils.dumpLocation(node, filePath)
    );
  }
}

function analyzeProperty(node, path, info) {
  // A property that points to an identifier, possibly in the current scope:
  //
  //     function fn() {}
  //
  //     var obj = {
  //       someFunc: fn // <--
  //     };
  if (n.Identifier.check(node.key) && n.Identifier.check(node.value)) {
    var identifierPath = Utils.findIdentifierInScope(node.value.name, path);
    if (identifierPath) {
      info.id = node.key.name;
      info.$contextNode = identifierPath.parentPath.node;
    }
  }
  else if (n.Identifier.check(node.key)) {
    info.id = node.key.name;
    info.$contextNode = node.value;
  }
  else if (n.Literal.check(node.key)) {
    info.id = node.key.value;
    info.$contextNode = node.value;
  }

  if (!info.id) {
    console.warn('Unable to parse property key!');
  }
}

function analyzeReturnStatement(node, path, info) {
  if (n.FunctionExpression.check(node.argument)) {
    info.$contextNode = node.argument;

    if (n.Identifier.check(node.argument.id)) {
      info.id = node.argument.id.name;
    }
    else {
      info.id = K.DEFAULT_FACTORY_EXPORTS_ID;
    }
  }
}

function isPrototypeProperty(lhs) {
  return (
    n.MemberExpression.check(lhs.object) &&
    n.Identifier.check(lhs.property) &&
    lhs.object.property.name === 'prototype'
  );
}

module.exports = analyzeNode;
