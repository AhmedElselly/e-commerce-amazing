const Post = require('../models/post');
const Cart = require('../models/cart');
const stripe = require('stripe')('sk_test_EycwzlF2EyCNqN9vTSGieIag002Nx5vqpx');
const Order = require('../models/order');
const {cloudinary} = require('../cloudinary');
module.exports = {
    async postIndex(req, res, next){
        const posts = await Post.paginate({}, {
            page: req.query.page || 1,
            limit: 3
        });
        posts.page = Number(posts.page);
        res.render('posts/index', {posts, title: 'All Posts'});
    },
    
    postNew(req, res){
        res.render('posts/new');
    },

    async postShow(req, res, next){
        const post = await Post.findById(req.params.id).populate({
            path: 'reviews',
            options: {sort: {'_id': -1}},
            populate: {
                path: 'author',
                model: 'User'
            }
        });
        const floorRating = post.calculateAvgRating();
        res.render('posts/show', {post, floorRating});
    },

    async postCreate(req, res, next){
        req.body.post.images = [];
        for(var file of req.files){
            req.body.post.images.push({
                url: file.secure_url,
                public_id: file.public_id
            });
        }

        // const title = req.body.title;
        // const description = req.body.description;
        // const price = req.body.price;
        // const location = req.body.location;
        // const author = {
        //     id: req.user._id,
        //     username: req.user.username
        // }

        // const postVar = {
        //     title,
        //     description,
        //     location,
        //     price,
        //     author
        // }

        req.body.post.author = {
            id: req.user._id,
            username: req.user.username
        }

        await Post.create(req.body.post, function(err){
            if(err) return next(err);
        });

        res.redirect('/posts');
    },

    async postEdit(req, res, next){
        const post = await Post.findById(req.params.id);
        res.render('posts/edit', {post});
    },

    async postUpdate(req, res, next){
        const post = await Post.findById(req.params.id);
        var deletedImages = req.body.deletedImages;
        if(deletedImages && deletedImages.length){
            for(const public_id of deletedImages){
                await cloudinary.v2.uploader.destroy(public_id);
                for(const image of post.images){
                    if(image.public_id === public_id){
                        var index = post.images.indexOf(image);
                        post.images.splice(index, 1);
                    }
                }
            }
        }

        if(req.files){
            for(const file of req.files){
                post.images.push({
                    url: file.secure_url,
                    public_id: file.public_id
                });
            }
        }

        post.title = req.body.post.title;
        post.price = req.body.post.price;
        post.description = req.body.post.description;
        post.location = req.body.post.location;
        await post.save();
        res.redirect(`/posts/${post.id}`);
    },

    async postDelete(req, res, next){
        const post = await Post.findById(req.params.id);
        for(var image of post.images){
            await cloudinary.v2.uploader.destroy(image.public_id);
        }
        await post.remove();
        req.session.success = 'Post deleted successfully!';
        res.redirect('/posts');
    },

    async addToCart(req, res, next){
        var productId = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart : {item: null, qty: 0, price: 0});

        const product = await Post.findById(productId)
        // , function(err, product){
        //     if(err){
        //         req.session.error = 'Cannot add item into cart';
        //         return res.redirect('/posts');
        //     }
        //     cart.add(product, product.id);
        //     req.session.cart = cart;
            
        //     console.log(req.session.cart);
        //     req.session.success = 'Item added into shopping cart';
        //     res.redirect('/posts');
        // });
        cart.add(product, product.id);
        req.session.cart = cart;
        
        req.session.success = 'Item added into shopping cart';
        if(!req.session.cart){
            req.session.error = 'Item not added';
        }
        
        console.log(req.session.cart);
        res.redirect('/posts');
    },

    shoppingCart(req, res, next){
        if(!req.session.cart){
            return res.render('posts/shopping-cart', {products: null});
        }

        var cart = new Cart(req.session.cart);
        res.render('posts/shopping-cart', {products: cart.generateArray(), totalPrice: cart.totalPrice});
    },
    
    checkout(req, res, next){
        if(!req.session.cart){
            return res.redirect('/posts/shopping-cart');
        }
        var cart = new Cart(req.session.cart);
        res.render('posts/checkout', {total: cart.totalPrice});
    },

    async checkoutPost(req, res, next){
        if(!req.session.cart){
            return res.redirect('/posts/shopping-cart');
        }
        var cart = new Cart(req.session.cart);

         // Token is created using Stripe Checkout or Elements!
        // Get the payment token ID submitted by the form:
        const token = req.body.stripeToken; // Using Express
        
        const charge = await stripe.charges.create({
            amount: cart.totalPrice * 100,
            currency: 'usd',
            description: req.body.title,
            source: token,
        }, function(err, charge){
            if(err) {
                req.session.error = "Can't make the charge";
                res.redirect('/posts/checkout');
            }
            var order = new Order({
                user: req.user,
                cart: cart,
                address: req.body.address,
                name: req.body.name,
                paymentId: charge.id
            })
            order.save(function(err, result){
                if(err){
                    req.session.error = 'Error saving the order contact the developer';
                    res.redirect('/posts/checkout');
                }

                req.session.cart = null;
                req.session.success = 'Payment Success';
                res.redirect('/posts')
            });
            console.log(order)
        });
    },

    async reduceItem(req, res, next){
        var productId = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart : {item: null, qty: 0, price: 0});

        cart.reduceByOne(productId);
        req.session.cart = cart;
        res.redirect('/posts/shopping-cart');
    },

    async removeItem(req, res, next){
        var productId = req.params.id;
        var cart = new Cart(req.session.cart ? req.session.cart : {item: null, qty: 0, price: 0});

        cart.removeItem(productId);
        req.session.cart = cart;
        res.redirect('/posts/shopping-cart');
    }
}