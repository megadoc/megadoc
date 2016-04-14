const React = require('react');
const Document = require('components/Document');
const StaticFile = require('./StaticFile');

const StandaloneStaticFile = React.createClass({
  render() {
    return (
      <Document>
        <StaticFile {...this.props} />
      </Document>
    );
  }
});

module.exports = StandaloneStaticFile;
