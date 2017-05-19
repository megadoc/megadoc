function TestSerializer() {}

TestSerializer.prototype.start = function(compilations, done) {
  done();
};

TestSerializer.prototype.seal = function(compilations, done) {
  done(null, compilations.map(compilation => {
    return Object.assign({}, compilation, { corpus: {} })
  }));
};

TestSerializer.prototype.emit = function(withCorpus, done) {
  done(null, withCorpus);
};

TestSerializer.prototype.purge = function(withCorpus, done) {
  done(null, withCorpus);
};

TestSerializer.prototype.stop = function(done) {
  done();
};

TestSerializer.renderRoutines = {
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

TestSerializer.reduceRoutines = {
  extractSummaryFromMarkdown(markdown) {
    return markdown;
  }
}

module.exports = TestSerializer;