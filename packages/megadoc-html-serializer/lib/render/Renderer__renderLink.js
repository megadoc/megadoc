const RE_INTERNAL_LINK = /^mega:\/\//;
const LinkToSelf = 'link-to-self';
const generateRelativeHref = require('./generateRelativeHref')
const { NoBrokenLinks } = require('../lintingRules')

const MEGA_LINK = 'mega-link--internal'
const MEGA_LINK_ACTIVE = 'mega-link--active'
const MEGA_LINK_BROKEN = 'mega-link--broken'

function LinkRenderer(config, getContextNode) {
  return function renderLink(href, title, text) {
    const classList = []
    let anchorTarget
    let normalHref = href

    if (!href.match(/^#|(.+):\/\//)) {
      const contextNode = getContextNode()
      const index = config.corpus.resolve({
        text: href,
        contextNode
      })

      if (index) {
        classList.push(MEGA_LINK)

        normalHref = generateRelativeHref(index.node, getContextNode())
      }
      else {
        classList.push(MEGA_LINK)
        classList.push(MEGA_LINK_BROKEN)

        config.linter.logRuleEntry({
          rule: NoBrokenLinks,
          params: {
            path: href,
            text,
            title
          },
          loc: config.linter.locationForNode(contextNode),
        });
      }
    }
    else {
      normalHref = href.replace(RE_INTERNAL_LINK, '');

      // is an internal link
      if (href !== normalHref) {
        classList.push(MEGA_LINK)

        if (LinkToSelf === normalHref) {
          classList.push(MEGA_LINK_ACTIVE)
        }

        if (!normalHref.length) {
          classList.push(MEGA_LINK_BROKEN)
        }
      }
      else {
        if (normalHref[0] !== '#' && config.launchExternalLinksInNewTabs) {
          anchorTarget = '_blank';
        }
      }
    }

    let tagString = '<a';

    tagString += ` href="${normalHref}"`
    tagString += ` class="${classList.join(' ')}"`

    if (title) {
      tagString += ` title="${title}"`;
    }

    if (anchorTarget) {
      tagString += ` target="${anchorTarget}"`
    }

    return tagString + '>' + text + '</a>';
  };
}

module.exports = LinkRenderer;