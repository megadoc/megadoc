const React = require('react');
const Checkbox = require('components/Checkbox');
const { bool, func, string, } = React.PropTypes;

const PTBool = React.createClass({
  propTypes: {
    value: bool,
    onChange: func,
    path: string,
  },

  render() {
    return (
      <Checkbox
        onChange={this.emitChange}
        checked={this.props.value === true}
      />
    );
  },

  emitChange(e) {
    this.props.onChange(this.props.path, e.target.checked, {
      shouldReload: true
    });
  }
});

module.exports = PTBool;
