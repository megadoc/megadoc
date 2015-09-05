var React = require("react");
var Icon = require('components/Icon');

var ModuleHeader = React.createClass({
  propTypes: {
    doc: React.PropTypes.object,
    commonPrefix: React.PropTypes.string
  },

  render() {
    var { doc } = this.props;
    let type;

    if (doc.isClass) {
      type = 'Class';
    }
    else if (doc.isFunction) {
      type = 'Function';
    }
    else {
      type = 'Module';
    }

    return (
      <header>
        <h1 className="class-view__header">
          <Icon className="icon-cube" />
          {' '}

          <span className="class-view__header-name">
            {doc.ctx.name}
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