module.exports = (app) => {
  app.use("/api/events/search", require("./search"));
  app.use("/api/admin", require("./admin"));
  app.use("/api/karma", require("./karma"));
  app.use("/api/sitemap", require("./sitemap"));
  app.use("/api/events/new", require("./add"));
};
