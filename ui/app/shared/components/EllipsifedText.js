var React = require("react");
var classSet = require("utils/classSet");

function getStyle(node, styleProp) {
  if (node.currentStyle) {
    return node.currentStyle[styleProp];
  }
  else if (window.getComputedStyle) {
    return document.defaultView.getComputedStyle(node,null).getPropertyValue(styleProp);
  }
}

var EllipsifedText = React.createClass({
  componentDidMount: function() {
    this.adjustSize();
  },

  componentDidUpdate: function(prevProps, prevState) {
    this.adjustSize();
  },

  render() {
    var className = classSet({ 'type-ellipsify': true }, this.props.className);

    return(
      <span
        ref="node"
        className={className}
        children={this.props.children}
      />
    );
  },

  adjustSize: function() {
    var node = this.refs.node.getDOMNode();
    var parentNode = node.parentNode;

    var padding       = parseInt(getStyle(parentNode, 'padding'), 10);
    var paddingLeft   = parseInt(getStyle(parentNode, 'padding-left'), 10);
    var paddingRight  = parseInt(getStyle(parentNode, 'padding-right'), 10);
    var targetWidth = (
      parentNode.getBoundingClientRect().width - (
        paddingLeft + paddingRight
      )
    );

    node.style['max-width'] = targetWidth + 'px';
  }
});

module.exports = EllipsifedText;