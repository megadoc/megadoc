const config = require('config');
const extension = config.emittedFileExtension || '';
const RE = extension.length > 0 && new RegExp(extension + '$');
const URIjs = require('urijs');
const inFileProtocol = location.protocol === 'file:';

function DocumentURI(uri) {
  if (inFileProtocol) {
    return uri.replace(config.outputDir, '')
  }
  else {
    return uri;
  }
};

DocumentURI.withExtension = function(uri) {
  if (config.useHashLocation) {
    return uri;
  }
  else {
    if (!uri.match(RE)) {
      return uri + extension;
    }
    else {
      return uri;
    }
  }
};

DocumentURI.withoutExtension = function(uri) {
  if (!config.useHashLocation && RE) {
    return uri.replace(RE, '');
  }
  else {
    return uri;
  }
};

DocumentURI.getCurrentPathName = function() {
  return DocumentURI(window.location.pathname);
};

module.exports = DocumentURI;
