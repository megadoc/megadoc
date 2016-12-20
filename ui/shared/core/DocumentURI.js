function DocumentURI(config) {
  this.mountPath = config.mountPath;
  this.extension = config.emittedFileExtension || '';
  this.fileExtensionRegExp = this.extension.length > 0 ?
    new RegExp(this.extension + '$') :
    null
  ;
}

DocumentURI.prototype.normalize = function(uri) {
  if (uri.indexOf(this.mountPath) === 0) {
    return ensureLeadingSlash(uri.slice(this.mountPath.length));
  }
  else {
    return uri;
  }
};

DocumentURI.prototype.withExtension = function(uri) {
  if (!uri.match(this.fileExtensionRegExp)) {
    return uri + this.extension;
  }
  else {
    return uri;
  }
};

DocumentURI.prototype.withoutExtension = function(uri) {
  if (this.fileExtensionRegExp) {
    return uri.replace(this.fileExtensionRegExp, '');
  }
  else {
    return uri;
  }
};

DocumentURI.prototype.getCurrentPathName = function() {
  return this.normalize(ensureLeadingSlash(window.location.pathname));
};

function ensureLeadingSlash(x) {
  return x[0] === '/' ? x : '/' + x;
}

module.exports = DocumentURI;
