const React = require('react');
const { omit } = require('lodash');

const { string, number, oneOfType } = React.PropTypes;

let startingLevel = 1;
let previousLevel = 1;

const Heading = React.createClass({
  statics: {
    setStartingLevel(level) {
      previousLevel = startingLevel;
      startingLevel = level;
    },

    restoreStartingLevel() {
      startingLevel = previousLevel;
      previousLevel = 1;
    }
  },

  propTypes: {
    parentLevel: oneOfType([string, number]),
    level: oneOfType([string, number]),
  },

  getDefaultProps: function() {
    return {
      parentLevel: 1
    };
  },

  render() {
    const level = Math.min(6,
      parseInt(this.props.parentLevel || startingLevel, 10) +
      parseInt(this.props.level, 10) -
      1
    );

    const Tag = `h${level}`;

    return (
      <Tag {...omit(this.props, [ 'parentLevel', 'level' ])} />
    );
  }
});

module.exports = Heading;
