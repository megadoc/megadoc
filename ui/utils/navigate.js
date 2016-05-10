const Router = require('../shared/core/Router');
const DocumentURI = require('../shared/core/DocumentURI');

module.exports = function(e, domNode) {
  console.log(domNode.tagName, domNode.href, location.origin)
  if (isLeftClickEvent(e) && !isModifiedEvent(e)) {
    e.stopPropagation();
    e.preventDefault();

    const destination = domNode.href.replace(location.origin, '');
    Router.transitionTo(destination);
    Router.refresh();

    if (destination.indexOf('#')) {
      Router.refreshScroll();
    }
  }
};

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
