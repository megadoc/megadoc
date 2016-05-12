const React = require("react");
const Outlet = require('components/Outlet');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const Router = require('core/Router');
const SpotlightManager = require('../components/SpotlightManager');
const Inspector = require('../components/Inspector');
const Layout = require('../components/Layout');
const ScrollSpy = require('../components/ScrollSpy');
const navigate = require('../utils/navigate');
const DocumentResolver = require('../DocumentResolver');
const ErrorMessage = require('components/ErrorMessage');
const { object } = React.PropTypes;

const Root = React.createClass({
  propTypes: {
    config: object,
  },

  getDefaultProps() {
    return {
      query: {},
    };
  },

  componentWillMount() {
    this.documentResolver = DocumentResolver(tinydoc.corpus);
  },

  componentDidMount() {
    Storage.on('change', this.reload);
    AppState.on('change', this.reload);

    window.addEventListener('click', this.handleInternalLink, false);

    // Argh, otherwise when you refresh the page the browser doesn't seem to
    // make the jump!
    //
    // To reproduce:
    //
    //   - turn on single page mode
    //   - anchor to some heading
    //   - reload
    //     - watch it stick to the top
    if (AppState.inSinglePageMode()) {
      Router.refreshScroll();
    }
  },

  componentWillUnmount() {
    window.removeEventListener('click', this.handleInternalLink, false);

    AppState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    const { config } = this.props;
    let documentContext;

    if (!AppState.inSinglePageMode()) {
      documentContext = this.resolveCurrentDocument();

      if (!documentContext) {
        return this.renderInternalError();
      }
    }

    return (
      <Outlet name="LayoutWrapper" forwardChildren>
        {config.tooltipPreviews && (<Inspector />)}
        {config.spotlight && (
          <SpotlightManager
            active={AppState.isSpotlightOpen()}
            onOpen={AppState.openSpotlight}
            onClose={AppState.closeSpotlight}
            documentNode={documentContext && documentContext.documentNode}
          />
        )}

        {config.scrollSpying && (
          <ScrollSpy />
        )}

        <Layout
          {...config.layoutOptions}
          pathname={this.getPathName()}
          {...documentContext}
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
          Corpus size: {tinydoc.corpus.length}
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
    if (e.target.tagName === 'A' && e.target.href.indexOf(location.origin) === 0) {
      navigate(e, e.target);
    }
  },

  resolveCurrentDocument() {
    return this.documentResolver.resolveFromLocation(this.getLocation(), this.props.config);
  },

  getPathName() {
    return DocumentResolver.getProtocolAgnosticPathName(this.getLocation());
  },

  getLocation() {
    return {
      pathname: this.props.pathname,
      origin: window.location.origin,
      protocol: window.location.protocol,
      hash: window.location.hash
    };
  }
});

module.exports = Root;