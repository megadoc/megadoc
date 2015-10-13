module.exports = [{
    name: routeName,
    path: '/' + routeName,
    handler: require('./screens/Root')(routeName)
  },

  {
    default: true,
    name: `${routeName}.landing`,
    handler: require('./screens/Landing'),
    parent: routeName
  },

  {
    name: `${routeName}.module`,
    path: 'modules/:moduleId',
    handler: require('./screens/Module'),
    parent: routeName
  }
];