# Setting up the development environment

This article will go over the things needed to get Megadoc set-up locally for
development purposes.

Clone the repository from github:

    git clone https://github.com/megadoc/megadoc

Make sure you're on Node 4 or higher (needed for tests) then run:

    npm install
    ./node_modules/.bin/lerna bootstrap --hoist

This command will install all the necessary packages for Megadoc core and the
core packages found under `packages/` - it will also compile their assets, run
the linter, run their tests, and verify everything is OK.

## Plugin helper scripts

Right now this is pretty crude and will hopefully get better, but see 
[./plugin-helper-scripts.md]() for a bunch of CLI utilities for working with
the core.

## The Devserver

The script at `bin/devserver` will launch a small web-server that provides a
_live-reload_ development session. You only need to feed it the output of a
Megadoc compilation so that it knows what to serve.

The server performs some hackery in order to serve the local sources of 
packages as opposed to the compiled versions that the `.html` files would
be requiring. But you do not need to know about that!

Example usage:

```shell
# compile the docs:
./cli/megadoc \
  --config ./my-project/megadoc.conf.js \
  --output-dir /srv/http/docs/my-project

# run the devserver against them:
./bin/devserver /srv/http/docs/my-project/config.js
```

Visit http://localhost:8942 to verify it's up and running. Now, any time you
modify stuff under `/ui` or `packages/*/ui` (based on what plugins the docs
were originally using), they should be picked up without having to re-compile
the docs or the plugins!

Note that the live-reload won't work for all sources - in the worst case 
scenario, you only have to reload the browser tab so it's still pretty decent.