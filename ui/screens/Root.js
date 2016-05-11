const React = require("react");
const Outlet = require('components/Outlet');
const AppState = require('core/AppState');
const Storage = require('core/Storage');
const DocumentURI = require('core/DocumentURI');
const config = require('config');
const SpotlightManager = require('../components/SpotlightManager');
const Inspector = require('../components/Inspector');
const Layout = require('../components/Layout');
const ScrollSpy = require('../components/ScrollSpy');
const navigate = require('../utils/navigate');
const DocumentResolver = require('../DocumentResolver');

const Root = React.createClass({
  propTypes: {
    params: React.PropTypes.object,
  },

  getDefaultProps() {
    return {
      query: {},
      params: {}
    };
  },

  componentWillMount() {
    this.documentResolver = DocumentResolver(tinydoc.corpus);
  },

  componentDidMount() {
    Storage.on('change', this.reload);
    AppState.on('change', this.reload);

    window.addEventListener('click', this.handleInternalLink, false);
  },

  shouldComponentUpdate(nextProps) {
    return this.props.params !== nextProps.params;
  },

  componentWillUnmount() {
    window.removeEventListener('click', this.handleInternalLink, false);

    AppState.off('change', this.reload);
    Storage.off('change', this.reload);
  },

  render() {
    const documentContext = this.resolveCurrentDocument();

    // console.log("Pathname = '%s', DPathname = '%s'",
    //   this.getPathName(),
    //   DocumentURI.getCurrentPathName()
    // );

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
          query={this.props.query /* TODO: deprecate */}
          {...documentContext}
        />
      </Outlet>
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