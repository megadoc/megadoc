const React = require('react');
const HeadingAnchor = require('components/HeadingAnchor');
const classSet = require('utils/classSet');
const { string, node, bool, oneOfType, number } = React.PropTypes;

const AnchorableHeading = React.createClass({
  propTypes: {
    href: string.isRequired,
    children: node.isRequired,
    withLink: bool,
    level: oneOfType([ number, string ]).isRequired
  },

  getDefaultProps() {
    return {
      withLink: true
    };
  },

  render() {
    const DOMTag = `h${this.props.level}`;

    return (
      <DOMTag className={classSet(this.props.className, { 'anchorable-heading': true })}>
        <HeadingAnchor.Anchor href={this.props.href} />

        {this.props.withLink && (
          <HeadingAnchor.Link href={this.props.href} />
        )}

        <HeadingAnchor.Text children={this.props.children} />
      </DOMTag>
    );
  }
});

module.exports = AnchorableHeading;
