var React = require('react');

var ResizablePanel = React.createClass({
  displayName: "ResizablePanel",

  propTypes: {
    width: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ])
  },

  getDefaultProps: function() {
    return {
      width: 'inherit'
    };
  },

  render() {
    return (
      <div className="resizable-panel" style={{width: this.props.width}}>
        <div
          className="resizable-panel__resizer"
          draggable={!!this.props.onResize}
          onDragEnd={this.props.onResize}
        />

        <div className="resizable-panel__content">
          {this.props.children}
        </div>
      </div>
    );
  }
});

module.exports = ResizablePanel;