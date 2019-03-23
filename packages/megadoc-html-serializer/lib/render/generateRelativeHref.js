const URI = require('urijs');
const LinkToSelf = {};

function generateRelativeHref(node, contextNode) {
  const relativeHref = URI(node.meta.href).relativeTo(contextNode.meta.href).toString();

  // handle links to self or links from an entity to parent since the relative
  // href will be empty and will be marked as a broken link when in fact it
  // isn't, so we just use the absolute href:
  if (relativeHref.length === 0) {
    return LinkToSelf;
  }

  return relativeHref;
}

module.exports = generateRelativeHref
module.exports.LinkToSelf = LinkToSelf;