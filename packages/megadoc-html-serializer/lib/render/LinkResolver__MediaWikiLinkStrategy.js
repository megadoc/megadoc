var RE_MEDIA_WIKI_LINK = /(.?)\[\[((?:.|\s)+?)\]\]/g;
var RE_NEWLINE = /\n/g;
var trim = function(x) {
  return x.trim()
}

var discardNewlines = function(x) {
  return x.replace(RE_NEWLINE, '')
}

// MediaWiki scheme for linking. The syntax is:
//
//     [[Path]]
//     [[Text | Path]]
function MediaWikiLinkInjector(docstring, renderLink) {
  return docstring.replace(RE_MEDIA_WIKI_LINK, function(original, leadingChar, pathFragment) {
    var path, text;

    // ignore links that were escaped by a leading \
    if (leadingChar === '\\') {
      return original.substr(1);
    }

    var pathFragments = pathFragment.split('|');

    if (pathFragments.length > 1)  {
      path = pathFragments.slice(1).map(trim).map(discardNewlines).join('|');
      text = pathFragments[0].trim();
    }
    else {
      path = pathFragment.trim();
    }

    return leadingChar + renderLink({
      source: leadingChar + path,
      text: text || null,
      title: null,
      path: path
    });
  });
}

module.exports = MediaWikiLinkInjector;