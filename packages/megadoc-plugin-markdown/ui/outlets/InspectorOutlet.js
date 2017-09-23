const React = require('react');
const { shape, string, number } = React.PropTypes;
const WPM = 275; // https://help.medium.com/hc/en-us/articles/214991667-Read-time

module.exports = React.createClass({
  displayName: 'Markdown::InspectorOutlet',

  propTypes: {
    documentNode: shape({
      properties: shape({
        title: string,
        wordCount: number,
      })
    }),
  },

  render() {
    const doc = this.props.documentNode.properties;
    const expectedReadTime = Math.ceil(doc.wordCount / WPM);

    return (
      <p>
        {doc.title} <small>({expectedReadTime} min read)</small>
      </p>
    );
  }
});
