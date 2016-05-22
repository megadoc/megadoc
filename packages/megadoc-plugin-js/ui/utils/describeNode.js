const K = require('../constants');

module.exports = function(nodeInfo) {
  return describeNode(nodeInfo, true);
};

function describeNode(nodeInfo, stringify) {
  const print = stringify ? prettyJSON : Identity;

  if (nodeInfo.type === K.TYPE_LITERAL) {
    return print(nodeInfo.hasOwnProperty('value') ? nodeInfo.value : null);
  }
  else if (nodeInfo.type === K.TYPE_ARRAY) {
    return print(nodeInfo.elements.map(x => describeNode(x, false)));
  }
  else if (nodeInfo.type === K.TYPE_OBJECT) {
    return print(nodeInfo.properties.reduce(function(map, x) {
      if (x) {
        map[x.key] = describeNode(x.value, false);
      }

      return map;
    }, {}));
  }

  return null;
}

function prettyJSON(x) {
  return JSON.stringify(x, null, 2);
}

function Identity(x) {
  return x;
}