function BlankSerializer() {}

BlankSerializer.prototype.start = function(compilations, done) {
  done();
};

BlankSerializer.prototype.renderCorpus = function(compilations, done) {
  done(null, compilations);
};

BlankSerializer.prototype.emitCorpusDocuments = function(compilations, done) {
  done(null, compilations);
};

BlankSerializer.prototype.purgeEmittedCorpusDocuments = function(compilations, done) {
  done(null, compilations);
};

BlankSerializer.prototype.stop = function(done) {
  done();
};

BlankSerializer.renderRoutines = {
  markdown(value) {
    return value;
  },

  linkify(params) {
    return typeof params === 'string' ? params : params.text;
  },

  linkifyFragment(params) {
    return params.text;
  },
}

BlankSerializer.reduceRoutines = {
  extractSummaryFromMarkdown(markdown) {
    return markdown;
  }
}

module.exports = BlankSerializer;