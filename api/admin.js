const express = require('express');
const router = express.Router();
const { isAdmin } = require('../authAPI');
const User = require('../models/user');
const Article = require('../models/article');
const Category = require('../models/category');
const bcrypt = require('bcrypt');

// ADMIN LOGIN
router.post('/login', async(req, res) => {
  const user = await User.findOne({ email: req.body.email }).then(async user => {
    if(!user) {
      res.send('Error user is not found');
    }
    const validate = await bcrypt.compare(req.body.password, user.password);
    if (!validate) {
      res.send('Error password is wrong')
      return;
    }
    if (user.isAdmin) {
      res.send({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    } else {
      res.send('Error Not Admin');
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + message.error
    });
  });
});

// GET CATEGORIES LIST
router.get('/categories', isAdmin, async(req, res) => {
  const categories = await Category.find({});
  res.send(categories);
});

// GET ARTICLES LIST
router.get('/articles', isAdmin, async(req, res) => {
  const articles = await Article.find({});
  res.send(articles);
});

// GET USERS LIST
router.get('/users', isAdmin, async(req, res) => {
  const users = await User.find({});
  res.send(users);
});

// GET MANAGE USER PAGE
router.get('/manage/user/:id', isAdmin, async(req, res) => {
  const profile = await User.findById(req.params.id);
  res.send(profile);
});

module.exports = router;
