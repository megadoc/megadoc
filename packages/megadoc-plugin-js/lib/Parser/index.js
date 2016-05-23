var fs = require('fs');
var nodejsPath = require('path');
var ASTUtils = require('./ASTUtils');
var Doc = require('./Doc');
var Docstring = require('./Docstring');
var Registry = require('./Registry');
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

Ppt.parseFile = function(filePath, config, assetRoot) {
  var relativeFilePath = filePath.indexOf(assetRoot) === 0 ?
    filePath.substr(assetRoot.length) :
    filePath
  ;

  try {
    this.parseString(
      fs.readFileSync(filePath, 'utf-8'),
      config,
      relativeFilePath,
      filePath
    );
  }
  catch(e) {
    console.error('Failed to parse ' + relativeFilePath);
    throw e;
  }
};

Ppt.parseString = function(str, config, filePath, absoluteFilePath) {
  if (str.length > 0) {
    try {
      if (config.parse) {
        this.ast = config.parse(str, absoluteFilePath);
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

      this.walk(this.ast, config, filePath);
    }
    catch (e) {
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

Ppt.walk = function(ast, inConfig, filePath) {
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
        if (ASTUtils.isCommentedDestructuredProperty(path)) {
          return;
        }

        commentPool.forEach(function(commentNode) {
          var comment = commentNode.value;

          if (comment[0] === '*') {
            parser.parseComment(comment, path, path.node, config, filePath);
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

Ppt.toJSON = function() {
  var registry = this.registry;

  return registry.docs.reduce(function(list, doc) {
    // We don't care about modules that @lend
    if (!doc.docstring.doesLend()) {
      list.push(doc.toJSON(registry));
    }

    return list;
  }, []);
};

Ppt.parseComment = function(comment, path, contextNode, config, filePath) {
  var nodeLocation = ASTUtils.dumpLocation(contextNode, filePath);
  var docstring = new Docstring('/*' + comment + '*/', config, nodeLocation);

  if (docstring.isInternal()) {
    return false;
  }

  if (docstring.doesLend()) {
    this.registry.trackLend(docstring.getLentTo(), path);
  }

  var predefinedNamespace = getPredefinedNamespace(config, docstring, filePath);

  if (predefinedNamespace) {
    if (docstring.namespace) {
      console.warn("Ignoring pre-defined namespace '%s' for module as it already specifies one ('%s'). (Source: '%s')",
        predefinedNamespace,
        docstring.namespace,
        nodeLocation
      );
    }
    else {
      docstring.namespace = predefinedNamespace;
    }
  }

  if (config.docstringProcessors && config.docstringProcessors.length) {
    runAllSync(config.docstringProcessors, [ docstring ]);
  }

  var nodeInfo = NodeAnalyzer.analyze(contextNode, path, filePath, config);
  var doc = new Doc(docstring, nodeInfo, filePath);

  // Pre-defined aliases:
  if (config.alias.hasOwnProperty(doc.id)) {
    config.alias[doc.id].forEach(function(alias) {
      doc.docstring.addAlias(alias);
    });
  }

  if (config.tagProcessors && config.tagProcessors.length) {
    docstring.tags.forEach(function(tag) {
      runAllSync(config.tagProcessors, [ tag ]);
    });
  }

  if (doc.id) {
    if (doc.isModule()) {
      var modulePath = ASTUtils.findNearestPathWithComments(path);

      if (process.env.VERBOSE) {
        console.log('\tFound a module "%s" (source: %s)', doc.id, nodeLocation);
      }

      this.registry.addModuleDoc(doc, modulePath, filePath);
    }
    else {
      this.registry.addEntityDoc(doc, path);

      if (process.env.VERBOSE) {
        console.log('\tFound an entity "%s" belonging to "%s" (source: %s)',
          doc.id,
          doc.nodeInfo.receiver || '<<unknown>>',
          nodeLocation
        );
      }
    }
  }
  else {
    console.warn("No identifier was found for this document, it will be ignored! (Source: %s)",
      nodeLocation
    );
  }

  return true;
};

function getPredefinedNamespace(config, docstring, filePath) {
  var namespace;

  if (config.namespaceDirMap) {
    var namespaceDirMap = Object.keys(config.namespaceDirMap);
    var dirName = nodejsPath.dirname(filePath);

    namespaceDirMap.some(function(pattern) {
      if (dirName.match(pattern)) {
        namespace = config.namespaceDirMap[pattern];

        return true;
      }
    });
  }

  return namespace && namespace.length > 0 ? namespace : null;
}

module.exports = Parser;