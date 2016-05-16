# Usage

This guide will get you up and running with Megadoc to turn those cold,
colorless blocks of text into a beautiful compilation of documentation.

## Installation

You need to have [Node.js](https://nodejs.org) installed (version 4 or newer).

Running the following command should get Megadoc installed locally and
expose a binary called `megadoc` which you'll use to compile your 
documentation

    npm install -g megadoc

> You may have to use `sudo` for that command.

Run `megadoc --version` to verify the package was properly installed, you
can also run `megadoc --help` to see what kind of options there are for the
CLI. Let's move on.

## Our first exciting (and dull) compilation

Before we start, it's worth touching up on Megadoc's philosophy: power in
the form of sane defaults (so that it "It Just Works") and true power in
the form of allowing for _so much_ customization (for the cases when it 
doesn't!)

Fire up your editor and create a new file, call it `megadoc.conf.js`. By
default, Megadoc will look such a file in the CWD when it is run.

```javascript
// @file: megadoc.conf.js
module.exports = {
  // your configuration goes here
  outputDir: 'public/docs',
  plugins: []
};
```

The configuration can be broken down into two layers - the first layer has
to do with general output and formatter settings (e.g. HTML), while the other
layer has to do with _plugins_ for feeding our input into Megadoc as we'll see
later.

To see what settings are available, refer to the [Config]() reference page.
In our example, we have requested the docs to be emitted in the `public/docs`
directory, relative to where we stored our `megadoc.conf.js` file.

Now now, before we get to the beef, let's try running the compiler and verify
that it's picking up our config file. Note that at this point, Megadoc will
not be presenting anything as we haven't fed it any input yet.

    megadoc

Hopefully, the command ran successfully and you see some files written to
`public/docs`:

```shell
$ ls public/docs
.                  ..                 404.html           config.js          index.html         styles.css         megadoc.js         megadoc__vendor.js
```

Okay, beef time!

## Plugins

At its core, Megadoc is extensible and hardly does much on its own without the
help of _plugins_. Plugins are generally concerned with scanning and compiling
documentation found in input sources, like Markdown or source-code files.

Other types of plugins exist that provide extra functionality to the UI, like
drawing reference graphs between documents, or maybe changing the Look and
Feel of the UI.

For now, we'll introduce ourselves to the first type of plugins - ones 
that let us get some source files scanned and rendered. Choose from one of
the following guides based on what kind of content you have:

- [/packages/megadoc-plugin-markdown/README.md Markdown documents]()
- [/packages/megadoc-plugin-js/README.md JavaScript source files]()
- [/packages/megadoc-plugin-yard-api/README.md Rails APIs]()
- [/packages/megadoc-plugin-lua/README.md Lua source files]()

