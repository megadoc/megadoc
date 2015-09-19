const React = require("react");
const MarkdownText = require('components/MarkdownText');
const Button = require('components/Button');

const TAB_CODE = 'code';
const TAB_PREVIEW = 'preview';

const ExampleTag = React.createClass({
  displayName: "ExampleTag",

  propTypes: {
    string: React.PropTypes.string
  },

  getInitialState: function() {
    return {
      activeTab: TAB_PREVIEW
    };
  },

  componentDidMount: function() {
    const iframe = React.findDOMNode(this.refs.iframe);
    const { document } = iframe.contentWindow;

    document.open();
    document.write(this.props.tag.code);
    document.close();
  },

  render() {
    const { tag } = this.props;
    var { string } = this.props.tag;
    var title = string.substr(0, string.indexOf('\n'));
    var type = this.props.tag.typeInfo.types[0];

    if (title[0] === ' ') {
      title = null;
    }
    // else {
    //   string = String(this.props.string).replace(title, '');
    // }

    return (
      <div className="live-example-tag">
        {title && (
          <p>
            <span><strong>Example:</strong> {title}</span>
          </p>
        )}

        {this.renderControls()}

        {this.state.activeTab === TAB_CODE && (
          <MarkdownText className="example-tag__code">
            {'```' + type + '\n' + string.replace(/[ ]{4}/g, '') + '\n```'}
          </MarkdownText>
        )}

        <iframe
          ref="iframe"
          className="live-example-tag__iframe"
          style={{
            display: this.state.activeTab === TAB_PREVIEW ? 'block' : 'none',
            width: tag.typeInfo.width || 'auto',
            height: tag.typeInfo.height || 'auto',
          }}
        />
      </div>
    );
  },

  renderControls() {
    const { activeTab } = this.state;

    return (
      <div className="live-example-tag__controls">
        <Button
          onClick={() => this.setState({ activeTab: TAB_CODE })}
          disabled={activeTab === TAB_CODE}
          className={activeTab === TAB_CODE ? 'active' : undefined}
          children="View Code"
        />

        {' '}

        <Button
          onClick={() => this.setState({ activeTab: TAB_PREVIEW })}
          disabled={activeTab === TAB_PREVIEW}
          className={activeTab === TAB_PREVIEW ? 'active' : undefined}
          children="Run"
        />
      </div>
    );
  }
});

module.exports = ExampleTag;