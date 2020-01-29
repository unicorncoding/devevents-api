module.exports = app => {
  app.use('/api/importers', require('./importers'));
  app.use('/api/events', require('./events'));
  app.use('/api/locations', require('./locations'));
};