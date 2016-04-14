const React = require('react');
const HighlightedText = require('components/HighlightedText');
const Disqus = require('components/Disqus');
const GitStats = require('components/GitStats');
const Document = require('components/Document');
const { shape, string, arrayOf, number, object, bool, } = React.PropTypes;

const StaticFile = React.createClass({
  propTypes: {
    gitStats: object,
    disqusShortname: bool,
    filePath: string,
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

  render() {
    return (
      <Document>
        <HighlightedText children={this.props.file.html} />

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
  }
});

module.exports = StaticFile;
