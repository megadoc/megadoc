const React = require("react");
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const NotFound = require('components/NotFound');
const Document = require('components/Document');
const ErrorMessage = require('components/ErrorMessage');
const Footer = require('components/Footer');
const DocumentResolver = require('../DocumentResolver');

const { node, shape, string, arrayOf, object, oneOfType } = React.PropTypes;

const LayoutScreen = React.createClass({
  propTypes: {
    children: node,
    documentNode: object,
    documentEntityNode: object,
    namespaceNode: object,
    regions: arrayOf(shape({
      name: string.isRequired,
      options: object,

      outlets: arrayOf(shape({
        name: string,
        options: object,
        using: oneOfType([ string, arrayOf(string) ]),
      }))
    })),
  },

  render() {
    const ctx = this.props;

    return (
      <div className="root__screen">
        {ctx.hasSidebarElements ?
          this.renderTwoColumnLayout(ctx) :
          this.renderSingleColumnLayout(ctx)
        }
      </div>
    );
  },

  renderTwoColumnLayout(ctx) {
    return (
      <TwoColumnLayout>
        <TwoColumnLayout.LeftColumn>
          <div>
            {this.renderElements(ctx, 'Layout::Sidebar')}
          </div>
        </TwoColumnLayout.LeftColumn>

        <TwoColumnLayout.RightColumn>
          {this.renderContent(ctx)}
        </TwoColumnLayout.RightColumn>
      </TwoColumnLayout>
    );
  },

  renderSingleColumnLayout(ctx) {
    return this.renderContent(ctx);
  },

  renderContent(ctx) {
    const ContentTag = this.getContentOutletTag(ctx.regions);

    return (
      <div>
        <ContentTag>
          {this.renderElements(ctx, 'Layout::Content') || <NotFound />}
        </ContentTag>

        <Footer />
      </div>
    );
  },

  renderElements(ctx, regionName) {
    const region = ctx.regions.filter(x => x.name === regionName)[0];

    if (!region || !region.outlets) {
      return null;
    }

    const children = [].concat(region.outlets || []);

    children.forEach(function({ name }) {
      if (!Outlet.isDefined(name)) {
        console.warn(
          "Outlet '%s' has not been defined, this is most likely " +
          "a configuration error. Please verify the outlet name is correct.",
          name
        );
      }
    });

    return children.map((x,i) => {
      const overridenNodes = getNodesForOutlet(x);
      const operatingNodes = overridenNodes || ctx;
      const key = `${x.name}__${i}`;

      if (x.using && !overridenNodes) {
        return (
          <ErrorMessage key={key}>
            <p>
              No document was found with the UID "{x.using}" to be inserted
              into the outlet "{x.name}" of the region "{region.name}". This
              is most likely a configuration error.
            </p>
          </ErrorMessage>
        );

        console.log(
          `Rendering "${operatingNodes.documentNode.uid}" inside the outlet ` +
          `"${x.name}" within the region "${region.name}".`
        );
      }

      return (
        <Outlet
          key={key}
          name={x.name}
          options={x.options}
          elementProps={{
            documentNode: operatingNodes.documentNode,
            documentEntityNode: operatingNodes.documentEntityNode,
            namespaceNode: operatingNodes.namespaceNode,
          }}
        />
      );
    }).filter(x => !!x)
  },

  getContentOutletTag(regions) {
    const spec = regions.filter(x => x.name === 'Layout::Content')[0];

    if (spec) {
      if (spec.options && spec.options.framed) {
        return Document;
      }
    }

    return 'div';
  },
});

module.exports = LayoutScreen;

function getNodesForOutlet(outlet) {
  if (outlet.using) {
    const documentNode = megadoc.corpus.get(outlet.using);

    if (documentNode) {
      return DocumentResolver.buildDocumentContext(documentNode);
    }
  }
};
