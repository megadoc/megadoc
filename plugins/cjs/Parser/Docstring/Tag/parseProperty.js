var TYPE_SPLITTER = /,|\|/

function parseProperty(docstring) {
  var typeInfo = {};

  var STATE_PARSING_NONE = 0;
  var STATE_PARSING_TYPE = 1;
  var STATE_PARSING_NAME = 2;
  var STATE_PARSING_DEFAULT_VALUE = 3;
  var STATE_PARSING_DESCRIPTION = 4;
  var state = STATE_PARSING_NONE;

  var typeStr;
  var nameStr;
  var descStr;

  docstring.split('').forEach(function(char) {
    switch (state) {
      case STATE_PARSING_NONE:
        if (char === '{') {
          typeStr = '';
          state = STATE_PARSING_TYPE;
        }
        else if (char === '\n') {
          state = STATE_PARSING_DESCRIPTION;
        }
        else if (char !== ' ') {
          nameStr = char;
          state = STATE_PARSING_NAME;
        }

        break;

      case STATE_PARSING_TYPE:
        if (char === '}') {
          state = STATE_PARSING_NAME;
          nameStr = '';
        }
        else if (char !== '{') {
          typeStr += char;
        }

        break;

      case STATE_PARSING_NAME:
        if (char === '[') {
          typeInfo.isOptional = true;
        }
        else if (char === '=') {
          state = STATE_PARSING_DEFAULT_VALUE;
          typeInfo.defaultValue = '';
        }
        else if (char === '\n') {
          state = STATE_PARSING_DESCRIPTION;
        }
        else if (char !== ']') {
          nameStr += char;
        }

        break;

      case STATE_PARSING_DEFAULT_VALUE:
        if (char === '\n') {
          state = STATE_PARSING_DESCRIPTION;
        }
        else if (char !== ']') {
          typeInfo.defaultValue += char;
        }
        break;

      case STATE_PARSING_DESCRIPTION:
        if (!descStr) {
          descStr = '';
        }

        descStr += char;

        break;
    }
  });

  if (typeStr) {
    typeInfo.types = typeStr.split(TYPE_SPLITTER);
  }
  else {
    typeInfo.types = [];
  }

  typeInfo.name = nameStr && nameStr.trim().length > 0 ?
    nameStr.trim() :
    null
  ;

  typeInfo.description = descStr || null;

  return typeInfo;
}

module.exports = parseProperty;