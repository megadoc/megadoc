const React = require("react");
const Outlet = require('components/Outlet');
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
  },

  shouldComponentUpdate: function() {
    return false;
  },

  render() {
    const { doc, moduleDocs } = this.props;
    const anchorId = Router.generateAnchorId({
      routeName: `${this.props.routeName}.module`,
      params: {
        moduleId: doc.id
      }
    });

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
        <h1 className="class-view__header markdown-text__heading" id={anchorId}>
          <span className="class-view__header-name">
            {doc.name}
          </span>

          {' '}

          <span className="class-view__header-type">
            <Outlet name="CJS::ModuleHeader::Type" props={this.props}>
              <span>{type}</span>
            </Outlet>
          </span>

          {anchorId && (
            <a
              href={'#'+anchorId}
              className="markdown-text__heading-anchor icon icon-link"
            />
          )}
        </h1>

        {this.props.showSourcePaths && (
          <div className="class-view__module-filepath type-mute">
            {doc.filePath}
          </div>
        )}
      </header>
    );
  }
});

module.exports = ModuleHeader;