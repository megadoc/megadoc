const React = require('react');
const console = require("console");
const { render } = require('react-dom');
const { renderToString } = require('react-dom/server');
const AppState = require('./AppState');
const App = require('./screens/App');
const { omit } = require('lodash');
const CorpusAPI = require('./CorpusAPI');
const { OutletManager } = require('react-transclusion');

function createMegadoc(config) {
  const outlets = OutletManager({
    strict: true,
    verbose: false
  });

  const corpus = CorpusAPI({
    database: config.database || [],
    redirect: config.redirect
  });

  const megadoc = {
    corpus: corpus
  };

  // expose this to plugins so that we can move to a non-global version in the
  // future
  megadoc.outlets = outlets;

  require('./outlets')(outlets)

  const pluginAPI = { corpus };

  config.plugins.forEach(function(plugin) {
    const pluginConfig = corpus.getNamespacesForPlugin(plugin.name).map(x => x.config);

    if (plugin.register) {
      plugin.register(pluginAPI, pluginConfig)
    }

    if (plugin.outlets) {
      plugin.outlets.forEach(function(outletSpec) {
        if (typeof outletSpec === 'string') {
          outlets.define(outletSpec)
        }
        else {
          // TODO ?
        }
      })
    }

    if (plugin.outletOccupants) {
      plugin.outletOccupants.forEach(function(occupantSpec) {
        outlets.add(occupantSpec.name, {
          key: occupantSpec.key || 'default',
          component: occupantSpec.component,
        })
      })
    }
  });

  const appConfig = omit(config, [
    'database',
    'plugins',
    'startingDocumentUID',
    'startingDocumentHref',
  ]);

  const appState = AppState(config);

  return { appConfig, appState, outlets, corpus };
}

exports.createClient = function(config) {
  const megadoc = createMegadoc(config);

  return {
    render: function(href, done) {
      done(null, renderToString(
        <App
          config={megadoc.appConfig}
          appState={megadoc.appState}
          corpus={megadoc.corpus}
          outletManager={megadoc.outlets}
          location={{
            protocol: 'file:',
            origin: "file://",
            pathname: href.replace(/^#/, ''),
            hash: '', // do we have to handle this? :o
          }}
        />
      ));
    },
  };
};

exports.startApp = function(config) {
  const megadoc = createMegadoc(config);
  const mountPath = MountPath(
    megadoc.corpus.get(config.startingDocumentUID),
    config.startingDocumentHref
  );

  console.log('Mount path = "%s".', mountPath);

  render(
    <App
      config={Object.assign({}, megadoc.appConfig, { mountPath })}
      appState={megadoc.appState}
      corpus={megadoc.corpus}
      outletManager={megadoc.outlets}
      location={window.location}
    />,
    document.querySelector('#__app__')
  );
};

// const megadoc = window.megadoc = createMegadoc(config);

// module.exports = megadoc;

function MountPath(currentDocument, startingHref) {
  if (currentDocument) {
    return location.pathname.replace(currentDocument.meta.href, '');
  }
  else if (startingHref) {
    return location.pathname.replace(startingHref, '');
  }
  else {
    return '';
  }
}
