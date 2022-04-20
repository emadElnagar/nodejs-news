var express = require('express');
var router = express.Router();

const slugify = require('slugify');
const Category = require('../models/category');
const Article = require('../models/article');

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
  if(article) {
    res.send(article);
  } else {
    res.status(404).send({message: 'Article not found'});
  }
});

module.exports = router;
