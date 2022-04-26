var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const { isNotAuth } = require('../auth');

// USER REGISTER
router.post('/register', isNotAuth, (req, res) => {
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password:  new User().hashPassword(req.body.password),
    gender: req.body.gender
  });
  User.findOne({ email: req.body.email }).then(result => {
    if (result) {
      res.status(402).json({
        message: 'user already created'
      })
    } else {
      user.save().then(result => {
        res.status(200).json({
          message: 'User created successfully'
        })
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        })
      })
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

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
