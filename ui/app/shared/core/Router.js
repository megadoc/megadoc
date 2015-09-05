let instance;

exports.setInstance = function(_instance) {
  instance = _instance;
};

/**
 * Update the query string to reflect the new given key/value pairs. This
 * will trigger a re-transition of the current route.
 *
 * @param  {Object} newQuery
 *         The query parameters.
 */
exports.updateQuery = function(newQuery) {
  var routes = instance.getRoutes();
  var currentRouteName = routes[routes.length-1].name;
  var query = instance.getQuery();

  Object.keys(newQuery).forEach(function(key) {
    query[key] = newQuery[key];
  });

  instance.replaceWith(currentRouteName, instance.getParams(), query);
};

exports.goToNotFound = function() {
  instance.replaceWith('404');
};

exports.transitionTo = function(path, params, query) {
  instance.transitionTo(path, params, query);
};

exports.getQueryItem = function(item) {
  if (instance) {
    return instance.getCurrentQuery()[item];
  }
};

exports.makeHref = function(name, params, query) {
  return instance.makeHref(name, params, query);
};


exports.getCurrentPath = function() {
  if (instance) {
    return instance.getCurrentPath();
  }
};

exports.isActive = function(routeName) {
  return instance && instance.isRunning && instance.isActive(routeName);
};


exports.getParamItem = function(item) {
  if (instance) {
    return instance.getCurrentParams()[item];
  }
};
