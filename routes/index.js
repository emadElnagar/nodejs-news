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

router.get('/search', async(req, res) => {
  const { search } = req.query;
  const searchedArticles = await article.find({ title: search });
  if (searchedArticles.length === 0) {
    res.render('search/not-found', { title: 'Noticias', user: req.session.user });
  } else {
    res.render('search/search', { title: 'Noticias', user: req.session.user, articles: searchedArticles });
  }
});

module.exports = router;
