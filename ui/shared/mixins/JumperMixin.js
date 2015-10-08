const React = require('react');
const jqScrollIntoView = require('jqScrollIntoView');

function BrowserJumperMixin(locateElement, offset) {
  function jumpToEntity(component, props, state, prevProps = null) {
    const element = locateElement.call(component, props, prevProps, state);

    if (prevProps) {
      const prevElement = locateElement.call(component, prevProps, state);

      if (prevElement === element) {
        return false;
      }
    }

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

    componentDidUpdate: function(prevProps) {
      jumpToEntity(this, this.props, this.state, prevProps);
    },
  };
}

module.exports = BrowserJumperMixin;