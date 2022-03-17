var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const async = require('hbs/lib/async');
const multer = require('multer');
const fs = require('fs');

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
    req.flash('profileError', [err.message]);
    res.redirect(`profile/${req.session.user._id}`);
  }
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', (req, res, next) => {
  let errorMessage = req.flash('error');
  if (req.session.user !== undefined) {
    res.redirect('/');
  }
  res.render('users/register', {title: 'Noticias-register', messages: errorMessage});
});

router.post('/register', [
  check('firstName')
    .not().isEmpty().withMessage('please enter your first name')
    .isLength({ min: 3, max: 20 }).withMessage('first name must be between 3 and 20 characters')
    .not().matches(/\d/)
    .withMessage('first name can not contain a number'),
  check('lastName')
    .not().isEmpty().withMessage('please enter your last name')
    .isLength({ min: 3, max: 20 }).withMessage('last name must be between 3 and 20 characters')
    .not().matches(/\d/)
    .withMessage('last name can not contain a number'),
  check('email')
    .not().isEmpty().withMessage('please enter your email')
    .isEmail().withMessage('please enter a valid email'),
  check('password')
    .not().isEmpty().withMessage('please enter your password')
    .isLength({ min: 8 }).withMessage('password must be at least 8 characters'),
  check('password-confirm').custom((value, {req}) => {
    if (value !== req.body.password) {
      throw new Error("passwrod and confirm passwrod doesn't match");
    }
    return true;
  })
], (req, res, next) => {
  const errors = validationResult(req);
  if (! errors.isEmpty()) {
    var validationErrors = [];
    for(var i = 0; i < errors.errors.length; i++) {
      validationErrors.push(errors.errors[i].msg);
    }
    req.flash('error', validationErrors);
    res.redirect('register');
    return;
  }
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password:  new User().hashPassword(req.body.password),
    gender: req.body.gender
  });

  User.findOne({email: req.body.email}, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      req.flash('error', 'this email is already exist');
      res.redirect('register');
      return;
    } else {
      user.save((error, data) => {
        if (error) {
          console.log(error);
        }
        // AUTOMATICALLY LOGIN AFTER REGISTRATION
        loggedin = req.session;
        loggedin.user = {};
        loggedin.user.email = req.body.email;
        loggedin.user._id = user._id;
        loggedin.user.firstName = user.firstName;
        loggedin.user.lastName = user.lastName;
        loggedin.user.gender = user.gender;
        loggedin.user.isAdmin = user.isAdmin;
        res.redirect('/');
      });
    }
  });
});

router.get('/login', (req, res, next) => {
  let errorMessage = req.flash('loginError');
  if (req.session.user !== undefined) {
    res.redirect('/');
  }
  res.render('users/login', { title: 'Noticias-login', messages: errorMessage });
});

router.post('/login', async (req, res, next)=> {
  const user = await User.findOne({ email: req.body.email });
  const loginError = "wrong email or password";
  if(!user) {
    req.flash('loginError', loginError);
    res.redirect('login');
    return;
  }
  const validate = await bcrypt.compare(req.body.password, user.password);
  if (!validate) {
    req.flash('loginError', loginError);
    res.redirect('login');
    return;
  }
  loggedin = req.session;
  loggedin.user = {};
  loggedin.user.email = req.body.email;
  loggedin.user._id = user._id;
  loggedin.user.firstName = user.firstName;
  loggedin.user.lastName = user.lastName;
  loggedin.user.gender = user.gender;
  loggedin.user.isAdmin = user.isAdmin;
  res.redirect('/');
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return console.log(err);
    }
    res.redirect('/');
  })
})

router.get('/profile/:id', async(req, res, next) => {
  const userId = req.params.id;
  const profile = await User.findById(userId);
  const errorMessage = req.flash('profileError');
  if (!profile) {
    res.render('404', { title: 'Noticias-profile', user: req.session.user });
    return;
  }
  res.render('users/profile', {
    title: 'Noticias-profile',
    user: req.session.user,
    message: errorMessage,
    profile: {
      id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      gender: profile.gender,
      image: profile.profileImg,
      isAdmin: profile.isAdmin,
      createdAt: profile.createdAt.toDateString()
    },
    check: function () {
      if (req.session.user) {
        return req.session.user._id === req.params.id;
      } else {
        return false;
      }
    }
  });
});

router.post('/profile-img-upload', async(req, res, next) => {
  const user = req.session.user;
  const newUser = { profileImg: (req.file.path).slice(6) };
  const userId = req.session.user._id;
  const profile = await User.findById(userId);
  const path = './public' + profile.profileImg;
  if (profile.profileImg !== '/images/default-user-image.png') {
    fs.unlink(path, (err) => {
      if (err) {
        req.flash('profileError', [err.message]);
        res.redirect(`profile/${req.session.user._id}`);
        return;
      }
    })
  }
  User.updateOne({ _id: req.session.user._id }, { $set: newUser }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect(`profile/${user._id}`);
    }
  });
});

router.post('/edit-username', (req, res, next) => {
  const user = req.session.user;
  const newUser = { firstName: req.body.firstName, lastName: req.body.lastName };
  User.updateOne({ _id: req.session.user._id }, { $set: newUser }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect(`profile/${user._id}`);
    }
  });
});

router.post('/change-email', (req, res, next) => {
  const user = req.session.user;
  const newUser = { email: req.body.email };
  User.updateOne({ _id: req.session.user._id }, { $set: newUser }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect(`profile/${user._id}`);
    }
  });
});

module.exports = router;
