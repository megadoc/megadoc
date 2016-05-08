const React = require("react");
const Banner = require('./Banner');
const Footer = require('components/Footer');
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const classSet = require('utils/classSet');
const NotFound = require('components/NotFound');
const DocumentURI = require('core/DocumentURI');

const { node, shape, string, arrayOf, array, } = React.PropTypes;
const Link = shape({
  text: string,
  href: string,
  links: array
});

const Layout = React.createClass({
  propTypes: {
    children: node,
    path: string,
    config: shape({
      bannerLinks: arrayOf(Link)
    })
  },

  render() {
    const documentNode = tinydoc.corpus.getByURI(
      DocumentURI.withExtension(this.props.pathname) +
      location.hash
    );

    const namespaceNode = tinydoc.corpus.getNamespaceOfDocument(documentNode);
    const layout = getLayoutForDocument(documentNode, namespaceNode) || getDefaultLayout();

    const hasSidebarElements = layout.some(x => x.name === 'Layout::Sidebar');

    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-two-column-layout': hasSidebarElements
    });

    const ctx = {
      layout,
      namespaceNode,
      documentNode,
      hasSidebarElements
    };

    return (
      <div className={className}>
        <Banner
          links={this.props.config.bannerLinks}
          currentPath={this.props.path}
        />

        <div className="root__screen">
          {this.renderContent(ctx)}
        </div>
      </div>
    );
  },

  renderContent(ctx) {
    if (!ctx.documentNode) {
      return <NotFound />;
    }

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
          <div>
            {this.renderElements(ctx, 'Layout::ContentPanel')}
          </div>
        </TwoColumnLayout.RightColumn>
      </TwoColumnLayout>
    );
  },

  renderSingleColumnLayout(ctx) {
    return (
      <div>
        {this.renderElements(ctx, 'Layout::ContentPanel')}
      </div>
    );
  },

  renderElements(ctx, outlet) {
    const outletSpec = ctx.layout.filter(x => x.name === outlet)[0];

    if (!outletSpec || !outletSpec.children) {
      return null;
    }

    const children = [].concat(outletSpec.children);

    return children.map(x => {
      return (
        <Outlet
          key={x.name}
          name={x.name}
          outletOptions={x.options}
          elementProps={{
            params: this.props.params,
            query: this.props.query,
            documentNode: ctx.documentNode,
            namespaceNode: ctx.namespaceNode,
          }}
        />
      );
    })
  },

  reload() {
    this.forceUpdate();
  },
});

module.exports = Layout;

function getLayoutForDocument(node, namespaceNode) {
  if (!namespaceNode) {
    return null;
  }

  if (namespaceNode.meta.defaultLayouts) {
    const entry = namespaceNode.meta.defaultLayouts
      .filter(x => x.documentTypes.indexOf(node.type) > -1)[0]
    ;

    if (entry) {
      return entry.layout;
    }
  }
}

function getDefaultLayout() {
  return [
    {
      name: 'Layout::ContentPanel',
      children: null
    }
  ];
}