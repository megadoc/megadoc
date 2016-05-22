var DocUtils = require('./DocUtils');
var K = require('./constants');

function DocTypeInfo(doc) {
  var typeInfo = {};

  typeInfo.name = DocUtils.getTypeNameOf(doc);
  typeInfo.nodeType = doc.nodeInfo.ctx.type;

  if (typeInfo.nodeType === K.TYPE_LITERAL) {
    typeInfo.value = doc.nodeInfo.ctx.value;
  }
  else if (typeInfo.nodeType === K.TYPE_FUNCTION) {
    // forget it if it was overridden to a different type
    if (typeInfo.name === K.TYPE_FUNCTION) {
      aggregateFunctionDetails(typeInfo, doc);
    }
    else {
      console.log('here: "function(%s)" was overridden to "%s"', doc.id, typeInfo.name)
    }
  }

  return typeInfo;
}

function aggregateFunctionDetails(map, doc) {
  map.params = [];

  var paramTags = doc.docstring.tags.filter(function(tag) { return tag.type === 'param' });
  var paramNodes = doc.nodeInfo.ctx.params;
  var identicalAnnotation = paramNodes.length === paramTags.length;

  paramTags.forEach(function(tag, index) {
    var name = tag.typeInfo.name;

    if (identicalAnnotation && !name) {
      name = paramNodes[index].name;
    }

    if (!name) {
      console.warn(
        "Parameter name is missing. This style is supported only if the number" +
        "of parameters in the documentation match the number of parameters " +
        "the function accepts."
      );

      name = '<<unknown>>';
    }

    var node = paramNodes.filter(function(x) { return x.name === name; })[0];

    map.params.push({
      name: name,
      type: tag.typeInfo.type,
      defaultValue: tag.typeInfo.defaultValue || (node && node.defaultValue)
    });
  });
}

module.exports = DocTypeInfo;