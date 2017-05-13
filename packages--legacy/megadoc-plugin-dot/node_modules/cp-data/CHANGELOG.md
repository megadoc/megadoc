v1.1.3
======

* Use polyfills for Array.isArray and Array.prototype.reduce, which should help
  make this library more friendly to older browsers.

v1.1.2
======

* No longer use the 'keys' property to determine if an object is a Set.
  Recently both Chrome and Firefox have added 'keys' to Array objects.
  See [Issue #1](https://github.com/cpettitt/cp-data/issues/1]).

v1.1.1
======

* Minor performance tweaks

v1.1.0
======

* Add PriorityQueue implementation

v1.0.0
======

* Initial release.
