var React = require('react');
var { Table, Column, Mixin:SortableTableMixin } = require('components/SortableTable');
var { sortBy, groupBy } = require('lodash');
var classSet = require('utils/classSet');

var Leaderboard = React.createClass({
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
      sortKey: 'superStarIndex',
      sortOrder: 'desc'
    };
  },

  render: function() {
    // let oc = groupBy(this.props.committers, 'commitCount');
    // let committers = Object.keys(oc).map(function(score) {
    //   return {
    //     commitCount: parseInt(score, 10),
    //     committers: oc[score].map((record) => record.name)
    //   };
    // });
    let committers = this.props.committers;
    committers = sortBy(committers, this.state.sortKey);

    if (this.state.sortOrder === 'desc') {
      committers = committers.reverse();
    }

    return (
      <Table className="leaderboard table">
        <thead>
          <tr>
            <th>Member</th>
            <Column sortKey="superStarIndex">Superstar Index</Column>
            <Column sortKey="commitCount">Commits</Column>
            <Column sortKey="reviewCount">Reviews</Column>
          </tr>
        </thead>

        <tbody>
          {committers.map(this.renderRecord)}
        </tbody>
      </Table>
    );
  },

  renderRecord(record) {
    var className = classSet({
      'leaderboard__superstar-record': record.isSuperstar
    });

    return (
      <tr key={record.commitCount} className={className}>
        <td>{record.name}{record.isSuperstar && (<em> - wowza</em>)}</td>
        <td>{(record.superStarIndex * 100).toFixed(2)}</td>
        <td>{record.commitCount}</td>
        <td>{record.reviewCount}</td>
      </tr>
    );
  }
});

module.exports = Leaderboard;