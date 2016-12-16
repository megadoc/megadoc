function Cluster() {}

Cluster.prototype.call = function(distributedFn, args) {
  let fn;

  if (typeof distributedFn === 'string') {
    fn = require(distributedFn);
  }
  else if (distributedFn.__distributedFn === true) {
    fn = distributedFn.deserialize();
  }

  return fn.apply(null, args);
};

module.exports = Cluster;