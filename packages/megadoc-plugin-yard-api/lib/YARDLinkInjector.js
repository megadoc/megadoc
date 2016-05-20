var RE_YARD_LINK = /\{(API::[\w\_]+)(\[\])?\}|\{Array\.?\<(API::[\w\_]+)\>\}/g;

module.exports = function YARDLinkInjector(text, renderLink) {
  return text.replace(RE_YARD_LINK, function(original, path1, hasBrackets, path2) {
    var path = path1 || path2;
    var isArray = Boolean(hasBrackets || path2);

    return renderLink({
      source: original,
      text: isArray ? (path + '[]') : path,
      title: null,
      path: path
    });
  });
}