const Post = require('../models/post');
const Review = require('../models/review');


module.exports = {
    isLoggedIn(req, res, next){
        if(req.isAuthenticated()){
            return next();
        } else{
            req.session.error = 'You should be logged in';
            res.redirect('/login');
        }

    },

    checkPostOwnership(req, res, next){
        if(req.isAuthenticated()){
            Post.findById(req.params.id, function(err, post){
                if(err){
                    
                    res.redirect('back');
                }else{
                    if(post.author.id.equals(req.user._id)){
                        next();
                    } else{
                        res.redirect('back');
                    }
                }
            })
        }else{
            res.redirect('back');
        }
    },

    isReviewAuthor: async (req, res, next)=>{
        let review = await Review.findById(req.params.review_id);
        if(review.author.equals(req.user._id)){
            return next();
        }

        req.session.error = 'You Don\'t have the authority to do such thing';
        res.redirect('/');
    }
}