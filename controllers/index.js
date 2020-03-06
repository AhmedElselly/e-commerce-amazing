const Cart = require('../models/cart');
const User = require('../models/user');
const Order = require('../models/order');
const Post = require('../models/post');

module.exports = {
    getRegister(req, res, next){
        res.render('register');
    },
    async postRegister(req, res, next){
        const newUser = {
            email: req.body.email,
            username: req.body.username
        }

        const user = await User.register(newUser, req.body.password);

        req.login(user, err => {
            if(err) return next(err);
            req.session.success = `Welcome to E-commerce ${user.username}`;
            res.redirect('/');
        });
    },

    getLogin(req, res, next){
        res.render('login');
    },

    async postLogin(req, res, next){
        const {username, password} = req.body;

        const {user, error} = await User.authenticate()(username, password);

        if(!user && error) return next(error);

        req.login(user, function(err){
            req.session.success = `Welcome back ${user.username}`;
            res.redirect('/');
        });
    },

    async logout(req, res, next){
        req.logout();
        req.session.success = 'Successfully logged out';
        res.redirect('/');
    },

    async userProfile(req, res, next){
         Order.find({
            user: req.user
        }, function(err, orders){
            if(err){
                req.session.error = 'Error getting the orders of the user';
                console.log(err);
                res.redirect('/posts');
            }
            var cart;
            orders.forEach(function(order){
                cart = new Cart(order.cart);
                order.items = cart.generateArray();
            });
            Post.find().where('author.id').equals(req.user._id).limit(10).exec(function(err, posts){
                if(err){
                    req.session.error = err;
                    console.log(err);
                } else{
                    console.log(orders);
                    res.render('profile', {orders, posts});
                }
                
            });
        });
        // const orders = await Order.find({user: req.user}).populate({
        //     path: 'posts',
        //     options: {sort: {'_id': -1}},
        //     populate: {
        //         path: 'author',
        //         model: 'User'
        //     }        
        // })
        // var cart;
        //     orders.forEach(function(order){
        //         cart = new Cart(order.cart);
        //         order.items = cart.generateArray();
        //     });
        // const posts = await Post.find({user: req.user});
        // res.render('profile', {orders, posts});
    }

}