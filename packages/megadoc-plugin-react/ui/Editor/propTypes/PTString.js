const React = require('react');
const { string, func, } = React.PropTypes;

const PTString = React.createClass({
  propTypes: {
    onChange: func,
    path: string,
    value: string,
  },

  render() {
    return (
      <input
        className="form-input"
        onChange={this.emitChange}
        value={this.props.value}
      />
    );
  },

  emitChange(e) {
    this.props.onChange(this.props.path, e.target.value);
  }
});

module.exports = PTString;
