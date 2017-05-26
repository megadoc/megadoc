const React = require("react");
const TwoColumnLayout = require('components/TwoColumnLayout');
const NotFound = require('components/NotFound');
const Document = require('components/Document');
const ErrorMessage = require('components/ErrorMessage');
const Footer = require('components/Footer');
const Sticky = require('components/Sticky');
const ConfigReceiver = require('components/ConfigReceiver');
const { OutletRenderer, Outlet } = require('react-transclusion');
const { PropTypes } = React;

const ConfigType = {
  collapsibleSidebar: PropTypes.bool,
  footer: PropTypes.string,
  resizableSidebar: PropTypes.bool,
  fixedSidebar: PropTypes.bool,
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
      >
        <TwoColumnLayout.LeftColumn>
          <div>
            {this.renderRegion('Layout::Sidebar')}
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
    const ContentTag = this.getOutletTag('Layout::Content');

    return (
      <div>
        <ContentTag>
          {this.renderRegion('Layout::Content') || <NotFound />}
        </ContentTag>

        <Footer>{this.props.config.footer}</Footer>
      </div>
    );
  },

  renderNavBar() {
    const contents = this.renderRegion('Layout::NavBar');

    if (!contents) {
      return null;
    }

    const ContentTag = this.getOutletTag('Layout::NavBar');

    return (
      <Sticky>
        <ContentTag>
          <p>Contents</p>

          {this.renderRegion('Layout::NavBar')}
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

    if (spec) {
      if (spec.options && spec.options.framed) {
        return Document;
      }
    }

    return 'div';
  },
});

module.exports = OutletRenderer(ConfigReceiver(LayoutScreen, ConfigType));
