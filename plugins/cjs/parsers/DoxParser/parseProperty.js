function parseProperty(docstring) {
  var info = {};
  var parsed = ''+docstring.trim();
  var matcher = parsed.match(/{([^}]+)}/);

  if (matcher) {
    parsed = parsed.substr(matcher[0].length).trim();
    info.types = matcher[1].trim().split(',');
  }

  if (parsed[0] === '[') {
    var lastBracketIndex = parsed.split('\n')[0].lastIndexOf(']');

    info.name = parsed.substr(1, lastBracketIndex-1);
    info.optional = true;

    parsed = parsed.substr(info.name.length+2);

    matcher = info.name.match(/([^=]+)=(.+)/);

    if (matcher) {
      info.defaultValue = matcher[2];
      info.name = matcher[1];
    }
  }
  else {
    matcher = parsed.match(/([\S]+)/);
    info.name = matcher[1];
    info.defaultValue = null;
    parsed = parsed.substr(matcher[0].length).trim();
  }

  info.description = parsed;

  return info;
}

module.exports = parseProperty;