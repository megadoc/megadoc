var fs = require('fs');
var assert = require('assert');
var ASTUtils = require('./ASTUtils');
var Doc = require('./Doc');
var Docstring = require('./Docstring');
var Registry = require('./Registry');
var PostProcessor = require('./PostProcessor');
var NodeAnalyzer = require('./NodeAnalyzer');
var pick = require('lodash').pick;
var assign = require('lodash').assign;
var debuglog = require('megadoc/lib/Logger')('megadoc').info;
var babel = require('babel-core');
var t = require('babel-types');

var runAllSync = require('../utils/runAllSync');

function Parser() {
  this.registry = new Registry();
}

var Ppt = Parser.prototype;

Ppt.parseFile = function(filePath, config, commonPrefix) {
  try {
    this.parseString(
      fs.readFileSync(filePath, 'utf-8'),
      config,
      filePath.replace(commonPrefix, ''),
      filePath
    );
  }
  catch(e) {
    console.error('Failed to parse ' + filePath);
    throw e;
  }
};

Ppt.parseString = function(str, config, filePath, absoluteFilePath) {
  if (str.length > 0) {
    try {
      if (config.parse) {
        this.ast = config.parse(str, filePath, absoluteFilePath);
      }
      else {
        this.ast = babel.transform(str, assign({
          filenameRelative: filePath,
          filename: absoluteFilePath,
          code: false,
          ast: true,
          babelrc: true,
          comments: true,
        }, config.parserOptions)).ast;
      }

      this.walk(this.ast, config, filePath, absoluteFilePath);
    } catch(e) {
      if (config.strict) {
        throw e;
      }
      else {
        console.warn("File could not be parsed, most likely due to a SyntaxError. (Source: '%s')", filePath);
        console.warn(e);

        return;
      }
    }
  }
};

Ppt.walk = function(ast, inConfig, filePath, absoluteFilePath) {
  var parser = this;
  var config = pick(inConfig, [
    'inferModuleIdFromFileName',
    'nodeAnalyzers',
    'docstringProcessors',
    'tagProcessors',
    'customTags',
    'namespaceDirMap',
    'alias',
    'namedReturnTags',
  ]);

  Object.keys(config.alias).forEach(function(key) {
    assert(Array.isArray(config.alias[key]),
      "megadoc-plugin-js: OptionError: expected alias '" + key + "' entry to " +
      " be an array, got '" + typeof config.alias[key] + "'."
    );
    config.alias[key].forEach(function(value) {
      assert(typeof value === 'string',
        "megadoc-plugin-js: OptionError: expected alias entry to be a string " +
        ", not '" + typeof value + "' (key '" + key + "')"
      );
    });
  });

  config.tagProcessors = config.tagProcessors || [];
  config.namespaceDirMap = config.namespaceDirMap || {};

  debuglog('\nParsing: %s', filePath);
  debuglog(Array(80).join('-'));

  babel.traverse(ast, {
    enter: function(path) {
      var commentPool;

      // Comments at the Program scope:
      if (t.isProgram(path.node) && path.node.innerComments && path.node.innerComments.length) {
        commentPool = path.node.innerComments;
      }
      else if (path.node.leadingComments && path.node.leadingComments.length) {
        commentPool = path.node.leadingComments;
      }

      if (commentPool) {
        // Handle an edge-case with babel against ES6 destructured identifiers;
        // it seems to attach the leading comments to both the VariableDeclaration
        // node as well as the first identifier inside of it, so for the following
        // snippet:
        //
        //     /**
        //      * @module
        //      */
        //      var { Assertion } = require('chai');
        //
        // leadingComments will be set both on VariableDeclaration as well as
        // Identifier(Assertion).
        //
        // We'll handle the VariableDeclaration and forget about the
        // destructured variable identifier altogether.
        if (isCommentedDestructuredProperty(path)) {
          return false;
        }

        commentPool.forEach(function(commentNode) {
          var comment = commentNode.value;

          if (comment[0] === '*') {
            if (!parser.parseComment(comment, path, path.node, config, filePath, absoluteFilePath)) {
              return false;
            }
          }
        });
      }
    },

    ExpressionStatement: function(path) {
      var node = path.node;
      var doc, name, expr;

      // module.exports = Something;
      if (t.isAssignmentExpression(node.expression) && ASTUtils.isModuleExports(node.expression)) {
        expr = node.expression;
        name = ASTUtils.getVariableNameFromModuleExports(expr);

        if (!name && config.inferModuleIdFromFileName) {
          name = ASTUtils.getVariableNameFromFilePath(filePath);
        }

        if (name) {
          doc = parser.registry.get(name, filePath);

          if (doc) {
            var modulePath = ASTUtils.findNearestPathWithComments(doc.$path);

            doc.markAsExported();
            parser.registry.trackModuleDocAtPath(doc, modulePath);
          }
        }
        else {
          console.warn(
            'Unable to identify exported module id. ' +
            'This probably means you are using an unnamed `module.exports`.' +
            ' (source: %s)',
            ASTUtils.dumpLocation(expr, filePath)
          );

          debuglog('Offending code block:\n%s', babel.transformFromAst(expr).code);
        }
      }
    },
  });
};

Ppt.seal = function(config) {
  PostProcessor.run(this.registry, config);
};

Ppt.toJSON = function() {
  return this.registry.docs.map(function(doc) {
    return doc.toJSON();
  });
};

Ppt.parseComment = function(comment, path, contextNode, config, filePath, absoluteFilePath) {
  var nodeInfo, doc;
  var docstring = new Docstring('/*' + comment + '*/', config, absoluteFilePath);

  if (docstring.isInternal()) {
    return false;
  }

  if (docstring.doesLend()) {
    this.registry.trackLend(docstring.getLentTo(), path);
  }

  runAllSync(config.docstringProcessors || [], [ docstring ]);

  nodeInfo = NodeAnalyzer.analyze(contextNode, path, filePath, config);

  doc = new Doc(docstring, nodeInfo, filePath, absoluteFilePath);

  if (config.alias.hasOwnProperty(doc.id)) {
    config.alias[doc.id].forEach(doc.addAlias.bind(doc));
  }

  docstring.tags.forEach(function(tag) {
    runAllSync(config.tagProcessors || [], [ tag ]);
  });

  if (doc.id) {
    if (doc.isModule()) {
      var modulePath = ASTUtils.findNearestPathWithComments(path);

      // console.log('\tFound a module "%s" (source: %s)', doc.id, nodeInfo.fileLoc);

      this.registry.addModuleDoc(doc, modulePath, filePath);
    }
    else {
      this.registry.addEntityDoc(doc, path);

      // console.log('\tFound an entity "%s" belonging to "%s" (source: %s)',
      //   doc.id,
      //   doc.getReceiver(),
      //   nodeInfo.fileLoc
      // );
    }
  }

  return true;
};

function isCommentedDestructuredProperty(path) {
  return (
    t.isIdentifier(path.node) &&
    path.node.leadingComments &&
    path.parentPath &&
    t.isVariableDeclarator(path.parentPath) &&
    path.parentPath.parentPath &&
    t.isVariableDeclaration(path.parentPath.parentPath) &&
    path.parentPath.parentPath.node.leadingComments &&
    path.parentPath.parentPath.node.leadingComments[0] === path.node.leadingComments[0]
  );
}

module.exports = Parser;