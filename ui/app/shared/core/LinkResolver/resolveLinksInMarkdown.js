var SHORTCUT_MATCHER = /[^\\]\[([^\]]+)\]\(\)/g;
var ESCAPED_MATCHER = /[\\]\[([^\]]+)\]\(\)/g;
var config = require('config');

var renderTitle = function(title) {
  return title;
};

if (!config.useHashLocation) {
  renderTitle = function(title) {
    return `tiny://${title}`;
  };
}

function resolveLinksInMarkdown(docstring, resolveEntity, context) {
  return docstring
    // resolve links with no URI; the title is the path to the object, e.g.:
    //
    //     [XHRPaginator]()
    //     [XHRPaginator#method]()
    //     [XHRPaginator@prop]()
    //     [XHRPaginator.staticMethod]()
    .replace(SHORTCUT_MATCHER, function(original, objectPath) {
      var link = resolveEntity(objectPath, context);
      var prefixChar = original[0];

      if (link) {
        return prefixChar + `[${renderTitle(link.title || objectPath)}](${link.href})`;
      }
      else {
        console.warn('Unable to resolve link to object: ' + objectPath);
        return prefixChar + `[${objectPath}]`;
      }
    })
    // any item that was escaped with a "\" like "\[]()" we remove the escaper
    .replace(ESCAPED_MATCHER, function(original) {
      return original.substr(1);
    })
  ;
}

module.exports = resolveLinksInMarkdown;