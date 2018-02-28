const React = require("react");
const TwoColumnLayout = require('./TwoColumnLayout');
const NotFound = require('./NotFound');
const Document = require('./Document');
const ErrorMessage = require('components/ErrorMessage');
const Footer = require('./Footer');
const Sticky = require('./Sticky');
const ConfigReceiver = require('components/ConfigReceiver');
const { OutletRenderer, Outlet } = require('react-transclusion');
const { PropTypes } = React;
const { INITIAL_SIDEBAR_WIDTH } = require('constants');

const ConfigType = {
  collapsibleSidebar: PropTypes.bool,
  footer: PropTypes.string,
  resizableSidebar: PropTypes.bool,
  fixedSidebar: PropTypes.bool,
  sidebarWidth: PropTypes.number,
};

const LayoutScreen = React.createClass({
  propTypes: {
    hasSidebarElements: PropTypes.bool,
    isOutletDefined: PropTypes.func,
    regions: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      options: PropTypes.object,

      outlets: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        options: PropTypes.object,
        using: PropTypes.string,
        scope: PropTypes.shape({
          documentEntityNode: PropTypes.object,
          documentNode: PropTypes.object,
          namespaceNode: PropTypes.object,
        })
      }))
    })).isRequired,

    config: PropTypes.shape(ConfigType)
  },

  render() {
    return (
      <div className="root__screen">
        {this.props.hasSidebarElements ?
          this.renderTwoColumnLayout() :
          this.renderSingleColumnLayout()
        }
      </div>
    );
  },

  renderTwoColumnLayout() {
    const navBar = this.renderNavBar();
    const { config } = this.props;

    return (
      <TwoColumnLayout
        resizable={config.resizableSidebar}
        collapsible={config.collapsibleSidebar}
        fixed={config.fixedSidebar}
        initialSidebarWidth={config.sidebarWidth || INITIAL_SIDEBAR_WIDTH}
      >
        <TwoColumnLayout.LeftColumn>
          <div>
            {this.renderRegion('Core::Sidebar')}
          </div>
        </TwoColumnLayout.LeftColumn>

        <TwoColumnLayout.RightColumn>
          {this.renderContent()}
        </TwoColumnLayout.RightColumn>

        {navBar && (
          <TwoColumnLayout.NavColumn>
            {navBar}
          </TwoColumnLayout.NavColumn>
        )}
      </TwoColumnLayout>
    );
  },

  renderSingleColumnLayout() {
    return this.renderContent();
  },

  renderContent() {
    const [ ContentTag, contentProps ] = this.getOutletTag('Core::Content');
    const { footer } = this.props.config;

    return (
      <div>
        <ContentTag className={contentProps.className}>
          {this.renderRegion('Core::Content') || <NotFound />}
        </ContentTag>

        {footer && footer.length > 0 && (
          <Footer>{footer}</Footer>
        )}
      </div>
    );
  },

  renderNavBar() {
    const contents = this.renderRegion('Core::NavBar');

    if (!contents) {
      return null;
    }

    const { ContentTag, contentProps } = this.getOutletTag('Core::NavBar');

    return (
      <Sticky>
        <ContentTag className={contentProps.className}>
          <p>Contents</p>

          {this.renderRegion('Core::NavBar')}
        </ContentTag>
      </Sticky>
    );
  },

  renderRegion(regionName) {
    const region = this.props.regions.filter(x => x.name === regionName)[0];

    if (!region || !region.outlets) {
      return null;
    }


    return region.outlets.map((x,i) => {
      const { scope } = x;
      const key = `${x.name}__${i}`;

      if (!this.props.isOutletDefined(x.name)) {
        return (
          <ErrorMessage key={key}>
            <p>
              Outlet "{x.name}" has not been defined! This is most likely
              a configuration error. Please verify the outlet name is correct.
            </p>
          </ErrorMessage>
        );
      }
      else if (!scope) {
        return (
          <ErrorMessage key={key}>
            <p>
              No document was found with the UID "{x.using}" to be inserted
              into the outlet "{x.name}" of the region "{region.name}". This
              is most likely a configuration error.
            </p>
          </ErrorMessage>
        );
      }

      return (
        <Outlet
          key={key}
          name={x.name}
          options={x.options}
          elementProps={scope}
        />
      );
    }).filter(x => !!x)
  },

  getOutletTag(regionName) {
    const spec = this.props.regions.filter(x => x.name === regionName)[0];

    if (spec && spec.options && spec.options.framed) {
      return [ Document, spec.options || {} ];
    }
    else if (spec) {
      return [ 'div', spec.options || {} ]
    }

    return [ 'div', {} ];
  },
});

module.exports = OutletRenderer(ConfigReceiver(LayoutScreen, ConfigType));
