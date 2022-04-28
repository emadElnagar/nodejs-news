var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const { isAuth, isNotAuth } = require('../auth');

const fileFilter = function(req, file, cb) {
  if (file.mimetype !== 'image/png') {
    cb(null, true)
  } else if (file.mimetype !== 'image/jpg') {
    cb(null, true)
  } else {
    cb(new Error('please enter jpg or png image'), false)
  }
}

const storage = multer.diskStorage({
  destination:  function(req, file, cb) {
    cb(null, './public/media/profile')
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname)
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024*1024*5
  },
  fileFilter: fileFilter
});

router.use(upload.single('image'), (err, req, res, next) => {
  if (err) {
    res.status(400).json({
      message: error.message
    })
  }
});

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

// UPLOAD PROFILE IMAGE
router.post('/profile-img-upload', isAuth, async(req, res, next) => {
  const user = req.session.user;
  const newUser = { profileImg: (req.file.path).slice(6) };
  const profile = await User.findById(req.session.user._id);
  const path = './public' + profile.profileImg;
  if (profile.profileImg !== '/images/default-user-image.png') {
    fs.unlink(path).then(result => {
      res.status(200).json({
        message: 'Success'
      })
    }).catch(error => {
      res.status(401).json({
        message: 'Error' + error.message
      })
    })
  }
  User.updateOne({ _id: req.session.user._id }, { $set: newUser }).then(result => {
    res.status(200).json({
      message: 'Image changed successfully'
    })
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// EDIT USER NAME
router.post('/edit-username', isAuth, (req, res) => {
  const user = req.session.user;
  const newUser = { firstName: req.body.firstName, lastName: req.body.lastName };
  User.updateOne({ _id: req.session.user._id }, { $set: newUser }).then(result => {
    res.status(200).json({
      message: 'User name edited successfully'
    })
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + message.error
    });
  });
});

module.exports = router;
