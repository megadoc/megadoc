const React = require("react");
const Outlet = require('components/Outlet');
const Heading = require('components/Heading');
const K = require('constants');
const Router = require('core/Router');

const { string, object, array, bool } = React.PropTypes;

const ModuleHeader = React.createClass({
  propTypes: {
    routeName: string.isRequired,
    doc: object,
    commonPrefix: string,
    moduleDocs: array,
    showSourcePaths: bool,
    headerLevel: string,
    generateAnchor: bool,
    showNamespace: bool,
  },

  getDefaultProps: function() {
    return {
      headerLevel: '1',
      generateAnchor: true,
    };
  },

  shouldComponentUpdate: function(prevProps) {
    return prevProps.doc !== this.props.doc;
  },

  render() {
    const { doc, moduleDocs } = this.props;
    let anchorId;

    if (this.props.generateAnchor) {
      anchorId = Router.generateAnchorId({
        routeName: `${this.props.routeName}.module`,
        params: {
          moduleId: doc.id
        }
      });
    }

    let type;

    if (!doc.ctx) {
      return <header>Unsupported Entity</header>;
    }

    if (moduleDocs.some((d) => d.ctx.scope === K.SCOPE_PROTOTYPE))  {
      type = 'Class';
    }
    else if (moduleDocs.some((d) => d.ctx.scope === K.SCOPE_FACTORY_EXPORTS))  {
      type = 'Factory';
    }
    else if (doc.ctx.type === K.TYPE_FUNCTION) {
      type = 'Function';
    }
    else {
      type = 'Object';
    }

    return (
      <header>
        <Heading
          level="1"
          parentLevel={this.props.headerLevel}
          className="class-view__header markdown-text__heading"
          title={this.props.showSourcePaths ? doc.filePath : undefined}
          id={anchorId}
        >
          <span className="class-view__header-name">
            {doc.name}
          </span>

          {' '}

          {this.props.showNamespace && doc.namespace && (
            <span className="class-view__header-namespace">
              {'{'}{doc.namespace}{'}'}
            </span>
          )}

          {' '}

          <span className="class-view__header-type">
            <Outlet name="CJS::ModuleHeader::Type" props={this.props} tagName="span">
              <span>{type}</span>
            </Outlet>
          </span>

          {anchorId && (
            <a
              href={'#'+anchorId}
              className="markdown-text__heading-anchor icon icon-link"
            />
          )}
        </Heading>
      </header>
    );
  }
});

module.exports = ModuleHeader;