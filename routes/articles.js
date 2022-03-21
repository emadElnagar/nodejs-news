var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const async = require('hbs/lib/async');
const slugify = require('slugify');
const Category = require('../models/category');
const Article = require('../models/article');
const multer = require('multer');

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
    cb(null, './public/media/articles')
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
    req.flash('imageError', [err.message]);
    res.redirect('new');
  }
});

router.get('/', async(req, res, next) => {
  const articles = await Article.find({})
  res.render('articles/articles_list', {
    title: 'Noticias-articles',
    user: req.session.user,
    articles: articles
  })
});

router.get('/create-category', (req, res, next) => {
  let errorMessage = req.flash('error');
  if (req.session.user === undefined) {
    res.redirect('/');
  }
  if (req.session.user.isAdmin === false) {
    res.redirect('/');
  }
  context = { 
    title: 'Noticias-new-category', 
    user: req.session.user, 
    messages: errorMessage 
  }
  res.render('articles/new_category', context);
});

router.post('/create-category', [
  check('title')
    .not().isEmpty().withMessage('please enter category title')
], (req, res, next) => {
  const errors = validationResult(req);
  if (! errors.isEmpty()) {
    var validationErrors = [];
    for(var i = 0; i < errors.errors.length; i++) {
      validationErrors.push(errors.errors[i].msg);
    }
    req.flash('error', validationErrors);
    res.redirect('create-category');
    return;
  }
  const category = new Category({
    title: req.body.title,
    author: req.session.user,
    slug: slugify(req.body.title, {
      replacement: '-',
      lower: true,
      strict: true,
    })
  })

  Category.findOne({ title: req.body.title }, (err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      req.flash('error', 'this category is already exist');
      res.redirect('create-category');
      return;
    } else {
      category.save((err, data) => {
        if (err) {
          console.log(err);
        }
        res.redirect('/');
      })
    }
  })
})

router.get('/new', async(req, res, next) => {
  let errorMessage = req.flash('error');
  const category = await Category.find({});
  const imageErrorMessage = req.flash('profileError');
  if (req.session.user === undefined) {
    res.redirect('/');
  } else if (req.session.user.isAdmin === false) {
    res.redirect('/');
  }
  context = { 
    title: 'Noticias-new-category',
    user: req.session.user,
    categories: category,
    messages: errorMessage,
    imageErrorMessage: imageErrorMessage
  }
  res.render('articles/new_article', context);
});

router.post('/new', [
  check('title')
    .not().isEmpty().withMessage('please enter the article title'),
  check('subject')
    .not().isEmpty().withMessage('please enter the article subject'),
  // check('image')
  //   .not().isEmpty().withMessage('please upload the article image'),
  check('category')
    .not().isEmpty().withMessage('please choose the article category'),
], (req, res, next) => {
  const errors = validationResult(req);
  if (! errors.isEmpty()) {
    var validationErrors = [];
    for(var i = 0; i < errors.errors.length; i++) {
      validationErrors.push(errors.errors[i].msg);
    }
    req.flash('error', validationErrors);
    res.redirect('new');
    return;
  }
  const article = new Article({
    title: req.body.title,
    subject: req.body.subject,
    image: (req.file.path).slice(6),
    category: req.body.category,
    author: req.session.user,
    slug: slugify(req.body.title, {
      replacement: '-',
      lower: true,
      strict: true,
    })
  });
  Article.findOne({ title: req.body.title }, (err, result) => {
    if (result) {
      req.flash('error', 'this title is already exist try to change it');
      res.redirect('new');
      return;
    } else {
      article.save((err, data) => {
        if (err) {
          console.log(err);
        }
        res.redirect('/');
      });
    }
  });
});

module.exports = router;
