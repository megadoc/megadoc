const React = require('react');
const Root = require('./Root');
const DocumentURI = require('core/DocumentURI');

const { object, } = React.PropTypes;

const App = React.createClass({
  propTypes: {
    config: object.isRequired,
    location: require('schemas/Location').isRequired,
  },

  componentWillMount() {
    const { config } = this.props;

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

  componentWillUnmount() {
    this.locationAPI.stop();
  },

  render() {
    const { location } = this.props;

    return (
      <Root
        onNavigate={this.navigate}
        onRefreshScroll={this.locationAPI.refreshScroll}
        config={this.props.config}
        location={{
          pathname: DocumentURI(location.pathname),
          hash: location.hash,
          origin: location.origin,
          protocol: location.protocol,
        }}
      />
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

function FileLocation() {
  return {
    start() {},
    transitionTo() {},
    refreshScroll() {},
    stop() {},
  }
}

function isLeftClickEvent(event) {
  return event.button === 0;
}

function isModifiedEvent(event) {
  return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}
