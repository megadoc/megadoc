var parser = require('luaparse');
var fs = require('fs');
var _ = require('lodash');
var assign = _.assign;
var findWhere = _.findWhere;
var Docstring = require('megadoc-docstring');
var parseNode = require('./parseNode');

var docstringParser = new Docstring.Parser();

docstringParser.defineTag('module', 'withName');
docstringParser.defineTag('param', 'withNameAndType');
docstringParser.defineTag('return', 'withNameAndType');
docstringParser.defineTag('example', 'withName');
docstringParser.defineTag('property', 'withNameAndType');

exports.parseFile = function(filePath) {
  var sourceCode = fs.readFileSync(filePath, 'utf-8');

  return exports.parseString(sourceCode);
};

exports.parseString = function(sourceCode) {
  var docs = [];
  var lineNodes = {};

  var ast = parser.parse(sourceCode, {
    comments: true,
    scope: true,
    locations: true,
    onCreateNode: function(node) {
      if (node.type !== 'Chunk' && node.type !== 'Comment') {
        lineNodes[node.loc.start.line] = node;
      }
    }
  });

  var commentedNodes = ast.comments.reduce(function(set, commentNode) {
    var commentLine = commentNode.loc.start.line;
    var node;

    Object.keys(lineNodes).some(function(line) {
      if (commentLine < line) {
        node = lineNodes[line];
        return true;
      }
    });

    if (node) {
      node.comments = node.comments || [];
      node.comments.push(commentNode.value);

      if (set.indexOf(node) === -1) {
        set.push(node);
      }
    }
    else {
      console.warn('Unable to find a matching node for comment:', commentNode.raw)
    }

    return set;
  }, []);

  commentedNodes.forEach(function(node) {
    if (node.comments[0][0] === '-') {
      var comment = node.comments.map(function(line) {
        return line.replace(/^\-?\s?/, '');
      }).join('\n');

      var docstring = docstringParser.parseComment(comment);
      var nodeInfo = parseNode(node);

      assign(docstring, nodeInfo);

      var moduleTag = findWhere(docstring.tags, { type: 'module' });
      if (moduleTag) {
        docstring.isModule = true;

        // whatever ID was specified in @module takes precedence over the
        // inferred entity ID
        if (moduleTag.name.length) {
          docstring.id = moduleTag.name;
        }
      }

      // doc path
      if (docstring.isModule) {
        docstring.path = docstring.id;
      }
      else {
        var symbol;

        switch(docstring.ctx.type) {
          case 'function':
            symbol = '#';
            break;
          case 'property':
            symbol = '@';
            break;
          default:
            symbol = '.';
        }

        docstring.symbol = symbol;
        docstring.path = docstring.receiver + symbol + docstring.id;
      }

      docs.push(docstring);
    }
  });

  return docs;
};
