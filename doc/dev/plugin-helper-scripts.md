# Plugin helper scripts

Browse the files under `/bin` to see the available helpers. These bash scripts 
are meant to help during the development of Megadoc core or its packages.

Most scripts will accept a `PACKAGE` environment variable that is named after
the package you're interested in (see `ls packages/`) but can also accept it
as the first argument, so the following two commands are equivalent:

    bin/test megadoc-plugin-js
    PACKAGE=megadoc-plugin-js bin/test

For convenience, the scripts will also accept a short-hand package names for 
_plugins_; so you can perform the above command with:

    bin/test js

This will work for anything that matches `ls/megadoc-plugin-*`.