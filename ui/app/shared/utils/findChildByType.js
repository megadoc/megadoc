var React = require("react");

module.exports = function(children, Type) {
  var child;

  React.Children.forEach(children, function(_child) {
    if (_child && !child && _child.type === Type) {
      child = _child;
    }
  });

  return child;
};