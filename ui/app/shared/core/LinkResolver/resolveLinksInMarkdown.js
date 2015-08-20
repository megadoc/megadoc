var SHORTCUT_MATCHER = /\[([^\]]+)\]\(\)/g;
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

      if (link) {
        return `[${renderTitle(link.title || objectPath)}](${link.href})`;
      }
      else {
        console.warn('Unable to resolve link to object: ' + objectPath);
        return `[${objectPath}]`;
      }
    })
  ;
}

module.exports = resolveLinksInMarkdown;