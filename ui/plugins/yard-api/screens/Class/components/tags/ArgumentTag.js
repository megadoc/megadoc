var React = require("react");

var ArgumentTag = React.createClass({
  displayName: "ArgumentTag",

  render() {
    return(
      <div className="argument-tag">
        <div className="argument-tag__header">
          <strong>{this.props.name}</strong>
          {this.props.is_required && (
            ' (required) '
          )}

          {' '}
          <span className="argument-tag__header-types">
            {this.props.types}
          </span>
        </div>

        <div>{this.props.text}</div>
      </div>
    );
  }
});

module.exports = ArgumentTag;