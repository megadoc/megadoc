const K = require('../constants');
const APPL_SEP = ' | '
const APPL_START = '.&lt;'
const APPL_END   = '&gt;'

module.exports = ({ html, expandFunctionSignatures }) => function renderType(type) {
  if (!type) {
    return '';
  }

  const displayNameOf = x => html && x.html || x.name;
  const displayName = displayNameOf(type);
  const renderFunctionParam = param => (
    displayNameOf(param)
  )

  if (type.name === K.TYPE_UNION) {
    return type.elements.map(renderType).join(APPL_SEP);
  }
  else if (type.name === K.TYPE_ARRAY && type.elements) {
    return `Array${APPL_START}` + type.elements.map(renderType).join(APPL_SEP) + APPL_END;
  }
  else if (type.name && type.elements) {
    return `${displayName}${APPL_START}${type.elements.map(renderType).join(APPL_SEP)}${APPL_END}`;
  }
  // function with params and return type
  else if (expandFunctionSignatures && type.name === K.TYPE_FUNCTION && type.params && type.returnType) {
    return `(${type.params.map(renderFunctionParam).join(', ')}) -> ${displayNameOf(type.returnType)}`
  }
  // function with return type only
  else if (expandFunctionSignatures && type.name === K.TYPE_FUNCTION && type.returnType) {
    return `() -> ${displayNameOf(type.returnType)}`
  }
  // function with params only
  else if (expandFunctionSignatures & type.name === K.TYPE_FUNCTION && type.params) {
    return `(${type.params.map(renderFunctionParam).join(', ')}) -> ?`
  }
  else if (type.name === K.TYPE_ALL_LITERAL) {
    return '*';
  }

  var buffer = displayName;

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