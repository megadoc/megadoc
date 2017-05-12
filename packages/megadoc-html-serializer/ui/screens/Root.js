const React = require("react");
const { Outlet } = require('react-transclusion');
const Storage = require('core/Storage');
const SpotlightManager = require('../components/SpotlightManager');
const Inspector = require('../components/Inspector');
const Layout = require('../components/Layout');
const ScrollSpy = require('../components/ScrollSpy');
const DocumentResolver = require('../DocumentResolver');
const DocumentURI = require('core/DocumentURI');
const LayoutTemplate = require('../LayoutTemplate');
const ErrorMessage = require('components/ErrorMessage');
const { object, func, } = React.PropTypes;

const Root = React.createClass({
  childContextTypes: {
    config: object,
    location: require('schemas/Location'),
    navigate: func,
  },

  propTypes: {
    appState: object.isRequired,
    config: object,
    corpus: object.isRequired,
    location: require('schemas/Location'),
    onNavigate: func,
    onRefreshScroll: func,
  },

  contextTypes: {
    documentURI: React.PropTypes.instanceOf(DocumentURI).isRequired,
    documentResolver: React.PropTypes.instanceOf(DocumentResolver).isRequired,
  },

  getChildContext() {
    return {
      location: this.props.location,
      config: this.props.config,
      navigate: this.props.onNavigate
    };
  },

  componentWillMount() {
    this.realizeTemplate = LayoutTemplate(this.props.corpus, this.props.config);
  },

  componentDidMount() {
    Storage.on('change', this.reload);
    this.props.appState.on('change', this.reload);

    window.addEventListener('click', this.handleInternalLink, false);
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
    let scope;
    let template;

    if (!this.props.appState.inSinglePageMode()) {
      scope = this.resolveCurrentDocument();

      if (!scope) {
        return this.renderInternalError();
      }
    }

    template = this.realizeTemplate(scope, this.getPathName());

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
          {...config.layoutOptions}
          pathname={pathname}
          scope={scope}
          template={template}
        />
      </Outlet>
    );
  },

  renderInternalError() {
    return (
      <ErrorMessage style={{ width: '50vw', margin: '10vh auto 0 auto' }}>
        <p>There was no document found at this URL. This most likely indicates
        a configuration error. Please check and try again.
        </p>

        <p>Debugging information:</p>

        <pre>
          Corpus size: {this.props.corpus.length}
          {"\n"}
          Location: {JSON.stringify(this.getLocation(), null, 2)}
        </pre>
      </ErrorMessage>
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

  resolveCurrentDocument() {
    return this.context.documentResolver.resolveFromLocation(this.getLocation(), this.props.config);
  },

  getPathName() {
    return this.context.documentResolver.getProtocolAgnosticPathName(
      this.getLocation(),
      this.context.documentURI
    );
  },

  getLocation() {
    return this.props.location;
  },
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