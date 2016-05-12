const React = require('react');
const HighlightedText = require('components/HighlightedText');
const Disqus = require('components/Disqus');
const { shape, string, arrayOf, number, bool, oneOf, } = React.PropTypes;

const StaticFile = React.createClass({
  propTypes: {
    namespaceNode: shape({
      config: shape({
        scrollToTop: bool,
        disqusShortname: bool,
        filePath: string,
        format: oneOf([ 'md', 'html' ]),
      }),
    }),

    documentNode: shape({
      properties: shape({
        html: string,
        toc: arrayOf(shape({
          html: string,
          id: string,
          level: number,
          scopedId: string,
          text: string,
        })),
      }),
    }),
  },

  render() {
    const config = this.props.namespaceNode.config;
    const file = this.props.documentNode.properties;

    return (
      <div>
        {this.renderContent(config.format, file.html)}

        {config.disqusShortname && (
          <Disqus
            identifier={config.filePath}
            title={config.disqusShortname}
          />
        )}

      </div>
    );
  },

  renderContent(format, content) {
    if (format === 'html') {
      return <div dangerouslySetInnerHTML={{__html: content}} />;
    }

    return <HighlightedText children={content} />;
  }
});

module.exports = StaticFile;
