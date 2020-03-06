const express = require('express');
const router = express.Router();
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
  userProfile
} = require('../controllers/index');

const {
  isLoggedIn
} = require('../middlewares/index');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/register', getRegister);

router.post('/register', postRegister);

router.get('/profile', isLoggedIn, userProfile);

router.get('/login', getLogin);

router.post('/login', postLogin);

router.get('/logout', logout);

module.exports = router;
