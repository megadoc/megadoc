This folder contains the CSS and any static assets that might be needed by the
stylesheets such as fonts and images used as backgrounds.

You are free to use any of plain CSS, LESS, or SASS to write your stylesheets.

We follow the BEM notation for styling elements, and you are advised to prefix
your class names with your plugin name to avoid conflict with other plugin CSS.

For example:

```less
.plugin-skeleton {
  &__browser {
  }

  &__browser-link {
  }

  &__content {
  }
}
```