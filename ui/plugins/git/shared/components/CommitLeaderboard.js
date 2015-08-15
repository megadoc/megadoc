var React = require('react');
var { Table, Column, Mixin:SortableTableMixin } = require('components/SortableTable');
var { sortBy, groupBy } = require('lodash');

var CommitLeaderboard = React.createClass({
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
      sortKey: 'commitCount',
      sortOrder: 'desc'
    };
  },

  render: function() {
    let oc = groupBy(this.props.committers, 'commitCount');
    let committers = Object.keys(oc).map(function(score) {
      return {
        commitCount: parseInt(score, 10),
        committers: oc[score].map((record) => record.name)
      };
    });

    committers = sortBy(committers, this.state.sortKey);

    if (this.state.sortOrder === 'desc') {
      committers = committers.reverse();
    }

    return (
      <Table className="commit-leaderboard table">
        <thead>
          <tr>
            <Column sortKey="commitCount"># Commits</Column>
            <th>Member(s)</th>
          </tr>
        </thead>

        <tbody>
          {committers.map(this.renderRecord)}
        </tbody>
      </Table>
    );
  },

  renderRecord(record) {
    return (
      <tr key={record.commitCount}>
        <td>{record.commitCount}</td>
        <td>{record.committers.join(', ')}</td>
      </tr>
    );
  }
});

module.exports = CommitLeaderboard;