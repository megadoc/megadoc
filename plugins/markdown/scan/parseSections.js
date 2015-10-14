var RE_EXTRACT_TITLE = /^(#{2,3})\s+([^\n]+)|^([^\n]+)\n([\-]{3,})\n/gm;

var markdownToText = require('../../../lib/utils/markdownToText');
var normalizeHeading = require('../../../lib/Renderer/Utils').normalizeHeading;

function parseSections(article) {
  var sections = [];

  article.replace(RE_EXTRACT_TITLE, function(match, hLevel, hTitle, sTitle, sSymbol) {
    var title, level;

    if (hLevel && hTitle) {
      level = hLevel.length;
      title = hTitle;
    }
    else if (sTitle && sSymbol) {
      title = sTitle;
      level = 2;
    }

    if (title && level) {
      var plainTitle = markdownToText(title);

      sections.push({
        id: normalizeHeading(plainTitle),
        level: level,
        title: title,
        plainTitle: plainTitle,
      });
    }

    return match;
  });

  return sections;
}

module.exports = parseSections;