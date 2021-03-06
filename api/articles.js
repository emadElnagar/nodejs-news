var express = require('express');
var router = express.Router();

const slugify = require('slugify');
const Category = require('../models/category');
const Article = require('../models/article');
const Comment = require('../models/comment');
const multer = require('multer');
const fs = require('fs');
const { isAuth, isAdmin } = require('../authAPI');

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
    res.status(400).json({
      message: error.message
    })
  }
});

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
router.post('/create-category', isAuth, isAdmin, async(req, res) => {
  const user = await User.findById(req.user._id);
  const category = new Category({
    title: req.body.title,
    author: user,
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
router.post('/new', async(req, res) => {
  const user = await User.findById(req.user._id);
  const article = new Article({
    title: req.body.title,
    subject: req.body.subject,
    image: (req.file.path).slice(6),
    category: req.body.category,
    author: user,
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

// GET UPDATE ARTICLE PAGE
router.get('/update/:slug', isAuth, isAdmin, async(req, res) => {
  const categories = await Category.find({});
  const article = await Article.findOne({ slug: req.params.slug }).then(result => {
    if (result) {
      res.send(categories);
    } else {
      res.status(404).json({
        message: 'Article Not Found'
      })
    }
  }).catch(error => {
    res.status(401).json({
      message: error.message
    });
  });
});

// UPDATE ARTICLE
router.post('/update/:slug', async(req, res) => {
  const categories = await Category.find({});
  const article = await Article.findOne({ slug: req.params.slug }).then(result => {
    if (result) {
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
      Article.updateOne({ _id: article._id }, { $set: updatedArticle }).then(result => {
        res.status(200).json({
          message: 'Article updated successfuly'
        })
      }).catch(error => {
        res.status(401).json({
          message: 'Error' + error.message
        })
      })
    } else {
      res.status(404).json({
        message: 'Article Not Found'
      })
    }
  }).catch(error => {
    res.status(401).json({
      message: error.message
    });
  });
});

// DELETE ARTICLE
router.post('/delete/:slug', isAuth, isAdmin, async(req, res, next) => {
  const article = await Article.findOne({ slug: req.params.slug });
  const path = './public' + article.image;
  fs.unlink(path, (err) => {
    if (err) {
      console.log(err);
      return;
    }
  });
  Article.deleteOne({ _id: article._id }).then(result => {
    res.status(200).json({
      message: 'Article deleted successfuly'
    })
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
  const user = await User.findById(req.user._id);
  const comment = new Comment({
    user: {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      image: user.image
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
