/**
 * @module Config
 * @preserveOrder
 */
module.exports = {
  /**
   * @property {String}
   *
   * The relative URL to reach the git activity page at.
   */
  routeName: 'activity',

  /**
   * @property {Boolean}
   *
   * Whether to use .mailmap (if found) for resolving coaelescing emails/names.
   */
  useMailMap: true,

  navigationIcon: null,
  navigationLabel: 'Activity',

  repository: null,

  /**
   * @property {Object}
   *
   * Tuning for the "Recent Commits" section.
   */
  recentCommits: {
    /**
     * @property {String}
     *
     * Indicates the time threshold for filtering recent activity.
     */
    since: '3 days ago',

    /**
     * @property {String[]}
     */
    ignore: [],

    /**
     * @property {Function}
     */
    transform: null
  },

  verbose: true
};