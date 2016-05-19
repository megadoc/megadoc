const React = require('react');
const { render } = require('react-dom');
const { renderToString } = require('react-dom/server');
const config = require('config');
const createMegadoc = require('core/megadoc');
const Storage = require('core/Storage');
const K = require('constants');
const App = require('./screens/App');
const megadoc = window.megadoc = createMegadoc(config);

console.log('megadoc: version %s', config.version);

Storage.register(K.CFG_COLOR_SCHEME, K.DEFAULT_SCHEME);

megadoc.publicModules = require('../tmp/publicModules');

// expose this to plugins so that we can move to a non-global version in the
// future
megadoc.outlets = require('components/Outlet');
megadoc.outlets.define('Meta');
megadoc.outlets.define('LayoutWrapper');
megadoc.outlets.define('Layout');
megadoc.outlets.define('Layout::Banner');
megadoc.outlets.define('Layout::Content');
megadoc.outlets.define('Layout::Sidebar');
megadoc.outlets.define('Layout::SidebarHeader');
megadoc.outlets.define('Layout::Footer');
megadoc.outlets.define('Inspector');
megadoc.outlets.define('Image');

require('./outlets/SidebarHeaderOutlet')(megadoc);
require('./outlets/ImageOutlet')(megadoc);

megadoc.start = function(options = {}) {
  megadoc.onReady(function(registrar) {
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
      config.mountPath = MountPath(megadoc.corpus.get(options.startingDocumentUID));

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

module.exports = megadoc;


function MountPath(currentDocument) {
  if (currentDocument) {
    return location.pathname.replace(currentDocument.meta.href, '');
  }
  else {
    return '';
  }
}
