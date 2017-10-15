function BlankSerializer() {}

BlankSerializer.prototype.start = function(compilations, done) {
  done();
};

BlankSerializer.prototype.seal = function(compilations, done) {
  done(null, { compilations });
};

BlankSerializer.prototype.emit = function(compilations, done) {
  done(null, compilations);
};

BlankSerializer.prototype.purge = function(compilations, done) {
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

module.exports = BlankSerializer;