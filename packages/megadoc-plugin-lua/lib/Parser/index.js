var parser = require('luaparse');
var fs = require('fs');
var _ = require('lodash');
var assign = _.assign;
var findWhere = _.findWhere;
var Docstring = require('megadoc-docstring');
var parseNode = require('./parseNode');

var docstringParser = new Docstring.Parser();

docstringParser.defineTag('author', 'withName');
docstringParser.defineTag('class', 'withName');
docstringParser.defineTag('copyright', 'withName');
docstringParser.defineTag('example', 'withName');
docstringParser.defineTag('field', 'withName');
docstringParser.defineTag('function', 'withName');
docstringParser.defineTag('module', 'withName');
docstringParser.defineTag('name', 'withName');
docstringParser.defineTag('param', 'withNameAndType');
docstringParser.defineTag('property', 'withNameAndType');
docstringParser.defineTag('release', 'withName');
docstringParser.defineTag('return', 'withNameAndType');
docstringParser.defineTag('see', 'withName');
docstringParser.defineTag('tparam', 'withName');
docstringParser.defineTag('treturn', 'withName');
docstringParser.defineTag('usage', 'withName');

exports.parseFile = function(filePath, config) {
  var sourceCode = fs.readFileSync(filePath, 'utf-8');

  return exports.parseString(sourceCode, config);
};

exports.parseString = function(sourceCode, config) {
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

    if (commentNode.raw.match(/^\-\-\s+vim:/)) {
      return set;
    }
    else if (node) {
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

      var docstring;

      try {
        docstring = docstringParser.parseComment(comment, {
          strict: config.strict
        });
      }
      catch (e) {
        console.error("Unable to parse comment docstring:", comment.slice(0, 80));
        console.error(e && e.message || e);

        return;
      }

      var nodeInfo = parseNode(node, config);

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
