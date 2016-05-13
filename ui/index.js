const React = require('react');
const { render } = require('react-dom');
const { renderToString } = require('react-dom/server');
const config = require('config');
const createTinydoc = require('core/tinydoc');
const Storage = require('core/Storage');
const K = require('constants');
const App = require('./screens/App');
const tinydoc = window.tinydoc = createTinydoc(config);

console.log('tinydoc: version %s', config.version);

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);
Storage.register(K.CFG_SYNTAX_HIGHLIGHTING, true);

tinydoc.publicModules = require('../tmp/publicModules');

// expose this to plugins so that we can move to a non-global version in the
// future
tinydoc.outlets = require('components/Outlet');
tinydoc.outlets.define('LayoutWrapper');
tinydoc.outlets.define('Layout');
tinydoc.outlets.define('Layout::Banner');
tinydoc.outlets.define('Layout::Content');
tinydoc.outlets.define('Layout::Sidebar');
tinydoc.outlets.define('Layout::SidebarHeader');
tinydoc.outlets.define('Layout::Footer');
tinydoc.outlets.define('Inspector');

require('./outlets/SidebarHeaderOutlet')(tinydoc);

tinydoc.start = function(options = {}) {
  tinydoc.onReady(function(registrar) {
    console.log('Ok, firing up.');

    if (config.$static) {
      config.$static.readyCallback({
        render(href, done) {
          var markup = renderToString(
            <App
              config={config}
              location={{
                protocol: 'file:',
                origin: "file://",
                pathname: href.replace(/^#/, ''),
                hash: '', // do we have to handle this? :o
              }}
            />
          );

          done(null, markup);
        },

        dumpRoutes: function() {
          return [];
        }
      });

    }
    else {
      config.mountPath = MountPath(tinydoc.corpus.get(options.startingDocumentUID));

      console.log('Mount path = "%s".', config.mountPath);

      render(
        <App
          config={config}
          location={window.location}
        />,
        document.querySelector('#__app__')
      );
    }
  });
};

module.exports = tinydoc;


function MountPath(currentDocument) {
  if (currentDocument) {
    return location.pathname.replace(currentDocument.meta.href, '');
  }
  else {
    return '';
  }
}
