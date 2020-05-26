module.exports = (app) => {
  app.use("/api/sitemap", require("./sitemap"));
  app.use("/api/events/search", require("./search"));
  app.use("/api/events/new", require("./add"));
  app.use("/api/admin", require("./admin"));
  app.use("/api/karma", require("./karma"));
};
