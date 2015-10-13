module.exports = function(src) {
  var lines = src.split('\n');

  var padding = Math.min.apply(Math,
    lines
      .map(function(line) { return line.search(/\S/); })
      .filter(function(cursor) { return cursor > -1; })
  );

  if (padding > 0) {
    return lines.map(function(line) {
      return line.substr(padding);
    }).join('\n')
  }
  else {
    return src;
  }
};