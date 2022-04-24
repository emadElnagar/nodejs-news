var express = require('express');
var router = express.Router();
const article = require('../models/article');

/* GET home page. */
router.get('/', async(req, res) => {
  const lastArticles = await article.find({}).sort('-updatedAt').limit(3);
  const sportArticles = await article.find({ category: 'sport' }).sort('-updatedAt').limit(3);
  const fashionArticles = await article.find({ category: 'fashion' }).sort('-updatedAt').limit(3);
  res.send({lastArticles, sportArticles, fashionArticles});
});

router.get('/search', async(req, res) => {
  const { search } = req.query;
  const searchedArticles = await article.find({ title: search });
  const searchedArticlesCtg = await article.find({ category: search });
  if (searchedArticles.length === 0 && searchedArticlesCtg.length === 0) {
    res.status(404).json({
      message: 'Not Found'
    })
  } else {
    res.send({
      searchedArticles,
      searchedArticlesCtg
    })
  }
})

module.exports = router;
