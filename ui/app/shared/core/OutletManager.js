const { where } = require('lodash');

let outlets = [];
let OutletManager = {
  setElements(inOutlets) {
    outlets = inOutlets;
  },

  getElements(outlet) {
    return where(outlets, { outlet });
  }
};

module.exports = OutletManager;