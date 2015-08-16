var RE_EXTRACT_TITLE = /^(#{2,3})\s+([^\n]+)|^([^\n]+)\n([\-]{3,})\n/gm;

function parseSections(article) {
  var sections = [];

  article.replace(RE_EXTRACT_TITLE, function(match, hLevel, hTitle, sTitle, sSymbol) {
    if (hLevel && hTitle) {
      sections.push({
        level: hLevel.length,
        title: hTitle
      });
    }
    else if (sTitle && sSymbol) {
      sections.push({
        level: 2,
        title: sTitle
      });
    }

    return match;
  });

  return sections;
}

module.exports = parseSections;