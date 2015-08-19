var TINY_PATH_MATCHER = /\[([^\]]+)\]\((tiny:\/\/[^\)]+)\)/g;
var SHORTCUT_MATCHER = /\[([^\]]+)\]\(\)/g;

function resolveLinksInMarkdown(docstring, resolveEntity, context) {
  return docstring
    // resolve links with no URI; the title is the path to the object, e.g.:
    //
    //     [XHRPaginator]()
    //     [XHRPaginator#method]()
    //     [XHRPaginator@prop]()
    //     [XHRPaginator.staticMethod]()
    .replace(SHORTCUT_MATCHER, function(original, objectPath) {
      var href = resolveEntity(objectPath, context);

      if (href) {
        return `[${href.title || objectPath}](${href.href})`;
      }
      else {
        console.warn('Unable to resolve link to object: ' + objectPath);
        return `[${objectPath}]`;
      }
    })
  ;
}

module.exports = resolveLinksInMarkdown;