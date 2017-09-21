var fs = require('fs');
var nodejsPath = require('path');
var ASTUtils = require('./ASTUtils');
var Doc = require('./Doc');
var Docstring = require('./Docstring');
var Registry = require('./Registry');
var analyzeNode = require('./NodeAnalyzer__analyzeNode');
var NodeInfo = require('./NodeAnalyzer__NodeInfo');
var pick = require('lodash').pick;
var assign = require('lodash').assign;
var babel = require('babel-core');
var t = require('babel-types');
const { dumpLocation } = ASTUtils
const debugLog = function() {
  if (process.env.MEGADOC_DEBUG === '1') {
    console.log.apply(console, arguments)
  }
}

function Parser() {
  this.registry = new Registry();
}

Parser.prototype.parseFile = function(filePath, config) {
  try {
    this.parseString(
      fs.readFileSync(filePath, 'utf-8'),
      config,
      filePath
    );
  }
  catch(e) {
    console.error('Failed to parse ' + filePath);
    throw e;
  }
};

Parser.prototype.parseString = function(str, config, filePath) {
  if (str.length > 0) {
    try {
      if (config.parse) {
        this.ast = config.parse(str, filePath);
      }
      else {
        this.ast = babel.transform(str, assign({
          filename: filePath,
          code: true,
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
        console.warn("%s: File could not be parsed, most likely due to a SyntaxError.", filePath);
        console.warn(e && e.stack || e);

        return;
      }
    }
  }
};

function getCommentPool(path) {
  var commentPool;

  // Comments at the Program scope:
  if (t.isProgram(path.node) && path.node.innerComments && path.node.innerComments.length) {
    commentPool = path.node.innerComments;
  }
  else if (t.isProgram(path.node) && path.node.body.leadingComments && path.node.body.leadingComments.length) {
    commentPool = path.node.body.leadingComments;
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
      debugLog('Ignoring comment pool on destructured property at %s', dumpLocation(path.node, 'line'))
      return;
    }

    const withoutDuplicates = discardDuplicateComments(commentPool)

    if (withoutDuplicates.length !== commentPool.length) {
      debugLog('Discarded %d comments identified as duplicate', commentPool.length - withoutDuplicates.length)
    }

    return withoutDuplicates.map(x => x.value);
  }
}

Parser.prototype.walk = function(ast, inConfig, filePath) {
  var parser = this;
  var config = pick(inConfig, [
    'inferModuleIdFromFileName',
    'inferNamespaces',
    'nodeAnalyzers',
    'docstringProcessors',
    'tagProcessors',
    'tagAliases',
    'customTags',
    'namespaceDirMap',
    'moduleMap',
    'alias',
    'namedReturnTags',
    'strict',
    'verbose',
  ]);

  if (process.env.MEGADOC_DEBUG === '1') {
    debugLog('\nParsing: %s', filePath);
    debugLog(Array(80).join('-'));
  }

  babel.traverse(ast, {
    enter: function(path) {
      var commentPool = getCommentPool(path);

      if (commentPool) {
        commentPool.forEach(function(comment, index) {
          if (comment[0] === '*') {
            debugLog('Found a docstring comment at %s', dumpLocation(path.node, 'line'));

            parser.parseComment(comment, path, config, filePath, index === commentPool.length-1);
          }
          else {
            debugLog('Ignoring comment since it does not start with /** at line %s', dumpLocation(path.node, 'line'))
          }
        });
      }
    },

    ExpressionStatement: function(path) {
      var node = path.node;
      var doc, name, expr;

      // module.exports = Something;
      if (t.isAssignmentExpression(node.expression) && ASTUtils.isModuleExports(node.expression)) {
        debugLog('Found "module.exports" at %s to be used as a module document', dumpLocation(node.expression, 'line'))

        expr = node.expression;
        name = ASTUtils.getVariableNameFromModuleExports(expr);

        if (!name && config.inferModuleIdFromFileName) {
          name = ASTUtils.getVariableNameFromFilePath(filePath);

          debugLog('  - Inferred module name from file name: "%s"', name)
        }

        if (name) {
          doc = parser.registry.get(name, filePath);

          debugLog('  - Module name: "%s"', name)

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
            dumpLocation(expr, filePath)
          );
        }
      }
    },
  });
};

Parser.prototype.toJSON = function() {
  const { registry } = this;

  // We don't care about modules that @lend
  const withoutLends = registry.docs.filter(doc => !doc.docstring.doesLend())

  if (process.env.MEGADOC_DEBUG === '1' && withoutLends.length !== registry.docs.length) {
    const lends = registry.docs.filter(doc => doc.docstring.doesLend())

    debugLog(`Discarding ${lends.length} @lend documents:`)

    lends.forEach(doc => {
      debugLog(` - %s (at %s)`, doc.id, dumpLocation(doc.$path.node, 'line'))
    });
  }

  debugLog('%d documents found in file', withoutLends.length)

  return withoutLends.map(doc => doc.toJSON(registry));
};

Parser.prototype.parseComment = function(comment, path, config, filePath, isClosestToNode) {
  var contextNode = path.node;
  var nodeLocation = dumpLocation(contextNode, filePath);

  var docstring = new Docstring(comment === null ? '' : '/*' + comment + '*/', {
    config: config,
    filePath: filePath,
    nodeLocation: nodeLocation,
    ignoreCommentParseError: comment === null,
  });

  if (docstring.isInternal()) {
    debugLog('Discarding @internal document:', dumpLocation(path.node, 'line'))
    return false;
  }

  if (docstring.doesLend()) {
    this.registry.trackLend(docstring.getLentTo(), path);
  }

  var predefinedNamespace = getPredefinedNamespace(config, docstring, filePath);

  if (predefinedNamespace) {
    if (docstring.namespace) {
      console.warn("%s: Ignoring pre-defined namespace '%s' for module as it already specifies one ('%s').",
        nodeLocation,
        predefinedNamespace,
        docstring.namespace
      );
    }
    else {
      docstring.namespace = predefinedNamespace;
    }
  }

  var nodeInfo;

  if (isClosestToNode) {
    nodeInfo = analyzeNode(contextNode, path, filePath, config);
  }
  else {
    nodeInfo = new NodeInfo(contextNode, filePath);
  }

  var doc = new Doc(docstring, nodeInfo, filePath);

  if (doc.id) {
    // Pre-defined aliases:
    if (config.alias.hasOwnProperty(doc.id)) {
      config.alias[doc.id].forEach(function(alias) {
        doc.docstring.addAlias(alias);
      });
    }

    if (doc.isModule()) {
      var modulePath = ASTUtils.findNearestPathWithComments(path);

      if (config.verbose) {
        console.info('[info] Found a module "%s" (source: %s)', doc.id, nodeLocation);
      }

      this.registry.addModuleDoc(doc, modulePath, filePath);
    }
    else {
      this.registry.addEntityDoc(doc, path);

      if (config.verbose) {
        console.info('[info] Found an entity "%s" belonging to "%s" (source: %s)',
          doc.id,
          doc.nodeInfo.receiver || '<<unknown>>',
          nodeLocation
        );
      }
    }

    doc.getTypeDefs().forEach(typeDefDoc => {
      this.registry.addEntityDoc(typeDefDoc, path);
    })
  }
  else {
    console.warn("%s: No identifier was found for this document, it will be ignored!",
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

function discardDuplicateComments(commentPool) {
  const uniqueComments = commentPool.reduce((map, comment) => {
    const locString = String(comment.start) + ',' + String(comment.end);

    if (!map[locString]) {
      map[locString] = [];
    }

    map[locString].push(comment);

    return map;
  }, {});

  return Object.keys(uniqueComments).map(function(key) {
    return uniqueComments[key][uniqueComments[key].length-1];
  });
}

module.exports = Parser;