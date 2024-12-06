const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
    },
    specPattern: 'cypress/e2e/**/*.js',
    baseUrl: 'http://localhost:3000',
  },
});
