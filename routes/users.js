var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', (req, res, next) => {
  res.render('users/register');
});

router.get('/login', (req, res, next) => {
  res.render('users/login');
})

module.exports = router;
