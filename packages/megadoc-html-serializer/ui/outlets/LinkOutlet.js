const React = require('react');
const { shape, string } = React.PropTypes;
const Link = require('components/Link');

const LinkOutlet = React.createClass({
  contextTypes: {
    location: shape({
      pathname: string,
    }),
  },

  propTypes: {
    $outletOptions: shape({
      href: string.isRequired,
      text: string.isRequired,
      title: string,
    }).isRequired,
  },

  render() {
    const props = this.props.$outletOptions;

    return (
      <Link href={props.href} title={props.title} children={props.text} />
    );
  }
});

module.exports = function(megadoc) {
  megadoc.outlets.add('Link', {
    key: 'Link',
    component: LinkOutlet
  });
};