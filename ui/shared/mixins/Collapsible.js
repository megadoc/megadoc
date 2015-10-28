var React = require('react');
var Icon = require('components/Icon');

var Collapsible = {
  propTypes: {
    collapsible: React.PropTypes.bool,
    initiallyCollapsed: React.PropTypes.bool,
    expanded: React.PropTypes.bool,
  },

  getDefaultProps: function() {
    return {
      collapsible: true,
      initiallyCollapsed: false
    };
  },

  getInitialState: function() {
    return {
      collapsed: false
    };
  },

  componentDidMount: function() {
    if (this.props.initiallyCollapsed && !this.props.expanded) {
      this.setState({ collapsed: true });
    }
  },

  componentWillReceiveProps: function(nextProps) {
    if (nextProps.expanded && this.state.collapsed) {
      this.setState({ collapsed: false });
    }
  },

  expand() {
    if (this.state.collapsed) {
      this.setState({ collapsed: false });
    }
  },

  renderCollapser() {
    if (this.isCollapsible()) {
      return <Icon className="collapser collapsible__icon icon-arrow-down" />;
    }
    else {
      return null;
    }
  },

  isCollapsed() {
    return this.isCollapsible() && !this.props.expanded && this.state.collapsed;
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