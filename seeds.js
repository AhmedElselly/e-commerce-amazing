const faker = require('faker');

const Post = require('./models/post');

async function seedPosts(){
    await Post.remove({});
    for(const i of Array(40)){
        const post = {
            title: faker.lorem.word(),
            description: faker.lorem.text(),
            author: {
                '_id': req.user.id,
                'username': req.user.username
            }
        }
        await Post.create(post);
    }
    console.log('40 new fake posts created by faker');
}

module.exports = seedPosts;