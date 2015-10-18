const React = require('react');
const { omit } = require('lodash');

const { string, node } = React.PropTypes;

const Heading = React.createClass({
  propTypes: {
    parentLevel: string,
    level: string,
  },

  render() {
    const level = Math.min(6,
      parseInt(this.props.parentLevel, 10) +
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
