var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const async = require('hbs/lib/async');
const slugify = require('slugify');
const Category = require('../models/category');
const Article = require('../models/article');

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
  if (req.session.user === undefined) {
    res.redirect('/');
  } else if (req.session.user.isAdmin === false) {
    res.redirect('/');
  }
  context = { 
    title: 'Noticias-new-category',
    user: req.session.user,
    categories: category,
    messages: errorMessage
  }
  res.render('articles/new_article', context);
});

module.exports = router;
