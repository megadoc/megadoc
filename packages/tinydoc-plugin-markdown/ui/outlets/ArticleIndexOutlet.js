const React = require('react');
const ClassBrowser = require('../components/ClassBrowser')
const { object } = React.PropTypes;

tinydoc.outlets.add('Markdown::ArticleIndex', {
  key: 'Markdown::ArticleIndex',

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
