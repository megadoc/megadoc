const React = require('react');
const { findDOMNode } = require('react-dom');
const { throttle, } = require('lodash');
const { node, } = React.PropTypes;

const Sticky = React.createClass({
  propTypes: {
    children: node,
  },

  componentDidMount() {
    this.calculateInitialValues();
    this.debouncedApplyStickiness = throttle(this.applyStickiness, 10);

    window.addEventListener('scroll', this.debouncedApplyStickiness, false);
    window.addEventListener('resize', this.debouncedApplyStickiness, false);

    this.applyStickinessSync();
  },

  componentDidUpdate() {
    this.calculateInitialValues();
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

  calculateInitialValues() {
    const domNode = findDOMNode(this);

    withRealDimensions(domNode, () => {
      const bbox = domNode.getBoundingClientRect();

      this.offsetTop = bbox.top + getScrollTop(window);
      this.clientWidth = bbox.width;
      this.clientHeight = bbox.height;
    });
  },

  applyStickiness() {
    window.requestAnimationFrame(this.applyStickinessSync);
  },

  applyStickinessSync() {
    const domNode = findDOMNode(this);
    const scrollTop = getScrollTop(window);
    const offsetTop = this.offsetTop;
    const viewportHeight = (document.documentElement.clientHeight - offsetTop);
    const newStyle = {};

    if (scrollTop > offsetTop) {
      newStyle.position = 'fixed';
      newStyle.top = `${offsetTop}px`;
      newStyle.width = `${this.clientWidth}px`;
    }
    else if (scrollTop <= offsetTop) {
      newStyle.position = 'relative';
      newStyle.top = '0px';
    }

    if (this.clientHeight > viewportHeight) {
      newStyle.height = `${viewportHeight}px`;
      newStyle.overflow = 'auto';
    }
    else {
      newStyle.height = null;
      newStyle.overflow = null;
    }

    domNode.classList.toggle('sticky-container--sticky', newStyle.position === 'fixed');

    applyStyle(domNode, newStyle);
  }
});

function getScrollTop(window) {
  return window.hasOwnProperty('scrollY') ? window.scrollY : window.scrollTop;
}

function applyStyle(domNode, style) {
  const styleString = serializeCSSTextString(style);

  if (typeof domNode.style.cssText !== 'undefined') {
    if (domNode.style.cssText !== styleString) {
      domNode.style.cssText = styleString;
    }
  }
  else {
    if (domNode.getAttribute('style') !== styleString) {
      domNode.setAttribute('style', styleString);
    }
  }
}

function serializeCSSTextString(style) {
  return Object.keys(style).reduce(function(s, x) {
    if (style[x] === null) {
      return s;
    }
    else {
      return s + `${x}: ${style[x]}; `;
    }
  }, '').replace(/\s$/, '');
}

module.exports = Sticky;


function withRealDimensions(domNode, fn) {
  const { position, height, width, top } = domNode.style;

  let positionModified = false;

  if (position === 'fixed' || position === 'absolute') {
    domNode.style.position = 'static';
    domNode.style.height = null;
    domNode.style.width = null;
    domNode.style.top = null;

    positionModified = true;
  }

  try {
    fn();
  }
  finally {
    if (positionModified) {
      domNode.style.position = position;
      domNode.style.width = width;
      domNode.style.height = height;
      domNode.style.top = top;
    }
  }
}