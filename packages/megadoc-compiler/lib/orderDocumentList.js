const R = require('ramda');

module.exports = R.sortBy(R.prop('filePath'));
