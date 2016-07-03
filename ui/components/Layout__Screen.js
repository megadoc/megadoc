const React = require("react");
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const NotFound = require('components/NotFound');
const Document = require('components/Document');
const ErrorMessage = require('components/ErrorMessage');
const Footer = require('components/Footer');
const Sticky = require('components/Sticky');
const { shape, string, arrayOf, object, bool, } = React.PropTypes;

const LayoutScreen = React.createClass({
  propTypes: {
    hasSidebarElements: bool,
    regions: arrayOf(shape({
      name: string.isRequired,
      options: object,

      outlets: arrayOf(shape({
        name: string,
        options: object,
        using: string,
        scope: shape({
          documentEntityNode: object,
          documentNode: object,
          namespaceNode: object,
        })
      }))
    })).isRequired,
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

    return (
      <TwoColumnLayout>
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

        <Footer />
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

      if (!Outlet.isDefined(x.name)) {
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

module.exports = LayoutScreen;
