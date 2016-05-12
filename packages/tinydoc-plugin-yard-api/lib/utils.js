exports.isAPIObject = function(x) {
  return x.meta.entityType === 'api-object';
};

exports.isAPIEndpoint = function(x) {
  return x.meta.entityType === 'api-endpoint';
};