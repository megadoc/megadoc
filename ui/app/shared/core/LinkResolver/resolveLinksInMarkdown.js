var TINY_PATH_MATCHER = /\[([^\]]+)\]\((tiny:\/\/[^\)]+)\)/g;
var SHORTCUT_MATCHER = /\[([^\]]+)\]\(\)/g;

function resolveLinksInMarkdown(docstring, resolveEntity) {
  return docstring
    // resolve any link whose URI starts with tiny://
    .replace(TINY_PATH_MATCHER, function(original, linkTitle, objectPath) {
      var href = resolveEntity(objectPath.replace('tiny://', ''));

      if (href) {
        return `[${linkTitle}](${href})`;
      }
      else {
        console.warn('Unable to resolve link to object: ' + objectPath);
        return `[${linkTitle}]`;
      }
    })

    // resolve links with no URI; the title is the path to the object, e.g.:
    //     [XHRPaginator]()
    .replace(SHORTCUT_MATCHER, function(original, objectPath) {
      var href = resolveEntity(objectPath);

      if (href) {
        return `[${href.title || objectPath}](${href.href})`;
      }
      else {
        console.warn('Unable to resolve link to object: ' + objectPath);
        return `[${objectPath}]`;
      }
    })
  ;
};

module.exports = resolveLinksInMarkdown;