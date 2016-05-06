const React = require("react");
const HighlightedText = require('components/HighlightedText');
const GitStats = require('components/GitStats');
const Disqus = require('components/Disqus');
const scrollToTop = require('utils/scrollToTop');
const HasTitle = require('mixins/HasTitle');
const HasMetaDescription = require('mixins/HasMetaDescription');
const Database = require('../Database');
const Document = require('components/Document');
const Outlet = require('components/Outlet');
const NotFound = require('components/NotFound');

const { shape, bool, string } = React.PropTypes;

const Article = React.createClass({
  propTypes: {
    routeName: string,
    config: shape({
      gitStats: bool,
    })
  },

  mixins: [
    HasTitle(function() {
      const article = Database.for(this.props.routeName).get(this.getArticleId());

      if (article) {
        return article.title;
      }
    }),

    HasMetaDescription(function() {
      const article = Database.for(this.props.routeName).get(this.getArticleId());

      if (article) {
        return article.summary;
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
    const article = Database.for(this.props.routeName).get(this.getArticleId());

    if (!article) {
      return <NotFound />;
    }

    return (
      <Document>
        <HighlightedText>{article.source}</HighlightedText>

        <Outlet
          name="Markdown::Document"
          elementProps={{ document: article }}
        />

        {this.props.config.gitStats && (
          <GitStats {...article.git} />
        )}

        <Disqus identifier={article.id} title={article.title} />
      </Document>
    );
  }
});

module.exports = Article;