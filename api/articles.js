var express = require('express');
var router = express.Router();

const slugify = require('slugify');
const Category = require('../models/category');
const Article = require('../models/article');
const Comment = require('../models/comment');

router.get('/', async(req, res) => {
  try {
    const articles = await Article.find({}).sort('-updatedAt');
    res.send(articles);
  } catch (err) {
    res.send(err);
  }
});

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

router.post('/:slug', async(erq, res) => {
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
      message: "Error" + error.message
    })
  }).catch(error => {
    res.status(401).json({
      message: "Error" + error.message
    })
  })
});

module.exports = router;