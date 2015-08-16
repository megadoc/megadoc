// var { APP_DOM_ELEMENT_ID } = require('constants');
//
// function inferOffsetTop(node) {
//   var contentOffsetTop = document.querySelector('#'+APP_DOM_ELEMENT_ID).offsetTop;
//   return node.offsetTop - contentOffsetTop;
// }

module.exports = function(selector) {
  var node = typeof selector === 'string' ? document.querySelector(selector) : selector;

  if (node) {
    window.scrollTo(0, node.offsetTop /* inferOffsetTop(node) */);
  }
};

module.exports.aSomewhatSmarterVersion = function(selector, scrollableAncestor) {
  var node = typeof selector === 'string' ?
    document.querySelector(selector) :
    selector
  ;

  if (scrollableAncestor.scrollTop > node.offsetTop) {
    scrollableAncestor.scrollTop = node.offsetTop;
  }
  else if (scrollableAncestor.scrollTop + scrollableAncestor.offsetHeight < node.offsetTop + node.offsetHeight) {
    scrollableAncestor.scrollTop = node.offsetTop + node.offsetHeight - scrollableAncestor.offsetHeight;
  }
};
