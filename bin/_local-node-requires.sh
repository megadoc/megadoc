# This hack is very convenient to play around node require paths where our
# packages most usually require "tinydoc" and other core plugins as
# peerDependencies but they won't (and shouldn't) be installed locally.
#
# What this will do is that it will make node resolve those packages from
# /packages and it will work for the core library because we created a fake
# package inside /packages/tinydoc to this end.
export NODE_PATH="./packages:${NODE_PATH}"
