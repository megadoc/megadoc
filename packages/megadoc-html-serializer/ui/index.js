const React = require('react');
const console = require("console");
const { render } = require('react-dom');
const { renderToString } = require('react-dom/server');
const AppState = require('./AppState');
const Router = require('./components/Router');
const CorpusAPI = require('./CorpusAPI');
const { OutletManager } = require('react-transclusion');
const {
  outlets: coreOutlets,
  outletOccupants: coreOutletOccupants
} = require('./outlets');

const scrapePlugins = () => {
  return Object
    .keys(window.exports)
    .filter(function(key) {
      const thing = window.exports[key]

      return (
        (
          thing && typeof thing === 'object' && thing.plugin === true
        ) ||
        (
          /megadoc-(theme|plugin)-/.test(key)
        )
      );
    })
    .map(function(key) {
      return window.exports[key];
    })
    .reduce((acc, exportedObject) => {
      // accept a list of plugins from a single file (e.g. for inline plugins)
      const plugins = Array.isArray(exportedObject) ? exportedObject : [ exportedObject ]

      // resolve es6 default imports
      return acc.concat(
        plugins.map(x => x.hasOwnProperty('default') ? x.default : x)
      )
    }, [])
  ;
}

function createMegadoc(config) {
  const plugins = scrapePlugins()
  const outlets = OutletManager({
    strict: true,
    verbose: false
  });

  const corpus = CorpusAPI({
    database: config.database || [],
    redirect: config.redirect
  });

  plugins
    .reduce((acc, x) => acc.concat(x.outlets || []), coreOutlets)
    .forEach(outlet => {
      outlets.define(outlet)
    })
  ;

  plugins
    .reduce((acc, x) => acc.concat(x.outletOccupants || []), coreOutletOccupants)
    .forEach(occupant => {
      outlets.add(occupant.name, occupant)
    })
  ;

  return {
    appConfig: config,
    appState: AppState(config),
    outlets,
    corpus
  };
}

exports.createClient = function(config) {
  const megadoc = createMegadoc(config);

  return {
    render: function(href, done) {
      done(null, renderToString(
        <Router
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
}) {
  const megadoc = createMegadoc(config);
  const mountPath = MountPath(megadoc.corpus.get(startingDocumentUID), startingDocumentHref);

  console.log('Mount path = "%s".', mountPath);

  render(
    <Router
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
