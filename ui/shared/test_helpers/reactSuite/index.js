const API = require("./API");
const config = require("./config");
const { setRootNode } = require('react-drill/lib/DOMSelectors');
const GLOBAL = window;

function expose(key, value) {
  if (config.useGlobals) {
    if (value === undefined) {
      delete GLOBAL[key];
    } else {
      GLOBAL[key] = value;
    }
  }
}

/**
 * @module TestHelpers.reactSuite
 *
 * Prepare a mocha test suite for testing a React component. Every test in the
 * suite will have access to a mounted instance of the component type you're
 * testing, which means you don't have to worry about creating, rendering,
 * or detaching the component.
 *
 * You may access the instance using the global "subject".
 *
 * Also, your tests will have access to a bunch of DOM helpers for writing the
 * test scenarios. See ./DOMHelpers.js for those helpers.
 *
 * @param {MochaSuite} suite
 *        The test suite you're in. I.e, the function passed to describe().
 *
 * @param {React} type
 *        The component type/factory/class something you want to test.
 *
 * @param {Object} [initialProps={}]
 *        Optional. If you want the component to start out with certain props
 *        when it's auto-rendered by the reactSuite, this is the way to do it.
 *
 *        Probably useful for required props.
 *
 * @param {Object} [options={}]
 *        reactSuite options.
 *
 * @param {Boolean} [options.autoMount=true]
 *        Whether the subject should be automatically mounted and unmounted
 *        in `beforeEach()` and `afterEach()` blocks.
 *
 *        Pass this false if you want manual control of the subject.
 *
 * @param {Boolean} [options.immediatelyAttachToDOM=false]
 *        When true, the subject's container node will be attached to the DOM
 *        before the subject gets mounted. This is necessary for components that
 *        use libraries/or rely on DOM operations when they mount.
 *
 * @param {Boolean} [options.requiresRouterContext=false]
 *        Convenience option for calling "stubRoutes()" with an empty route-set.
 *        Use this if you need the component to be set up in a RR context but no
 *        route stubbing is necessary.
 *
 * @return {TestHelpers.ReactSuiteAPI}
 *
 * @example
 *
 *     var reactSuite = require("test_helpers/reactSuite");
 *
 *     describe('MyComponent', function() {
 *       reactSuite(this, require("components/MyComponent"));
 *
 *       it("should mount without errors", function() {
 *         // subject will now point to the mounted instance of MyComponent:
 *         expect(subject.isMounted()).to.equal(true);
 *       });
 *     });
 */
function reactSuite(suite, type, initialProps, options = {}) {
  const inspecting = config.inspect || options.immediatelyAttachToDOM;
  const api = new API(type, {
    immediatelyAttachToDOM: options.immediatelyAttachToDOM
  });

  api.on('change', function mutateallthethings() {
    // scope all the DOMHelpers to the container DOM node
    setRootNode(api.getContainer());

    // global access to `subject`
    expose("subject", api.getSubject());

    // ?inspect mode
    if (config.inspect && !api.isAttachedToDOM()) {
      api.attachToDOM();
    }
    else if (!inspecting && api.isAttachedToDOM()) {
      api.detachFromDOM();
    }
  });

  if (options.autoMount !== false) {
    suite.beforeEach(function(done) {
      api.createSubject(initialProps, function() {
        done();
      });
    });
  }

  suite.afterEach(function() {
    if (api.isRunning() && !config.inspect) {
      api.removeSubject();
    }
  });

  return api;
}

reactSuite.config = config;

module.exports = reactSuite;
