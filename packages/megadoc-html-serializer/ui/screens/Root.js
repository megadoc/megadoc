const React = require("react");
const console = require("console");
const { findDOMNode } = require('react-dom');
const { Outlet } = require('react-transclusion');
const Storage = require('core/Storage');
const SpotlightManager = require('../components/SpotlightManager');
const Inspector = require('../components/Inspector');
const Layout = require('../components/Layout');
const ScrollSpy = require('../components/ScrollSpy');
const DocumentResolver = require('../DocumentResolver');
const DocumentURI = require('core/DocumentURI');
const LayoutTemplate = require('../LayoutTemplate');
const NotFound = require('./NotFound');
const { object, func, } = React.PropTypes;

const Root = React.createClass({
  propTypes: {
    appState: object.isRequired,
    config: object,
    corpus: object.isRequired,
    location: require('schemas/Location'),
    onNavigate: func,
    onTransitionTo: func,
    onRefreshScroll: func,
    documentURI: React.PropTypes.instanceOf(DocumentURI).isRequired,
    documentResolver: React.PropTypes.instanceOf(DocumentResolver).isRequired,
  },

  childContextTypes: {
    config: object,
    location: require('schemas/Location'),
    navigate: func,
    transitionTo: func,
  },

  getInitialState() {
    return {
      scope: null,
      template: null,
    };
  },

  getChildContext() {
    return {
      location: this.props.location,
      config: this.props.config,
      navigate: this.props.onNavigate,
      transitionTo: this.props.onTransitionTo,
    };
  },

  componentWillMount() {
    this.realizeTemplate = LayoutTemplate(this.props.corpus, this.props.config);
    this.setState(this.resolveScope());
  },

  componentDidMount() {
    Storage.on('change', this.reload);
    this.props.appState.on('change', this.reload);

    window.addEventListener('click', this.handleInternalLink, false);
  },

  componentWillReceiveProps: function(nextProps) {
    if (
      nextProps.location.pathname !== this.props.location.pathname ||
      nextProps.location.hash !== this.props.location.hash
    ) {
      this.setState(this.resolveScope(nextProps.location));
    }
  },

  componentDidUpdate(prevProps) {
    if (prevProps.location.hash !== this.props.location.hash) {
      console.debug('Hash has changed from "%s" to "%s" - forcing refresh!', prevProps.location.hash, this.props.location.hash);
      this.props.onRefreshScroll();
    }
  },

  componentWillUnmount() {
    this.realizeTemplate = null;

    window.removeEventListener('click', this.handleInternalLink, false);

    this.props.appState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    const { config } = this.props;
    const pathname = this.getPathName();
    const { scope, template } = this.state;

    if (!scope) {
      return this.renderInternalError();
    }

    return (
      <Outlet name="LayoutWrapper" forwardChildren>
        <Outlet name="Meta" />

        {config.tooltipPreviews && (
          <Inspector
            corpus={this.props.corpus}
            inSinglePageMode={config.layoutOptions && config.layoutOptions.singlePageMode}
          />
        )}

        {config.spotlight && (
          <SpotlightManager
            corpus={this.props.corpus}
            active={this.props.appState.isSpotlightOpen()}
            onOpen={this.props.appState.openSpotlight}
            onClose={this.props.appState.closeSpotlight}
            documentNode={scope && scope.documentNode}
            pathname={pathname}
          />
        )}

        {config.scrollSpying && (
          <ScrollSpy />
        )}

        <Layout
          config={config}
          pathname={pathname}
          scope={scope}
          template={template}
        />
      </Outlet>
    );
  },

  renderInternalError() {
    const location = this.getLocation();
    const anchor = location.hash.replace('#', '');
    let redirectUrl;

    if (anchor && anchor.length) {
      const withoutAnchor = this.resolveScope(Object.assign({}, location, {
        hash: ''
      }))

      if (withoutAnchor.scope) {
        redirectUrl = location.pathname;
      }
    }
    else {
      redirectUrl = '/index.html';
    }

    return (
      <NotFound
        location={this.getLocation()}
        redirectUrl={redirectUrl}
        corpus={this.props.corpus}
      />
    );
  },

  reload() {
    this.forceUpdate();
  },

  handleInternalLink(e) {
    var node = e.target;

    if ((node.tagName === 'A' || node.tagName === 'a') && isInternalLink(node)) {
      this.props.onNavigate(e, {
        href: node.getAttribute('href')
      });
    }
  },

  resolveScope(location = this.getLocation()) {
    const scope = this.resolveCurrentDocument(location);

    if (scope) {
      return {
        scope,
        template: this.realizeTemplate(scope, this.getPathName(location))
      };
    }
    else if (this.isHashPointingToAnchor(location)) {
      return {
        scope: this.state.scope,
        template: this.state.template,
      };
      // no-op
    }
    else {
      return {
        scope: null,
        template: null,
      }
    }
  },

  resolveCurrentDocument(location = this.getLocation()) {
    return this.props.documentResolver.resolveFromLocation(location, this.props.config);
  },

  getPathName(location = this.getLocation()) {
    return this.props.documentResolver.getProtocolAgnosticPathName(
      location,
      this.props.documentURI
    );
  },

  getLocation() {
    return this.props.location;
  },

  isHashPointingToAnchor(location = this.getLocation()) {
    const anchor = location.hash.replace(/^#/, '');
    const selfNode = findDOMNode(this);

    return anchor && anchor.length > 0 && !!selfNode.querySelector(`a[name="${anchor}"]`);
  }
});

module.exports = Root;

function isInternalLink(node) {
  const href = node.href;

  if (href && typeof href === 'object') {
    // SVG
    if (node.className.baseVal.indexOf('mega-link--internal') > -1) {
      return href.baseVal;
    }
  }
  else {
    return href && href.indexOf(location.origin) === 0;
  }
}