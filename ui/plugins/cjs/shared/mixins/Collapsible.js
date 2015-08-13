var React = require('react');
var Icon = require('components/Icon');

var Collapsible = {
  propTypes: {
    collapsible: React.PropTypes.bool,
    initiallyCollapsed: React.PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      collapsible: true,
      initiallyCollapsed: false
    };
  },

  getInitialState: function() {
    return {
      collapsed: this.props.initiallyCollapsed
    };
  },

  expand() {
    if (this.state.collapsed) {
      this.setState({ collapsed: false });
    }
  },

  renderCollapser() {
    if (this.isCollapsible()) {
      return <Icon className="collapser icon-arrow-down" />;
    }
    else {
      return null;
    }
  },

  isCollapsed() {
    return this.isCollapsible() && this.state.collapsed;
  },

  isCollapsible() {
    return !!this.props.collapsible;
  },

  toggleCollapsed() {
    if (this.isCollapsible()) {
      this.setState({
        collapsed: !this.state.collapsed
      });
    }
  }
};

module.exports = Collapsible;