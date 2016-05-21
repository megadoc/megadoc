const K = require('../constants');

module.exports = function renderType(type) {
  if (!type) {
    console.warn("Invalid type!", (new Error()).trace)
    return '';
  }

  if (type.name === K.TYPE_UNION) {
    return type.elements.map(renderType).join('|');
  }
  else if (type.name === K.TYPE_ARRAY && type.elements) {
    return 'Array.&lt;' + type.elements.map(renderType).join('|') + '&gt;';
  }
  else if (type.name === K.TYPE_ALL_LITERAL) {
    return '*';
  }

  var buffer = type.html || type.name;

  if (type.nullable === false) {
    buffer += '!';
  }

  if (type.nullable === true) {
    buffer += '?';
  }

  if (type.optional) {
    buffer += '=';
  }

  return buffer;
}