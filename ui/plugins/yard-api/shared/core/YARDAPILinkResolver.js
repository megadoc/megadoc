var { findWhere } = require('lodash');

var YARDAPILinkResolver = function(docstring/*, next*/) {
  var database = require('config').database;

  // return docstring.replace(/\[([^\]]+)\](?!\()/g, function(original, objectName) {
  return docstring.replace(/\{([^\}]+)\}/g, function(original, objectName) {
    // console.log('match:', objectName, arguments);

    var object = findWhere(database, { id: objectName });

    if (object) {
      // console.log('match found!', object);
      return `[${objectName}](/api/class/${objectName})`;
    }
    else {
      // console.warn('Unable to resolve object link:', original);
      return original;
    }
  });
};

module.exports = YARDAPILinkResolver;