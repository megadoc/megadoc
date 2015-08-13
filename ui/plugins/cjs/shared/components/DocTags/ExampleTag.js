var React = require("react");
var MarkdownText = require('components/MarkdownText');

var ExampleTag = React.createClass({
  displayName: "ExampleTag",

  statics: {
    getKey: function(tag) {
      return tag.string;
    }
  },

  render() {
    var { string } = this.props;
    var title = string.substr(0, string.indexOf('\n'));

    console.log(title);

    if (title[0] === ' ') {
      title = null;
    }
    else {
      string = String(this.props.string).replace(title, '');
    }

    return(
      <div>
        <p>
          <strong>Example</strong>

          {title &&
            <span>
              {': '}
              {title}
            </span>
          }
        </p>

        <MarkdownText className="example-tag__code">
          {string}
        </MarkdownText>
      </div>
    );
  }
});

module.exports = ExampleTag;