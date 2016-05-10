const config = require('config');
const extension = config.emittedFileExtension || '';
const RE_FILE_EXTENSION = extension.length > 0 && new RegExp(extension + '$');
const RE_OUTPUT_DIR = new RegExp('^' + config.outputDir);
const RE_PUBLIC_PATH = new RegExp('^' + config.publicPath);
const inFileProtocol = location.protocol === 'file:';

function DocumentURI(uri) {
  if (uri.indexOf(config.mountPath) === 0) {
    return ensureLeadingSlash(uri.slice(config.mountPath.length));
  }
  else {
    return uri;
  }
};

DocumentURI.withExtension = function(uri) {
  if (!uri.match(RE_FILE_EXTENSION)) {
    return uri + extension;
  }
  else {
    return uri;
  }
};

DocumentURI.withoutExtension = function(uri) {
  if (RE_FILE_EXTENSION) {
    return uri.replace(RE_FILE_EXTENSION, '');
  }
  else {
    return uri;
  }
};

DocumentURI.getCurrentPathName = function() {
  return DocumentURI(ensureLeadingSlash(window.location.pathname));
};

function ensureLeadingSlash(x) {
  return x[0] === '/' ? x : '/' + x;
}

module.exports = DocumentURI;
