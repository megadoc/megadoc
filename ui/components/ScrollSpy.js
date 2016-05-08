const React = require("react");
const Router = require('core/Router');
const { filter } = Array.prototype;

const ScrollSpy = React.createClass({
  getDefaultProps() {
    return {
      query: {},
      params: {}
    };
  },

  componentDidMount() {
    window.addEventListener('scroll', focusClosestHeading, false);
  },

  shouldComponentUpdate() {
    return false;
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', focusClosestHeading, false);
  },

  render() {
    return null;
  },
});

module.exports = ScrollSpy;

function focusClosestHeading() {
  const nodes = filter.call(document.querySelectorAll('[id]'), function(node) {
    return node.tagName.match(/^H\d/);
  }).map(function(node) {
    return {
      node: node,
      box: node.getBoundingClientRect()
    };
  });

  let target, min;

  nodes.forEach(function(item) {
    const top = Math.abs(item.box.top);

    if (min === undefined) {
      min = top;
      target = item;
    }
    else if (top < min) {
      min = top;
      target = item;
    }
  });

  if (target) {
    const { id } = target.node;
    const newHash = `#${id}`;

    if (window.location.hash !== newHash) {
      // LOLOL
      //
      // no but seriously, we need to do this so that when we change the hash
      // manually, the browser don't jump!
      target.node.id = null;

      // can't use history.replaceState because it's not allowed on file://
      window.location.hash = newHash;

      target.node.id = id;

      Router.refresh();
    }
  }
}