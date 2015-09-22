var React = require("react");
var MarkdownText = require('components/MarkdownText');
var GitStats = require('components/GitStats');
var config = require('config');
var Disqus = require('components/Disqus');
var scrollToTop = require('utils/scrollToTop');
var HasTitle = require('mixins/HasTitle');
var Router = require('core/Router');

var Article = React.createClass({
  mixins: [
    HasTitle(function() {
      var article = this.props.database.get(this.getArticleId());

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
    return props.params.splat;
  },

  render() {
    var article = this.props.database.get(this.getArticleId());

    if (!article) {
      Router.goToNotFound();
      return null;
    }

    return (
      <div className="doc-content">
        <MarkdownText jumpy>{article.source}</MarkdownText>

        {config.gitStats && (
          <GitStats {...article.git} />
        )}

        <Disqus identifier={article.id} title={article.title} />
      </div>
    );
  }
});

module.exports = Article;