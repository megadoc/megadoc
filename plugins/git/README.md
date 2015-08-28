# git tinydoc Plugin

This plugin analyzes a git repository's history to present some useful (and silly) statistics, like recent merge activity, and a repository's _superstars_.

Most of these stats are parsed with the help of [git-log-parser](https://github.com/bendrucker/git-log-parser).

## Configuration

```javascript
module.exports = {
  git: {
    // The routing path in the UI to use for the git stats page. 
    // 
    // A value of "activity", for example, will make the page available at:
    // http://your.tinydoc.com/activity
    routePath: 'activity',

    /**
     * @property {Boolean}
     *
     * Whether to use the git .mailmap file (if it exists) for fixing author 
     * emails/names in the commit history.
     */
    useMailMap: true,

    // The options to pass to the "recent activity" scanner, which uses
    // 
    // See the git-log-parser for the options you can pass here.
    recentCommits: {
      since: '3 days ago',

      /**
       * @property {RegExp[]}
       * 
       * Array of patterns to exclude from the recent activity list.
       * These will be matched against the commit _subjects_.
       */
      ignore: [],

      /**
       * @property {Function}
       *
       * A function that can be implemented to post-process a commit's message
       * for display in the Recent Activity section.
       *
       * You can implement this to remove any extraneous information found in
       * all commit messages, like a gerrit's "Change-Id" or "Reviewed-By"
       * field messages.
       */
      transform: function(commitMsg) {
        return commitMsg;
      }
    }
  }
}
```