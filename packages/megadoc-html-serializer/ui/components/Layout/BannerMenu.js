const React = require("react");
const Link = require("components/Link");
const Icon = require('components/Icon');
const classSet = require('utils/classSet');
const DocumentURI = require('../../DocumentURI');
const getLinkHref = require('./getLinkHref');
const { string, oneOf, arrayOf, shape, } = React.PropTypes;

const BannerMenu = React.createClass({
  propTypes: {
    currentPath: string,
    openStrategy: oneOf([ 'hover', 'click' ]),
    text: string.isRequired,
    href: string,
    links: arrayOf(shape({
      text: string.isRequired,
      href: string.isRequired
    })).isRequired,
  },

  contextTypes: {
    documentURI: React.PropTypes.instanceOf(DocumentURI).isRequired,
  },

  getDefaultProps() {
    return {
      openStrategy: 'hover'
    };
  },

  getInitialState() {
    return {
      clicked: false,
      hovering: false,
    };
  },

  componentWillUpdate(nextProps) {
    if (nextProps.currentPath !== this.props.currentPath && this.state.clicked) {
      this.close();
    }
  },

  render() {
    const isOpen = this.props.openStrategy === 'click' ?
      this.state.clicked :
      this.state.hovering
    ;
    const isActive = this.props.links.some(x => this.props.currentPath === x.href);
    const icon = <Icon className="icon-arrow-down" />;

    return (
      <div
        onMouseEnter={this.trackCursorOn}
        onMouseLeave={this.trackCursorOff}
        className={classSet("banner__menu", {
          "banner__menu--open": isOpen,
          "banner__menu--active": isActive,
        })
      }>
        <span
          className="banner__menu-title"
          onClick={this.toggle}
        >
          {this.props.href ? (
            <Link
              href={this.context.documentURI.withExtension(this.props.href)}
              active={isActive}
              activePattern={this.props.activePattern}
            >
              {this.props.text} {icon}
            </Link>
          ) : (
            <span>{this.props.text} {icon}</span>
          )}
        </span>


        {isOpen && (
          <ul className="banner__menu-list">
            {this.props.links.map(this.renderLink)}
          </ul>
        )}
      </div>
    );
  },

  renderLink(link) {
    return (
      <li key={link.href + link.text} className="banner__menu-list-item">
        <Link
          href={getLinkHref(this, link)}
          children={link.text}
        />
      </li>
    );
  },

  trackCursorOn() {
    if (!this.state.hovering) {
      this.setState({ hovering: true });
    }
  },

  trackCursorOff() {
    if (this.state.hovering) {
      this.setState({ hovering: false });
    }
  },

  toggle() {
    this.setState({ clicked: !this.state.clicked });
  },

  close() {
    this.setState({ clicked: false });
  }
});

module.exports = BannerMenu;