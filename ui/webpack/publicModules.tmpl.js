module.exports = {
  <% _.forEach(externals, function(moduleId) { %>
    "<%- moduleId %>": require("<%- moduleId %>"),
  <% }); %>
};