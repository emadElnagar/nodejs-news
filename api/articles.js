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

module.exports = router;
