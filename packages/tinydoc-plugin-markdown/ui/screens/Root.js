var React = require('react');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;
const { string, shape } = React.PropTypes;

var MarkdownRoot = React.createClass({
  propTypes: {
    params: shape({
      splat: string
    }),

    routeName: string,

    config: shape({
      layout: string,
    })
  },

  render() {
    if (this.props.config.layout === 'SinglePageLayout') {
      return <RouteHandler {...this.props} />
    }

    return (
      <TwoColumnLayout className="markdown-root">
        <LeftColumn>
          <ClassBrowser
            routeName={this.props.routeName}
            activeArticleId={decodeURIComponent(this.props.params.articleId)}
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