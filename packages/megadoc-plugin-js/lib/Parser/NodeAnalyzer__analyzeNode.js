var ASTUtils = require('./ASTUtils');
var NodeInfo = require('./NodeAnalyzer__NodeInfo');
var K = require('./constants');
var generateContext = require('./NodeAnalyzer__generateContext');
var debuglog = require('megadoc/lib/Logger')('megadoc').info;
var t = require('babel-types');

function analyzeNode(node, path, filePath, config) {
  var info = new NodeInfo(node, filePath);

  debuglog('Analyzing "%s".', node.type);

  // CommonJS: a default export
  //
  //     /**
  //      * Something.
  //      */
  //     var SomeModule = function() {
  //     };
  //
  //     module.exports = SomeModule;
  if (t.isVariableDeclaration(node)) {
    analyzeVariableDeclaration(node, path, info);
  }

  else if (t.isExpressionStatement(node)) {
    analyzeExpressionStatement(node, path, info, filePath, config);
  }
  // a plain named function:
  //
  //     /**
  //      * Something.
  //      */
  //     function SomeModule() {}
  else if (t.isFunctionDeclaration(node) && t.isIdentifier(node.id)) {
    info.id = node.id.name;
    info.$contextNode = node;
  }
  else if (t.isFunctionExpression(node)) {
    info.id = node.id.name;
    info.$contextNode = node;
  }
  else if (t.isClassDeclaration(node)) {
    info.id = node.id.name;
    info.$contextNode = node;
  }
  else if (t.isObjectProperty(node)) {
    analyzeProperty(node, path, info, filePath, config);
  }
  // Factory returns:
  //
  //     function someFactory() {
  //       return function processor() {};
  //     }
  else if (t.isReturnStatement(node)) {
    analyzeReturnStatement(node, path, info);
  }
  else if (t.isObjectMethod(node)) {
    info.id = node.key.name;
    info.$contextNode = node;
  }

  if (info.id) {
    info.addContextInfo(generateContext(info.$contextNode));

    if (info.isExports()/* || info.isDestructuredObject() */) {
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
  if (t.isIdentifier(decl.id)) {
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
  else if (t.isObjectPattern(decl.id)) {
    if (decl.id.properties.length === 1 && t.isObjectProperty(decl.id.properties[0])) {
      var prop = decl.id.properties[0];

      // We'll use prop.value so that we map to the correct variable if it
      // is remapped:
      //
      //     /**
      //      * @module SomeModulEntity
      //      */
      //     var { entity: SomeModulEntity } = require('SomeModule');
      if (t.isIdentifier(prop.value)) {
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
  if (ASTUtils.isExports(node)) {
    info.markAsExports();
  }
}

function analyzeExpressionStatement(node, path, info, filePath, config) {
  var expr = node.expression;
  var lhs = expr.left;
  var rhs = expr.right;

  // Properties assigned to some object.
  if (t.isMemberExpression(lhs) && t.isLiteral(rhs)) {
    info.$contextNode = rhs;

    // Static properties:
    //
    //     SomeModule.foo = 'a';
    if (t.isIdentifier(lhs.object) && t.isIdentifier(lhs.property)) {
      info.type = 'property';
      info.id = lhs.property.name;
      info.receiver = lhs.object.name;
    }

    // Properties assigned to `this`:
    //
    //     this.foo = 'a';
    else if (t.isThisExpression(lhs.object) && t.isIdentifier(lhs.property)) {
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
  else if (t.isMemberExpression(lhs) && t.isFunctionExpression(rhs)) {
    info.$contextNode = rhs;

    // CommonJS special scenario: a named function assigned to `module.exports`
    //
    //     module.exports = function namedFunction() {};
    if (ASTUtils.isModuleExports(expr) && t.isIdentifier(rhs.id)) {
      info.id = rhs.id.name;
    }
    // Unnamed CommonJS module.exports:
    //
    //     module.exports = function() {};
    else if (ASTUtils.isModuleExports(expr) && config.inferModuleIdFromFileName) {
      info.id = ASTUtils.getVariableNameFromFilePath(filePath);
    }
    // A function assigned to some object property:
    //
    //     SomeModule.someFunction = function() {};
    else if (t.isIdentifier(lhs.object) && t.isIdentifier(lhs.property)) {
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
      console.info(expr.left);
    }
  }

  // Objects assigned to a property.
  else if (t.isMemberExpression(lhs) && t.isObjectExpression(rhs)) {
    info.$contextNode = rhs;

    // An object assigned to some object property:
    //
    //     SomeModule.someProperty = {};
    if (t.isIdentifier(lhs.object) && t.isIdentifier(lhs.property)) {
      info.id = lhs.property.name;
      info.receiver = lhs.object.name;
    }

    // For functions assigned to an object's prototype:
    //
    //     SomeModule.prototype.someFunction = function() {};
    else if (t.isMemberExpression(lhs.object) && t.isIdentifier(lhs.property)) {
      info.id = lhs.property.name;
      info.receiver = ASTUtils.flattenNodePath(lhs.object);
    }
  }
  else if (t.isMemberExpression(lhs)) {
    // Properties assigned to `this`:
    //
    //     this.foo = something;
    //     this.foo = new Something();
    if (t.isThisExpression(lhs.object)) {
      info.id = lhs.property.name;
      info.markAsInstanceProperty();
    }
    else {
      info.id = lhs.property.name;
      info.receiver = lhs.object.name;
    }
  }

  if (!info.id) {
    console.info("Unrecognized ExpressionStatement '%s' => '%s' (Source: %s).",
      lhs ? lhs.type : expr.type,
      rhs ? rhs.type : expr.type,
      ASTUtils.dumpLocation(node, filePath)
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
  if (t.isIdentifier(node.key) && t.isIdentifier(node.value)) {
    var identifierPath = ASTUtils.findIdentifierInScope(node.value.name, path);
    if (identifierPath) {
      info.id = node.key.name;
      info.$contextNode = identifierPath.parentPath.node;
    }
  }
  else if (t.isIdentifier(node.key)) {
    info.id = node.key.name;
    info.$contextNode = node.value;
  }
  else if (t.isLiteral(node.key)) {
    info.id = node.key.value;
    info.$contextNode = node.value;
  }

  if (!info.id) {
    console.warn('Unable to parse property key!');
  }
}

function analyzeReturnStatement(node, path, info) {
  if (t.isFunctionExpression(node.argument)) {
    info.$contextNode = node.argument;

    if (t.isIdentifier(node.argument.id)) {
      info.id = node.argument.id.name;
    }
    else {
      info.id = K.DEFAULT_FACTORY_EXPORTS_ID;
    }
  }
}

function isPrototypeProperty(lhs) {
  return (
    t.isMemberExpression(lhs.object) &&
    t.isIdentifier(lhs.property) &&
    lhs.object.property.name === 'prototype'
  );
}

module.exports = analyzeNode;
