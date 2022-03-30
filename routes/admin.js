var express = require('express');
const async = require('hbs/lib/async');
var router = express.Router();
const User = require('../models/user');
const Article = require('../models/article');
const Category = require('../models/category');
const bcrypt = require('bcrypt');
const fs = require('fs');
const { isAdmin } = require('../auth');

router.get('/', isAdmin, (req, res) => {
  res.render('admin/admin_main', { title: 'Noticias-admin', user: req.session.user });
});

router.get('/login', (req, res) => {
  let errorMessage = req.flash('loginError');
  if(req.session.user) {
    if (req.session.user.isAdmin) {
      res.redirect('/admin');
    } else {
      res.render('404', { title: 'Noticias', user: req.session.user });
    }
  } else {
    res.render('admin/signin', { title: 'Noticias-admin-login', messages: errorMessage });
  } 
});

router.post('/login', async(req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const loginError = `you arent allowed here or wrong password or email`;
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
  if (user.isAdmin) {
    loggedin = req.session;
    loggedin.user = {};
    loggedin.user.email = req.body.email;
    loggedin.user._id = user._id;
    loggedin.user.firstName = user.firstName;
    loggedin.user.lastName = user.lastName;
    loggedin.user.gender = user.gender;
    loggedin.user.isAdmin = user.isAdmin;
    loggedin.user.image = user.profileImg;
    res.redirect('/admin');
  } else {
    req.flash('loginError', loginError);
    res.redirect('login');
  }
});

router.get('/categories', isAdmin, async(req, res) => {
  const categories = await Category.find({});
  res.render('admin/admin_categories', {
    title: 'Noticias-admin-categories',
    user: req.session.user,
    categories: categories
  });
});

router.get('/articles', isAdmin, async(req, res) => {
  const articles = await Article.find({});
  res.render('admin/article_list', {
    title: 'Noticias-admin-articles',
    user: req.session.user,
    articles: articles
  });
});

router.get('/users', isAdmin, async(req, res) => {
  const users = await User.find({});
  res.render('admin/users_list', {
    title: 'Noticias-admin-articles',
    user: req.session.user,
    users: users
  });
});

router.get('/manage/user/:id', isAdmin, async(req, res) => {
  const profile = await User.findById(req.params.id);
  res.render('admin/manage_user', {
    title: 'Noticias-manage-user',
    user: req.session.user,
    profile: {
      id: profile._id,
      firstName: profile.firstName,
      lastName: profile.lastName, 
      email: profile.email, 
      image: profile.profileImg,
      isAdmin: profile.isAdmin,
      isModerator: profile.isModerator,
      createdAt: profile.createdAt.toDateString()
    }
  });
});

router.post('/delete/category/:slug', isAdmin, async(req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  Category.deleteOne({ _id: category._id }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/admin/categories');
  });
})

router.post('/update/:slug', isAdmin, async(req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  newCategory = { title: req.body.title };
  Category.updateOne({ _id: category._id }, { $set: newCategory }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/admin/categories');
  });
});

router.post('/delete/:id', isAdmin, async(req, res) => {
  const user = await User.findById(req.params.id);
  const path = './public' + user.profileImg;
  if (user.profileImg !== '/images/default-user-image.png') {
    fs.unlink(path, (err) => {
      if (err) {
        console.log(err);
        return;
      }
    })
  }
  User.deleteOne({ _id: user._id }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/admin/users');
  });
});

router.post('/create-moderator/:id', isAdmin, async(req, res) => {
  const user = await User.findById(req.params.id);
  User.updateOne({ _id: user._id }, { $set: { isModerator: true } }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/admin/users');
  });
});

router.post('/isolate-moderator/:id', isAdmin, async(req, res) => {
  const user = await User.findById(req.params.id);
  User.updateOne({ _id: user._id }, { $set: { isModerator: false } }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/admin/users');
  });
});

module.exports = router;
