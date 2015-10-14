const React = require("react");
const HighlightedText = require('components/HighlightedText');
const GitStats = require('components/GitStats');
const Disqus = require('components/Disqus');
const scrollToTop = require('utils/scrollToTop');
const HasTitle = require('mixins/HasTitle');
const Router = require('core/Router');

const { shape, object, bool } = React.PropTypes;

const Article = React.createClass({
  propTypes: {
    database: object,
    config: shape({
      gitStats: bool
    })
  },

  mixins: [
    HasTitle(function() {
      const article = this.props.database.get(this.getArticleId());

      if (article) {
        return article.title;
      }
    })
  ],

  componentDidMount: function() {
    scrollToTop();
  },

  componentDidUpdate: function(prevProps) {
    if (this.getArticleId(prevProps) !== this.getArticleId()) {
      scrollToTop();
    }
  },

  getArticleId(props = this.props) {
    return props.params.articleId;
  },

  render() {
    const article = this.props.database.get(this.getArticleId());

    if (!article) {
      Router.goToNotFound();
      return null;
    }

    return (
      <div className="doc-content">
        <HighlightedText>{article.source}</HighlightedText>

        {this.props.config.gitStats && (
          <GitStats {...article.git} />
        )}

        <Disqus identifier={article.id} title={article.title} />
      </div>
    );
  }
});

module.exports = Article;