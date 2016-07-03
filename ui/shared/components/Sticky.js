const React = require('react');
const { findDOMNode } = require('react-dom');
const { throttle, } = require('lodash');
const { node, } = React.PropTypes;

const Sticky = React.createClass({
  propTypes: {
    children: node,
  },

  componentDidMount() {
    this.offsetTop = findDOMNode(this).getBoundingClientRect().top;
    this.debouncedApplyStickiness = throttle(this.applyStickiness, 5);

    window.addEventListener('scroll', this.debouncedApplyStickiness, false);
    window.addEventListener('resize', this.debouncedApplyStickiness, false);

    this.applyStickinessSync();
  },

  componentWillUnmount() {
    window.removeEventListener('resize', this.debouncedApplyStickiness, false);
    window.removeEventListener('scroll', this.debouncedApplyStickiness, false);
  },

  render() {
    return (
      <div className="sticky-container">
        {this.props.children}
      </div>
    );
  },

  applyStickiness() {
    window.requestAnimationFrame(this.applyStickinessSync);
  },

  applyStickinessSync() {
    const domNode = findDOMNode(this);
    const scrollTop = getScrollTop(window);
    const offsetTop = this.offsetTop;
    const bbox = domNode.getBoundingClientRect();
    const viewportHeight = (document.documentElement.clientHeight - offsetTop);
    const newStyle = {};

    if (scrollTop > offsetTop) {
      newStyle.top = `${scrollTop}px`;
    }
    else if (scrollTop <= offsetTop) {
      newStyle.top = '0px';
    }

    if (bbox.height > viewportHeight) {
      newStyle.position = 'absolute';
      newStyle.height = `${bbox.height}px`;
      newStyle.overflow = 'auto';
    }
    else {
      newStyle.position = 'relative';
      newStyle.height = null;
      newStyle.overflow = null;
    }

    applyStyle(domNode, newStyle);
  }
});

function getScrollTop(window) {
  return window.hasOwnProperty('scrollY') ? window.scrollY : window.scrollTop;
}

function applyStyle(domNode, style) {
  const styleString = serializeCSSTextString(style);

  if (typeof domNode.style.cssText !== 'undefined') {
    domNode.style.cssText = styleString;
  }
  else {
    domNode.setAttribute('style', styleString);
  }
}

function serializeCSSTextString(style) {
  return Object.keys(style).reduce(function(s, x) {
    if (style[x] === null) {
      return s;
    }
    else {
      return s + `${x}:${style[x]};`;
    }
  }, '');
}

module.exports = Sticky;
