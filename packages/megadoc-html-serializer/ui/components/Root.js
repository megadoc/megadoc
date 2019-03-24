const React = require("react");
const { findDOMNode } = require('react-dom');
const { Outlet } = require('react-transclusion');
const CorpusAPI = require('../CorpusAPI');
const DocumentResolver = require('../DocumentResolver');
const DocumentURI = require('../DocumentURI');
const Inspector = require('../shared/components/Inspector');
const Layout = require('../shared/components/Layout');
const LayoutTemplate = require('../LayoutTemplate');
const NotFound = require('../shared/components/NotFound');
const ScrollSpy = require('../shared/components/ScrollSpy');
const SpotlightManager = require('../shared/components/SpotlightManager');
const { assign } = require('lodash');
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
    this.setState(this.resolveScope(this.props));
  },

  componentDidMount() {
    this.props.appState.on('change', this.reload);

    window.addEventListener('click', this.handleInternalLink, false);
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.config !== this.props.config) {
      this.realizeTemplate = LayoutTemplate(nextProps.corpus, nextProps.config);
    }

    if (
      nextProps.location.pathname !== this.props.location.pathname ||
      nextProps.location.hash !== this.props.location.hash ||
      nextProps.config !== this.props.config
    ) {
      this.setState(this.resolveScope(nextProps));
    }
  },

  componentDidUpdate(prevProps) {
    if (prevProps.location.hash !== this.props.location.hash) {
      this.props.onRefreshScroll();
    }
  },

  componentWillUnmount() {
    this.realizeTemplate = null;

    window.removeEventListener('click', this.handleInternalLink, false);

    this.props.appState.off('change', this.reload);
  },

  render() {
    const { config } = this.props;
    const pathname = this.getPathName(this.props);
    const { scope, template } = this.state;

    if (!scope) {
      return this.renderInternalError();
    }

    return (
      <Outlet name="Core::LayoutWrapper" forwardChildren elementProps={this.props}>
        <Outlet name="Core::Meta" />

        {config.tooltipPreviews && (
          <Inspector corpus={this.props.corpus} />
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
    const { corpus, location } = this.props
    const anchor = location.hash.replace('#', '');
    const redirectUrl = [
      // omit the anchor and try ?
      () => {
        if (anchor && anchor.length) {
          const withoutAnchor = this.resolveCurrentDocument({
            config: this.props.config,
            documentResolver: this.props.documentResolver,
            location: assign({}, location, {
              hash: ''
            })
          })

          if (withoutAnchor) {
            return location.pathname;
          }
        }
      },

      // resolve by parent path ?
      () => {
        const dirname = string => string.split('/').slice(0, -1).join('/')
        const parentNode = corpus.getByURI(dirname(location.pathname) + '/index.html')

        if (parentNode) {
          return CorpusAPI.hrefOf(parentNode)
        }
      },

      () => {
        return corpus.getHrefOfFirstAvailableNamespace();
      },

      // oh snap ?
      () => '/index.html'
    ].reduce((found, f) => found || f(), null);

    return (
      <NotFound
        location={this.props.location}
        redirectUrl={redirectUrl}
        corpus={corpus}
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

  resolveScope(props = this.props) {
    const { location } = props;
    const scope = this.resolveCurrentDocument({
      config: props.config,
      documentResolver: props.documentResolver,
      location: props.location
    });

    if (scope) {
      return {
        scope,
        template: this.realizeTemplate(scope, this.getPathName(props))
      };
    }
    else if (isHashPointingToAnchor(location)) {
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

  resolveCurrentDocument({ location, config, documentResolver }) {
    return documentResolver.resolveFromLocation(location, config);
  },

  getPathName({ documentResolver, documentURI, location }) {
    return documentResolver.getProtocolAgnosticPathName(location, documentURI);
  },
});

function isHashPointingToAnchor(location) {
  const anchor = location.hash.replace(/^#/, '');
  const selfNode = findDOMNode(this);

  return anchor && anchor.length > 0 && selfNode && !!selfNode.querySelector(`a[name="${anchor}"]`);
}

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