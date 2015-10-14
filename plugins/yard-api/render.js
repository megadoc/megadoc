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

function renderResource(doc, md, linkify) {
  doc.text = md(linkify(doc.text, doc.id));

  doc.objects.forEach(function(childDoc) {
    renderObject(childDoc, md, linkify, doc.id);
  });

  doc.endpoints.forEach(function(childDoc) {
    renderEndpoint(childDoc, md, linkify, doc.id);
  });
}

function renderObject(doc, md, linkify, parentId) {
  doc.text = md(linkify(doc.text, parentId));
}

function renderEndpoint(doc, md, linkify, parentId) {
  doc.text = md(linkify(doc.text, parentId));

  doc.tags.forEach(function(tagDoc) {
    renderEndpointTag(tagDoc, md, linkify, parentId);
  });
}

function renderEndpointTag(tag, md, linkify, parentId) {
  var CODE_TAGS = [ 'example_request', 'example_response' ];

  if (CODE_TAGS.indexOf(tag.tag_name) > -1) {
    var srcText = '```javascript\n'+tag.text+'\n```';
    tag.text = md(linkify(srcText, parentId));
  }
  else if (tag.tag_name === 'argument') {
    tag.text = md(linkify(tag.text, parentId));
    tag.types = tag.types.map(function(type) {
      var typeStr = type;
      var isArray;

      if (typeStr.match(/^Array\<(.*)\>$|^(.*)\[\]$/)) {
        typeStr = RegExp.$1 || RegExp.$2;
        isArray = true;
      }

      if (RUBY_BUILTIN_TYPES.indexOf(typeStr) > -1) {
        return type;
      }

      var linkedStr = md(
        linkify('['+typeStr+']()', parentId, { useOriginalTitle: true }),
        { trimHTML: true }
      );

      if (isArray) {
        linkedStr = 'Array&lt;' + linkedStr + '&gt;';
      }

      console.log('Linkifying "%s" => "%s"', type, linkedStr);

      return linkedStr;
    });
  }
}

module.exports = function(database, md, linkify) {
  database.forEach(function(doc) {
    renderResource(doc, md, linkify);
  });
};