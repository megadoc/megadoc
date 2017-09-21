const chalk = require('chalk');
const columnify = require('columnify');
const invariant = require('invariant');
const R = require('ramda');
const LOG_INFO = 1;
const LOG_WARN = 2;
const LOG_ERROR = 3;
const LevelStrings = {
  [LOG_INFO]: 'info',
  [LOG_WARN]: chalk.yellow('warning'),
  [LOG_ERROR]: chalk.red('error'),
}

let lastFile; // YES

/**
 * @module Linter
 *
 * @typedef   {Linter~Config}
 * @type      {Object}
 * @property  {String} assetRoot
 *
 *
 * @typedef   {Linter~Location}
 * @type      {Object}
 *
 * @property  {String} filePath
 * @property  {Object} loc
 * @property  {Object} loc.start
 * @property  {Number} loc.start.line
 *
 *
 * @typedef   {Linter~Rule}
 * @type      {Object}
 *
 * @property  {String} name
 * @property  {function(Object): String} messageFn
 * @property  {Object} defaults
 * @property  {Linter~Level} defaults.level
 *
 * @typedef   {Linter~Level}
 * @type      {Number}
 *
 * One of `LOG_INFO`, `LOG_WARN` or `LOG_ERROR`.
 */

/**
 * Create a Linter that works according to user configuration.
 *
 * @param  {Linter~Config} config
 * @return {Linter}
 */
exports.for = function(config) {
  invariant(typeof config.assetRoot === 'string' && config.assetRoot,
    'assetRoot must be defined!'
  )

  return {
    addToErrorReport: R.partial(addToErrorReport, [config]),
    logMessage: R.partial(logMessage, [config]),
    logRuleEntry: R.partial(logRuleEntry, [config]),
    logError: R.partial(logError, [config]),
    logConfigurationError: R.partial(logConfigurationError, [config]),
    locationForNode: R.partial(locationForNode, [config]),
    locationForNodeAsString: R.pipe(
      R.partial(locationForNode, [config]),
      stringifyNodeLocation
    )
  }
}

// TODO
function addToErrorReport(config, error) {
  console.error(error && error.stack || error)
}

/**
 * @memberOf Linter
 *
 * Inform the user of an issue described by a [[Linter~Rule]]. The message may
 * or may not be printed based on how the user has configured the rule.
 *
 * @param  {Object}       config
 *
 * @param  {Object}       params
 * @param  {Linter~Rule}  params.rule
 * @param  {Object}       params.params
 *         Parameters to pass to [[Linter~Rule.messageFn]]
 *
 * @param  {Linter~Location} params.loc
 */
function logRuleEntry(config, { rule, params, loc }) {
  const message = rule.messageFn(params)
  const { ruleName, ruleLevel } = readRuleConfig(config, rule)

  return logMessage(config, {
    message,
    level: ruleLevel,
    loc,
    rule: ruleName,
  })
}

/**
 * @memberOf Linter
 *
 * Inform the user of an error that can be tracked to a [[location | Linter~Location]].
 *
 * @param  {Object}           config
 * @param  {Object}           params
 * @param  {String}           params.message
 * @param  {Linter~Location}  params.loc
 */
function logError(config, { message, loc }) {
  return logMessage(config, {
    message,
    level: LOG_ERROR,
    loc,
    rule: 'none'
  })
}

/**
 * @memberOf Linter
 *
 * Inform the user of an error caused by an invalid configuration.
 *
 * @param  {Object}           config
 * @param  {Object}           params
 * @param  {String}           params.message
 */
function logConfigurationError(config, { message }) {
  return logMessage(config, {
    message,
    level: LOG_ERROR,
    rule: 'configuration'
  })
}

/**
 * @memberOf Linter
 *
 * Low-level printing routine. You should probably use a more specialized one
 * like [[logRuleEntry]] or [[logError]].
 *
 * @param  {Object}           config
 *
 * @param  {Object}           params
 * @param  {Linter~Rule}      params.rule
 * @param  {Linter~Location}  params.loc
 * @param  {String}           params.message
 * @param  {Linter~Level}     [params.level=LOG_INFO]
 */
function logMessage(config, { rule, loc, message, level = LOG_INFO }) {
  if (config.lintingDisabled === true) {
    return;
  }

  const { filePath: __filePath, line } = loc;
  const filePath = getRelativeFilePath(config, __filePath)

  // for lack of a better buffering implementation :D
  if (lastFile !== filePath) {
    if (lastFile) {
      console.log('')
    }

    lastFile = filePath

    console.log(chalk.underline(chalk.bold(filePath)))
  }

  console.log(
    columnify(
      [{ line, level: level, message, rule }],
      {
        columns: [ 'line', 'level', 'message', 'rule' ],
        preserveNewLines: true,
        showHeaders: false,
        truncate: false,
        config: {
          line: {
            minWidth: 5,
            align: 'right',
            dataTransform: x => chalk.green(x),
          },
          level: {
            minWidth: 'warning'.length,
            maxWidth: 'warning'.length,
            dataTransform: x => LevelStrings[x],
          },
          message: {
            maxWidth: 65,
          },
          rule: {
            dataTransform: x => chalk.green(x),
          }
        }
      }
    )
  )
}

function readRuleConfig(config, rule) {
  return {
    ruleName: rule.name,
    ruleLevel: rule.defaults && rule.defaults.level
  }
}

function getRelativeFilePath(config, filePath) {
  if (filePath && config.assetRoot && R.startsWith(config.assetRoot, filePath)) {
    return filePath.slice(config.assetRoot.length).replace(/^\//, '');
  }
  else {
    return filePath;
  }
}

function locationForNode(config, node) {
  return {
    filePath: getRelativeFilePath(config, R.prop('filePath', node)),
    line: R.path([ 'loc', 'start', 'line' ], node)
  }
}

function stringifyNodeLocation(loc = {}) {
  const { filePath, line } = loc

  if (filePath && line) {
    return `${filePath}:${line}`
  }
  else if (filePath) {
    return filePath
  }
  else {
    return '<<unknown>>'
  }
}

exports.LOG_INFO = LOG_INFO
exports.LOG_WARN = LOG_WARN
exports.LOG_ERROR = LOG_ERROR
exports.NoLocation = { filePath: '<<none>>' }
exports.NullLinter = {
  addToErrorReport: R.T,
  logMessage: R.T,
  logRuleEntry: R.T,
  logError: R.T,
  logConfigurationError: R.T,
  locationForNode: R.always(null),
  locationForNodeAsString: R.always(null),
}