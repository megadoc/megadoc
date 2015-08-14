var React = require("react");
var classSet = require("react/lib/cx");

var { string, func } = React.PropTypes;
var K = require("constants");
var SORT_ASC = K.SORT_ASC;
var SORT_DESC = K.SORT_DESC;

var Column = React.createClass({
  propTypes: {
    sortKey: string.isRequired,
    activeSortOrder: string
  },

  contextTypes: {
    onSort: func,
    activeSortKey: string,
    activeSortOrder: string
  },

  render: function() {
    var className = {};
    var { sortKey } = this.props;
    var { activeSortKey, activeSortOrder } = this.context;

    if (activeSortKey === sortKey) {
      className['sort-asc'] = activeSortOrder === SORT_ASC;
      className['sort-desc'] = activeSortOrder === SORT_DESC;
    }

    return (
      <th onClick={this.onClick} className={classSet(className)}>
        {this.props.children}
      </th>
    );
  },

  onClick: function() {
    this.context.onSort(this.props.sortKey);
  }
});

var SortableTable = React.createClass({
  displayName: "SortableTable",

  // childContextTypes: {
  //   onSort: func
  // },

  // getChildContext: function() {
  //   return { onSort: this.sort };
  // },

  render: function () {
    var { className } = this.props;

    return (
      <table className={className} children={this.props.children} />
    );
  },
});

exports.Mixin = {
  childContextTypes: {
    onSort: func,
    activeSortKey: string,
    activeSortOrder: string
  },

  getChildContext: function() {
    return {
      onSort: this.sort,
      activeSortKey: this.state.sortKey,
      activeSortOrder: this.state.sortOrder
    };
  },

  getInitialState: function() {
    return {
      // sortKey: 'sortableName',
      // sortOrder: 'asc'
    };
  },

  sort: function(prop) {
    var sortOrder;
    var sortKey = prop;

    if (this.state.sortKey === sortKey) {
      sortOrder = this.state.sortOrder === SORT_ASC ?
        SORT_DESC :
        SORT_ASC;
    }
    else {
      sortOrder = SORT_ASC;
    }

    this.setState({ sortKey, sortOrder }, () => {
      console.log("Sorting by %s (%s)", this.state.sortKey, this.state.sortOrder);
    });
  }
};

exports.Table = SortableTable;
exports.Column = Column;