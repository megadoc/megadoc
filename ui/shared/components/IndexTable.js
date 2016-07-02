const React = require('react');
const { node } = React.PropTypes;

exports.Table = React.createClass({
  displayName: 'IndexTable.Table',
  propTypes: {
    children: node,
  },

  render() {
    return (
      <table className="index-table">
        <tbody>{this.props.children}</tbody>
      </table>
    );
  }
});

exports.Row = React.createClass({
  displayName: 'IndexTable.Row',
  propTypes: {
    children: node,
  },

  render() {
    return (
      <tr className="index-table__row">{this.props.children}</tr>
    );
  }
});

exports.Column = React.createClass({
  displayName: 'IndexTable.Column',
  propTypes: {
    children: node,
  },

  render() {
    return (
      <td className="index-table__column">{this.props.children}</td>
    );
  }
});

