let instance;

exports.setInstance = function(_instance) {
  instance = _instance;
};

if (process.env.NODE_ENV === 'development') {
  exports.getInstance = function() {
    console.warn('You are using a development-only method.');
    return instance;
  };
}

/**
 * Update the query string to reflect the new given key/value pairs. This
 * will trigger a re-transition of the current route.
 *
 * @param  {Object} newQuery
 *         The query parameters.
 */
exports.updateQuery = function(newQuery) {
  var routes = instance.getCurrentRoutes();
  var currentRouteName = routes[routes.length-1].name;
  var query = instance.getCurrentQuery();

  Object.keys(newQuery).forEach(function(key) {
    query[key] = newQuery[key];

    if (query[key] === null) {
      delete query[key];
    }
  });

  instance.replaceWith(currentRouteName, instance.getCurrentParams(), query);
};

exports.goToNotFound = function() {
  instance.replaceWith('404');
};

exports.transitionTo = function(path, params, query) {
  instance.transitionTo(path, params, query);
};

exports.replaceWith = function(path, params, query) {
  instance.replaceWith(path, params, query);
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

exports.isRunning = function() {
  return instance && instance.isRunning;
};

exports.getParamItem = function(item) {
  if (instance) {
    return instance.getCurrentParams()[item];
  }
};
