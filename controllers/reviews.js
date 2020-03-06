const Post = require('../models/post');
const Review = require('../models/review');

module.exports = {
    async reviewCreate(req, res, next){
        // getting the post id
        // const post = await Post.findById(req.params.id);
        //getting the post id and populate it with review authors
        // and can't make more than one review
        const post = await Post.findById(req.params.id).populate('reviews').exec();
        let haveReviewed = post.reviews.filter(review => {
            return review.author.equals(req.user._id);
        }).length;
        //checking if the author have a review in the post
        if(haveReviewed){
            req.session.error = 'Sorry, you can only create one review per post! Check editing your review instead';
            return res.redirect(`/posts/${post.id}`);
        }
        //connect it with it's author
        req.body.review.author = req.user._id;

        //create the review
        const review = await Review.create(req.body.review);
        // req.body.review.author = req.user._id;
        // req.body.review.author.username = req.user.username;

        
        // review.save();
        //inject the review to the post
        post.reviews.push(review);
        //saving the post
        post.save();
        //redirect to the post page
        req.session.success = 'Review is created!';

        console.log(req.user.username);
        res.redirect(`/posts/${post.id}`);
    },
    
    async reviewUpdate(req, res, next){
        const post = await Post.findById(req.params.id);
        const review = await Review.findByIdAndUpdate(req.params.review_id, req.body.review);
        req.session.success = 'Review successfully updated';
        res.redirect(`/posts/${post.id}`);
    },

    async reviewDestroy(req, res, next){
        const post = await Post.findByIdAndUpdate(req.params.id, {
            $pull: { reviews: req.params.review_id }
        });

        await Review.findByIdAndRemove(req.params.review_id);
        req.session.success = 'Review deleted successfully';
        res.redirect(`/posts/${post.id}`);
    }
}