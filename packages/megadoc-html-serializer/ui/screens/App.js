const React = require('react');
const Root = require('./Root');
const DocumentURI = require('core/DocumentURI');
const DocumentResolver = require('../DocumentResolver');
const { OutletProvider } = require('react-transclusion');

const { PropTypes } = React;

const App = React.createClass({
  propTypes: {
    appState: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
    corpus: PropTypes.object.isRequired,
    location: require('schemas/Location').isRequired,
  },

  childContextTypes: {
    appState: PropTypes.object,
    corpus: PropTypes.object,
    documentResolver: PropTypes.instanceOf(DocumentResolver),
    documentURI: PropTypes.instanceOf(DocumentURI),
  },

  getInitialState() {
    return {
      hashDisabled: true,
    };
  },

  getChildContext() {
    return {
      appState: this.props.appState,
      corpus: this.props.corpus,
      documentURI: this.documentURI,
      documentResolver: this.documentResolver,
    };
  },

  componentWillMount() {
    const { config } = this.props;

    this.documentURI = new DocumentURI({
      mountPath: this.props.location.protocol === 'file:' ? config.mountPath : null,
      extension: config.emittedFileExtension,
    });

    this.documentResolver = new DocumentResolver({
      config: config,
      corpus: this.props.corpus,
      documentURI: this.documentURI
    });

    let locationAPI;

    if (config.layoutOptions && config.layoutOptions.singlePageMode) {
      locationAPI = HashLocation;
    }
    else if (this.props.location.protocol === 'file:') {
      locationAPI = FileLocation;
    }
    else if (this.props.location.protocol.match(/^http:/)) {
      locationAPI = HistoryLocation;
    }

    this.locationAPI = locationAPI({
      location: this.props.location,
      onChange: this.reload
    });

    this.locationAPI.start();
  },

  componentDidMount() {
    // this is to avoid discrepancy with the server-rendered version since it
    // will not have a hash fragment and the client would (hash fragment may
    // change the UI if it's pointing to a DocumentEntity)
    this.setState({ hashDisabled: false });
  },

  componentWillUnmount() {
    this.locationAPI.stop();
  },

  render() {
    const { location } = this.props;

    return (
      <OutletProvider outletManager={this.props.outletManager}>
        <Root
          onNavigate={this.navigate}
          onRefreshScroll={this.locationAPI.refreshScroll}
          config={this.props.config}
          corpus={this.props.corpus}
          appState={this.props.appState}
          location={{
            pathname: this.documentURI.normalize(location.pathname),
            hash: this.state.hashDisabled ? '' : location.hash,
            origin: location.origin,
            protocol: location.protocol,
          }}
        />
      </OutletProvider>
    );
  },

  reload() {
    console.debug('App: forcing update.');

    this.forceUpdate();
  },

  navigate(e, domNode) {
    if (isLeftClickEvent(e) && !isModifiedEvent(e)) {
      const href = domNode.href.replace(location.origin, '');

      if (this.locationAPI.transitionTo(href)) {
        e.stopPropagation();
        e.preventDefault();
      }
    }
  },
});

module.exports = App;

/**
 * Requirements:
 *
 * - use relative links everywhere
 *
 * ## MPM and the `http://` protocol
 *
 * - use the History API
 * - use location.pathname to point to documents
 * - use location.hash to point to entities
 *
 * ## MPM and the `file://` protocol
 *
 * - use no location API, navigate using regular links
 * - use mountpoint to figure out the proper pathname
 * - use location.pathname to point to documents
 * - use location.hash to point to entities
 *
 * ## SPM and any protocol
 *
 * - use hash location
 * - use location.hash to point to both documents and entities
 */
function HistoryLocation(options) {
  const { history } = window;
  const emitChange = options.onChange;
  const exports = {
    start() {
      window.addEventListener('hashchange', refreshScroll);
      window.addEventListener('popstate', emitChange);

      if (options.location.pathname === '/') {
        exports.transitionTo('/index.html');
      }
    },

    transitionTo(pathname) {
      history.pushState(null, null, pathname);

      emitChange();

      return true;
    },

    refreshScroll,

    stop() {
      window.removeEventListener('popstate', emitChange);
      window.removeEventListener('hashchange', refreshScroll);
    }
  };

  return exports;

  // force the browser to (re)scroll to the proper location
  function refreshScroll() {
    const { location } = options;
    const originalLocation = location.hash;

    if (originalLocation && originalLocation.length > 0) {
      location.replace(originalLocation);
    }
  }
}

function HashLocation(options) {
  const emitChange = options.onChange;

  return {
    start() {
      window.addEventListener('hashchange', emitChange);
    },
    transitionTo() {},
    refreshScroll() {},
    stop() {
      window.removeEventListener('hashchange', emitChange);
    },
  }
}

function FileLocation(options) {
  const emitChange = options.onChange;

  return {
    start() {
      window.addEventListener('hashchange', emitChange);
    },
    transitionTo() {},
    refreshScroll() {},
    stop() {
      window.removeEventListener('hashchange', emitChange);
    },
  }
}

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
