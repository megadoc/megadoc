const React = require('react');
const { string, any } = React.PropTypes;

const DocGroup = React.createClass({
  propTypes: {
    tagName: string,
    label: string,
    className: string,
    children: any
  },

  getDefaultProps: function() {
    return {
      tagName: 'div',
    };
  },

  shouldComponentUpdate: function(nextProps) {
    return this.props.children !== nextProps.children;
  },

  render() {
    const DOMTag = this.props.tagName;

    return (
      <div className="doc-group">
        <h2 className="doc-group__header" children={this.props.label} />

        <DOMTag className={this.props.className}>
          {this.props.children}
        </DOMTag>
      </div>
    );
  }
});

module.exports = DocGroup;