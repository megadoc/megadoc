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
