const React = require("react");
const HighlightedText = require('components/HighlightedText');
const Disqus = require('components/Disqus');

const { shape, string, object, oneOfType, bool, } = React.PropTypes;

const Article = React.createClass({
  contextTypes: {
    location: shape({ pathname: string }).isRequired,
    config: shape({
      disqus: oneOfType([ bool, object ]),
    }).isRequired,
  },

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

        <Disqus
          identifier={article.id}
          title={article.title}
          pathname={this.context.location.pathname}
          config={this.context.config.disqus || { enabled: false } }
        />
      </div>
    );
  }
});

module.exports = Article;