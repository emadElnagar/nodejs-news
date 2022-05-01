const express = require('express');
const router = express.Router();
const { isAdmin } = require('../authAPI');
const User = require('../models/user');
const Article = require('../models/article');
const Category = require('../models/category');
const bcrypt = require('bcrypt');
const fs = require('fs');

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

// DELETE CATEGORY
router.delete('/delete/category/:slug', isAdmin, async(req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).then(category => {
    if (category) {
      Category.deleteOne({ _id: category._id }).then(result => {
        res.status(200).json({
          message: 'Category deleted successfully'
        });
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        });
      });
    } else {
      res.send('Categroy Not Found');
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// UPDATE CATEGORY
router.put('/update/:slug', isAdmin, async(req, res) => {
  const category = await Category.findOne({ slug: req.params.slug }).then(category => {
    if (category) {
      newCategory = { title: req.body.title };
      Category.updateOne({ _id: category._id }, { $set: newCategory }).then(result => {
        res.status(200).json({
          message: 'Categroy updated successfully'
        });
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        });
      });
    } else {
      res.send('Category Not Found');
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// DELETE USER
router.delete('/delete/:id', isAdmin, async(req, res) => {
  const user = await User.findById(req.params.id).then(user => {
    if (user) {
      const path = './public' + user.profileImg;
      if (user.profileImg !== '/images/default-user-image.png') {
        fs.unlink(path, (err) => {
          if (err) {
            console.log(err);
            return;
          }
        })
      }
      User.deleteOne({ _id: user._id }).then(result => {
        res.status(200).json({
          message: 'User deleted successfully'
        })
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        });
      });
    } else {
      res.status(404).json({
        message: 'User Not Found'
      });
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// CREATE MODERATOR USER
router.put('/create-moderator/:id', isAdmin, async(req, res) => {
  const user = await User.findById(req.params.id).then(user => {
    if (user) {
      User.updateOne({ _id: user._id }, { $set: { isModerator: true } }).then(result => {
        res.status(200).json({
          message: 'This user is a moderator now'
        });
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        });
      });
    } else {
      res.status(404).json({
        message: 'User Not Found'
      });
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// ISOLATE MODERATOR
router.put('/isolate-moderator/:id', isAdmin, async(req, res) => {
  const user = await User.findById(req.params.id).then(user => {
    if (user) {
      User.updateOne({ _id: user._id }, { $set: { isModerator: false } }).then(result => {
        res.status(200).json({
          message: 'Moderator isolated successfully'
        });
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        });
      });
    } else {
      res.status(404).json({
        message: 'User Not Found'
      })
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

module.exports = router;
