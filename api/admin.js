const express = require('express');
const router = express.Router();
const { isAdmin } = require('../authAPI');

// ADMIN LOGIN
router.post('/login', async(req, res) => {
  const user = await User.findOne({ email: req.body.email }).then(user => {
    if(!user) {
      res.send('Error user is not found');
    }
    const validate = await bcrypt.compare(req.body.password, user.password);
    if (!validate) {
      res.send('Error password is wrong')
      return;
    }
    if (user.isAdmin) {
      res.send({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user),
      });
      return;
    } else {
      res.send('Error Not Admin');
    }
  }).catch(error => {
    res.status(401).json({
      message: 'Error' + message.error
    });
  });
});

module.exports = router;
