var fs = require('fs');
var assert = require('assert');
var nodejsPath = require('path');
var Utils = require('./Utils');
var Doc = require('./Doc');
var Docstring = require('./Docstring');
var Registry = require('./Registry');
var PostProcessor = require('./PostProcessor');
var NodeAnalyzer = require('./NodeAnalyzer');
var WeakSet = require('weakset');
var pick = require('lodash').pick;
var assign = require('lodash').assign;
var debuglog = require('tinydoc/lib/Logger')('tinydoc').info;
var babel = require('babel-core');
var t = require('babel-types');

var runAllSync = require('../utils/runAllSync');

function Parser() {
  this.registry = new Registry();

  // @type {WeakSet<n.CommentNode>}
  //
  // This is necessary to track the comment nodes we visited because we might
  // "force" a traversal of comments in the case of expression statements (so
  // that the comments are parsed before actual module definitions)
  //
  // If we don't do this, we need to make multiple passes over the AST so meh.
  this.visitedComments = new WeakSet();
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
        comments: true
      }, config.parserOptions)).ast;
    }

    this.walk(this.ast, config, filePath, absoluteFilePath);
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
  ]);

  Object.keys(config.alias).forEach(function(key) {
    assert(Array.isArray(config.alias[key]),
      "tinydoc-plugin-js: OptionError: expected alias '" + key + "' entry to " +
      " be an array, got '" + typeof config.alias[key] + "'."
    );
    config.alias[key].forEach(function(value) {
      assert(typeof value === 'string',
        "tinydoc-plugin-js: OptionError: expected alias entry to be a string " +
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

      if (t.isProgram(path.node) && path.node.innerComments && path.node.innerComments.length) {
        commentPool = path.node.innerComments;
      }

      else if (path.node.leadingComments && path.node.leadingComments.length) {
        commentPool = path.node.leadingComments;
      }

      if (commentPool) {
        if (parser.visitedComments.has(path)) {
          // console.log('Comment walker: already seen this node, ignoring.');
          return false;
        }

        parser.visitedComments.add(path);

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
      var doc, name;

      if (node.comments) {
        this.visit(path.get('comments'));
      }

      if (t.isAssignmentExpression(node.expression)) {
        var expr = node.expression;

        // module.exports = Something;
        if (Utils.isModuleExports(expr)) {
          name = Utils.getVariableNameFromModuleExports(expr);

          if (!name && config.inferModuleIdFromFileName) {
            name = Utils.getVariableNameFromFilePath(filePath);
          }

          if (name) {
            doc = parser.registry.get(name, filePath);

            if (doc) {
              var modulePath = Utils.findNearestPathWithComments(doc.$path);

              doc.markAsExported();
              parser.registry.trackModuleDocAtPath(doc, modulePath);
            }
          }
          else {
            console.warn(
              'Unable to identify exported module id. ' +
              'This probably means you are using an unnamed `module.exports`.' +
              ' (source: %s)',
              Utils.dumpLocation(expr, filePath)
            );

            debuglog('Offending code block:\n%s', babel.transformFromAst(expr).code);
          }
        }
      }
    },
  });
};

Ppt.seal = function() {
  PostProcessor.run(this.registry);
};

Ppt.toJSON = function() {
  return this.registry.docs.map(function(doc) {
    return doc.toJSON();
  });
};

Ppt.parseComment = function(comment, path, contextNode, config, filePath, absoluteFilePath) {
  var nodeInfo, doc;

  var docstring = new Docstring('/*' + comment + '*/', config.customTags, absoluteFilePath);

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
      var modulePath = Utils.findNearestPathWithComments(path);

      if (!docstring.namespace) {
        var dirName = nodejsPath.dirname(filePath);

        Object.keys(config.namespaceDirMap).some(function(pattern) {
          if (dirName.match(pattern)) {
            // gotta <3 mutable state.. :)
            docstring.overrideNamespace(config.namespaceDirMap[pattern]);
            doc.id = doc.generateId();
            doc.name = doc.generateName();

            return true;
          }
        });
      }

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

module.exports = Parser;