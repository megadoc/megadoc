var CODE_BLOCK_PADDING = 4;

module.exports = function(src) {
  var lines = src.split('\n');

  var padding;
  var firstNonBlankLine;
  var lineIter, line;

  for (lineIter = 0; lineIter < lines.length; ++lineIter) {
    line = lines[lineIter];

    if (line.trim().length > 0) {
      firstNonBlankLine = line;
      break;
    }
  }

  if (firstNonBlankLine) {
    if (firstNonBlankLine.match(/^(\s+)/)) {
      padding = RegExp.$1.length;

      if (padding > 0 && padding !== CODE_BLOCK_PADDING) {
        return lines.map(function(_line) {
          return _line.substr(padding);
        }).join('\n');
      }
    }
  }

  return src;
};