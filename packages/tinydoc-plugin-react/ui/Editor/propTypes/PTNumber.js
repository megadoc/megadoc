const React = require('react');
const { string, func, } = React.PropTypes;

const PTNumber = React.createClass({
  propTypes: {
    onChange: func,
    path: string,
    value: string,
  },

  render() {
    return (
      <input
        type="number"
        className="form-input"
        onChange={this.emitChange}
        value={this.props.value}
      />
    );
  },

  emitChange(e) {
    const number = e.target.value;
    let newValue;

    if (number.length === 0) {
      newValue = undefined;
    }
    else {
      newValue = number;
    }

    this.props.onChange(this.props.path, newValue);
  }
});

module.exports = PTNumber;
