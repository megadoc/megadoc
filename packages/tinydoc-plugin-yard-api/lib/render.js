var isAPIObject = require('./utils').isAPIObject;
var isAPIEndpoint = require('./utils').isAPIEndpoint;

var RUBY_BUILTIN_TYPES = [
  'Object',
  'Hash',
  'Numeric',
  'String',
  'Number',
  'Fixnum',
  'Boolean',
  'Integer',
];

function renderResource(node, md, linkify) {
  var doc = node.properties;

  doc.text = md(linkify(doc.text, { contextNode: node }));

  node.entities.filter(isAPIObject).forEach(function(childNode) {
    renderObject(childNode, md, linkify, node);
  });

  node.entities.filter(isAPIEndpoint).forEach(function(childNode) {
    renderEndpoint(childNode, md, linkify, node);
  });
}

function renderObject(node, md, linkify, parentNode) {
  var doc = node.properties;
  doc.text = md(linkify(doc.text, { contextNode: parentNode }));
}

function renderEndpoint(node, md, linkify, parentNode) {
  var doc = node.properties;

  doc.text = md(linkify(doc.text, { contextNode: node }));
  doc.tags.forEach(function(tagDoc) {
    renderEndpointTag(tagDoc, md, linkify, node);
  });
}

function renderEndpointTag(tag, md, linkify, parentNode) {
  var CODE_TAGS = [ 'example_request', 'example_response' ];
  var tagName = tag.tag_name;

  if (CODE_TAGS.indexOf(tagName) > -1) {
    var srcText = '```javascript\n'+tag.text+'\n```';
    tag.text = md(linkify(srcText, { contextNode: parentNode }));
  }
  else if ([ 'argument' ].indexOf(tagName) > -1) {
    tag.text = md(linkify(tag.text, { contextNode: parentNode }));
    tag.types = tag.types.map(function(type) {
      return linkType(TypeInfo(type), parentNode);

      // var typeStr = type;
      // var isArray;

      // if (typeStr.match(/^Array\<(.*)\>$|^(.*)\[\]$/)) {
      //   typeStr = RegExp.$1 || RegExp.$2;
      //   isArray = true;
      // }

      // if (RUBY_BUILTIN_TYPES.indexOf(typeStr) > -1) {
      //   return type;
      // }

      // var linkedStr = md(
      //   linkify('['+typeStr+']()', {
      //     contextNode: parentNode,
      //     options: { useOriginalTitle: true }
      //   }),
      //   { trimHTML: true }
      // );

      // if (isArray) {
      //   linkedStr = 'Array&lt;' + linkedStr + '&gt;';
      // }

      // return linkedStr;
    });
  }
  else if (tagName === 'returns') {
    if (tag.text[0] === '{' && tag.text[tag.text.length-1] === '}') {
      tag.types = [
        linkType( TypeInfo(tag.text.slice(1,-1)), parentNode )
      ];
    }
  }

  function linkType(typeInfo, contextNode) {
    var link = typeInfo.name;

    if (RUBY_BUILTIN_TYPES.indexOf(typeInfo.name) === -1) {
      link = md(
        linkify('[' + typeInfo.name + ']()', {
          contextNode: contextNode,
          options: { useOriginalTitle: true }
        }),
        { trimHTML: true }
      );
    }

    if (typeInfo.isArray) {
      return 'Array.&lt;' + link + '&gt;';
    }
    else {
      return link;
    }
  }
}

module.exports = function(database, md, linkify) {
  database.documents.forEach(function(node) {
    renderResource(node, md, linkify);
  });
};

function TypeInfo(docstring) {
  var isArray;
  var typeStr;

  if (docstring.match(/^Array\<(.*)\>$|^(.*)\[\]$/)) {
    typeStr = RegExp.$1 || RegExp.$2;
    isArray = true;
  }
  else {
    typeStr = docstring;
  }

  return {
    name: typeStr,
    isArray: isArray
  };
}