const invariant = require('utils/invariant');

/**
 * Routing APIs for the app.
 */
const Router = exports;

// TODO: re-implement
/**
 * Update the query string to reflect the new given key/value pairs. This
 * will trigger a re-transition of the current route.
 *
 * @param  {Object} newQuery
 *         The query parameters.
 */
Router.updateQuery = function(/*newQuery*/) {
  invariant(false, "Not implemented!");
};

// TODO: re-implement
Router.getQueryItem = function(/*item*/) {
  invariant(false, "Not implemented!");
};

// TODO: re-implement
Router.refresh = function() {
  invariant(false, "Not implemented!");
};

module.exports = Router;
