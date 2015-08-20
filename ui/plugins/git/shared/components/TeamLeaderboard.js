var React = require('react');
var { Table, Column, Mixin: SortableTableMixin } = require('components/SortableTable');
var { sortBy } = require('lodash');

var TeamLeaderboard = React.createClass({
  mixins: [ SortableTableMixin ],

  propTypes: {
    committers: React.PropTypes.arrayOf(React.PropTypes.shape({
      commitCount: React.PropTypes.number,
      email: React.PropTypes.string,
      name: React.PropTypes.string
    }))
  },

  getDefaultProps: function() {
    return {
      committers: []
    };
  },

  getInitialState: function() {
    return {
      sortKey: 'name',
      sortOrder: 'asc'
    };
  },

  render: function() {
    let teams = sortBy(this.props.teams, this.state.sortKey);

    if (this.state.sortOrder === 'desc') {
      teams = teams.reverse();
    }

    return (
      <Table className="leaderboard table">
        <thead>
          <tr>
            <Column sortKey="name">Team</Column>
            <Column sortKey="commitCount">Commits</Column>
            <Column sortKey="reviewCount">Reviews</Column>
          </tr>
        </thead>

        <tbody>
          {teams.map(this.renderRecord)}
        </tbody>
      </Table>
    );
  },

  renderRecord(record) {
    return (
      <tr key={record.name}>
        <td>{record.name}</td>
        <td>{record.commitCount}</td>
        <td>{record.reviewCount}</td>
      </tr>
    );
  }
});

module.exports = TeamLeaderboard;