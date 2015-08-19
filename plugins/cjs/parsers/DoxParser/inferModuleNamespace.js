var path = require('path');
var findWhere = require('lodash').findWhere;
var strClassify = require('../../../../lib/utils/strClassify');

module.exports = function(doc, filePath) {
  var nsTag = findWhere(doc.tags, { type: 'namespace' });

  if (nsTag) { // @namespace Namespace
    return nsTag.string.split('\n')[0].trim();
  }
  else { // Namespace.Module
    var idPath = doc.id.split('.');

    if (idPath.length > 1) {
      return idPath[0];
    }
    else if (filePath) { // from filepath, namespace/Module.js
      return strClassify(path.basename(path.dirname(filePath)));
    }
    else {
      return undefined;
    }
  }
};