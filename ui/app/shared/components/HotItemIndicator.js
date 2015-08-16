var React = require('react');
var Icon = require('components/Icon');

var HotItemIndicator = React.createClass({

  render: function() {
    return (
      <Icon
        title="This item is hot! It has been edited recently."
        className="icon-fire hot-item-indicator"
      />
    );
  }

});

module.exports = HotItemIndicator;