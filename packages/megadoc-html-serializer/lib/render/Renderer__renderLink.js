const RE_INTERNAL_LINK = /^mega:\/\//;
const LinkToSelf = 'link-to-self';

function LinkRenderer(config) {
  return function renderLink(srcHref, title, text) {
    var href = srcHref.replace(RE_INTERNAL_LINK, '');
    var isInternal = href !== srcHref;
    var tagString = '<a';

    if (href !== LinkToSelf) {
      tagString += ' href="' + href + '"';
    }

    if (title) {
      tagString += ' title="' + title + '"';
    }

    if (isInternal) {
      if (href === LinkToSelf) {
        tagString += ' class="mega-link--internal mega-link--active"';
      }
      else if (href.length) {
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