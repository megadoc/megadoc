const React = require("react");
const Banner = require('./Banner');
const Outlet = require('components/Outlet');
const TwoColumnLayout = require('components/TwoColumnLayout');
const classSet = require('utils/classSet');
const NotFound = require('components/NotFound');
const DocumentURI = require('core/DocumentURI');

const { node, shape, string, arrayOf, array, object, } = React.PropTypes;
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
    path: string,
    pathname: string,
    params: object, // DEPRECATED
    query: object, // DEPRECATED
    config: shape({
      bannerLinks: arrayOf(Link)
    })
  },

  getDefaultProps() {
    return {
      config: {
        bannerLinks: [],
        layouts: []
      }
    };
  },

  render() {
    const documentHref = DocumentURI.withExtension(this.props.pathname) + window.location.hash;
    const documentNode = tinydoc.corpus.getByURI(documentHref);

    const namespaceNode = tinydoc.corpus.getNamespaceOfDocument(documentNode);
    const layout = (
      getLayoutForDocument(documentNode, this.props.config.layouts) ||
      getDefaultLayoutForDocument(documentNode, namespaceNode) ||
      getDefaultLayout()
    );

    const hasSidebarElements = layout.some(x => x.name === 'Layout::Sidebar');

    const className = classSet({
      'root': true,
      'root--with-multi-page-layout': true,
      'root--with-two-column-layout': hasSidebarElements
    });

    if (!documentNode) {
      console.warn("Unable to find a document at the URI:", documentHref);
    }

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
            {this.renderElements(ctx, 'Layout::Content')}
          </div>
        </TwoColumnLayout.RightColumn>
      </TwoColumnLayout>
    );
  },

  renderSingleColumnLayout(ctx) {
    return (
      <div>
        {this.renderElements(ctx, 'Layout::Content')}
      </div>
    );
  },

  renderElements(ctx, outlet) {
    const outletSpec = ctx.layout.filter(x => x.name === outlet)[0];

    if (!outletSpec || !outletSpec.children) {
      return null;
    }

    const children = [].concat(outletSpec.children);

    children.forEach(function({ name }) {
      if (!Outlet.isDefined(name)) {
        console.warn(
          "Outlet '%s' has not been defined, this is most likely " +
          "a configuration error. Please verify the outlet name is correct.",
          name
        );
      }
    })

    console.debug('rendering outlets:', children.map(x => x.name))

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

function getDefaultLayoutForDocument(documentNode, namespaceNode) {
  if (!namespaceNode) {
    return null;
  }

  if (namespaceNode.meta.defaultLayouts) {
    return getLayoutForDocument(documentNode, namespaceNode.meta.defaultLayouts);
  }
}

function getLayoutForDocument(documentNode, layouts) {
  const entry = layouts.filter(x => {
    return (
      (
        x.documentTypes &&
        x.documentTypes.indexOf(documentNode.type) > -1
      ) ||
      (
        x.documentUID === documentNode.uid
      ) ||
      (
        x.documentUIDs &&
        x.documentUIDs.indexOf(documentNode.uid) > -1
      )
    );
  })[0];

  if (entry) {
    return entry.layout;
  }
}

function getDefaultLayout() {
  return [
    {
      name: 'Layout::Content',
      children: null
    }
  ];
}