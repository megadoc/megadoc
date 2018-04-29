const ControllerOutlet = require('./outlets/ControllerOutlet');
const BrowserOutlet = require('./outlets/BrowserOutlet');

module.exports = {
  name: 'megadoc-plugin-yard-api',
  outlets: [
    'YARD-API::Browser',
    'YARD-API::Controller',
  ],

  outletOccupants: [
    {
      name: 'YARD-API::Browser',
      component: BrowserOutlet
    },
    {
      name: 'YARD-API::Controller',
      component: ControllerOutlet
    },
  ]
};