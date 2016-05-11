const React = require("react");
const HighlightedText = require('components/HighlightedText');
const Disqus = require('components/Disqus');
const scrollToTop = require('utils/scrollToTop');
const HasTitle = require('mixins/HasTitle');
const HasMetaDescription = require('mixins/HasMetaDescription');
const Database = require('../Database');
const Document = require('components/Document');
const Outlet = require('components/Outlet');
const NotFound = require('components/NotFound');

const { shape, string, object } = React.PropTypes;

const Article = React.createClass({
  propTypes: {
    documentNode: shape({
      meta: shape({
        gitStats: object,
      }),

      source: string,
    }).isRequired,
  },

  mixins: [
    // HasTitle(function() {
    //   const article = Database.for(this.props.routeName).get(this.getArticleId());

    //   if (article) {
    //     return article.title;
    //   }
    // }),

    // HasMetaDescription(function() {
    //   const article = Database.for(this.props.routeName).get(this.getArticleId());

    //   if (article) {
    //     return article.summary;
    //   }
    // })
  ],

  // componentDidMount: function() {
  //   scrollToTop();
  // },

  // componentDidUpdate: function(prevProps) {
  //   if (this.getArticleId(prevProps) !== this.getArticleId()) {
  //     scrollToTop();
  //   }
  // },

  // getArticleId(props = this.props) {
  //   return props.params.articleId;
  // },

  render() {
    const article = this.props.documentNode.properties;
    // const article = Database.for(this.props.routeName).get(this.getArticleId());

    // if (!article) {
    //   return <NotFound />;
    // }

    return (
      <Document>
        <HighlightedText>{article.source}</HighlightedText>

        <Disqus identifier={article.id} title={article.title} />
      </Document>
    );
  }
});

module.exports = Article;