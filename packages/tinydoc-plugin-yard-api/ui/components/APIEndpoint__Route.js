const React = require('react');
const classSet = require('utils/classSet');
const { shape, string, bool, } = React.PropTypes;

const APIEndpointRoute = React.createClass({
  propTypes: {
    route: shape({
      verb: string,
      path: string,
    }),

    standalone: bool,
  },

  render() {
    const { route } = this.props;

    return (
      <div
        className={classSet("api-endpoint__route", {
          'api-endpoint__route--standalone': this.props.standalone,
          'api-endpoint__route--skinned': !this.props.standalone,
        })
      }>
        <span className="api-endpoint__route-verb">
          {route.verb}
        </span>

        {' '}

        {highlightDynamicFragments(route.path)}
      </div>
    );
  }
});

module.exports = APIEndpointRoute;

function highlightDynamicFragments(route) {
  const fragments = route.split('/');

  return fragments.map(function(fragment, index) {
    return (
      <span key={fragment}>
        {fragment.match(/^:[\w|_]+$/) ? (
          <span className="api-endpoint__route-dynamic-fragment">
            {fragment}
          </span>
        ) : (
          fragment
        )}

        {index !== fragments.length-1 && '/'}
      </span>
    );
  });
}
