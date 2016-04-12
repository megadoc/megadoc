const React = require("react");
const Heading = require('components/Heading');
const { string, object, bool, number } = React.PropTypes;

const ModuleHeader = React.createClass({
  propTypes: {
    doc: object,
    commonPrefix: string,
    showSourcePaths: bool,
    anchorId: string,
    showNamespace: bool,
    level: number,
  },

  shouldComponentUpdate: function(prevProps) {
    return prevProps.doc !== this.props.doc;
  },

  render() {
    const { doc, anchorId } = this.props;

    let type;

    if (doc.ctx.type === 'function') {
      type = 'Function';
    }
    else {
      type = 'Object';
    }

    let id = doc.id;

    if (doc.ctx.type === 'function' && doc.indexer === ':') {
      id = `${doc.receiver}:${doc.id}`;
    }

    return (
      <header>
        <Heading
          level={this.props.level || 1}
          className="lua-module__header markdown-text__heading"
          title={this.props.showSourcePaths ? doc.filePath : undefined}
          id={anchorId}
        >
          <span className="lua-module__header-name">
            {id}
          </span>

          {' '}

          <span className="lua-module__header-type">
            <span>{type}</span>
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