/**
 * @module Core.Store
 *
 * Build an object that extends Store to save and retrieve records and
 * collections using an immutable record set.
 *
 * usage:
 *
 * Extend using Object.assign, make sure to specify a name for the store.
 *
 *     var Store = require('core/Store');
 *
 *     var SurveyStore = new Store({
 *       name: 'surveys',
 *
 *       findAll(params) {
 *         ...
 *       }
 *     });
 *
 *     // ...
 *
 *     componentWillMount() {
 *       SurveyStore.addChangeListener(this._onChange);
 *       SurveyStore.find(this.id);
 *     },
 *
 *     _onChange() {
 *       this.setState({surveys: SurveyStore.get(this.id) });
 *     }
 *
 *
 * The store shoves items into a map by both id and aggregate key.
 * It then manages updating thes when the store is updated
 *
 *     _items = {
 *       "surveys:1": {id: "1", title: "foo"},
 *       "surveys:2": {id: "2", title: "bar"}
 *     }
 *
 *     _aggregates = {
 *       "surveys:all": [
 *         {id: "1", title: "foo"}
 *         {id: "2", title: "bar"}
 *       ],
 *       'surveys:{"sort":"title"}': [
 *         {id: "2", title: "bar"}
 *       ]
 *     }
 *
 */
var Store = function(spec) {
};

/**
 * Resets all the created stores in the app to their original state.
 */
Store.aStaticMethod = function() {
};

/**
 * Find an item in the store by ID.
 */
Store.aStaticMethodWithParam = function(id) {
};

/**
 * @static
 *
 * This is explicitly marked as static.
 */
Store.anExplicitlyMarkedStaticMethod = function(id) {
};

module.exports = Store;
