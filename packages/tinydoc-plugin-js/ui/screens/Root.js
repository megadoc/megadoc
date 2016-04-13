var React = require('react');
var ClassBrowser = require('components/ClassBrowser');
var { RouteHandler } = require('react-router');
var TwoColumnLayout = require('components/TwoColumnLayout');
var { LeftColumn, RightColumn } = TwoColumnLayout;
const Footer = require('components/Footer');

module.exports = function createRoot(routeName) {
  return React.createClass({
    displayName: 'JSRoot',

    propTypes: {
      query: React.PropTypes.object,
      params: React.PropTypes.shape({
        moduleId: React.PropTypes.string,
        entity: React.PropTypes.string,
      })
    },

    getInitialState: function() {
      return {
        sidebarWidth: '240px'
      };
    },

    render() {
      return (
        <TwoColumnLayout>
          <LeftColumn>
            <ClassBrowser
              routeName={routeName}
              activeModuleId={this.props.params.moduleId}
              activeEntityId={this.props.params.entity}
            />
          </LeftColumn>

          <RightColumn>
            <div>
              <RouteHandler routeName={routeName} {...this.props} />
            </div>
          </RightColumn>

        </TwoColumnLayout>
      );
    }
  });
};