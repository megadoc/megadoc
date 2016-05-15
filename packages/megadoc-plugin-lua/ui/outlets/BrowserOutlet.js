const React = require('react');
const Browser = require('../components/Browser');

const BrowserOutlet = React.createClass({
  render() {
    return (
      <Browser {...this.props} />
    );
  },
});

megadoc.outlets.add('Lua::Browser', {
  key: 'source',
  component: BrowserOutlet
});