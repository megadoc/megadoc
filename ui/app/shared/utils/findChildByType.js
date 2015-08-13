var React = require("react");

module.exports = function(children, type) {
  var child;

  React.Children.forEach(children, function(_child) {
    if (_child && !child && _child.type === type.type) {
      child = _child;
    }
  });

  return child;
};