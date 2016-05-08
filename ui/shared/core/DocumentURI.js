const config = require('config');
const extension = config.emittedFileExtension || '';
const RE = extension.length > 0 && new RegExp(extension + '$');
const URIjs = require('urijs');

exports.withExtension = function(uri) {
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

exports.withoutExtension = function(uri) {
  if (!config.useHashLocation && RE) {
    return uri.replace(RE, '');
  }
  else {
    return uri;
  }
};