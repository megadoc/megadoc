let instance;

exports.setInstance = function(_instance) {
  instance = _instance;
};

exports.getSingleton = function() {
  return instance;
};
