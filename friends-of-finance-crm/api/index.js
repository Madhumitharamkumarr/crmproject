// Vercel serverless function entrypoint wrapping the Express server
const serverless = require("serverless-http");
const app = require("../server");

module.exports = serverless(app);
