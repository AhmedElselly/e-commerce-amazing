const express = require('express');
const router = express.Router({mergeParams: true});

const {
    reviewCreate,
    reviewUpdate,
    reviewDestroy
} = require('../controllers/reviews');

const {
    isReviewAuthor
} = require('../middlewares/index');


router.post('/', reviewCreate);
router.put('/:review_id', isReviewAuthor, reviewUpdate);
router.delete('/:review_id', isReviewAuthor, reviewDestroy);


module.exports = router;