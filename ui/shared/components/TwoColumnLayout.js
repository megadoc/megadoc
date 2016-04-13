const React = require('react');
const findChildByType = require('utils/findChildByType');
const EventEmitter = require('core/EventEmitter');
const Storage = require('core/Storage');
const resizable = require('utils/resizable');
const classSet = require('utils/classSet');
const config = require('config');
const Icon = require('components/Icon');
const Button = require('components/Button');
const emitter = new EventEmitter([ 'change', 'resize' ]);
const {
  CFG_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  INITIAL_SIDEBAR_WIDTH
} = require('constants');

Storage.register(CFG_SIDEBAR_WIDTH, INITIAL_SIDEBAR_WIDTH);

// We want all instances of TwoColumnLayout across the app to share the same
// sidebar width, so we'll track it here outside of state or something.
let initialWidth = Storage.get(CFG_SIDEBAR_WIDTH);
let sidebarWidth = initialWidth;
let activeInstances = [];
let inverted;

// so that we reset the sidebar width if storage was cleared
Storage.on('change', function() {
  sidebarWidth = Storage.get(CFG_SIDEBAR_WIDTH);
});

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

const TwoColumnLayout = React.createClass({
  statics: {
    isActive() {
      return config.resizableSidebar && activeInstances.length > 0;
    },

    getSidebarWidth() {
      return TwoColumnLayout.isActive() ? sidebarWidth : 0;
    },

    on: emitter.on,
    off: emitter.off,

    invert() { inverted = true; }
  },

  propTypes: {
    children: React.PropTypes.any,
  },

  getInitialState: function() {
    return {
      sidebarCollapsed: false
    };
  },

  componentDidMount() {
    activeInstances.push(1);

    if (config.resizableSidebar) {
      this.resizableInstance = resizable(React.findDOMNode(this.refs.resizer), {
        onResize: this.updateSidebarWidth,
        onResizeStop: this.updateAndSaveSidebarWidth
      });
    }

    emitter.on('resize', this.reloadOnResize);
    emitter.emit('change');
    emitter.emit('resize');
  },

  componentWillUnmount() {
    if (config.resizableSidebar) {
      this.resizableInstance.destroy();
    }

    activeInstances.pop();
    emitter.emit('change');
  },

  render() {
    var left = findChildByType(this.props.children, LeftColumn);
    var right = findChildByType(this.props.children, RightColumn);

    const leftClassName = classSet({
      'two-column-layout__left': true,
      'two-column-layout__left--collapsed': this.state.sidebarCollapsed
    });

    return (
      <div className={classSet({ "two-column-layout": true, "two-column-layout--inverted": inverted })}>
        <div
          className={leftClassName}
          style={{ width: config.resizableSidebar ? sidebarWidth : null }}
        >
          <div className="resizable-panel">
            {config.collapsibleSidebar && (
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
            [inverted ? 'marginRight' : 'marginLeft']: config.resizableSidebar ? sidebarWidth : null
          }}
          children={right}
        />
      </div>
    );
  },

  reloadOnResize() {
    this.forceUpdate();
  },

  updateSidebarWidth(x) {
    sidebarWidth = Math.max(initialWidth + x, MIN_SIDEBAR_WIDTH);
    emitter.emit('resize', sidebarWidth);
  },

  updateAndSaveSidebarWidth() {
    initialWidth = sidebarWidth;
    Storage.set(CFG_SIDEBAR_WIDTH, sidebarWidth);
  },

  collapseSidebar() {
    this.setState({ sidebarCollapsed: !this.state.sidebarCollapsed });
  }
});

module.exports = TwoColumnLayout;
module.exports.LeftColumn = LeftColumn;
module.exports.RightColumn = RightColumn;
