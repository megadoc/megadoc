const React = require("react");
const Icon = require('components/Icon');
const K = require('constants');

const ModuleHeader = React.createClass({
  propTypes: {
    doc: React.PropTypes.object,
    commonPrefix: React.PropTypes.string,
    moduleDocs: React.PropTypes.array
  },

  render() {
    const { doc, moduleDocs } = this.props;
    let type;

    if (!doc.ctx) {
      return <header>Unsupported Entity</header>;
    }

    if (doc.ctx.type === 'component') {
      type = 'Component';
    }
    else if (moduleDocs.some((d) => d.ctx.scope === K.SCOPE_PROTOTYPE))  {
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
        <h1 className="class-view__header">
          <Icon className="icon-cube" />
          {' '}

          <span className="class-view__header-name">
            {doc.name}
          </span>

          {' '}
          <span className="class-view__header-type">{type}</span>
        </h1>

        <div className="class-view__module-filepath">
          Defined in: {doc.filePath.replace(this.props.commonPrefix, '')}
        </div>
      </header>
    );
  }
});

module.exports = ModuleHeader;