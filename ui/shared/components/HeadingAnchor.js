const React = require('react');
const classSet = require('utils/classSet');
const { string, bool, } = React.PropTypes;

exports.Anchor = React.createClass({
  displayName: 'HeadingAnchor.Anchor',

  propTypes: {
    href: string,
  },

  render() {
    return (
      <a name={this.props.href} className="anchorable-heading__anchor" />
    );
  }
});

exports.Text = React.createClass({
  displayName: 'HeadingAnchor.Text',

  render() {
    return (
      <span
        {...this.props}
        className={classSet(this.props.className, { "anchorable-heading__text": true })}
      />
    );
  }
});

exports.Link = React.createClass({
  displayName: 'HeadingAnchor.Link',

  propTypes: {
    href: string,
    className: string,
    trailing: bool,
  },

  render() {
    const className = classSet(this.props.className, {
      "anchorable-heading__link": true,
      "anchorable-heading__link--trailing": Boolean(this.props.trailing),
      "icon": true,
      "icon-link": true,
    });

    return (
      <a className={className} href={`#${this.props.href}`} />
    );
  }
});