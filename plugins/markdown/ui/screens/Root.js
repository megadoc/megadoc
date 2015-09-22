var React = require('react');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;

var MarkdownRoot = React.createClass({
  propTypes: {
    params: React.PropTypes.shape({
      splat: React.PropTypes.string
    }),

    database: React.PropTypes.object
  },

  render() {
    const { database } = this.props;

    if (this.props.config.layout === 'SinglePageLayout') {
      return <RouteHandler {...this.props} />
    }

    return (
      <TwoColumnLayout className="markdown-root">
        <LeftColumn>
          <ClassBrowser
            routeName={this.props.routeName}
            activeArticleId={this.props.params.splat}
            folders={database.getFolders()}
            articles={database.getArticles()}
          />
        </LeftColumn>

        <RightColumn>
          <div className="markdown-root__content">
            <RouteHandler {...this.props} />
          </div>
        </RightColumn>
      </TwoColumnLayout>
    );
  }
});

module.exports = MarkdownRoot;