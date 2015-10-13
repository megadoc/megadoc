var React = require("react");
var HighlightedText = require('components/HighlightedText');
var PrecompiledText = require('components/PrecompiledText');

var ExampleTag = React.createClass({
  displayName: "ExampleTag",

  propTypes: {
    string: React.PropTypes.string,
  },

  render() {
    var { string } = this.props;
    var title;
    // var title = string.substr(0, string.indexOf('\n'));

    // TODO: this is broken in the pre-rendered version, we need to parse the
    // example name at compile time instead
    // if (title[0] === ' ') {
    //   title = null;
    // }
    // else {
    //   string = String(this.props.string).replace(title, '');
    // }

    return (
      <div className="example-tag">
        <p>
          {title && (
            <div>
              <strong>Example: </strong>
              <span dangerouslySetInnerHTML={{__html: title.replace('<p>', '').replace('</p>', '') }} />
            </div>
          )}

          {!title && (<strong>Example</strong>)}
        </p>

        <HighlightedText className="example-tag__code">
          {string}
        </HighlightedText>
      </div>
    );
  }
});

module.exports = ExampleTag;