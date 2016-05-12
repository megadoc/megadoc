const React = require('react');

exports.Table = React.createClass({
  displayName: 'IndexTable.Table',

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

  render() {
    return (
      <tr className="index-table__row">{this.props.children}</tr>
    );
  }
});

exports.Column = React.createClass({
  displayName: 'IndexTable.Column',

  render() {
    return (
      <td className="index-table__column">{this.props.children}</td>
    );
  }
});

