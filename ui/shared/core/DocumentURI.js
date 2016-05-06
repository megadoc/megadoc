const config = require('config');
const extension = config.emittedFileExtension || '';
const RE = extension.length > 0 && new RegExp(extension + '$');

exports.withExtension = function(uri) {
  return uri + extension;
};

exports.withoutExtension = function(uri) {
  if (RE) {
    return uri.replace(RE, '');
  }
  else {
    return uri;
  }
};