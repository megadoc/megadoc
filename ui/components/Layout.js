const React = require("react");
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const classSet = require('utils/classSet');
const NotFound = require('components/NotFound');
const Document = require('components/Document');
const ErrorMessage = require('components/ErrorMessage');
const Banner = require('./Layout__Banner');
const { getLayoutForDocument } = require('./Layout__Utils');

const { node, shape, string, arrayOf, array, object, oneOfType, oneOf } = React.PropTypes;
const Link = shape({
  text: string,
  href: string,
  links: array
});

const Layout = React.createClass({
  statics: {
    getDefaultLayoutForDocument,
    getLayoutForDocument,
  },

  propTypes: {
    children: node,
    pathname: string.isRequired,
    namespaceNode: object,
    documentNode: object,
    query: object, // DEPRECATED
    bannerLinks: arrayOf(Link),
    customLayouts: arrayOf(shape({
      match: shape({
        by: oneOf([ 'url', 'uid', 'type' ]).isRequired,
        on: oneOfType([ string, arrayOf(string) ]).isRequired,
      }).isRequired,

      regions: arrayOf(shape({
        name: string.isRequired,
        options: object,

        outlets: arrayOf(shape({
          name: string,
          options: object,
          with: oneOfType([ string, arrayOf(string) ]),
        }))
      })).isRequired
    })),
  },

  getDefaultProps() {
    return {
      bannerLinks: [],
      layouts: []
    };
  },

  render() {
    const ctx = RenderContext(this.props);
    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-two-column-layout': ctx.hasSidebarElements
    });

    return (
      <div className={className}>
        <Banner
          links={this.props.bannerLinks || []}
          currentPath={this.props.pathname}
        />

        <div className="root__screen">
          {this.renderScreen(ctx)}
        </div>
      </div>
    );
  },

  renderScreen(ctx) {
    return ctx.hasSidebarElements ?
      this.renderTwoColumnLayout(ctx) :
      this.renderSingleColumnLayout(ctx)
    ;
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
    const ContentTag = this.getContentOutletTag(ctx.layout);

    return (
      <ContentTag>
        {this.renderElements(ctx, 'Layout::Content') || <NotFound />}
      </ContentTag>
    );
  },

  renderElements(ctx, region) {
    const regionSpec = ctx.layout.filter(x => x.name === region)[0];

    if (!regionSpec || !regionSpec.outlets) {
      return null;
    }

    const children = [].concat(regionSpec.outlets || []);

    children.forEach(function({ name }) {
      if (!Outlet.isDefined(name)) {
        console.warn(
          "Outlet '%s' has not been defined, this is most likely " +
          "a configuration error. Please verify the outlet name is correct.",
          name
        );
      }
    })

    return children.map(x => {
      const operatingNodes = getNodesForOutlet(x, ctx);

      if (!operatingNodes) {
        return (
          <ErrorMessage key={x.name}>
            <p>
              No document was found with the UID "{x.with}" to be inserted
              into the outlet "{x.name}".
            </p>
          </ErrorMessage>
        );
      }

      // console.log('Rendering "%s" inside the outlet "%s" within the region "%s".',
      //   operatingNodes.documentNode.uid,
      //   x.name,
      //   regionSpec.name
      // );

      return (
        <Outlet
          key={x.name}
          name={x.name}
          outletOptions={x.options}
          elementProps={{
            query: this.props.query,
            documentNode: operatingNodes.documentNode,
            namespaceNode: operatingNodes.namespaceNode,
          }}
        />
      );
    })
  },

  getContentOutletTag(layout) {
    const spec = layout.filter(x => x.name === 'Layout::Content')[0];

    if (spec) {
      if (spec.options && spec.options.framed) {
        return Document;
      }
    }

    return 'div';
  },

  reload() {
    this.forceUpdate();
  },
});

module.exports = Layout;

function getDefaultLayoutForDocument(props) {
  if (props.namespaceNode && props.namespaceNode.meta.defaultLayouts) {
    return getLayoutForDocument({
      documentNode: props.documentNode,
      layouts: props.namespaceNode.meta.defaultLayouts,
      pathname: props.pathname
    });
  }
}

function getDefaultLayout() {
  return [
    {
      name: 'Layout::Content',
      outlets: null
    }
  ];
}

function getNodesForOutlet(outlet, defaults) {
  if (!outlet.with) {
    return defaults;
  }

  const documentNode = tinydoc.corpus.get(outlet.with);

  if (documentNode) {
    return {
      documentNode,
      namespaceNode: tinydoc.corpus.getNamespaceOfDocument(documentNode)
    }
  }
  else {
    return null;
  }
}

function RenderContext(props) {
  const layout = (
    getLayoutForDocument({
      documentNode: props.documentNode,
      layouts: props.customLayouts,
      pathname: props.pathname
    }) ||
    getDefaultLayoutForDocument(props) ||
    getDefaultLayout()
  );

  return {
    layout,
    namespaceNode: props.namespaceNode,
    documentNode: props.documentNode,
    hasSidebarElements: layout.some(x => x.name === 'Layout::Sidebar')
  };
}
