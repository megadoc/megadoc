var React = require('react');
var Radio = require("components/Radio");
var Storage = require('core/Storage');
var AppState = require('core/AppState');

var Settings = React.createClass({
  render: function() {
    return (
      <div className="settings">
        <h1>Settings</h1>

        <fieldset>
          <legend><strong>Layout</strong></legend>

          <p>Choose your preferred document layout.</p>

          <Radio
            name="layout"
            value="single-page"
            checked={AppState.getLayout() === 'single-page'}
            onChange={this.setLayout}
          >
            Single Page - display everything on the same page.
          </Radio>

          <Radio
            name="layout"
            value="multi-page"
            checked={AppState.getLayout() === 'multi-page'}
            onChange={this.setLayout}
          >
            Multi Page - a more focused layout that displays one document at a time.
          </Radio>
        </fieldset>

        <div className="settings__controls">
          <button className="btn" onClick={this.reset}>Reset settings</button>
        </div>
      </div>
    );
  },

  setLayout(e) {
    AppState.setLayout(e.target.value);
  },

  reset() {
    Storage.clear();
  }
});

module.exports = Settings;