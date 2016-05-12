const React = require('react');
const classSet = require('utils/classSet');
const { string, bool, node, } = React.PropTypes;

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

  propTypes: {
    children: node.isRequired,
  },

  render() {
    const needsWrapper = React.Children.count(this.props.children) > 1;

    if (needsWrapper) {
      return (
        <span
          className="anchorable-heading__text"
          children={this.props.children}
        />
      );
    }
    else {
      const child = React.Children.only(this.props.children);

      return React.cloneElement(child, {
        className: classSet(child.props.className, {
          "anchorable-heading__text": true
        })
      });
    }
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
      <a className={className} href={`#${this.props.href}`} onClick={intercept} />
    );
  }
});

function intercept(e) {
  e.stopPropagation();
}