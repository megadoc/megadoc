var SHORTCUT_MATCHER = /[^\\]\[([^\]]+)\]\(\)/g;
var ESCAPED_MATCHER = /[\\]\[([^\]]+)\]\(\)/g;
var config = require('config');

var renderTitle = function(rawTitle) {
  var title = rawTitle;

  if (!config.useHashLocation) {
    title = `tiny://${title}`;
  }

  return title;
};

function resolveLinksInMarkdown(docstring, resolveEntity, context) {
  return docstring
    // resolve links with no URI; the title is the path to the object, e.g.:
    //
    //     [XHRPaginator]()
    //     [XHRPaginator#method]()
    //     [XHRPaginator@prop]()
    //     [XHRPaginator.staticMethod]()
    .replace(SHORTCUT_MATCHER, function(original, path) {
      var customTitle, objectPath;

      if (path.indexOf(' ') > -1) {
        var fragments = path.split(' ');
        objectPath = fragments.shift();
        customTitle = fragments.join(' ');
      }
      else {
        objectPath = path;
      }

      var link = resolveEntity(objectPath, context);
      var prefixChar = original[0];

      if (link) {
        var title = customTitle || link.title || objectPath;
        return prefixChar + `[${renderTitle(title)}](${link.href})`;
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