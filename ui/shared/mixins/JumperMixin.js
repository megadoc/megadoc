const React = require('react');
const { findDOMNode } = require('react-dom');
const scrollIntoView = require('utils/scrollIntoView');
const SIDEBAR_SELECTOR = '.resizable-panel__content';

function JumperMixin(locateElement, offset, parentNodeSelector = SIDEBAR_SELECTOR) {
  function jump(component, props) {
    const element = locateElement.call(component, props);

    if (element === false) {
      return false;
    }
    else if (element) {
      scrollIntoView(
        findDOMNode(element),
        document.querySelector(parentNodeSelector),
        offset
      );

      return true;
    }
    else {
      console.warn('Unable to jump to element; node not found.');
      return false;
    }
  }

  return {
    componentDidMount: function() {
      jump(this, this.props);
    },

    componentDidUpdate: function() {
      jump(this, this.props);
    },
  };
}

JumperMixin.SIDEBAR_SELECTOR = SIDEBAR_SELECTOR;

module.exports = JumperMixin;