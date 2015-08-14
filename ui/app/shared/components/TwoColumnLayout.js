var React = require('react');
var findChildByType = require('utils/findChildByType');
var ResizablePanel = require('components/ResizablePanel');

// We want all instances of TwoColumnLayout across the app to share the same
// sidebar width, so we'll track it here outside of state or something.
var sidebarWidth = '240px';
var MAX_SIDEBAR_WIDTH = 640;

var LeftColumn = React.createClass({
  render() {
    return this.props.children;
  }
});

var RightColumn = React.createClass({
  render() {
    return this.props.children;
  }
});

var TwoColumnLayout = React.createClass({
  render() {
    var left = findChildByType(this.props.children, LeftColumn.type);
    var right = findChildByType(this.props.children, RightColumn.type);

    return (
      <div className="two-column-layout">
        <div className="two-column-layout__left">
          <ResizablePanel width={sidebarWidth} onResize={this.updateSidebarWidth}>
            {left}
          </ResizablePanel>
        </div>

        <div
          className="two-column-layout__right"
          style={{ marginLeft: sidebarWidth }}
          children={right}
        />
      </div>
    );
  },

  updateSidebarWidth(e) {
    sidebarWidth = Math.min(e.clientX, MAX_SIDEBAR_WIDTH);
    this.forceUpdate();
  }
});

module.exports = TwoColumnLayout;
module.exports.LeftColumn = LeftColumn;
module.exports.RightColumn = RightColumn;