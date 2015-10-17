const React = require('react');
const jqScrollIntoView = require('jqScrollIntoView');

function BrowserJumperMixin(locateElement, offset) {
  function jumpToEntity(component, props) {
    const element = locateElement.call(component, props);

    if (element === false) {
      return false;
    }
    else if (element) {
      jqScrollIntoView(React.findDOMNode(element), { offset });

      return true;
    }
    else {
      console.warn('Unable to jump to element; node not found.');
      return false;
    }
  }

  return {
    componentDidMount: function() {
      jumpToEntity(this, this.props);
    },

    componentDidUpdate: function() {
      jumpToEntity(this, this.props);
    },
  };
}

module.exports = BrowserJumperMixin;