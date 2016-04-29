const React = require('react');
const HighlightedText = require('components/HighlightedText');
const Disqus = require('components/Disqus');
const GitStats = require('components/GitStats');
const Document = require('components/Document');
const scrollToTop = require('utils/scrollToTop');
const { shape, string, arrayOf, number, object, bool, oneOf, } = React.PropTypes;

const StaticFile = React.createClass({
  propTypes: {
    scrollToTop: bool,
    gitStats: object,
    disqusShortname: bool,
    filePath: string,
    format: oneOf([ 'md', 'html' ]),
    file: shape({
      html: string,
      toc: arrayOf(shape({
        html: string,
        id: string,
        level: number,
        scopedId: string,
        text: string,
      }))
    }),
  },

  componentDidMount() {
    if (this.props.scrollToTop) {
      scrollToTop();
    }
  },

  render() {
    return (
      <Document>
        {this.renderContent(this.props.format, this.props.file.html)}

        {this.props.gitStats && (
          <GitStats {...this.props.gitStats} />
        )}

        {this.props.disqusShortname && (
          <Disqus
            identifier={this.props.filePath}
            title={this.props.disqusShortname}
          />
        )}

      </Document>
    );
  },

  renderContent(format, content) {
    if (format === 'html') {
      return <div dangerouslySetInnerHTML={{__html: content}} />;
    }

    return <HighlightedText children={this.props.file.html} />;
  }
});

module.exports = StaticFile;
