const React = require('react');
const console = require("console");
const { render } = require('react-dom');
const { renderToString } = require('react-dom/server');
const AppState = require('./AppState');
const App = require('./screens/App');
const CorpusAPI = require('./CorpusAPI');
const { OutletManager } = require('react-transclusion');

function createMegadoc(config, { plugins }) {
  const outlets = OutletManager({
    strict: true,
    verbose: false
  });

  const corpus = CorpusAPI({
    database: config.database || [],
    redirect: config.redirect
  });

  require('./outlets')(outlets)

  plugins.forEach(function({
    outlets: pluginOutlets = [],
    outletOccupants: pluginOutletOccupants = [],
  }) {
    pluginOutlets.forEach(function(outletSpec) {
      if (typeof outletSpec === 'string') {
        outlets.define(outletSpec)
      }
      else {
        // TODO ?
      }
    })

    pluginOutletOccupants.forEach(function(occupantSpec) {
      outlets.add(occupantSpec.name, {
        key: occupantSpec.key || 'default',
        component: occupantSpec.component,
      })
    })
  });

  return {
    appConfig: config,
    appState: AppState(config),
    outlets,
    corpus
  };
}

exports.createClient = function(config) {
  const megadoc = createMegadoc(config, { plugins: config.plugins });

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

exports.startApp = function(config, {
  startingDocumentUID,
  startingDocumentHref,
  plugins
}) {
  const megadoc = createMegadoc(config, { plugins });
  const mountPath = MountPath(megadoc.corpus.get(startingDocumentUID), startingDocumentHref);

  console.log('Mount path = "%s".', mountPath);

  render(
    <App
      config={megadoc.appConfig}
      appState={megadoc.appState}
      corpus={megadoc.corpus}
      mountPath={mountPath}
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
