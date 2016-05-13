const { shape, string, func, oneOf, } = require('react').PropTypes;

module.exports = shape({
  pathname: string,
  origin: string,
  protocol: oneOf([ 'file:', 'http:', 'https:' ]),
  hash: string,
  replace: func,
});