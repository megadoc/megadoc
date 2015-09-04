const React = require('react');
const findChildByType = require('utils/findChildByType');
const EventEmitter = require('core/EventEmitter');
const Storage = require('core/Storage');
const $ = require('jquery');
require('jQueryUI');
const emitter = new EventEmitter([ 'change', 'resize' ]);
const {
  CFG_SIDEBAR_WIDTH,
  MIN_SIDEBAR_WIDTH,
  INITIAL_SIDEBAR_WIDTH
} = require('constants');

Storage.register(CFG_SIDEBAR_WIDTH, INITIAL_SIDEBAR_WIDTH);

// We want all instances of TwoColumnLayout across the app to share the same
// sidebar width, so we'll track it here outside of state or something.
let sidebarWidth = Storage.get(CFG_SIDEBAR_WIDTH);
let activeInstances = [];

// so that we reset the sidebar width if storage was cleared
Storage.on('change', function() {
  sidebarWidth = Storage.get(CFG_SIDEBAR_WIDTH);
});

const LeftColumn = React.createClass({
  render() {
    return this.props.children;
  }
});

const RightColumn = React.createClass({
  render() {
    return this.props.children;
  }
});

const TwoColumnLayout = React.createClass({
  statics: {
    isActive() {
      return activeInstances.length > 0;
    },

    getSidebarWidth() {
      return TwoColumnLayout.isActive() ? sidebarWidth : 0;
    },

    on: emitter.on,
    off: emitter.off
  },

  componentDidMount() {
    activeInstances.push(1);

    $(React.findDOMNode(this.refs.resizer))
      .resizable({
        handles: 'e'
      })
      .on('resize', this.updateSidebarWidth)
      .on('resizestop', this.updateAndSaveSidebarWidth)
    ;

    emitter.on('resize', this.reloadOnResize);
    emitter.emit('change');
  },

  componentWillUnmount() {
    $(React.findDOMNode(this.refs.resizer)).resizable('destroy');

    activeInstances.pop();
    emitter.emit('change');
  },

  render() {
    var left = findChildByType(this.props.children, LeftColumn);
    var right = findChildByType(this.props.children, RightColumn);

    return (
      <div className="two-column-layout">
        <div
          ref="resizer"
          className="two-column-layout__left"
          style={{ width: sidebarWidth }}
        >
          <div className="resizable-panel">
            <div className="resizable-panel__content">
              {left}
            </div>
          </div>
        </div>

        <div
          className="two-column-layout__right"
          style={{ marginLeft: sidebarWidth }}
          children={right}
        />
      </div>
    );
  },

  reloadOnResize() {
    this.forceUpdate();
  },

  updateSidebarWidth(e, ui) {
    sidebarWidth = Math.max(ui.size.width, MIN_SIDEBAR_WIDTH);
    emitter.emit('resize', sidebarWidth);
  },

  updateAndSaveSidebarWidth(e, ui) {
    this.updateSidebarWidth(e, ui);
    Storage.set(CFG_SIDEBAR_WIDTH, sidebarWidth);
  }
});

module.exports = TwoColumnLayout;
module.exports.LeftColumn = LeftColumn;
module.exports.RightColumn = RightColumn;
