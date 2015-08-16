var scrollIntoView = require('utils/scrollIntoView');

var SectionJumperMixin = function(locateElement) {
  function jumpToEntity(component, props, state) {
    var element = locateElement.call(component, props, state);
    var isReactComponent;

    if (!element) {
      return false;
    }

    isReactComponent = element.getDOMNode instanceof Function;

    if (isReactComponent) {
      scrollIntoView(element.getDOMNode());

      if (element.expand instanceof Function) {
        element.expand();
      }
    }
    else {
      scrollIntoView(element);
    }

    return true;
  }

  return {
    componentDidMount: function() {
      jumpToEntity(this, this.props, this.state);
    },

    componentDidUpdate: function() {
      jumpToEntity(this, this.props, this.state);
    },
  };
};

module.exports = SectionJumperMixin;