var NO_DESCRIPTION_TAGS = require('./constants').NO_DESCRIPTION_TAGS;

module.exports = function(commentNode, id, tags) {
  var description = String(commentNode.description || '').trim();

  return tags
    .filter(function(x) { return x.type in NO_DESCRIPTION_TAGS })
    .reduce(function(buffer, x) {
      return buffer + x.string.trim();
    }, description)
  ;
};