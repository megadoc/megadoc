var React = require('react');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var Database = require('core/Database');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;

var YARDAPIRoot = React.createClass({
  propTypes: {
    params: React.PropTypes.shape({
      resourceId: React.PropTypes.string
    })
  },

  render() {
    return (
      <TwoColumnLayout className="yard-api-root">
        <LeftColumn>
          <ClassBrowser
            activeResourceId={this.props.params.resourceId}
            objects={Database.getAllTags()}
          />
        </LeftColumn>

        <RightColumn>
          <div className="yard-api-root__content">
            <RouteHandler {...this.props} />
          </div>
        </RightColumn>
      </TwoColumnLayout>
    );
  }
});

module.exports = YARDAPIRoot;