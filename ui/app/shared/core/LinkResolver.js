const LinkResolver = require('tinydoc/lib/LinkResolver');
const { registry } = require('config');

const resolver = new LinkResolver(registry);

module.exports = resolver;