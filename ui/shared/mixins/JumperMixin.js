const React = require('react');
const jqScrollIntoView = require('jqScrollIntoView');

function BrowserJumperMixin(locateElement, offset) {
  function jumpToEntity(component, props, state) {
    const element = locateElement.call(component, props, state);

    if (element) {
      jqScrollIntoView(React.findDOMNode(element), { offset });

      if (element.expand instanceof Function) {
        element.expand();
      }

      return true;
    }
    else {
      return false;
    }
  }

  return {
    componentDidMount: function() {
      jumpToEntity(this, this.props, this.state);
    },

    componentDidUpdate: function() {
      jumpToEntity(this, this.props, this.state);
    },
  };
}

module.exports = BrowserJumperMixin;