var express = require('express');
var router = express.Router();
const article = require('../models/article');

/* GET home page. */
router.get('/', async(req, res) => {
  const lastArticles = await article.find({}).sort('-updatedAt').limit(3);
  const sportArticles = await article.find({ category: 'sport' }).sort('-updatedAt').limit(3);
  const fashionArticles = await article.find({ category: 'fashion' }).sort('-updatedAt').limit(3);
  res.render('index', {
    title: 'Noticias',
    user: req.session.user,
    lastArticles: lastArticles,
    sportArticles: sportArticles,
    fashionArticles: fashionArticles
  });
});

module.exports = router;
