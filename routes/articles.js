var express = require('express');
var router = express.Router();
const { check, validationResult } = require('express-validator');
const async = require('hbs/lib/async');
const slugify = require('slugify');
const Category = require('../models/category');
const Article = require('../models/article');
const User = require('../models/user');
const Comment = require('../models/comment')
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
  const articles = await Article.find({}, { image: 1, title: 1, slug: 1, category: 1 }).sort('-updatedAt');
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
    title: 'Noticias-new-article',
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
        res.redirect('/articles');
      });
    }
  });
});

router.get('/update/:slug', async(req, res, next) => {
  const article = await Article.findOne({ slug: req.params.slug });
  const category = await Category.find({});
  const errorMessage = req.flash('error');
  const imageErrorMessage = req.flash('profileError');
  if (req.session.user === undefined) {
    res.redirect('/');
  } else if (req.session.user.isAdmin === false) {
    res.redirect('/');
  }
  if (!article) {
    res.render('404', { user: req.session.user, title: 'Noticias-article' });
  } else {
    const errors = validationResult(req);
    if (! errors.isEmpty()) {
      var validationErrors = [];
      for(var i = 0; i < errors.errors.length; i++) {
        validationErrors.push(errors.errors[i].msg);
      }
      req.flash('error', validationErrors);
      res.redirect(`/update/${article.slug}`);
      return;
    }
    res.render('articles/update_article' , {
      user: req.session.user,
      title: 'Noticias-update-article',
      categories: category,
      errorMessage: errorMessage,
      imageErrorMessage: imageErrorMessage,
      article: {
        id: article._id,
        title: article.title,
        subject: article.subject,
        image: article.image
      }
    });
  }
});

router.post('/update/:slug', [
  check('title')
    .not().isEmpty().withMessage('please enter the article title'),
  check('subject')
    .not().isEmpty().withMessage('please enter the article subject'),
  check('category')
    .not().isEmpty().withMessage('please choose the article category'),
], async(req, res, next) => {
  const article = await Article.findOne({ slug: req.params.slug });
  const updatedArticle = {
    title: req.body.title,
    subject: req.body.subject,
    image: (req.file.path).slice(6) || article.image,
    slug: slugify(req.body.title, {
      replacement: '-',
      lower: true,
      strict: true,
    })
  }
  if (req.file.path) {
    const path = './public' + article.image;
    fs.unlink(path, (err) => {
      if (err) {
        console.log(err);
        return;
      }
    })
  }
  Article.updateOne({ _id: article._id }, { $set: updatedArticle }, (err, doc) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect('/articles');
    }
  });
});

router.post('/delete/:slug', async(req, res, next) => {
  const article = await Article.findOne({ slug: req.params.slug });
  const path = './public' + article.image;
  fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });
  Article.deleteOne({ _id: article._id }, (err, doc) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/articles');
  });
});

router.get('/:slug', async(req, res, next) => {
  const article = await Article.findOne({ slug: req.params.slug });
  if (!article) {
    res.render('404', { user: req.session.user, title: 'Noticias-article' });
  } else {
    const author = await User.findById(article.author);
    const relatedArticle = await Article.find({ category: article.category, slug: { $ne: article.slug } }, { title: 1, image: 1, slug: 1 } ).sort('-updatedAt').limit(4);
    const comments = await Comment.find({ article: article });
    res.render('articles/article_details', {
      user: req.session.user,
      relatedArticles: relatedArticle,
      title: `Noticias-${article.slug}`,
      comments: comments,
      author: {
        id: author._id,
        firstName: author.firstName,
        lastName: author.lastName,
        img: author.profileImg,
      },
      article: {
        id: article._id,
        title: article.title,
        image: article.image,
        subject: article.subject,
        author: article.author,
        category: article.category,
        slug: article.slug,
        createdAt: article.createdAt.toDateString(),
        updatedAt: article.updatedAt.toDateString(),
      }
    });
  }
});

router.post('/:slug', async(req, res) => {
  const article = await Article.findOne({ slug: req.params.slug });
  const comment = new Comment({
    user: {
      id: req.session.user._id,
      firstName: req.session.user.firstName,
      lastName: req.session.user.lastName,
      image: req.session.user.image
    },
    article: article,
    content: req.body.comment
  });
  comment.save((err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect(`/articles/${article.slug}`);
    }
  });
});

module.exports = router;
