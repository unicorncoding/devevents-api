const asyncHandler = require('express-async-handler');
const router = require('express').Router();
const { makeAdmin } = require('../utils/auth')

router.get('/', asyncHandler(async(req, res) => {
  const admin = 'co.unicorn.ding@gmail.co';
  const info = await makeAdmin(admin);
  res.send(info);
}));

module.exports = router;