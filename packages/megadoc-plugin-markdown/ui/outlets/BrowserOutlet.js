const React = require('react');
const ClassBrowser = require('../components/ClassBrowser')
const { object } = React.PropTypes;

megadoc.outlets.add('Markdown::Browser', {
  key: 'Markdown::Browser',

  component: React.createClass({
    propTypes: {
      namespaceNode: object,
    },

    render() {
      return (
        <ClassBrowser {...this.props} />
      );
    }
  })
});
