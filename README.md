# Megadoc

[![Build Status](https://travis-ci.org/megadoc/megadoc.svg)](https://travis-ci.org/megadoc/megadoc) [![Coverage Status](https://coveralls.io/repos/github/megadoc/megadoc/badge.svg?branch=master)](https://coveralls.io/github/megadoc/megadoc?branch=master)

Megadoc is a documentation generator that is able to scan and analyze documentation found in different sources and present them in a coherent UI.
Example sources include source-files like JavaScript or Lua modules, Markdown 
documents, and Ruby on Rails APIs.

## Motivation

- Write anywhere: docs may live inside the main codebase (in the form of comment blocks) or outside (like text or markdown files) - the tool shouldn't care.
- Aggregate, linkable docs: the ability to inter-link documents regardless of the source, like pointing to a JavaScript module from a Markdown article.
- Simple deployment model: .html files that require no webserver to power, so that one can easily host the docs anywhere (like on GitHub Pages, a local browser session, or any static server.)

## Getting started

See the [/doc/usage/README.md usage](doc/usage/README.md) guide to set up Megadoc for your project.

## Hacking

See the [/doc/dev/README.md Developer's Handbook](doc/dev/README.md) for extending megadoc.

### UI tests

    npm run test:ui
    npm run test:ui:packages

## License

Copyright (C) 2015 Ahmad Amireh

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.