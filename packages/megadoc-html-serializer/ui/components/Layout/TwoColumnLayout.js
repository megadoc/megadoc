const React = require('react');
const { findDOMNode } = require('react-dom');
const findChildByType = require('utils/findChildByType');
const resizable = require('utils/resizable');
const classSet = require('utils/classSet');
const Icon = require('components/Icon');
const Button = require('components/Button');
const {
  MIN_SIDEBAR_WIDTH,
  INITIAL_SIDEBAR_WIDTH
} = require('constants');

const { PropTypes } = React;
const LeftColumn = React.createClass({
  propTypes: {
    children: React.PropTypes.any,
  },

  render() {
    return this.props.children;
  }
});

const RightColumn = React.createClass({
  propTypes: {
    children: React.PropTypes.any,
  },

  render() {
    return this.props.children;
  }
});

const NavColumn = React.createClass({
  propTypes: {
    children: React.PropTypes.any,
  },

  render() {
    return this.props.children;
  }
});

const TwoColumnLayout = React.createClass({
  contextTypes: {
    appState: React.PropTypes.object.isRequired,
  },

  propTypes: {
    children: React.PropTypes.any,
    resizable: PropTypes.bool,
    fixed: PropTypes.bool,
    collapsible: PropTypes.bool,
  },

  getInitialState() {
    return {
      initialSidebarWidth: INITIAL_SIDEBAR_WIDTH,
      sidebarWidth: INITIAL_SIDEBAR_WIDTH,
      sidebarCollapsed: false
    };
  },

  componentDidMount() {
    this.context.appState.on('change', this.reload);

    if (this.props.resizable) {
      this.resizableInstance = resizable(findDOMNode(this.refs.resizer), {
        onResize: this.updateSidebarWidth,
        onResizeStop: this.updateAndSaveSidebarWidth
      });
    }
  },

  componentWillUnmount() {
    this.context.appState.off('change', this.reload);

    if (this.props.resizable) {
      this.resizableInstance.destroy();
    }
  },

  render() {
    const left = findChildByType(this.props.children, LeftColumn);
    const right = findChildByType(this.props.children, RightColumn);
    const nav = findChildByType(this.props.children, NavColumn);
    const sidebarWidth = this.state.sidebarCollapsed ? 0 : this.state.sidebarWidth;

    const leftClassName = classSet({
      'two-column-layout__left': true,
      'two-column-layout__left--collapsed': this.state.sidebarCollapsed
    });

    const inverted = this.context.appState.isTwoColumnLayoutInverted();

    return (
      <div
        className={classSet({
          "two-column-layout": true,
          "two-column-layout--inverted": inverted,
          "two-column-layout--with-nav": !!nav,
          "two-column-layout--fixed": !!this.props.fixed,
        })}
      >
        <div
          className={leftClassName}
          style={{ width: sidebarWidth }}
        >
          <div className="resizable-panel">
            {this.props.collapsible && (
              <Button
                onClick={this.collapseSidebar}
                className="two-column-layout__collapse-btn">
                <Icon className="icon-menu" />
              </Button>
            )}

            <div className="resizable-panel__content">
              {left}
            </div>

            <div
              ref="resizer"
              className="ui-resizable-handle ui-resizable-e"
            />
          </div>
        </div>

        <div
          className="two-column-layout__right"
          style={{
            [inverted ? 'marginRight' : 'marginLeft']: sidebarWidth
          }}
          children={right}
        />

        {nav && (
          <div className="two-column-layout__nav" children={nav || null} />
        )}
      </div>
    );
  },

  reload() {
    this.forceUpdate();
  },

  updateSidebarWidth(x) {
    this.setState({
      sidebarWidth: Math.max(this.state.initialSidebarWidth + x, MIN_SIDEBAR_WIDTH)
    });
  },

  updateAndSaveSidebarWidth() {
    this.setState({
      initialSidebarWidth: this.state.sidebarWidth
    });
  },

  collapseSidebar() {
    this.setState({ sidebarCollapsed: !this.state.sidebarCollapsed });
  }
});

module.exports = TwoColumnLayout;
module.exports.LeftColumn = LeftColumn;
module.exports.RightColumn = RightColumn;
module.exports.NavColumn = NavColumn;
