const { OutletManager, OutletFactory } = require('react-transclusion');

module.exports = OutletFactory(OutletManager({ strict: true }));