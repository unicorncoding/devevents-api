const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { makeAdmin, whois } = require('../utils/auth')
const { confirm, reject } = require('../utils/datastore');



router.post('/:eventId/:action(confirm|reject)', asyncHandler(async(req, res) => {
  const { eventId, action } = req.params;
  const { admin } = await whois(req);

  if (!admin) {
    res.status(403).send("Sorry, you don't have access to confirm events");
    return;
  }
  
  if (action === "confirm") {
    const info = await confirm(eventId);
    res.send(info);
  }

  if (action === "reject") {
    const info = await reject(eventId);
    res.send(info);
  }
  
}));

router.get('/grant', asyncHandler(async(req, res) => {
  const admin = 'co.unicorn.ding@gmail.co';
  const info = await makeAdmin(admin);
  res.send(info);
}));

module.exports = router;