let outlets = {};
let OutletManager = {
  add(outlet, renderer) {
    if (!outlets[outlet]) {
      outlets[outlet] = [];
    }

    outlets[outlet].push(renderer);
  },

  getElements(outlet) {
    return outlets[outlet];
  }
};

module.exports = OutletManager;