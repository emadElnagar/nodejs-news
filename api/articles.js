var express = require('express');
var router = express.Router();

const slugify = require('slugify');
const Category = require('../models/category');
const Article = require('../models/article');
const Comment = require('../models/comment');
const { isAuth, isAdmin } = require('../auth');

// ARTICLES LIST
router.get('/', async(req, res) => {
  try {
    const articles = await Article.find({}).sort('-updatedAt');
    res.send(articles);
  } catch (err) {
    res.send(err);
  }
});

// CREATE CATEGORY
router.post('/create-category', isAuth, isAdmin, (req, res) => {
  const category = new Category({
    title: req.body.title,
    author: req.session.user,
    slug: slugify(req.body.title, {
      replacement: '-',
      lower: true,
      strict: true,
    })
  });
  Category.findOne({ title: req.body.title }).then( result => {
    if (result.length < 1) {
      category.save().then(result => {
        res.status(200).json({
          message: "Category Created"
        })
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        });
      });
    } else {
      res.status(402).json({
        message: "Category is already defined try another one"
      })
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// GET CREATE ARTICLE PAGE
router.get('/new', async(req, res) => {
  const categories = await Category.find({});
  res.send(categories);
});

// CREAET NEW ARTICLE
router.post('/new', (req, res) => {
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
  Article.findOne({ title: req.body.title }).then(result => {
    if (result.length < 1) {
      article.save().then(result => {
        res.status(200).json({
          message: 'Error' + error.message
        })
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        })
      });
    } else {
      res.status(402).json({
        message: 'this title is already exist try to change it'
      });
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + error.message
    });
  });
});

// ARTICLE DETAILS
router.get('/:slug', async(req, res) => {
  const article = await Article.findOne({ slug: req.params.slug });
  const comments = await Comment.find({ article: article }).sort('-createdAt');
  const relatedArticles = await Article.find({ category: article.category, slug: { $ne: article.slug } }, { title: 1, image: 1, slug: 1 } ).sort('-updatedAt').limit(4);
  if (article) {
    res.send({article, comments, relatedArticles});
  } else {
    res.status(404).send({message: 'Article not found'});
  }
});

// CREATE COMMENT
router.post('/:slug', isAuth, async(erq, res) => {
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
  comment.save().then(result => {
    res.status(200).json({
      message: "Created Successfuly"
    })
  }).catch(error => {
    res.status(401).json({
      message: "Error" + error.message
    })
  })
});

module.exports = router;
