const React = require("react");
const Outlet = require('components/Outlet');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const SpotlightManager = require('../components/SpotlightManager');
const Inspector = require('../components/Inspector');
const Layout = require('../components/Layout');
const ScrollSpy = require('../components/ScrollSpy');
const DocumentResolver = require('../DocumentResolver');
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
    config: object,
    location: require('schemas/Location'),
    onNavigate: func,
    onRefreshScroll: func,
  },

  getChildContext() {
    return {
      location: this.props.location,
      config: this.props.config,
      navigate: this.props.onNavigate
    };
  },

  componentWillMount() {
    this.documentResolver = DocumentResolver(megadoc.corpus);
    this.realizeTemplate = LayoutTemplate(megadoc, this.props.config);
  },

  componentDidMount() {
    Storage.on('change', this.reload);
    AppState.on('change', this.reload);

    window.addEventListener('click', this.handleInternalLink, false);
  },

  componentDidUpdate(prevProps) {
    if (prevProps.location.hash !== this.props.location.hash) {
      console.debug('Hash has changed from "%s" to "%s" - forcing refresh!', prevProps.location.hash, this.props.location.hash);
      this.props.onRefreshScroll();
    }
  },

  componentWillUnmount() {
    this.documentResolver = null;
    this.realizeTemplate = null;

    window.removeEventListener('click', this.handleInternalLink, false);

    AppState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    const { config } = this.props;
    const pathname = this.getPathName();
    let scope;
    let template;

    if (!AppState.inSinglePageMode()) {
      scope = this.resolveCurrentDocument();

      if (!scope) {
        return this.renderInternalError();
      }
    }

    template = this.realizeTemplate(scope, this.getPathName());

    return (
      <Outlet name="LayoutWrapper" forwardChildren>
        <Outlet name="Meta" />

        {config.tooltipPreviews && (<Inspector />)}
        {config.spotlight && (
          <SpotlightManager
            active={AppState.isSpotlightOpen()}
            onOpen={AppState.openSpotlight}
            onClose={AppState.closeSpotlight}
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
          Corpus size: {megadoc.corpus.length}
          {"\n"}
          Location: {JSON.stringify(this.getLocation(), null, 2)}
        </pre>
      </ErrorMessage>
    );
  },

  reload() {
    console.debug('Root: updating');
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
    return this.documentResolver.resolveFromLocation(this.getLocation(), this.props.config);
  },

  getPathName() {
    return DocumentResolver.getProtocolAgnosticPathName(this.getLocation());
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