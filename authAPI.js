import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    isAdmin: user.isAdmin,
  }, process.env.JWT_SECRET , {
    expiresIn: '30d',
  });
};

const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET , (err, decode) => {
      if(err) {
        res.status(401).send({message: 'Invalid token'});
      } else {
        req.user = decode;
        next();
      }
    })
  } else {
    res.status(401).send({message: 'No token'});
  }
}

const isNotAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    const token = authorization.slice(7, authorization.length);
    jwt.verify(token, process.env.JWT_SECRET , (err, decode) => {
      if(err) {
        res.status(401).send({message: 'Invalid token'});
      } else {
        req.user = decode;
        next();
      }
    })
  } else {
    res.status(401).send({message: 'No token'});
  }
}

const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).send({ message: 'Invalid Admin Token' });
  }
};

module.exports = {
  isAdmin: isAdmin,
  isNotAuth: isNotAuth,
  isAuth: isAuth,
}
