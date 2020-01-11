module.exports = app => {
  app.use('/importers', require('./importers'));
  app.use('/events', require('./events'));
  app.use('/locations', require('./locations'));
};