var express = require('express');
var router = express.Router();
const User = require('../models/user');

// GET PROFILE PAGE
router.get('/profile/:id', async(req, res) => {
  const profile = await User.findById(req.params.id);
  if (profile) {
    res.send(profile);
  } else {
    res.status(404).json({
      message: 'User not found'
    })
  }
});

module.exports = router;
