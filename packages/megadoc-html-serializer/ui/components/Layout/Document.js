const React = require('react');
const classSet = require('classnames')
const Document = React.createClass({
  render() {
    return (
      <div {...this.props} className={classSet("doc-content", this.props.className)} />
    );
  }
});

module.exports = Document;
