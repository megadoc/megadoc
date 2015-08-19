var jqScrollIntoView = require('jqScrollIntoView');

var SectionJumperMixin = function(locateElement) {
  function jumpToEntity(component, props, state) {
    var element = locateElement.call(component, props, state);

    if (!element) {
      return false;
    }
    else {
      jqScrollIntoView(React.findDOMNode(element));

      if (element.expand instanceof Function) {
        element.expand();
      }

      return true;
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
};

module.exports = SectionJumperMixin;