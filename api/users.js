var express = require('express');
var router = express.Router();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const { isAuth, isNotAuth, generateToken } = require('../authAPI');

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

// USER LOGIN
userRouter.post('/login', expressAsyncHandler(async(req, res) => {
  const user = await User.findOne({email: req.body.email});
  if (user){
    if (bcrypt.compare(req.body.password, user.password)) {
      res.send({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    }
  }
  res.status(401).send({message: 'invalid email or password'})
}));

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
      });
      res.send({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
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
  const user = await User.findById(req.user._id);
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
router.put('/edit-username', isAuth, (req, res) => {
  const user = await User.findById(req.user._id);
  const newUser = { firstName: req.body.firstName, lastName: req.body.lastName };
  User.updateOne({ _id: req.session.user._id }, { $set: newUser }).then(result => {
    res.status(200).json({
      message: 'User name edited successfully'
    })
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// CHANGE USER EMAIL
router.put('/change-email', isAuth, (req, res) => {
  const user = await User.findById(req.user._id);
  const newUser = { email: req.body.email };
  User.updateOne({ _id: req.session.user._id }, { $set: newUser }).then(result => {
    res.status(200).json({
      message: 'Email updated successfully'
    })
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// CHANGE USER PASSWORD
router.put('/change-password', isAuth, async(req, res) => {
  const user = await User.findById(req.user._id);
  const profile = await User.findOne({ email: user.email });
  const validate = await bcrypt.compare(req.body.currentPassword, profile.password);
  if (!validate) {
    res.status(401).json({
      message: 'Current password is not correct'
    })
  }
  const newUser = { password: new User().hashPassword(req.body.newPassword) };
  User.updateOne({ _id: req.session.user._id }, {  $set: newUser }).then().catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

module.exports = router;
