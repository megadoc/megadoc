var escapeHTML = require('lodash').escape;
var RE_INTERNAL_LINK = Object.freeze(/^mega:\/\//);

function LinkRenderer(config) {
  return function renderLink(srcHref, title, text) {
    var href = srcHref.replace(RE_INTERNAL_LINK, '');
    var isInternal = href !== srcHref;
    var tagString = '<a href="' + href + '"';

    if (title) {
      tagString += ' title="' + escapeHTML(title) + '"';
    }

    if (isInternal) {
      if (href.length) {
        tagString += ' class="mega-link--internal"';
      }
      else {
        tagString += ' class="mega-link--internal mega-link--broken"';
      }
    }

    if (!isInternal && href[0] !== '#' && config.launchExternalLinksInNewTabs) {
      tagString += ' target="_blank"';
    }

    return tagString + '>' + text + '</a>';
  };
}

module.exports = LinkRenderer;