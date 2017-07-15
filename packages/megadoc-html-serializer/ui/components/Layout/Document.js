const React = require('react');
const Document = React.createClass({
  render() {
    return (
      <div className="doc-content" {...this.props} />
    );
  }
});

module.exports = Document;
