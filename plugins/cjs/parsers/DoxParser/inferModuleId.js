var path = require('path');

function inferModuleId(doc, filePath) {
  var classTag = doc.tags.filter(function(tag) {
    return [ 'class', 'module' ].indexOf(tag.type) > -1;
  })[0];

  var nameMatch;

  if (classTag) {
    nameMatch = classTag.string.match(/^([\w\.]+)\s*$|([\w\.]+)\s*\n/);
  }

  if (nameMatch) {
    return nameMatch[1] || nameMatch[2];
  }
  else if (doc.ctx && doc.ctx.name === 'exports') {
    return path.basename(filePath, path.extname(filePath));
  }
  else if (doc.ctx && doc.ctx.type === 'declaration') {
    return doc.ctx.string;
  }
  else if (doc.ctx && doc.ctx.name) {
    return doc.ctx.name;
  }
  else {
    console.warn('Unable to infer an ID for module:' + filePath);
  }
}

module.exports = inferModuleId;