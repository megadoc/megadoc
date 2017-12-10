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
    className: string,
    documentNode: shape({
      source: string,
    }).isRequired,
  },

  render() {
    const article = this.props.documentNode.properties;

    return (
      <div className={this.props.className}>
        <HighlightedText>{article.source}</HighlightedText>

        {this.context.config.disqus && (
          <Disqus
            identifier={article.id}
            title={article.title}
            pathname={this.context.location.pathname}
            config={this.context.config.disqus}
          />
        )}
      </div>
    );
  }
});

module.exports = Article;