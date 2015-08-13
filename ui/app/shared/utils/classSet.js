var classSet = require("react/lib/cx");

module.exports = function(classes, ...optional) {
  var className = classes;

  if (optional.length) {
    optional.filter(function(className) {
      return className && className.length > 0;
    }).forEach(function(extraClassName) {
      className[extraClassName] = true;
    });
  }

  return classSet(className);
};