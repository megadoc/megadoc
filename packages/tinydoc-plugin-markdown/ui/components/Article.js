const React = require("react");
const HighlightedText = require('components/HighlightedText');
const Disqus = require('components/Disqus');

const { shape, string, } = React.PropTypes;

const Article = React.createClass({
  propTypes: {
    documentNode: shape({
      source: string,
    }).isRequired,
  },

  render() {
    const article = this.props.documentNode.properties;

    return (
      <div>
        <HighlightedText>{article.source}</HighlightedText>

        <Disqus identifier={article.id} title={article.title} />
      </div>
    );
  }
});

module.exports = Article;