const parseFn = require('../parseFn');
const reduceFn = require('../reduceFn');
const subject = require('../refineFn');
const init = require('../initFn');
const async = require('async');
const { assert, stubConsoleWarn, createFileSuite } = require('megadoc-test-utils');

describe('megadoc-plugin-js::refineFn', function() {
  const fileSuite = createFileSuite(this);

  it('works', function(done) {
    stubConsoleWarn('Unable to map ".*" to any module, it will be discarded.');

    const sourceFile1 = fileSuite.createFile('source1.js', `
      const Faye = require('faye');
      const Immutable = require('immutable');
      const {assign} = require('lodash');
      const objCamelize = require('utils/Object.camelize');

      /**
       * @module Push
       *
       * A small module for subscribing to PandaPush channels.
       */
      let exports;

      /*
       * @private
       * @property {Immutable.Map}
       * A map of URLs to Faye.Client instances connected to those URLs.
       */
      let clients = Immutable.Map();

      /*
       * @private
       * @property {Immutable.Map}
       * A map of URLs to maps, where the value maps' keys are channel names, and
       * whose values are JWT tokens for sending along with auth requests.
       */
      let tokens = Immutable.Map();

      let defaultStores = {clients, tokens};

      /*
       * @private
       * Constructs a new Faye.Client set up to connect to PandaPush with an auth header.
       *
       * @param {String} url
       *        The URL of the PandaPush server.
       * @param {Function} getTokenStore
       *        A function that returns a token store (an Immutable.Map).
       *
       * @return {Faye.Client}
       */
      const buildClient = (url, clientClass, getTokenStore) => {
        let client = new clientClass(url);
        client.addExtension({
          outgoing(message, callback) {
            if (message.channel !== '/meta/subscribe') {
              return callback(message);
            }

            message.ext = message.ext || {};
            message.ext.auth = {token: getTokenStore().getIn([url, message.subscription])};
            return callback(message);
          }
        });
        return client;
      };

      /**
       * @module Push.Middleware
       *
       * Contains some common wrappers for subscription callbacks.
       *
       * A middleware should expect its handler function to take two arguments. The
       * first started life as a PandaPush message, though intervening middlewares may
       * alter it. The second is a metadata dictionary. There are no defaults for
       * this; middlewares can add keys as they see fit.
       */
      const Middleware = exports.Middleware = {
        /**
         * Only call the provided handler if the message's 'action' property is one
         * of those specified in the actions parameter.
         *
         * @param {Function} handler
         *        The subscription handler.
         * @param {Array<String>|String} actions
         *        Whitelist of interesting actions.
         */
        filterActions(handler, actions) {
          actions = [].concat(actions);
          return (message, meta = {}) => {
            const {action} = message;
            if (actions.indexOf(action) === -1) return;
            handler(message, assign(meta, {action}));
          };
        },

        /**
         * Call the callback with only the camel-cased attributes of the message
         * object.
         *
         * @param {Function} handler
         *        The subscription handler.
         */
        justAttributes(handler) {
          return ({attributes}, meta = {}) => { handler(objCamelize(attributes), meta) };
        },

        /**
         * Combines the behavior of the [Push.Middleware.filterActions]() and
         * [Push.Middleware.justAttributes]() middlewares.
         *
         * @param {Function} handler
         * @param {Array<String>|String} actions
         */
        attributesForActions(handler, actions) {
          return Middleware.filterActions(Middleware.justAttributes(handler), actions);
        },
      };

      /**
       * Subscribes to a PandaPush channel, based on the provided configuaration.
       *
       * @param {Object} _config
       * @param {String} channel
       *        Part of _config.
       * @param {String} token
       *        Part of _config.
       * @param {String} url
       *        Part of _config.
       * @param {Function} callback
       *        Handler for the subscription.
       * @param {Object} stores
       *        Needs a clients key and a tokens key, corresponding to stores for
       *        those. Optional; defaults to defaultStores.
       * @param {Function} clientClass
       *        A constructor function for building a client. Optional; default is
       *        Faye.Client.
       *
       * @return {Promise}
       *         Returns a Promise which resolves to a successful Faye subscription.
       */
      exports.subscribe = ({channel, token, url}, callback, stores = defaultStores, clientClass = Faye.Client) => {
        stores.tokens = stores.tokens.setIn([url, channel], token);

        let client = stores.clients.get(url);
        if (!client) {
          client = buildClient(url, clientClass, () => stores.tokens);
          stores.clients = stores.clients.set(url, client);
        }

        const subscription = client.subscribe(channel, callback);
        subscription.then(null, ({message}) => { console.error(message) });
        return subscription;
      };

    `);

    const context = {
      commonOptions: {},
      options: {},
      state: init({})
    };

    const actions = {
      extractSummaryFromMarkdown(markdown) {
        return markdown;
      }
    }

    parseFn(context, sourceFile1.path, function(err, rawDocuments) {
      if (err) {
        done(err);
      }
      else {
        async.map(rawDocuments, reduceFn.bind(null, context, actions), function(err2, documents) {
          if (err2) {
            done(err2);
          }
          else {
            subject(context, documents, function(err3, refinedDocuments) {
              if (err3) {
                done(err3);
              }
              else {
                // TODO: real assertion?
                assert.ok(refinedDocuments);
                done();
              }
            })
          }
        })
      }
    })
  });
});