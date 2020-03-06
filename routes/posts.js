const express = require('express');
const router = express.Router();
const multer = require('multer');
const {cloudinary, storage} = require('../cloudinary');
const upload = multer({storage});
const {
    postIndex,
    postNew,
    postCreate,
    postShow,
    postEdit,
    postUpdate,
    postDelete,
    addToCart,
    shoppingCart,
    checkout,
    checkoutPost,
    reduceItem,
    removeItem
} = require('../controllers/posts');

const {
    isLoggedIn,
    checkPostOwnership
} = require('../middlewares/index');

router.get('/', postIndex);

router.get('/new', isLoggedIn, postNew);

router.post('/', isLoggedIn, upload.array('images', 4), postCreate);

router.get('/shopping-cart', isLoggedIn, shoppingCart);

router.get('/reduce/:id', isLoggedIn, reduceItem);

router.get('/remove/:id', isLoggedIn, removeItem);

router.get('/checkout', isLoggedIn, checkout);

router.post('/checkout', isLoggedIn, checkoutPost);

router.get('/:id', postShow)

router.get('/:id/edit', checkPostOwnership, isLoggedIn, postEdit);

router.put('/:id', checkPostOwnership, isLoggedIn, upload.array('images', 4), postUpdate);

router.delete('/:id', checkPostOwnership, isLoggedIn, postDelete);




// CART ROUTES

router.get('/add-to-cart/:id', isLoggedIn, addToCart);


module.exports = router;