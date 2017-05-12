function Linter(config = {}) {
  const messages = [];
  const emitChange = () => {
    if (config.onChange) {
      config.onChange();
    }
  };

  return {
    push({ type, message }) {
      messages.push({ type, message });

      emitChange();
    },

    getMessages() {
      return messages;
    }
  }
}

module.exports = Linter;